import * as fs from 'fs';
const fse = require('fs-extra');

export function inTestFolder(input: string): string {
    const tmpDestination = `tmp/${input}`;
    if (fs.existsSync(tmpDestination)) {
        fs.rmdirSync(tmpDestination, { recursive: true });
    }

    fse.mkdirSync(tmpDestination, { recursive: true });

    return tmpDestination;
}

export function cleanUpTestFiles(): void {
    if (!fs.existsSync('tmp')) {
        return;
    }
    fs.rmdirSync('tmp', { recursive: true });
}
