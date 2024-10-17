import { useState, useEffect } from 'react';
import { Breadcrumbs } from "@/components";
import { Link } from 'react-router-dom';
import { IoArrowBack, IoArrowForward, IoPencil } from 'react-icons/io5';
import { Notification } from "@/components"; // Importando o componente Notification

interface Funcao {
    funcao_id: number;
    funcao: string;
}

export default function FuncoesInativos() {
    const [funcoes, setFuncoes] = useState<Funcao[]>([]);
    const [selectedFuncoes, setSelectedFuncoes] = useState<number[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage, setRecordsPerPage] = useState(5);
    const [notification, setNotification] = useState<{ type: 'info' | 'success' | 'error'; message: string } | null>(null);

    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentRecords = funcoes.slice(indexOfFirstRecord, indexOfLastRecord);
    const totalPages = Math.ceil(funcoes.length / recordsPerPage);

    const fetchFuncoes = async () => {
        try {
            const result = await window.ipcRenderer.invoke(
                'query-database-postgres',
                'SELECT funcao_id, funcao FROM profissionais_funcao WHERE funcao_status1 = \'inativo\''
            );
            setFuncoes((result as Funcao[]).sort((a, b) => a.funcao_id - b.funcao_id));
        } catch (error) {
            console.error('Erro ao buscar funcoes:', error);
        }
    };

    useEffect(() => {
        fetchFuncoes();
    }, []);

    const handleCheckboxChange = (funcao_id: number): void => {
        setSelectedFuncoes(prevSelected =>
            prevSelected.includes(funcao_id)
                ? prevSelected.filter(selectedId => selectedId !== funcao_id)
                : [...prevSelected, funcao_id]
        );
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
            setNotification({ type: 'error', message: 'Nenhuma função selecionado.' });
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
                                            <Link to={"/funcoes"}>
                                                <button>
                                                    Visualizar Ativos
                                                </button>
                                            </Link>
                                        </li>
                                        <li>
                                            <a onClick={() => handleChangeStatus('Ativo')}>
                                                Mover para Ativos
                                            </a>
                                        </li>
                                    </ul>
                                </div>

                                <select className="select select-bordered max-w-xs" onChange={(e) => setRecordsPerPage(parseInt(e.target.value))}>
                                    <option value="5">5</option>
                                    <option value="10">10</option>
                                    <option value="25">25</option>
                                    <option value="50">50</option>
                                </select>

                                <Link to={'/funcoes/novo'}>
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
                                    <th></th>
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
                                        <td className="w-1">
                                            <Link to={`/funcoes/${funcao.funcao_id}`} className='btn btn-ghost tooltip flex w-fit' data-tip="Editar">
                                                <IoPencil />
                                            </Link>
                                        </td>
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
