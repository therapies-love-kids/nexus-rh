import { useState, useEffect } from 'react';
import { Breadcrumbs, Modal, TextInput } from "@/components";
import { Link, useParams } from 'react-router-dom';
import { IoArrowBack } from 'react-icons/io5';

export default function AtualizarDepartamento() {
    const { departamento_id } = useParams<string>();
    const [departamentoNome, setDepartamentoNome] = useState<string>('');
    const [modalMessage, setModalMessage] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    useEffect(() => {
        const fetchDepartamentoData = async () => {
            try {
                if (departamento_id) {
                    const result = await window.ipcRenderer.invoke(
                        'query-database-postgres',
                        `SELECT departamento FROM profissionais_departamento WHERE departamento_id = ${departamento_id}`
                    );
                    const departamento = result[0];
                    setDepartamentoNome(departamento.departamento ?? '');
                }
            } catch (error) {
                console.log(error);
            }
        };

        fetchDepartamentoData();
    }, [departamento_id]);

    const handleSubmit = async () => {
        if (!departamentoNome) {
            setModalMessage('Preencha todos os campos obrigatórios: departamento.');
            setIsModalOpen(true);
            return;
        }
    
        try {
            const table = 'profissionais_departamento';
            const updates = {
                departamento: departamentoNome,
            };
    
            if (departamento_id) {
                const ids = [parseInt(departamento_id, 10)];
                
                const result = await window.ipcRenderer.invoke('update-records-postgres', {
                    table,
                    updates,
                    ids,
                    idColumn: 'departamento_id'
                });
    
                if (result.success) {
                    setModalMessage('Departamento atualizada com sucesso!');
                } else {
                    setModalMessage(`Erro ao atualizar departamento: ${result.message}`);
                }
            } else {
                setModalMessage('ID do departamento não encontrado.');
            }
        } catch (error) {
            setModalMessage(`Erro ao atualizar departamento: ${error}`);
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
                            <Link to={'/departamentos'}>
                                <button className="btn btn-ghost w-full"><IoArrowBack /></button>
                            </Link>
                            <p className="card-title m-0 p-0">
                                Atualizar Departamento
                            </p>
                        </div>

                        <TextInput 
                            label="Nome do Departamento"
                            placeholder="Nome do departamento"
                            value={departamentoNome}
                            onChange={(e) => setDepartamentoNome(e.target.value)}
                        />

                        <button 
                            className="btn btn-primary mt-6" 
                            onClick={handleSubmit}
                        >
                            Atualizar Departamento
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
