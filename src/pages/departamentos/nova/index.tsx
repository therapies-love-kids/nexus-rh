import { useState } from 'react';
import { Breadcrumbs, Modal } from "@/components";
import { Link } from 'react-router-dom';
import { IoArrowBack } from 'react-icons/io5';

export default function NovoDepartamento() {
    const [departamentoNome, setDepartamentoNome] = useState('');
    const [modalMessage, setModalMessage] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSubmit = async () => {
        if (!departamentoNome) {
            setModalMessage('Preencha todos os campos obrigatórios: "departamento".');
            setIsModalOpen(true);
            return;
        }

        try {
            const table = 'profissionais_departamento';
            const columns = ['departamento'];
            const values = [departamentoNome];

            const result = await window.ipcRenderer.invoke('insert-records-postgres', { table, columns, values });

            if (result.success) {
                setModalMessage('Departamento criado com sucesso!');
            } else {
                setModalMessage(`Erro ao adicionar departamento: ${result.message}`);
            }
        } catch (error) {
            console.error('Erro ao adicionar departamento:', error);
            setModalMessage('Erro ao adicionar departamento.');
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
                            <Link to={'/profissionais/departamentos'}>
                                <button className="btn btn-ghost w-full"><IoArrowBack /></button>
                            </Link>
                            <p className="card-title m-0 p-0">
                                Adicionar Novo Departamento
                            </p>
                        </div>

                        <div className="form-control mt-4">
                            <label className="label">
                                <span className="label-text">Nome do Departamento</span>
                            </label>
                            <input 
                                type="text" 
                                placeholder="Nome do departamento" 
                                className="input input-bordered" 
                                value={departamentoNome}
                                onChange={(e) => setDepartamentoNome(e.target.value)} 
                            />
                        </div>

                        <button 
                            className="btn btn-primary mt-6" 
                            onClick={handleSubmit}
                        >
                            Adicionar Departamento
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
