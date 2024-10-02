import { useState, useEffect } from 'react';
import { Breadcrumbs, Modal } from "@/components";
import { Link, useParams } from 'react-router-dom';
import { IoArrowBack } from 'react-icons/io5';

export default function AtualizarFuncao() {
    const { id } = useParams<string>();
    const [funcaoNome, setFuncaoNome] = useState<string>('');
    const [modalMessage, setModalMessage] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    useEffect(() => {
        const fetchFuncaoData = async () => {
            try {
                if (id) {
                    const result = await window.ipcRenderer.invoke(
                        'query-database-postgres',
                        `SELECT funcao FROM profissionais_funcao WHERE id = ${id}`
                    );
                    const funcao = result[0];
                    setFuncaoNome(funcao.funcao ?? '');
                }
            } catch (error) {
                console.log(error);
            }
        };

        fetchFuncaoData();
    }, [id]);

    const handleSubmit = async () => {
        if (!funcaoNome) {
            setModalMessage('Preencha todos os campos obrigatórios: função.');
            setIsModalOpen(true);
            return;
        }
    
        try {
            const table = 'profissionais_funcao';
            const updates = {
                funcao: funcaoNome,
            };
    
            if (id) {
                const ids = [parseInt(id, 10)];
                
                const result = await window.ipcRenderer.invoke('update-records-postgres', {
                    table,
                    updates,
                    ids,
                    idColumn: 'id' // Especificando a coluna de identificação
                });
    
                if (result.success) {
                    setModalMessage('Função atualizada com sucesso!');
                } else {
                    setModalMessage(`Erro ao atualizar função: ${result.message}`);
                }
            } else {
                setModalMessage('ID da função não encontrado.');
            }
        } catch (error) {
            setModalMessage(`Erro ao atualizar função: ${error}`);
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
                        <div className='flex flex-row items-center gap-2'>
                            <Link to={'/profissionais/funcoes'}>
                                <button className="btn btn-ghost w-full"><IoArrowBack /></button>
                            </Link>
                            <p className="card-title m-0 p-0">
                                Atualizar Função
                            </p>
                        </div>

                        <div className="form-control mt-4">
                            <label className="label">
                                <span className="label-text">Nome da Função</span>
                            </label>
                            <input 
                                type="text" 
                                placeholder="Nome da função" 
                                className="input input-bordered" 
                                value={funcaoNome}
                                onChange={(e) => setFuncaoNome(e.target.value)} 
                            />
                        </div>

                        <button 
                            className="btn btn-primary mt-6" 
                            onClick={handleSubmit}
                        >
                            Atualizar Função
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
                >
                    <p>{modalMessage}</p>
                </Modal>
            )}
        </div>
    );
}
