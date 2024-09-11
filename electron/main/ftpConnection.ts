import ftp from 'basic-ftp';
import { ipcMain } from 'electron';

// Configurações do FTP
const ftpConfig = {
    host: '192.168.1.13',  // Substitua pelo IP do seu servidor
    user: 'ftpimages',
    password: 'tlk@951753',
    secure: false  // Ou true se estiver usando FTP sobre TLS/SSL
};

async function uploadImageToFtp(localFilePath: string, remoteFilePath: string): Promise<void> {
    const client = new ftp.Client();
    client.ftp.verbose = true;
    try {
        await client.access(ftpConfig);
        await client.uploadFrom(localFilePath, remoteFilePath);
    } catch (err) {
        if (err instanceof Error) {
            console.error('Erro ao conectar ao FTP:', err.message);
        } else {
            console.error('Erro ao conectar ao FTP:', err);
        }
        throw err;
    } finally {
        client.close();
    }
}

// Expondo a função via IPC
ipcMain.handle('ftp-upload', async (event, localFilePath: string, remoteFilePath: string) => {
    try {
        await uploadImageToFtp(localFilePath, remoteFilePath);
        return { success: true };
    } catch (error) {
        if (error instanceof Error) {
            return { success: false, message: error.message };
        } else {
            return { success: false, message: 'Erro desconhecido' };
        }
    }
});