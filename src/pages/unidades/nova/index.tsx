import { useState, useEffect, SetStateAction } from 'react';
import { Breadcrumbs, Modal } from "@/components";
import { Link } from 'react-router-dom';
import { IoArrowBack, IoCalendar, IoClose, IoKey, IoPerson } from 'react-icons/io5';
import MaskedInput from 'react-text-mask'; // Importando a máscara

export default function NovaUnidade() {
    const [unidadeNome, setUnidadeNome] = useState('');
    const [endereco, setEndereco] = useState('');
    const [cep, setCep] = useState('');
    const [modalMessage, setModalMessage] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSubmit = async () => {
        if (!unidadeNome || !endereco || !cep) {
            setModalMessage('Preencha todos os campos obrigatórios: unidade, endereço e CEP.');
            setIsModalOpen(true);
            return;
        }

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

                        <div className="form-control mt-4">
                            <label className="label">
                                <span className="label-text">Nome da Unidade</span>
                            </label>
                            <input 
                                type="text" 
                                placeholder="Nome da unidade" 
                                className="input input-bordered" 
                                value={unidadeNome}
                                onChange={(e) => setUnidadeNome(e.target.value)} 
                            />
                        </div>

                        <div className="form-control mt-4">
                            <label className="label">
                                <span className="label-text">Endereço</span>
                            </label>
                            <input 
                                type="text" 
                                placeholder="Endereço da unidade" 
                                className="input input-bordered" 
                                value={endereco}
                                onChange={(e) => setEndereco(e.target.value)} 
                            />
                        </div>

                        <div className="form-control mt-4">
                            <label className="label">
                                <span className="label-text">CEP</span>
                            </label>
                            <MaskedInput
                                type="text"
                                placeholder="CEP (00000-000)"
                                className="input input-bordered"
                                value={cep}
                                onChange={(e: { target: { value: SetStateAction<string>; }; }) => setCep(e.target.value)}
                                mask={[/\d/, /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/]} // Máscara para o CEP
                                guide={false} // Não exibe a máscara antes de digitar
                            />
                        </div>

                        <button 
                            className="btn btn-primary mt-6" 
                            onClick={handleSubmit}
                        >
                            Adicionar Unidade
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
