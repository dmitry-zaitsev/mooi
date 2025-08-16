export type InputSchema = {
    languages: string[],
    entries: ProductCopy[],
}

export type ProductCopy = {
    key: string,
    value: string,
    description?: string,
    tags?: string[],
}

export type Config = {
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
    entries.forEach((entry, index) => {
        const result = validateProductCopy(entry);
        if (!result.valid) {
            return {
                valid: false,
                errors: result.errors.map(e => `entries[${index}]: ${e}`),
            }
        }
    });

    return {
        valid: true,
        errors: [],
    }
}

function validateProductCopy(obj: any): ValidationResult {
    if (!obj.key) {
        return {
            valid: false,
            errors: ['key is required'],
        }
    }

    if (!obj.value) {
        return {
            valid: false,
            errors: ['value is required'],
        }
    }

    if (!obj.description) {
        return {
            valid: false,
            errors: ['description is required'],
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
