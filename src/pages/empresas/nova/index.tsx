import { useState, useEffect, SetStateAction } from 'react';
import { Breadcrumbs, Modal } from "@/components";
import { Link } from 'react-router-dom';
import { IoArrowBack, IoCalendar, IoClose, IoKey, IoPerson } from 'react-icons/io5';
import MaskedInput from 'react-text-mask'; // Importando a máscara

export default function NovaEmpresa() {
    const [empresaNome, setEmpresaNome] = useState('');
    const [cnpj, setCnpj] = useState('');
    const [modalMessage, setModalMessage] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSubmit = async () => {
        if (!empresaNome || !cnpj) {
            setModalMessage('Preencha todos os campos obrigatórios: empresa e CNPJ.');
            setIsModalOpen(true);
            return;
        }

        try {
            const table = 'profissionais_empresa';
            const columns = ['empresa', 'cnpj'];
            const values = [empresaNome, cnpj];

            const result = await window.ipcRenderer.invoke('insert-records-postgres', { table, columns, values });

            if (result.success) {
                setModalMessage('Empresa criada com sucesso!');
            } else {
                setModalMessage(`Erro ao adicionar empresa: ${result.message}`);
            }
        } catch (error) {
            console.error('Erro ao adicionar empresa:', error);
            setModalMessage('Erro ao adicionar empresa.');
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
                            <Link to={'/profissionais/empresas'}>
                                <button className="btn btn-ghost w-full"><IoArrowBack /></button>
                            </Link>
                            <p className="card-title m-0 p-0">
                                Adicionar Nova Empresa
                            </p>
                        </div>

                        <div className="form-control mt-4">
                            <label className="label">
                                <span className="label-text">Nome da Empresa</span>
                            </label>
                            <input 
                                type="text" 
                                placeholder="Nome da empresa" 
                                className="input input-bordered" 
                                value={empresaNome}
                                onChange={(e) => setEmpresaNome(e.target.value)} 
                            />
                        </div>

                        <div className="form-control mt-4">
                            <label className="label">
                                <span className="label-text">CNPJ</span>
                            </label>
                            <MaskedInput
                                type="text"
                                placeholder="CNPJ (00.000.000/0000-00)"
                                className="input input-bordered"
                                value={cnpj}
                                onChange={(e: { target: { value: SetStateAction<string>; }; }) => setCnpj(e.target.value)}
                                mask={[/\d/, /\d/, '.', /\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/]} // Máscara para o CNPJ
                                guide={false} // Não exibe a máscara antes de digitar
                            />
                        </div>

                        <button 
                            className="btn btn-primary mt-6" 
                            onClick={handleSubmit}
                        >
                            Adicionar Empresa
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
