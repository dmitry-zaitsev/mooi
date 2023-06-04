export type InputSchema = {
    languages: string[],
    entries: ProductCopy[],
}

export type ProductCopy = {
    key: string,
    value: string,
    description?: string,
}

export function validateSchema(obj: any): ValidationResult {
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

export function isProductCopy(obj: any): obj is ProductCopy {
    return obj.key !== undefined && obj.value !== undefined && obj.description !== undefined;
}

export type ValidationResult = {
    valid: boolean,
    errors: string[],
}
