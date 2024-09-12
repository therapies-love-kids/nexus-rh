export const fetchImageFromFtp = async (imagePath: string | null): Promise<string> => {
    try {
        // Invoca o método IPC para obter a imagem do FTP
        const result = await window.ipcRenderer.invoke('ftp-get-image', imagePath);
        if (result.success) {
            // Retorna a imagem no formato base64 para ser utilizada no front-end
            return `data:image/jpeg;base64,${result.base64Image}`;
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        console.error('Erro ao buscar imagem do FTP:', error);
        // Retorna a imagem padrão em caso de erro
        return '/default.png';
    }
};
