import { useState } from 'react';
import { Breadcrumbs, Modal } from "@/components";
import { Link } from 'react-router-dom';
import { IoArrowBack } from 'react-icons/io5';

export default function NovaFuncao() {
    const [funcaoNome, setFuncaoNome] = useState('');
    const [modalMessage, setModalMessage] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const isButtonDisabled = !funcaoNome;

    const handleSubmit = async () => {
        try {
            const table = 'profissionais_funcao';
            const columns = ['funcao'];
            const values = [funcaoNome];
            const result = await window.ipcRenderer.invoke('insert-records-postgres', { table, columns, values });
            if (result.success) {
                setModalMessage('Função criada com sucesso!');
            } else {
                setModalMessage(`Erro ao adicionar função: ${result.message}`);
            }
        } catch (error) {
            console.error('Erro ao adicionar função:', error);
            setModalMessage('Erro ao adicionar função.');
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
                            <Link to={'/funcoes'}>
                                <button className="btn btn-ghost w-full"><IoArrowBack /></button>
                            </Link>
                            <p className="card-title m-0 p-0">
                                Adicionar Nova função
                            </p>
                        </div>
                        <div className="form-control mt-4">
                            <label className="label">
                                <span className="label-text">Nome da função</span>
                            </label>
                            <input 
                                type="text" 
                                placeholder="Nome da função" 
                                className="input input-bordered" 
                                value={funcaoNome}
                                onChange={(e) => setFuncaoNome(e.target.value)}
                            />
                        </div>
                        <div className="tooltip tooltip-bottom w-full" data-tip={isButtonDisabled ? "Preencha todos os campos obrigatórios" : null}>
                            <button 
                                className="btn btn-primary mt-6 w-full"
                                onClick={handleSubmit}
                                disabled={isButtonDisabled}
                            >
                                Adicionar Função
                            </button>
                        </div>
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
