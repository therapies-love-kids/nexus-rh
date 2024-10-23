import { useState, useEffect } from "react";

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
    coluna_id: number;
}

export function useTarefas(departamentoId: number | undefined, status: string) {
    const [tarefas, setTarefas] = useState<Tarefa[]>([]);

    useEffect(() => {
        if (departamentoId) {
            const fetchTarefas = async () => {
                try {
                    const result = await window.ipcRenderer.invoke(
                        'query-database-postgres',
                        `SELECT tarefa_id, tarefa_titulo, tarefa_descricao, tarefa_status, tarefa_prioridade, tarefa_data_criacao, tarefa_data_vencimento, tarefa_departamento_id, tarefa_unidade_id, funcao_id, tarefa_atribuida_por, tarefa_projeto_id, coluna_id
                        FROM tarefas 
                        WHERE tarefa_departamento_id = $1
                        AND tarefa_status = $2`,
                        [departamentoId, status]
                    );
                    setTarefas(result);
                } catch (error) {
                    console.error('Erro ao buscar tarefas:', error);
                }
            };

            fetchTarefas();
        }
    }, [departamentoId, status]);

    return tarefas;
}

export function useProjetos(departamentoId: number | undefined, status: string) {
    const [projetos, setProjetos] = useState<{ projeto_id: number, projeto_nome: string }[]>([]);

    useEffect(() => {
        const fetchProjetos = async () => {
            if (departamentoId) {
                try {
                    const result = await window.ipcRenderer.invoke(
                        'query-database-postgres',
                        `SELECT projeto_id, projeto_nome 
                        FROM tarefas_projetos 
                        WHERE departamento_id = $1
                        AND projeto_status = $2`,
                        [departamentoId, status]
                    );
                    setProjetos(result);
                } catch (error) {
                    console.error('Erro ao buscar projetos:', error);
                }
            }
        };

        fetchProjetos();
    }, [departamentoId, status]);

    return projetos;
}

export function useColunas(projetoId: number | undefined, status: string) {
    const [colunas, setColunas] = useState<{ coluna_id: number, coluna_nome: string, coluna_cor: string }[]>([]);

    useEffect(() => {
        const fetchColunas = async () => {
            if (projetoId) {
                try {
                    const result = await window.ipcRenderer.invoke(
                        'query-database-postgres',
                        `SELECT coluna_id, coluna_nome, coluna_cor 
                        FROM tarefas_colunas 
                        WHERE projeto_id = $1
                        AND coluna_status = $2`,
                        [projetoId, status]
                    );
                    setColunas(result);
                } catch (error) {
                    console.error('Erro ao buscar colunas:', error);
                }
            }
        };

        fetchColunas();
    }, [projetoId, status]);

    return colunas;
}
