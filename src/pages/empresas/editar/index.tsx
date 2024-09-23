import { useState, useEffect } from 'react';
import { Breadcrumbs, Modal } from "@/components";
import { Link, useParams } from 'react-router-dom';
import { IoArrowBack, IoClose } from 'react-icons/io5';

export default function AtualizarEmpresa() {
    const { id } = useParams<string>(); // Obter ID da empresa via parâmetros da URL
    const [empresaNome, setEmpresaNome] = useState<string>('');
    const [cnpj, setCnpj] = useState<string>('');
    const [modalMessage, setModalMessage] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    // Carregar os dados da empresa existente
    useEffect(() => {
        const fetchEmpresaData = async () => {
            try {
                if (id) {
                    const result = await window.ipcRenderer.invoke(
                        'query-database-postgres',
                        `SELECT empresa, cnpj FROM profissionais_empresa WHERE id = ${id}`
                    );
                    const empresa = result[0];
                    setEmpresaNome(empresa.empresa ?? '');
                    setCnpj(empresa.cnpj ?? '');
                }
            } catch (error) {
                console.log(error);
            }
        };

        fetchEmpresaData();
    }, [id]);

    const handleSubmit = async () => {
        if (!empresaNome || !cnpj) {
            setModalMessage('Preencha todos os campos obrigatórios: empresa e CNPJ.');
            setIsModalOpen(true);
            return;
        }
    
        try {
            const table = 'profissionais_empresa';
            const updates = {
                empresa: empresaNome,
                cnpj: cnpj
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
                    setModalMessage('Empresa atualizada com sucesso!');
                } else {
                    setModalMessage(`Erro ao atualizar empresa: ${result.message}`);
                }
            } else {
                setModalMessage('ID da empresa não encontrado.');
            }
        } catch (error) {
            setModalMessage(`Erro ao atualizar empresa: ${error}`);
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
                                Atualizar Empresa
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
                            <input 
                                type="text" 
                                placeholder="CNPJ (00.000.000/0000-00)" 
                                className="input input-bordered"
                                value={cnpj}
                                onChange={(e) => setCnpj(e.target.value)}
                            />
                        </div>

                        <button 
                            className="btn btn-primary mt-6" 
                            onClick={handleSubmit}
                        >
                            Atualizar Empresa
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
