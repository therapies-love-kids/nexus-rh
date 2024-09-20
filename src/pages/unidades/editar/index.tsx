import { useState, useEffect } from 'react';
import { Breadcrumbs, Modal } from "@/components";
import { Link, useParams } from 'react-router-dom';
import { IoArrowBack, IoClose } from 'react-icons/io5';
import MaskedInput from 'react-text-mask';

export default function AtualizarUnidade() {
    const { id } = useParams<string>(); // Obter ID da unidade via parâmetros da URL
    const [unidadeNome, setUnidadeNome] = useState<string>('');
    const [endereco, setEndereco] = useState<string>('');
    const [cep, setCep] = useState<string>('');
    const [modalMessage, setModalMessage] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    // Carregar os dados da unidade existente
    useEffect(() => {
        const fetchUnidadeData = async () => {
            try {
                if (id) {
                    const result = await window.ipcRenderer.invoke(
                        'query-database-postgres',
                        `SELECT unidade, endereco, cep FROM profissionais_unidade WHERE id = ${id}`
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
    }, [id]);

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
    
            if (id) {
                const ids = [parseInt(id, 10)];
                
                const result = await window.ipcRenderer.invoke('update-records-postgres', {
                    table,
                    updates,
                    ids,
                    idColumn: 'id' // Especificando a coluna de identificação
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
                            <Link to={'/profissionais/unidades'}>
                                <button className="btn btn-ghost w-full"><IoArrowBack /></button>
                            </Link>
                            <p className="card-title m-0 p-0">
                                Atualizar Unidade
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
                                onChange={(e) => setCep(e.target.value)}
                                mask={[/\d/, /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/]} // Máscara para o CEP
                                guide={false}
                            />
                        </div>

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
