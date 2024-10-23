export const DownloadImageFtp = async (baseFolder: string, imagePath: string | null): Promise<string> => {
    try {
        const fixedPath = '/home/ftpimages';
        const remoteFilePath = `${fixedPath}/${baseFolder}/${imagePath}`;
        // console.log('Caminho gerado para o download:', remoteFilePath);

        const result = await window.ipcRenderer.invoke('download-ftp', { remoteFilePath });
        
        if (result.success) {
            return `data:image/jpeg;base64,${result.base64Image}`;
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        console.error('Erro ao buscar imagem do FTP:', error);
        return '/default.png';
    }
};

export const uploadImageFtp = async (baseFolder: string, localFilePath: string, imageName: string): Promise<void> => {
    try {
        const fixedPath = '/home/ftpimages';
        
        const remoteFileName = `${fixedPath}/${baseFolder}/${imageName}`;

        const result = await window.ipcRenderer.invoke('upload-ftp', { localFilePath, remoteFileName });

        if (!result.success) {
            throw new Error(result.message);
        }
    } catch (error) {
        console.error('Erro ao enviar a imagem para o FTP:', error);
        throw error;
    }
};
