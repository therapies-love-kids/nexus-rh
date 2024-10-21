import { useState, useEffect } from 'react';
import { DownloadImageFtp } from "@/utils/hookFTP";

export function useDepartamentos(selectedDepartamento: any, fetchProfissionais: (departamentoId: number) => Promise<void>, status: string = 'ativo') {
    const [departamentos, setDepartamentos] = useState<{ departamento_id: number, departamento: string }[]>([]);

    useEffect(() => {
        const fetchDepartamentos = async () => {
            const result = await window.ipcRenderer.invoke(
                'query-database-postgres',
                `SELECT departamento_id, departamento FROM profissionais_departamento WHERE departamento_status1 = $1`,
                [status]
            );
            setDepartamentos(result);
            if (selectedDepartamento) {
                fetchProfissionais(selectedDepartamento);
            }
        };
        fetchDepartamentos();
    }, [selectedDepartamento, fetchProfissionais, status]);

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

export function useFuncoes(status: string = 'ativo') {
    const [funcoes, setFuncoes] = useState<{ funcao_id: number, funcao: string }[]>([]);

    useEffect(() => {
        const fetchFuncoes = async () => {
            const result = await window.ipcRenderer.invoke(
                'query-database-postgres',
                `SELECT funcao_id, funcao FROM profissionais_funcao WHERE funcao_status1 = $1`,
                [status]
            );
            setFuncoes(result);
        };
        fetchFuncoes();
    }, [status]);

    return funcoes;
}

export function useUnidades(status: string = 'ativo') {
    const [unidades, setUnidades] = useState<{ unidade_id: number, unidade: string, endereco: string, cep: string }[]>([]);

    useEffect(() => {
        const fetchUnidades = async () => {
            const result = await window.ipcRenderer.invoke(
                'query-database-postgres',
                `SELECT unidade_id, unidade, endereco, cep FROM profissionais_unidade WHERE unidade_status1 = $1`,
                [status]
            );
            setUnidades(result);
        };
        fetchUnidades();
    }, [status]);

    return unidades;
}

export function useProfissionais(departamentoId: number | undefined, baseFolder: string, status: string = 'ativo') {
    const [profissionais, setProfissionais] = useState<{
        profissional_id: number,
        profissional_nome: string,
        profissional_senha: string,
        profissional_foto: string,
        profissional_horaentrada: string,
        profissional_horasaida: string,
        profissional_dataingressoempresa: string,
        profissional_datanascimento: string,
        profissional_datademissaoempresa: string | null,
        profissional_cpf: string,
        profissional_status1: string,
        imageUrl?: string
    }[]>([]);

    useEffect(() => {
        const fetchProfissionais = async () => {
            try {
                const query = departamentoId
                    ? `SELECT p.profissional_id, p.profissional_nome, p.profissional_senha, p.profissional_foto, 
                                p.profissional_horaentrada, p.profissional_horasaida, p.profissional_dataingressoempresa, 
                                p.profissional_datanascimento, p.profissional_datademissaoempresa, p.profissional_cpf, p.profissional_status1
                        FROM profissionais p
                        JOIN profissionais_departamento_associacao dpa ON p.profissional_id = dpa.profissional_id
                        WHERE dpa.departamento_id = $1 AND p.profissional_status1 = $2`
                    : `SELECT p.profissional_id, p.profissional_nome, p.profissional_senha, p.profissional_foto, 
                                p.profissional_horaentrada, p.profissional_horasaida, p.profissional_dataingressoempresa, 
                                p.profissional_datanascimento, p.profissional_datademissaoempresa, p.profissional_cpf, p.profissional_status1
                        FROM profissionais p
                        WHERE p.profissional_status1 = $1`;

                const params = departamentoId ? [departamentoId, status] : [status];

                const result = await window.ipcRenderer.invoke('query-database-postgres', query, params);

                // Buscando as imagens dos profissionais
                const profissionaisWithImages = await Promise.all(result.map(async (profissional: any) => {
                    const imageUrl = await DownloadImageFtp(baseFolder, profissional.profissional_foto);
                    return { ...profissional, imageUrl };
                }));

                setProfissionais(profissionaisWithImages);
            } catch (error) {
                console.error('Erro ao buscar profissionais:', error);
            }
        };

        fetchProfissionais();
    }, [departamentoId, baseFolder, status]);

    return profissionais;
}