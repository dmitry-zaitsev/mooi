import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';
import * as Handlebars from 'handlebars';
import { FileCopy } from '../input';
import { TranlsatorEngine } from './engine';
import { HashFunction } from '../crypto';
import { TranslationStoreFactory, TranslationsStore } from '../store/translations';
import { App } from '../di';
const fse = require('fs-extra');

export interface FileTranslation {
    originalPath: string;
    translatedPath: string;
    language: string;
    content: string;
}

export class FileTranslator {
    private engine: TranlsatorEngine;
    private storeFactory: TranslationStoreFactory;
    private hashFunction: HashFunction;
    private context?: string;

    constructor(
        engine: TranlsatorEngine,
        storeFactory: TranslationStoreFactory,
        hashFunction: HashFunction,
        context?: string
    ) {
        this.engine = engine;
        this.storeFactory = storeFactory;
        this.hashFunction = hashFunction;
        this.context = context;
    }

    public async translateFiles(
        fileEntries: FileCopy[],
        languages: string[]
    ): Promise<FileTranslation[]> {
        const results: FileTranslation[] = [];

        for (const entry of fileEntries) {
            const files = this.resolveFiles(entry.filePath);
            
            for (const filePath of files) {
                for (const language of languages) {
                    App.printer.info(`Translating file ${filePath} to ${language}`);
                    
                    const translation = await this.translateFile(
                        filePath,
                        language,
                        entry
                    );
                    
                    if (translation) {
                        results.push(translation);
                        // Ensure directory exists for the output path
                        fse.ensureDirSync(path.dirname(translation.translatedPath));
                        // Write the translated file
                        fs.writeFileSync(translation.translatedPath, translation.content);
                        App.printer.info(`  Created: ${translation.translatedPath}`);
                    }
                }
            }
        }

        return results;
    }

    private resolveFiles(pattern: string): string[] {
        const resolvedPath = path.resolve(process.cwd(), pattern);
        return glob.sync(resolvedPath);
    }

    private async translateFile(
        filePath: string,
        language: string,
        entry: FileCopy
    ): Promise<FileTranslation | null> {
        const store = this.storeFactory(`file_${language}`);
        
        // Read file content
        const content = fs.readFileSync(filePath, 'utf-8');
        
        // Generate hash for the file content
        const hash = this.hashFunction([content, entry.description || null]);
        
        // Check if already translated
        const existing = store.getByHash(hash);
        if (existing) {
            App.printer.info(`  Using cached translation for ${filePath}`);
            return {
                originalPath: filePath,
                translatedPath: this.generateTranslatedPath(filePath, language, entry.outputPath),
                language,
                content: existing.value
            };
        }

        // Check if we should use previous version as context (default: true)
        const usePreviousVersion = entry.usePreviousVersionAsContext !== false;
        let enrichedDescription = entry.description || `Content of file: ${path.basename(filePath)}`;
        
        if (usePreviousVersion) {
            // Try to get previous translation from store
            const previousTranslation = store.get(filePath);
            if (previousTranslation) {
                enrichedDescription += `\n\nPrevious ${language} translation for reference:\n${previousTranslation.value}\n\nPlease maintain consistency with the previous translation where appropriate, but feel free to improve it if needed.`;
            }
        }

        // Prepare content for translation
        const fileInfo = {
            key: filePath,
            value: content,
            description: enrichedDescription
        };

        // Translate using the engine
        const translations = await this.engine.translate([fileInfo], language);
        
        if (translations && translations.length > 0) {
            const translatedContent = translations[0];
            
            // Store in cache
            store.put(filePath, translatedContent, hash);
            
            return {
                originalPath: filePath,
                translatedPath: this.generateTranslatedPath(filePath, language, entry.outputPath),
                language,
                content: translatedContent
            };
        }

        return null;
    }

    private generateTranslatedPath(originalPath: string, language: string, outputPathTemplate?: string): string {
        if (!outputPathTemplate) {
            // Default behavior: place in same directory with language suffix
            const dir = path.dirname(originalPath);
            const ext = path.extname(originalPath);
            const nameWithoutExt = path.basename(originalPath, ext);
            return path.join(dir, `${nameWithoutExt}_${language}${ext}`);
        }

        // Use Handlebars template for custom output path
        const template = Handlebars.compile(outputPathTemplate);
        
        // Prepare template variables
        const dir = path.dirname(originalPath);
        const ext = path.extname(originalPath);
        const nameWithoutExt = path.basename(originalPath, ext);
        
        const templateData = {
            languageCode: language,
            fileName: nameWithoutExt,
            extension: ext,
            directory: dir,
            originalPath: originalPath
        };
        
        return template(templateData);
    }
}