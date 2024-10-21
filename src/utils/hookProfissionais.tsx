import { useState, useEffect } from 'react';
import { DownloadImageFtp } from "@/utils/hookFTP";

export function useDepartamentos(selectedDepartamento: number | undefined, fetchProfissionais: (departamentoId: number) => Promise<void>) {
    const [departamentos, setDepartamentos] = useState<{ departamento_id: number, departamento: string }[]>([]);

    useEffect(() => {
        const fetchDepartamentos = async () => {
            const result = await window.ipcRenderer.invoke(
                'query-database-postgres',
                `SELECT departamento_id, departamento FROM profissionais_departamento WHERE departamento_status1 = 'ativo'`
            );
            setDepartamentos(result);
            if (selectedDepartamento) {
                fetchProfissionais(selectedDepartamento);
            }
        };
        fetchDepartamentos();
    }, [selectedDepartamento, fetchProfissionais]);

    return departamentos;
}

export function useProfissionalImage(profissional_id: number | any, baseFolder: string) {
    const [imageUrls, setImageUrls] = useState<Record<number, string>>({});

    useEffect(() => {
        const fetchProfissionalImage = async () => {
            if (profissional_id) {
                try {
                    const result = await window.ipcRenderer.invoke(
                        'query-database-postgres',
                        `SELECT profissional_foto FROM profissionais WHERE profissional_id = $1`,
                        [profissional_id]
                    );
                    const profissional = result[0];
                    const imageUrl = await DownloadImageFtp(baseFolder, profissional.profissional_foto);
                    setImageUrls((prev) => ({ ...prev, [profissional_id]: imageUrl }));
                } catch (error) {
                    console.error('Erro ao buscar a imagem do profissional:', error);
                }
            }
        };

        fetchProfissionalImage();
    }, [profissional_id, baseFolder]);

    return imageUrls[profissional_id] || null;
}

export function useProfissionais(departamentoId: number | undefined) {
    const [profissionais, setProfissionais] = useState<{ profissional_id: number, profissional_nome: string }[]>([]);

    useEffect(() => {
        const fetchProfissionais = async () => {
            if (departamentoId) {
                try {
                    const result = await window.ipcRenderer.invoke(
                        'query-database-postgres',
                        `SELECT profissional_id, profissional_nome 
                        FROM profissionais 
                        WHERE profissional_id IN (
                            SELECT profissional_id 
                            FROM profissionais_departamento_associacao 
                            WHERE departamento_id = $1
                        ) AND profissional_status1 = 'ativo'`,
                        [departamentoId]
                    );
                    setProfissionais(result);
                } catch (error) {
                    console.error('Erro ao buscar profissionais:', error);
                }
            }
        };

        fetchProfissionais();
    }, [departamentoId]);

    return profissionais;
}