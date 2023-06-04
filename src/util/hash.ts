import { ProductCopy } from "../input";
const crypto = require('crypto');

export const computeHash = (input: ProductCopy) => {
    const message = JSON.stringify(input);

    return crypto.createHash('sha1').update(message).digest('hex');
}
