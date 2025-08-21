export type InputSchema = {
    languages: string[],
    entries: (ProductCopy | FileCopy)[],
}

export type ProductCopy = {
    key: string,
    value: string,
    description?: string,
    tags?: string[],
}

export type FileCopy = {
    filePath: string,
    outputPath?: string,  // Optional template like: "translations/{{languageCode}}/{{fileName}}{{extension}}"
    description?: string,
    tags?: string[],
    usePreviousVersionAsContext?: boolean,  // When true, passes previous translation as context (default: true)
}

export type Config = {
    context?: string,
    useContextForChecksum?: boolean,
    formats?: FormatConfig[],
    openai?: OpenaiEngineConfig,
}

export type OpenaiEngineConfig = {
    url?: string,
    urlParams?: Record<string, string>,
    model?: string,
}

export type FormatConfig = {
    name?: string,
    outputPath: string,
    format: string,
    useWhen?: FormatCondition,
}

export type FormatCondition = {
    tagsInclude?: string[],
}

export type ValidationResult = {
    valid: boolean,
    errors: string[],
}

export function validateInputSchema(obj: any): ValidationResult {
    if (!obj.languages) {
        return {
            valid: false,
            errors: ['languages is required'],
        }
    }

    if (!obj.entries) {
        return {
            valid: false,
            errors: ['entries is required'],
        }
    }

    if (!Array.isArray(obj.entries)) {
        return {
            valid: false,
            errors: ['entries must be an array'],
        }
    }

    const entries = obj.entries as any[];
    const errors: string[] = [];
    
    entries.forEach((entry, index) => {
        // Check if it's a file entry or product copy
        if (entry.filePath) {
            const result = validateFileCopy(entry);
            if (!result.valid) {
                errors.push(...result.errors.map(e => `entries[${index}]: ${e}`));
            }
        } else {
            const result = validateProductCopy(entry);
            if (!result.valid) {
                errors.push(...result.errors.map(e => `entries[${index}]: ${e}`));
            }
        }
    });
    
    if (errors.length > 0) {
        return {
            valid: false,
            errors: errors,
        }
    }

    return {
        valid: true,
        errors: [],
    }
}

function validateProductCopy(obj: any): ValidationResult {
    const errors: string[] = [];
    
    if (!obj.key) {
        errors.push('key is required');
    }

    if (!obj.value) {
        errors.push('value is required');
    }

    // Description is optional as per the type definition
    // No validation needed for optional field

    if (errors.length > 0) {
        return {
            valid: false,
            errors: errors,
        }
    }

    return {
        valid: true,
        errors: [],
    }
}

function validateFileCopy(obj: any): ValidationResult {
    if (!obj.filePath) {
        return {
            valid: false,
            errors: ['filePath is required'],
        }
    }

    // Check if the glob pattern matches at least one file
    const glob = require('glob');
    const path = require('path');
    
    // Resolve the path relative to the current working directory
    const resolvedPath = path.resolve(process.cwd(), obj.filePath);
    const files = glob.sync(resolvedPath);
    
    if (files.length === 0) {
        return {
            valid: false,
            errors: [`filePath '${obj.filePath}' does not match any files`],
        }
    }

    return {
        valid: true,
        errors: [],
    }
}

export function validateConfig(obj: any): ValidationResult {
    if (obj.formats) {
        if (!Array.isArray(obj.formats)) {
            return {
                valid: false,
                errors: ['formats must be an array'],
            }
        }

        const formats = obj.formats as any[];
        formats.forEach((format, index) => {
            const result = validateFormatConfig(format);
            if (!result.valid) {
                return {
                    valid: false,
                    errors: result.errors.map(e => `formats[${index}]: ${e}`),
                }
            }
        });
    }

    return {
        valid: true,
        errors: [],
    }
}

function validateFormatConfig(obj: any): ValidationResult {
    if (!obj.outputPath) {
        return {
            valid: false,
            errors: ['outputPath is required'],
        }
    }

    if (!obj.format) {
        return {
            valid: false,
            errors: ['format is required'],
        }
    }

    return {
        valid: true,
        errors: [],
    }
}
