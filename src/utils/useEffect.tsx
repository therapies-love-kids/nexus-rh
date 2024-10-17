import { useState, useEffect } from 'react';
import { fetchImageFromFtp } from "@/utils/imageUtils";

// Hook para buscar departamentos e profissionais relacionados
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

// Hook para buscar tarefas por departamento
interface Tarefa {
    tarefa_id: number;
    tarefa_titulo: string;
    tarefa_descricao: string;
    tarefa_status: string;
    tarefa_prioridade: 'baixa' | 'media' | 'alta';
    tarefa_data_criacao: string;
    tarefa_data_vencimento: string;
    tarefa_departamento_id: number;
    tarefa_unidade_id: number;
    funcao_id: number;
    tarefa_atribuida_por: number;
    tarefa_projeto_id: number;
}

export function useTarefas(departamentoId: number | undefined) {
    const [tarefas, setTarefas] = useState<Tarefa[]>([]); // Definindo o tipo do estado

    useEffect(() => {
        if (departamentoId) {
            const fetchTarefas = async () => {
                try {
                    const result = await window.ipcRenderer.invoke(
                        'query-database-postgres',
                        `SELECT tarefa_id, tarefa_titulo, tarefa_descricao, tarefa_status, tarefa_prioridade, tarefa_data_criacao, tarefa_data_vencimento, tarefa_departamento_id, tarefa_unidade_id, funcao_id, tarefa_atribuida_por, tarefa_projeto_id 
                        FROM tarefas 
                        WHERE tarefa_departamento_id = $1`,
                        [departamentoId]
                    );
                    setTarefas(result);
                } catch (error) {
                    console.error('Erro ao buscar tarefas:', error);
                }
            };

            fetchTarefas();
        }
    }, [departamentoId]);

    return tarefas;
}


// Hook para buscar e armazenar a URL da imagem do profissional
export function useProfissionalImage(profissional_id: number | any) {
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
                    const imageUrl = await fetchImageFromFtp(profissional.profissional_foto);
                    setImageUrls((prev) => ({ ...prev, [profissional_id]: imageUrl }));
                } catch (error) {
                    console.error('Erro ao buscar a imagem do profissional:', error);
                }
            }
        };

        fetchProfissionalImage();
    }, [profissional_id]);

    return imageUrls[profissional_id] || null;
}

// Hook genérico para buscar dados de um profissional
export function useProfissional(profissional_id: number | undefined) {
    const [profissionalData, setProfissionalData] = useState<any>(null);

    useEffect(() => {
        const fetchProfissionalData = async () => {
            if (profissional_id) {
                try {
                    const result = await window.ipcRenderer.invoke(
                        'query-database-postgres',
                        `SELECT * FROM profissionais WHERE profissional_id = $1`,
                        [profissional_id]
                    );
                    setProfissionalData(result[0]);
                } catch (error) {
                    console.error('Erro ao buscar dados do profissional:', error);
                }
            }
        };

        fetchProfissionalData();
    }, [profissional_id]);

    return profissionalData;
}

export function useProjetos(departamentoId: number | undefined) {
    const [projetos, setProjetos] = useState<{ projeto_id: number, projeto_nome: string }[]>([]);

    useEffect(() => {
        const fetchProjetos = async () => {
            if (departamentoId) {
                try {
                    const result = await window.ipcRenderer.invoke(
                        'query-database-postgres',
                        `SELECT projeto_id, projeto_nome 
                        FROM tarefas_projetos 
                        WHERE departamento_id = $1`,
                        [departamentoId]
                    );
                    setProjetos(result);
                } catch (error) {
                    console.error('Erro ao buscar projetos:', error);
                }
            }
        };

        fetchProjetos();
    }, [departamentoId]);

    return projetos;
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
