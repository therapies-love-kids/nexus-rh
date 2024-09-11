import 'electron';

declare global {
    namespace Electron {
        interface IpcMain {
            handle(channel: 'ftp-upload', listener: (event: Electron.IpcMainInvokeEvent, localFilePath: string, remoteFilePath: string) => Promise<{ success: boolean; message?: string }>): void;
        }
    }
}


interface VersionInfo {
    update: boolean
    version: string
    newVersion?: string
}

interface ErrorType {
    message: string
    error: Error
}
