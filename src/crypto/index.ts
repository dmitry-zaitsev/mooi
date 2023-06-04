var crypto = require('crypto')

export type HashFunction = (keys: (string | null)[]) => string;

export const sha1HashFunction: HashFunction = (keys: (string | null)[]) => {
    const input = keys.filter((key) => key !== null).join(",");

    var shasum = crypto.createHash('sha1')
    shasum.update(input)
    return shasum.digest('hex');
}
