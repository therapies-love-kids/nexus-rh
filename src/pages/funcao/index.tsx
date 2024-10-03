import { useState, useEffect } from 'react';
import { Breadcrumbs } from "@/components";
import { Link, useNavigate } from 'react-router-dom';
import { IoArrowBack, IoArrowForward } from 'react-icons/io5';
import { Notification } from "@/components"; // Importando o componente Notification

interface Funcao {
    funcao_id: number;
    funcao: string;
}

export default function Funcaos() {
    const [funcoes, setFuncoes] = useState<Funcao[]>([]);
    const [selectedFuncoes, setSelectedFuncoes] = useState<number[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage, setRecordsPerPage] = useState(5);
    const [notification, setNotification] = useState<{ type: 'info' | 'success' | 'error'; message: string } | null>(null);

    const fetchFuncoes = async () => {
        try {
            const result = await window.ipcRenderer.invoke(
                'query-database-postgres',
                'SELECT funcao_id, funcao FROM profissionais_funcao WHERE funcao_status1 = \'ativo\''
            );
            setFuncoes(result as Funcao[]);
        } catch (error) {
            console.error('Erro ao buscar funções:', error);
        }
    };

    useEffect(() => {
        fetchFuncoes();
    }, []);

    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentRecords = funcoes.slice(indexOfFirstRecord, indexOfLastRecord);
    const totalPages = Math.ceil(funcoes.length / recordsPerPage);

    const handleCheckboxChange = (funcao_id: number): void => {
        setSelectedFuncoes(prevSelected =>
            prevSelected.includes(funcao_id)
                ? prevSelected.filter(selectedId => selectedId !== funcao_id)
                : [...prevSelected, funcao_id]
        );
    };

    const navigate = useNavigate();

    const handleEdit = () => {
        if (selectedFuncoes.length === 1) {
            const [selectedId] = selectedFuncoes;
            navigate(`/funcoes/${selectedId}`);
        } else {
            setNotification({ type: 'error', message: 'Selecione apenas uma função para editar.' });
        }
    };

    const handleChangeStatus = async (status: 'Inativo' | 'Ativo') => {
        if (selectedFuncoes.length > 0) {
            try {
                setNotification({ type: 'info', message: `Alterando status da função para ${status}...`});

                const updates = {
                    funcao_status1: status.toLowerCase(), // Definindo o status
                };

                const result = await window.ipcRenderer.invoke('update-records-postgres', {
                    table: 'profissionais_funcao',
                    updates,
                    ids: selectedFuncoes,
                    idColumn: 'funcao_id',
                });
                if (result.success) {
                    await fetchFuncoes();
                    setSelectedFuncoes([]);
                    setNotification({ type:'success', message: `Status da função alterado para ${status} com sucesso!` });
                } else {
                    setNotification({ type: 'error', message: result.message || 'Erro ao alterar o status das funções.' });
                }
            } catch (error) {
                console.error('Erro ao alterar status das funções:', error);
                setNotification({ type: 'error', message: 'Erro ao alterar status das funções.' });
            }
        } else {
            setNotification({ type: 'error', message: 'Nenhuma função selecionada.' });
        }
    };

    return (
        <div className='bg-base-200 min-h-screen'>
            <Breadcrumbs />

            <div className="mt-10 px-24 rounded">
                <div className='card bg-base-100 shadow-xl w-full mb-10'>
                    <div className="card-body">
                        <div className='flex justify-between'>
                            <h2 className="card-title">Funções</h2>
                            <div className='flex gap-2 justify-between'>
                                <div className="dropdown dropdown-end">
                                    <div tabIndex={1} role="button" className="btn">
                                        Ações
                                    </div>
                                    <ul tabIndex={1} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
                                        <li>
                                            <Link to={"/funcoes/inativos"}>
                                                <button>
                                                    Visualizar inativos
                                                </button>
                                            </Link>
                                        </li>
                                        <li>
                                            <a onClick={() => handleChangeStatus('Inativo')}>
                                                Mover para Inativos
                                            </a>
                                        </li>
                                        <li>
                                            <button
                                                className={`${selectedFuncoes.length !== 1 ? 'tooltip text-gray-400 text-start cursor-not-allowed' : ''}`}
                                                data-tip={selectedFuncoes.length !== 1 ? 'Selecione apenas uma função para editar.' : ''}
                                                onClick={handleEdit}
                                                disabled={selectedFuncoes.length !== 1}
                                            >
                                                Editar
                                            </button>
                                        </li>
                                    </ul>
                                </div>

                                <select className="select select-bordered max-w-xs" onChange={(e) => setRecordsPerPage(parseInt(e.target.value))}>
                                    <option value="5">5</option>
                                    <option value="10">10</option>
                                    <option value="25">25</option>
                                    <option value="50">50</option>
                                </select>

                                <Link to={'/funcoes/nova'}>
                                    <button className="btn btn-primary">Adicionar</button>
                                </Link>
                            </div>
                        </div>

                        <table className="table">
                            <thead>
                                <tr>
                                    <th>
                                        <label>
                                            <input
                                                type="checkbox"
                                                className="checkbox"
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedFuncoes(currentRecords.map(e => e.funcao_id));
                                                    } else {
                                                        setSelectedFuncoes([]);
                                                    }
                                                }}
                                                checked={selectedFuncoes.length === currentRecords.length}
                                            />
                                        </label>
                                    </th>
                                    <th>ID</th>
                                    <th>Nome da Função</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentRecords.map((funcao) => (
                                    <tr key={funcao.funcao_id}>
                                        <th>
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    className="checkbox"
                                                    checked={selectedFuncoes.includes(funcao.funcao_id)}
                                                    onChange={() => handleCheckboxChange(funcao.funcao_id)}
                                                />
                                            </label>
                                        </th>
                                        <td>{funcao.funcao_id}</td>
                                        <td>{funcao.funcao}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="flex justify-between items-center mt-4">
                            <div className="flex items-center gap-5">
                                <button
                                    className="btn"
                                    onClick={() => setCurrentPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                >
                                    <IoArrowBack />
                                </button>
                                <div>Página {currentPage}</div>
                                <button
                                    className="btn"
                                    onClick={() => setCurrentPage(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                >
                                    <IoArrowForward />
                                </button>
                            </div>

                            <div className="text-sm text-gray-600">
                                Mostrando {indexOfFirstRecord + 1}-{Math.min(indexOfLastRecord, funcoes.length)} de {funcoes.length} registros
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {notification && (
                <Notification 
                    type={notification.type} 
                    message={notification.message} 
                    onClose={() => setNotification(null)}
                />
            )}
        </div>
    );
}
