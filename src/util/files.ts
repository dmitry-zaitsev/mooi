import fse = require('fs-extra');
import os = require('os');

export const mooiDir = () => {
    const mooiDir = `${os.homedir()}/.mooi`;

    fse.ensureDirSync(mooiDir);

    return mooiDir;
}
