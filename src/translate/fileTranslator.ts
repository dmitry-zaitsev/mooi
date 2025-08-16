import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';
import { FileCopy } from '../input';
import { TranlsatorEngine } from './engine';
import { HashFunction } from '../crypto';
import { TranslationStoreFactory, TranslationsStore } from '../store/translations';
import { App } from '../di';

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
                        entry.description
                    );
                    
                    if (translation) {
                        results.push(translation);
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
        description?: string
    ): Promise<FileTranslation | null> {
        const store = this.storeFactory(`file_${language}`);
        
        // Read file content
        const content = fs.readFileSync(filePath, 'utf-8');
        
        // Generate hash for the file content
        const hash = this.hashFunction([content, description || null]);
        
        // Check if already translated
        const existing = store.getByHash(hash);
        if (existing) {
            App.printer.info(`  Using cached translation for ${filePath}`);
            return {
                originalPath: filePath,
                translatedPath: this.generateTranslatedPath(filePath, language),
                language,
                content: existing.value
            };
        }

        // Prepare content for translation
        const fileInfo = {
            key: filePath,
            value: content,
            description: description || `Content of file: ${path.basename(filePath)}`
        };

        // Translate using the engine
        const translations = await this.engine.translate([fileInfo], language);
        
        if (translations && translations.length > 0) {
            const translatedContent = translations[0];
            
            // Store in cache
            store.put(filePath, translatedContent, hash);
            
            return {
                originalPath: filePath,
                translatedPath: this.generateTranslatedPath(filePath, language),
                language,
                content: translatedContent
            };
        }

        return null;
    }

    private generateTranslatedPath(originalPath: string, language: string): string {
        const dir = path.dirname(originalPath);
        const ext = path.extname(originalPath);
        const nameWithoutExt = path.basename(originalPath, ext);
        
        return path.join(dir, `${nameWithoutExt}_${language}${ext}`);
    }
}