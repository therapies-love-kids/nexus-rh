import { useState, useEffect, SetStateAction } from 'react';
import { Breadcrumbs, Modal, TextInput } from "@/components";
import { Link } from 'react-router-dom';
import { IoArrowBack, IoCalendar, IoClose, IoKey, IoPerson } from 'react-icons/io5';
import MaskedInput from 'react-text-mask'; // Importando a máscara
import CEPInput from '@/components/inputs/CEPInput';

export default function NovaUnidade() {
    const [unidadeNome, setUnidadeNome] = useState('');
    const [endereco, setEndereco] = useState('');
    const [cep, setCep] = useState('');
    const [modalMessage, setModalMessage] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const isButtonDisabled = (!unidadeNome || !endereco || !cep)

    const handleSubmit = async () => {
        try {
            const table = 'profissionais_unidade';
            const columns = ['unidade', 'endereco', 'cep'];
            const values = [unidadeNome, endereco, cep];

            const result = await window.ipcRenderer.invoke('insert-records-postgres', { table, columns, values });

            if (result.success) {
                setModalMessage('Unidade criada com sucesso!');
            } else {
                setModalMessage(`Erro ao adicionar unidade: ${result.message}`);
            }
        } catch (error) {
            console.error('Erro ao adicionar unidade:', error);
            setModalMessage('Erro ao adicionar unidade.');
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
                            <Link to={'/unidades'}>
                                <button className="btn btn-ghost w-full"><IoArrowBack /></button>
                            </Link>
                            <p className="card-title m-0 p-0">
                                Adicionar Nova Unidade
                            </p>
                        </div>

                        <TextInput
                            label="Nome da Unidade"
                            placeholder="Nome da unidade"
                            value={unidadeNome}
                            onChange={(e) => setUnidadeNome(e.target.value)}
                        />

                        <TextInput
                            label="Endereço"
                            placeholder="Endereço da unidade"
                            value={endereco}
                            onChange={(e) => setEndereco(e.target.value)}
                        />

                        <CEPInput
                            label="CEP"
                            value={cep}
                            onChange={(e) => setCep(e.target.value)}
                        />

                        <div className="tooltip tooltip-bottom w-full" data-tip={isButtonDisabled ? "Preencha todos os campos obrigatórios" : null}>
                            <button 
                                className="btn btn-primary mt-6 w-full"
                                onClick={handleSubmit}
                                disabled={isButtonDisabled}
                            >
                                Adicionar Unidade
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
