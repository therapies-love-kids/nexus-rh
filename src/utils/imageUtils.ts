// src/utils/imageUtils.ts
const baseImagePath = 'http://192.168.1.13/profissionais/'; // Atualize com o caminho base do Apache

export const getSambaImageUrl = (imagePath: string | null): string => {
    if (!imagePath) {
        return `${baseImagePath}default.png`; // Caminho para a imagem padrão
    }
    return `${baseImagePath}${imagePath}`;
};
