import ftp from 'basic-ftp';
import { ipcMain } from 'electron';
import { Writable } from 'stream';


// Configurações do FTP
const ftpConfig = {
    host: '192.168.1.13',
    user: 'ftpimages',
    password: 'tlk@951753',
    secure: false, // Manter o SSL habilitado
    secureOptions: {
        rejectUnauthorized: false, // Ignora certificados auto-assinados
        sessionTickets: true, // Tentar reutilização de sessão
    }
};


async function getImageFromFtp(remoteFilePath: string): Promise<Buffer> {
    const client = new ftp.Client();
    client.ftp.verbose = true;
    try {
        await client.access(ftpConfig);

        const chunks: Buffer[] = [];
        const writableStream = new Writable({
            write(chunk, encoding, callback) {
                chunks.push(chunk);
                callback();
            }
        });

        await client.downloadTo(writableStream, remoteFilePath);
        return Buffer.concat(chunks);
    } catch (err) {
        if (err instanceof Error) {
            console.error('Erro ao conectar ao FTP:', err.message);
        } else {
            console.error('Erro desconhecido ao conectar ao FTP:', err);
        }
        throw err;
    } finally {
        client.close();
    }
}

ipcMain.handle('ftp-get-image', async (event, fileName: string | null) => {
    try {
        const imagePath = fileName ? `profissionais/${fileName}` : 'profissionais/default.png';
        const imageBuffer = await getImageFromFtp(imagePath);
        const base64Image = imageBuffer.toString('base64');
        return { success: true, base64Image };
    } catch (error) {
        if (error instanceof Error) {
            return { success: false, message: error.message };
        } else {
            return { success: false, message: 'Erro desconhecido' };
        }
    }
});
