import { useState, useEffect } from 'react';
import { Breadcrumbs, Modal } from "@/components";

interface Unidade {
    id: number;
    unidade: string;
}

interface Funcao {
    id: number;
    funcao: string;
}

export default function NovoProfissional() {
    const [nome, setNome] = useState('');
    const [unidadeId, setUnidadeId] = useState<number | null>(null);
    const [funcaoId, setFuncaoId] = useState<number | null>(null);
    const [modalMessage, setModalMessage] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [unidades, setUnidades] = useState<Unidade[]>([]);
    const [funcoes, setFuncoes] = useState<Funcao[]>([]);

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                // Buscar unidades com ID e nome
                const unidadeResult = await window.ipcRenderer.invoke(
                    'query-database-postgres',
                    'SELECT id, unidade FROM profissionais_unidade'
                );
                setUnidades(unidadeResult);

                // Buscar funções com ID e nome
                const funcaoResult = await window.ipcRenderer.invoke(
                    'query-database-postgres',
                    'SELECT id, funcao FROM profissionais_funcao'
                );
                setFuncoes(funcaoResult);
            } catch (error) {
                console.error('Erro ao buscar opções:', error);
            }
        };
        fetchOptions();
    }, []);

    const handleSubmit = async () => {
        if (unidadeId === null || funcaoId === null) {
            setModalMessage('Selecione uma unidade e uma função.');
            setIsModalOpen(true);
            return;
        }

        try {
            // Dados a serem inseridos
            const table = 'profissionais';
            const columns = ['profissional_nome', 'profissional_unidade_id', 'profissional_funcao_id'];
            const values = [nome, unidadeId, funcaoId];

            // Enviar os dados para a base de dados
            const result = await window.ipcRenderer.invoke('insert-into-database', { table, columns, values });

            if (result.success) {
                setModalMessage('Profissional adicionado com sucesso!');
            } else {
                setModalMessage(`Erro ao adicionar profissional: ${result.message}`);
            }
        } catch (error) {
            console.error('Erro ao adicionar profissional:', error);
            setModalMessage('Erro ao adicionar profissional.');
        } finally {
            setIsModalOpen(true);
        }
    };

    return (
        <div className='bg-base-200 min-h-screen'>
            <Breadcrumbs />

            <div className="px-24 rounded">
                <div className="card bg-base-100 shadow-xl w-full my-10">
                    <div className="card-body">
                        <h2 className="card-title">Adicionar Novo Profissional</h2>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Nome</span>
                            </label>
                            <input 
                                type="text" 
                                placeholder="Nome do profissional" 
                                className="input input-bordered"
                                value={nome}
                                onChange={(e) => setNome(e.target.value)} 
                            />
                        </div>

                        <div className="form-control mt-4">
                            <label className="label">
                                <span className="label-text">Unidade</span>
                            </label>
                            <select
                                className="select select-bordered"
                                value={unidadeId || ''}
                                onChange={(e) => setUnidadeId(Number(e.target.value))}
                            >
                                <option value="" disabled>Selecione a unidade</option>
                                {unidades.map((unidadeOption) => (
                                    <option key={unidadeOption.id} value={unidadeOption.id}>
                                        {unidadeOption.unidade}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-control mt-4">
                            <label className="label">
                                <span className="label-text">Função</span>
                            </label>
                            <select
                                className="select select-bordered"
                                value={funcaoId || ''}
                                onChange={(e) => setFuncaoId(Number(e.target.value))}
                            >
                                <option value="" disabled>Selecione a função</option>
                                {funcoes.map((funcaoOption) => (
                                    <option key={funcaoOption.id} value={funcaoOption.id}>
                                        {funcaoOption.funcao}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button 
                            className="btn btn-primary mt-6" 
                            onClick={handleSubmit}
                        >
                            Adicionar Profissional
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <Modal 
                    type={modalMessage?.includes('sucesso') ? 'success' : 'error'} 
                    message={modalMessage || ''} 
                    onClose={() => setIsModalOpen(false)} 
                />
            )}
        </div>
    );
}