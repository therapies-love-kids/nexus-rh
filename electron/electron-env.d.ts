/// <reference types="vite-electron-plugin/electron-env" />

declare namespace NodeJS {
    interface ProcessEnv {
        VSCODE_DEBUG?: 'false' | 'true';
        APP_ROOT: string;
        VITE_PUBLIC: string;
    }
}