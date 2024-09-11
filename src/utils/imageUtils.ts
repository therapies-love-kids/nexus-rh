const baseFtpPath = '/profissionais/';  // Caminho no servidor FTP

export const uploadImageToFtp = async (localFilePath: string, imageName: string): Promise<string> => {
    try {
        // Invoca o IPC para fazer upload da imagem
        const result = await window.ipcRenderer.invoke('ftp-upload', localFilePath, `${baseFtpPath}${imageName}`);
        if (result.success) {
            return `${baseFtpPath}${imageName}`;  // Retorna o caminho da imagem no FTP
        } else {
            throw new Error(result.message || 'Erro desconhecido no upload');
        }
    } catch (err) {
        console.error('Erro ao fazer upload da imagem:', err);
        throw err;
    }
};
