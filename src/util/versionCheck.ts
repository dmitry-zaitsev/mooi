import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';
import { App } from '../di';

interface NpmPackageInfo {
    'dist-tags': {
        latest: string;
    };
}

interface VersionCheckCache {
    lastCheck: number;
    latestVersion: string;
}

const CACHE_FILE = '.mooi-version-cache.json';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const NPM_REGISTRY_URL = 'https://registry.npmjs.org/mooi-cli';

export class VersionChecker {
    private cacheFilePath: string;

    constructor() {
        const homeDir = process.env.HOME || process.env.USERPROFILE || '';
        this.cacheFilePath = path.join(homeDir, CACHE_FILE);
    }

    public async checkForUpdates(): Promise<void> {
        try {
            // Check if we should skip the version check
            if (process.env.MOOI_SKIP_VERSION_CHECK === 'true') {
                return;
            }

            const currentVersion = this.getCurrentVersion();
            const latestVersion = await this.getLatestVersion();

            if (latestVersion && this.isNewerVersion(currentVersion, latestVersion)) {
                this.displayUpdatePrompt(currentVersion, latestVersion);
            }
        } catch (error) {
            // Silently fail - don't interrupt the user's workflow
            // We can optionally log this for debugging
            if (process.env.MOOI_DEBUG === 'true') {
                console.error('Version check failed:', error);
            }
        }
    }

    private getCurrentVersion(): string {
        const packageJsonPath = path.join(__dirname, '../../package.json');
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
        // For testing: simulate an older version
        if (process.env.MOOI_TEST_VERSION) {
            return process.env.MOOI_TEST_VERSION;
        }
        return packageJson.version;
    }

    private async getLatestVersion(): Promise<string | null> {
        // Check cache first
        const cachedVersion = this.getCachedVersion();
        if (cachedVersion) {
            return cachedVersion;
        }

        // Fetch from npm registry
        return new Promise((resolve) => {
            const timeout = setTimeout(() => {
                resolve(null);
            }, 5000); // 5 second timeout

            https.get(NPM_REGISTRY_URL, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    clearTimeout(timeout);
                    try {
                        const packageInfo: NpmPackageInfo = JSON.parse(data);
                        const latestVersion = packageInfo['dist-tags']?.latest;
                        
                        if (latestVersion) {
                            this.cacheVersion(latestVersion);
                            resolve(latestVersion);
                        } else {
                            resolve(null);
                        }
                    } catch (error) {
                        resolve(null);
                    }
                });
            }).on('error', () => {
                clearTimeout(timeout);
                resolve(null);
            });
        });
    }

    private getCachedVersion(): string | null {
        try {
            if (!fs.existsSync(this.cacheFilePath)) {
                return null;
            }

            const cache: VersionCheckCache = JSON.parse(
                fs.readFileSync(this.cacheFilePath, 'utf-8')
            );

            const now = Date.now();
            if (now - cache.lastCheck < CACHE_DURATION) {
                return cache.latestVersion;
            }

            return null;
        } catch {
            return null;
        }
    }

    private cacheVersion(version: string): void {
        try {
            const cache: VersionCheckCache = {
                lastCheck: Date.now(),
                latestVersion: version
            };

            fs.writeFileSync(
                this.cacheFilePath,
                JSON.stringify(cache, null, 2),
                'utf-8'
            );
        } catch {
            // Ignore cache write errors
        }
    }

    private isNewerVersion(current: string, latest: string): boolean {
        const currentParts = current.split('.').map(Number);
        const latestParts = latest.split('.').map(Number);

        for (let i = 0; i < Math.max(currentParts.length, latestParts.length); i++) {
            const currentPart = currentParts[i] || 0;
            const latestPart = latestParts[i] || 0;

            if (latestPart > currentPart) {
                return true;
            } else if (latestPart < currentPart) {
                return false;
            }
        }

        return false;
    }

    private displayUpdatePrompt(current: string, latest: string): void {
        console.log('\n' + '='.repeat(60));
        console.log('📦 A new version of mooi-cli is available!');
        console.log(`   Current version: ${current}`);
        console.log(`   Latest version:  ${latest}`);
        console.log('\n   Run the following command to update:');
        console.log('   npm install -g mooi-cli@latest');
        console.log('\n   To skip this check, set MOOI_SKIP_VERSION_CHECK=true');
        console.log('='.repeat(60) + '\n');
    }
}