/// <reference types="vite-electron-plugin/electron-env" />

declare namespace NodeJS {
    interface ProcessEnv {
        VSCODE_DEBUG?: 'false' | 'true';  // Inclui 'true' para debugging
        APP_ROOT: string;  // Certifique-se que essa variável está no .env
        VITE_PUBLIC: string;  // Certifique-se que essa variável está no .env
        GH_TOKEN: string;  // Adicione o token do GitHub se necessário
    }
}