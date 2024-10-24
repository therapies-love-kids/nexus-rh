import { useState } from 'react';

export function useProfissionaisNew() {
    const [modalMessage, setModalMessage] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSubmit = async (
        nome: string,
        senha: string,
        dataIngressoEmpresa: Date | null,
        cpf: string,
        unidadeIds: number[],
        empresaIds: number[],
        departamentoIds: number[],
        funcaoIds: number[],
        funcoesPermissoes: any
    ) => {
        if (!nome || !senha || !dataIngressoEmpresa || !cpf || !unidadeIds.length || !departamentoIds.length || !funcaoIds.length || !empresaIds.length) {
            setModalMessage('Preencha todos os campos obrigatórios.');
            setIsModalOpen(true);
            return;
        }

        try {
            const table = 'profissionais';
            const columns = ['profissional_nome', 'profissional_senha', 'profissional_dataingressoempresa', 'profissional_cpf'];
            const values = [nome, senha, dataIngressoEmpresa, cpf];

            const result = await window.ipcRenderer.invoke('insert-records-postgres', { table, columns, values });

            if (result.success) {
                const query = `SELECT profissional_id FROM profissionais WHERE profissional_nome = $1`;
                const searchResult = await window.ipcRenderer.invoke('query-database-postgres', query, [nome]);

                if (searchResult.length > 0) {
                    const profissionalId = searchResult[0].profissional_id;

                    // Criação das promessas de inserção
                    const insertPromisesUnidades = unidadeIds.map((unidadeId) => (
                        window.ipcRenderer.invoke('insert-records-postgres', {
                            table: 'profissionais_unidade_associacao',
                            columns: ['profissional_id', 'unidade_id'],
                            values: [profissionalId, unidadeId],
                        })
                    ));

                    const insertPromisesEmpresas = empresaIds.map((empresaId) => (
                        window.ipcRenderer.invoke('insert-records-postgres', {
                            table: 'profissionais_empresa_associacao',
                            columns: ['profissional_id', 'empresa_id'],
                            values: [profissionalId, empresaId],
                        })
                    ));

                    const insertPromisesDepartamentos = departamentoIds.map((departamentoId) => (
                        window.ipcRenderer.invoke('insert-records-postgres', {
                            table: 'profissionais_departamento_associacao',
                            columns: ['profissional_id', 'departamento_id'],
                            values: [profissionalId, departamentoId],
                        })
                    ));

                    const insertPromisesFuncoes = funcaoIds.map((funcaoId) => {
                        const permissoes = funcoesPermissoes[funcaoId] || {
                            perm_editar: false,
                            perm_criar: false,
                            perm_inativar: false,
                            perm_excluir: false,
                        };
                
                        return window.ipcRenderer.invoke('insert-records-postgres', {
                            table: 'profissionais_funcao_associacao',
                            columns: ['profissional_id', 'funcao_id', 'perm_editar', 'perm_criar', 'perm_inativar', 'perm_excluir'],
                            values: [profissionalId, funcaoId, permissoes.perm_editar, permissoes.perm_criar, permissoes.perm_inativar, permissoes.perm_excluir],
                        });
                    });

                    await Promise.all([
                        ...insertPromisesUnidades,
                        ...insertPromisesEmpresas,
                        ...insertPromisesDepartamentos,
                        ...insertPromisesFuncoes,
                    ]);

                    setModalMessage('Usuário criado com sucesso!');
                } else {
                    setModalMessage('Erro: Não foi possível encontrar o ID do profissional inserido.');
                }
            } else {
                setModalMessage(`Erro ao adicionar profissional: ${result.message}`);
            }
        } catch (error) {
            setModalMessage('Erro ao adicionar profissional.');
        } finally {
            setIsModalOpen(true);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setModalMessage(null);
    };

    return {
        handleSubmit,
        modalMessage,
        isModalOpen,
        handleCloseModal
    };
}
