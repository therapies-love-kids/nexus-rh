import { useState, useEffect } from 'react';
import { DownloadImageFtp } from "@/hooks/hookFTP";

export function useDepartamentos(status: string = 'ativo') {
    const [departamentos, setDepartamentos] = useState<{ departamento_id: number, departamento: string }[]>([]);

    useEffect(() => {
        const fetchDepartamentos = async () => {
            const result = await window.ipcRenderer.invoke(
                'query-database-postgres',
                `SELECT departamento_id, departamento FROM profissionais_departamento WHERE departamento_status1 = $1`,
                [status]
            );
            setDepartamentos(result);
        };
        fetchDepartamentos();
    }, [status]);

    return departamentos;
}

export function useEmpresas(status: string = 'ativo') {
    const [empresas, setEmpresas] = useState<{ empresa_id: number, empresa: string, cnpj: string }[]>([]);

    useEffect(() => {
        const fetchEmpresas = async () => {
            const result = await window.ipcRenderer.invoke(
                'query-database-postgres',
                `SELECT empresa_id, empresa, cnpj FROM profissionais_empresa WHERE empresa_status1 = $1`,
                [status]
            );
            setEmpresas(result);
        };
        fetchEmpresas();
    }, [status]);

    return empresas;
}

export function useFuncoes(profissionalId?: number, status?: string) {
    const [funcoes, setFuncoes] = useState<{
        profissional_id: number; funcao_id: number, funcao: string 
}[]>([]);

    useEffect(() => {
        const fetchFuncoes = async () => {
            const query = profissionalId
                ? `SELECT f.funcao_id, f.funcao 
                    FROM profissionais_funcao f
                    JOIN profissionais_funcao_associacao pfa ON f.funcao_id = pfa.funcao_id
                    WHERE pfa.profissional_id = $1 ${status ? 'AND f.funcao_status1 = $2' : ''}`
                : `SELECT funcao_id, funcao 
                    FROM profissionais_funcao 
                    ${status ? 'WHERE funcao_status1 = $1' : ''}`;

            const params = profissionalId
                ? status
                    ? [profissionalId, status]
                    : [profissionalId]
                : status
                    ? [status]
                    : [];

            const result = await window.ipcRenderer.invoke('query-database-postgres', query, params);
            setFuncoes(result);
        };

        fetchFuncoes();
    }, [profissionalId, status]);

    return funcoes;
}

export function useUnidades(profissionalId?: number, status?: string) {
    const [unidades, setUnidades] = useState<{
        profissional_id: number; unidade_id: number, unidade: string, endereco: string, cep: string 
}[]>([]);

    useEffect(() => {
        const fetchUnidades = async () => {
            const query = profissionalId
                ? `SELECT u.unidade_id, u.unidade, u.endereco, u.cep
                    FROM profissionais_unidade u
                    JOIN profissionais_unidade_associacao pua ON u.unidade_id = pua.unidade_id
                    WHERE pua.profissional_id = $1 ${status ? 'AND u.unidade_status1 = $2' : ''}`
                : `SELECT unidade_id, unidade, endereco, cep 
                    FROM profissionais_unidade 
                    ${status ? 'WHERE unidade_status1 = $1' : ''}`;

            const params = profissionalId
                ? status
                    ? [profissionalId, status]
                    : [profissionalId]
                : status
                    ? [status]
                    : [];

            const result = await window.ipcRenderer.invoke('query-database-postgres', query, params);
            setUnidades(result);
        };

        fetchUnidades();
    }, [profissionalId, status]);

    return unidades;
}

export function useProfissionais(
    baseFolder: string,
    status: string = 'ativo',
    departamentoId?: number | undefined,
    unidadeID?: number | undefined,
    funcaoID?: number | undefined,
    empresaID?: number | undefined,
    ) {
    const [profissionais, setProfissionais] = useState<any[]>([]);
    const [unidades, setUnidades] = useState<{ [key: number]: any[] }>({});
    const [funcoes, setFuncoes] = useState<{ [key: number]: any[] }>({});
    const [empresas, setEmpresas] = useState<any[]>([]);
    const [departamentos, setDepartamentos] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const whereClauses: string[] = [`p.profissional_status1 = $1`];
                const params: any[] = [status];

                if (departamentoId !== undefined) {
                    whereClauses.push(`dpa.departamento_id = $2`);
                    params.push(departamentoId);
                }

                if (unidadeID !== undefined) {
                    whereClauses.push(`pua.unidade_id = $3`);
                    params.push(unidadeID);
                }

                if (funcaoID !== undefined) {
                    whereClauses.push(`pfa.funcao_id = $4`);
                    params.push(funcaoID);
                }

                const queryProfissionais = `
                    SELECT DISTINCT p.profissional_id, p.profissional_nome, p.profissional_foto 
                    FROM profissionais p 
                    JOIN profissionais_departamento_associacao dpa ON p.profissional_id = dpa.profissional_id 
                    LEFT JOIN profissionais_unidade_associacao pua ON p.profissional_id = pua.profissional_id
                    LEFT JOIN profissionais_funcao_associacao pfa ON p.profissional_id = pfa.profissional_id
                    WHERE ${whereClauses.join(' AND ')}
                `;

                const resultProfissionais = await window.ipcRenderer.invoke('query-database-postgres', queryProfissionais, params);
                
                const profissionaisWithImages = await Promise.all(resultProfissionais.map(async (profissional: any) => {
                    const imageUrl = await DownloadImageFtp(baseFolder, profissional.profissional_foto);
                    return { ...profissional, imageUrl };
                }));

                setProfissionais(profissionaisWithImages);

                // Carregar unidades e funções
                const newUnidades: { [key: number]: any[] } = {};
                const newFuncoes: { [key: number]: any[] } = {};

                for (const prof of profissionaisWithImages) {
                    // Unidades
                    const queryUnidades = `
                        SELECT u.unidade_id, u.unidade 
                        FROM profissionais_unidade u
                        JOIN profissionais_unidade_associacao pua ON u.unidade_id = pua.unidade_id
                        WHERE pua.profissional_id = $1`;
                        
                    const unidadesResult = await window.ipcRenderer.invoke('query-database-postgres', queryUnidades, [prof.profissional_id]);
                    newUnidades[prof.profissional_id] = unidadesResult;

                    // Funções
                    const queryFuncoes = `
                        SELECT f.funcao_id, f.funcao 
                        FROM profissionais_funcao f
                        JOIN profissionais_funcao_associacao pfa ON f.funcao_id = pfa.funcao_id
                        WHERE pfa.profissional_id = $1`;
                    const funcoesResult = await window.ipcRenderer.invoke('query-database-postgres', queryFuncoes, [prof.profissional_id]);
                    newFuncoes[prof.profissional_id] = funcoesResult;
                }

                setUnidades(newUnidades);
                setFuncoes(newFuncoes);

                // Carregar empresas
                const queryEmpresas = `SELECT empresa_id, empresa FROM profissionais_empresa WHERE empresa_status1 = $1`;
                const empresasResult = await window.ipcRenderer.invoke('query-database-postgres', queryEmpresas, [status]);
                setEmpresas(empresasResult);

                // Carregar departamentos
                const queryDepartamentos = `SELECT departamento_id, departamento FROM profissionais_departamento WHERE departamento_status1 = $1`;
                const departamentosResult = await window.ipcRenderer.invoke('query-database-postgres', queryDepartamentos, [status]);
                setDepartamentos(departamentosResult);

            } catch (error) {
                console.error('Erro ao buscar dados:', error);
            }
        };

        fetchData();
    }, [departamentoId, baseFolder, status, unidadeID, funcaoID, empresaID]);

    return { profissionais, unidades, funcoes, empresas, departamentos };
}
