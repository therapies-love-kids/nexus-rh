import { useState, useEffect, SetStateAction } from 'react';
import { Breadcrumbs, Modal, TextInput } from "@/components";
import { Link } from 'react-router-dom';
import { IoArrowBack, IoCalendar, IoClose, IoKey, IoPerson } from 'react-icons/io5';
import MaskedInput from 'react-text-mask'; // Importando a máscara
import CNPJInput from '@/components/inputs/CNPJInput';

export default function NovaEmpresa() {
    const [empresaNome, setEmpresaNome] = useState('');
    const [cnpj, setCnpj] = useState('');
    const [modalMessage, setModalMessage] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const isButtonDisabled = (!empresaNome || !cnpj);

    const handleSubmit = async () => {
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
                            <Link to={'/empresas'}>
                                <button className="btn btn-ghost w-full"><IoArrowBack /></button>
                            </Link>
                            <p className="card-title m-0 p-0">
                                Adicionar Nova Empresa
                            </p>
                        </div>

                        <TextInput
                            label="Nome da Empresa"
                            placeholder="Nome da empresa"
                            value={empresaNome}
                            onChange={(e) => setEmpresaNome(e.target.value)}
                        />

                        <CNPJInput
                            label="CNPJ"
                            value={cnpj}
                            onChange={(e) => setCnpj(e.target.value)}
                        />

                        <div className="tooltip tooltip-bottom w-full" data-tip={isButtonDisabled ? "Preencha todos os campos obrigatórios" : null}>
                            <button 
                                className="btn btn-primary mt-6 w-full"
                                onClick={handleSubmit}
                                disabled={isButtonDisabled}
                            >
                                Adicionar Empresa
                            </button>
                        </div>
                    </div>
                </div>
            </div>

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
