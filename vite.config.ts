/// <reference path="./src/type/package-json.d.ts" />

import { rmSync } from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron/simple';
import pkg from './package.json';

const packageJson = pkg as PackageJson;

export default defineConfig(({ command }) => {
    rmSync('dist-electron', { recursive: true, force: true });

    const isServe = command === 'serve';
    const isBuild = command === 'build';
    const sourcemap = isServe || !!process.env.VSCODE_DEBUG;

    return {
        resolve: {
            alias: {
                '@': path.join(__dirname, 'src'),
            },
        },
        plugins: [
            react(),
            electron({
                main: {
                    entry: 'electron/main/index.ts',
                    onstart(args) {
                        if (process.env.VSCODE_DEBUG) {
                            console.log('[startup] Electron App');
                        } else {
                            args.startup();
                        }
                    },
                    vite: {
                        build: {
                            sourcemap,
                            minify: isBuild,
                            outDir: 'dist-electron/main',
                            rollupOptions: {
                                external: [
                                    'pg-native',
                                    ...Object.keys(pkg.dependencies || {}),
                                ],
                            },
                        },
                    },
                },
                preload: {
                    input: 'electron/preload/index.ts',
                    vite: {
                        build: {
                            sourcemap: sourcemap ? 'inline' : undefined,
                            minify: isBuild,
                            outDir: 'dist-electron/preload',
                            rollupOptions: {
                                external: Object.keys(pkg.dependencies || {}),
                            },
                        },
                    },
                },
                renderer: {},
            }),
        ],
        server: process.env.VSCODE_DEBUG && (() => {
            if (packageJson.debug && packageJson.debug.env && packageJson.debug.env.VITE_DEV_SERVER_URL) {
                const url = new URL(packageJson.debug.env.VITE_DEV_SERVER_URL);
                return {
                    host: url.hostname,
                    port: +url.port,
                };
            }
            return {};
        })(),
        clearScreen: false,
    };
});
