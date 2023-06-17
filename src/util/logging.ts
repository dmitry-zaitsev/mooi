import winston = require('winston');
import { mooiDir } from './files';

export const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
    ),
    transports: [
        new winston.transports.File({ 
            filename: `${mooiDir()}/logs.json`,
            maxsize: 5000000, // ~5MB
        }),
    ]
});
