
import { app, BrowserWindow, ipcMain, shell } from 'electron';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import os from 'node:os';
import { update } from './update';
import { setupFtpIpcHandlers } from './ftpConnection';
import { setupMacAddressIpcHandler } from './macConsulta';
import { setupDatabaseIpcHandlers } from './DBConnection';
import '/public/icon.ico'
import '/public/icon.png'

const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.APP_ROOT = path.join(__dirname, '../..');

export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron');
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist');
export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;

// Define o diretório público
export const VITE_PUBLIC = path.join(process.env.APP_ROOT, 'public');
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? VITE_PUBLIC : RENDERER_DIST;

// Disable GPU Acceleration for Windows 7
if (os.release().startsWith('6.1')) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName());

if (!app.requestSingleInstanceLock()) {
    app.quit();
    process.exit(0);
}

let win: BrowserWindow | null = null;
const preload = path.join(__dirname, '../preload/index.mjs');
const indexHtml = path.join(RENDERER_DIST, 'index.html');

// Define o caminho do ícone
const iconPath = path.join(VITE_PUBLIC, 'icon.png'); // Verifique se o caminho está correto

async function createWindow() {
    const iconPath = path.join(VITE_PUBLIC, 'icon.png');

    win = new BrowserWindow({
        title: 'Main window',
        icon: iconPath,
        show: true,
        autoHideMenuBar: true,
        fullscreen: true,
        webPreferences: {
            preload,
        },
    });

    if (VITE_DEV_SERVER_URL) {
        win.loadURL(VITE_DEV_SERVER_URL);
        win.webContents.openDevTools();
    } else {
        win.loadFile(indexHtml);
    }

    win.webContents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith('https:')) shell.openExternal(url);
        return { action: 'deny' };
    });

    // Auto update
    update(win);
}

app.whenReady().then(() => {
    createWindow();
    setupFtpIpcHandlers();
    setupDatabaseIpcHandlers();
    setupMacAddressIpcHandler();
});

ipcMain.handle('app-close', () => {
    app.quit();
});

app.on('window-all-closed', () => {
    win = null;
    if (process.platform !== 'darwin') app.quit();
});

app.on('second-instance', () => {
    if (win) {
        if (win.isMinimized()) win.restore();
        win.focus();
    }
});

app.on('activate', () => {
    const allWindows = BrowserWindow.getAllWindows();
    if (allWindows.length) {
        allWindows[0].focus();
    } else {
        createWindow();
    }
});

ipcMain.handle('open-win', (_, arg) => {
    const childWindow = new BrowserWindow({
        icon: iconPath,
        webPreferences: {
            preload,
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    if (VITE_DEV_SERVER_URL) {
        childWindow.loadURL(`${VITE_DEV_SERVER_URL}#${arg}`);
    } else {
        childWindow.loadFile(indexHtml, { hash: arg });
    }
});