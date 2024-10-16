import { app, ipcMain } from 'electron'
import { createRequire } from 'node:module'
import type { ProgressInfo, UpdateDownloadedEvent, UpdateInfo} from 'electron-updater'
const { autoUpdater } = createRequire(import.meta.url)('electron-updater');


export function update(win: Electron.BrowserWindow) {
    autoUpdater.autoDownload = false
    autoUpdater.disableWebInstaller = false
    autoUpdater.allowDowngrade = false

    // Verificação de atualização
    autoUpdater.on('checking-for-update', () => {
        console.log('Verificando por atualizações...')
    })

    // Atualização disponível
    autoUpdater.on('update-available', (arg: UpdateInfo) => {
        console.log(`Atualização disponível: versão ${arg.version}`)
        win.webContents.send('update-can-available', { update: true, version: app.getVersion(), newVersion: arg?.version })
    })

    // Atualização não disponível
    autoUpdater.on('update-not-available', (arg: UpdateInfo) => {
        console.log('Nenhuma atualização disponível')
        win.webContents.send('update-can-available', { update: false, version: app.getVersion(), newVersion: arg?.version })
    })

    ipcMain.handle('check-update', async () => {
        if (!app.isPackaged) {
            const error = new Error('O recurso de atualização está disponível apenas após o empacotamento.')
            return { message: error.message, error }
        }

        try {
            return await autoUpdater.checkForUpdatesAndNotify()
        } catch (error) {
            console.error('Erro ao verificar atualizações:', error)
            return { message: 'Erro de rede', error }
        }
    })

    ipcMain.handle('start-download', (event: Electron.IpcMainInvokeEvent) => {
        console.log('Iniciando download da atualização...')
        startDownload(
            (error, progressInfo) => {
                if (error) {
                    console.error('Erro durante o download:', error)
                    event.sender.send('update-error', { message: error.message, error })
                } else {
                    event.sender.send('download-progress', progressInfo)
                }
            },
            () => {
                console.log('Download da atualização concluído')
                event.sender.send('update-downloaded')
            }
        )
    })

    ipcMain.handle('quit-and-install', () => {
        win.webContents.send('update-status', 'Fechando o aplicativo para atualizar...');
        setTimeout(() => {
            autoUpdater.quitAndInstall(false, true);
        }, 1000); // Aguardar um segundo para garantir que todos os processos sejam encerrados
    });
}

function startDownload(
    callback: (error: Error | null, info: ProgressInfo | null) => void,
    complete: (event: UpdateDownloadedEvent) => void,
) {
    autoUpdater.on('download-progress', (info: ProgressInfo) => callback(null, info))
    autoUpdater.on('error', (error: Error) => callback(error, null))
    autoUpdater.on('update-downloaded', complete)
    autoUpdater.downloadUpdate()
}
