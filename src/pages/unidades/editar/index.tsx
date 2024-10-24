import { useState, useEffect } from 'react';
import { Breadcrumbs, Modal, TextInput } from "@/components";
import { Link, useParams } from 'react-router-dom';
import { IoArrowBack } from 'react-icons/io5';
import MaskedInput from 'react-text-mask';
import CEPInput from '@/components/inputs/CEPInput';

export default function AtualizarUnidade() {
    const { unidade_id } = useParams<string>(); // Obter ID da unidade via parâmetros da URL
    const [unidadeNome, setUnidadeNome] = useState<string>('');
    const [endereco, setEndereco] = useState<string>('');
    const [cep, setCep] = useState<string>('');
    const [modalMessage, setModalMessage] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    // Carregar os dados da unidade existente
    useEffect(() => {
        const fetchUnidadeData = async () => {
            try {
                if (unidade_id) {
                    const result = await window.ipcRenderer.invoke(
                        'query-database-postgres',
                        `SELECT unidade, endereco, cep FROM profissionais_unidade WHERE unidade_id = ${unidade_id}`
                    );
                    const unidade = result[0];
                    setUnidadeNome(unidade.unidade ?? '');
                    setEndereco(unidade.endereco ?? '');
                    setCep(unidade.cep ?? '');
                }
            } catch (error) {
                console.log(error);
            }
        };

        fetchUnidadeData();
    }, [unidade_id]);

    const handleSubmit = async () => {
        if (!unidadeNome || !endereco || !cep) {
            setModalMessage('Preencha todos os campos obrigatórios: unidade, endereço e CEP.');
            setIsModalOpen(true);
            return;
        }
    
        try {
            const table = 'profissionais_unidade';
            const updates = {
                unidade: unidadeNome,
                endereco: endereco,
                cep: cep
            };
    
            if (unidade_id) {
                const ids = [parseInt(unidade_id, 10)];
                
                const result = await window.ipcRenderer.invoke('update-records-postgres', {
                    table,
                    updates,
                    ids,
                    idColumn: 'unidade_id' // Especificando a coluna de identificação
                });
    
                if (result.success) {
                    setModalMessage('Unidade atualizada com sucesso!');
                } else {
                    setModalMessage(`Erro ao atualizar unidade: ${result.message}`);
                }
            } else {
                setModalMessage('ID da unidade não encontrado.');
            }
        } catch (error) {
            setModalMessage(`Erro ao atualizar unidade: ${error}`);
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
                                Atualizar Unidade
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

                        <button 
                            className="btn btn-primary mt-6" 
                            onClick={handleSubmit}
                        >
                            Atualizar Unidade
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
