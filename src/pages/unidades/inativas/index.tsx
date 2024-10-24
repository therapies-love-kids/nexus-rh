import { useState, useEffect } from 'react';
import { Breadcrumbs } from "@/components";
import { Link } from 'react-router-dom';
import { IoArrowBack, IoArrowForward, IoPencil } from 'react-icons/io5';
import { Notification } from "@/components"; // Importando o componente Notification

interface Unidade {
    unidade_id: number;
    unidade: string;
    endereco: string;
    cep: string;
}

export default function Unidades() {
    const [unidades, setUnidades] = useState<Unidade[]>([]);
    const [selectedUnidades, setSelectedUnidades] = useState<number[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage, setRecordsPerPage] = useState(5);
    const [notification, setNotification] = useState<{ type: 'info' | 'success' | 'error'; message: string } | null>(null);

    const fetchUnidades = async () => {
        try {
            const result = await window.ipcRenderer.invoke(
                'query-database-postgres',
                'SELECT unidade_id, unidade, endereco, cep FROM profissionais_unidade WHERE unidade_status1 = \'inativo\''
            );
            setUnidades(result as Unidade[]);
        } catch (error) {
            console.error('Erro ao buscar unidades:', error);
        }
    };

    useEffect(() => {
        fetchUnidades();
    }, []);

    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentRecords = unidades.slice(indexOfFirstRecord, indexOfLastRecord);
    const totalPages = Math.ceil(unidades.length / recordsPerPage);

    const handleCheckboxChange = (unidade_id: number): void => {
        setSelectedUnidades(prevSelected =>
            prevSelected.includes(unidade_id)
                ? prevSelected.filter(selectedId => selectedId !== unidade_id)
                : [...prevSelected, unidade_id]
        );
    };

    const handleChangeStatus = async (status: 'Inativo' | 'Ativo') => {
        if (selectedUnidades.length > 0) {
            try {
                setNotification({ type: 'info', message: `Alterando status da unidade para ${status}...`});
                
                const updates = {
                    unidade_status1: status.toLowerCase(), // Definindo o status
                };

                const result = await window.ipcRenderer.invoke('update-records-postgres', {
                    table: 'profissionais_unidade',
                    updates,
                    ids: selectedUnidades,
                    idColumn: 'unidade_id',
                });

                if (result.success) {
                    await fetchUnidades();
                    setSelectedUnidades([]);
                    setNotification({ type: 'success', message: `Status dos profissionais alterado para ${status} com sucesso!` });
                } else {
                    setNotification({ type: 'error', message: result.message || 'Erro ao alterar status dos profissionais.' });
                }


            } catch (error) {
                console.error('Erro ao alterar status dos profissionais:', error);
                setNotification({ type: 'error', message: 'Erro ao alterar status dos profissionais.' });
            }
        } else {
            setNotification({ type: 'error', message: 'Nenhum profissional selecionado.' });
        }
    };

    return (
        <div className='bg-base-200 min-h-screen'>
            <Breadcrumbs />

            <div className="mt-10 px-24 rounded">
                <div className='card bg-base-100 shadow-xl w-full mb-10'>
                    <div className="card-body">
                        <div className='flex justify-between'>
                            <h2 className="card-title">Unidades</h2>
                            <div className='flex gap-2 justify-between'>
                                <div className="dropdown dropdown-end">
                                    <div tabIndex={1} role="button" className="btn">
                                        Ações
                                    </div>
                                    <ul tabIndex={1} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
                                        <li>
                                            <Link to={"/unidades"}>
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

                                <Link to={'/unidades/nova'}>
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
                                                        setSelectedUnidades(currentRecords.map(u => u.unidade_id));
                                                    } else {
                                                        setSelectedUnidades([]);
                                                    }
                                                }}
                                                checked={selectedUnidades.length === currentRecords.length}
                                            />
                                        </label>
                                    </th>
                                    <th>ID</th>
                                    <th>Nome da Unidade</th>
                                    <th>Endereço</th>
                                    <th>CEP</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentRecords.map((unidade) => (
                                    <tr key={unidade.unidade_id}>
                                        <th>
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    className="checkbox"
                                                    checked={selectedUnidades.includes(unidade.unidade_id)}
                                                    onChange={() => handleCheckboxChange(unidade.unidade_id)}
                                                />
                                            </label>
                                        </th>
                                        <td>{unidade.unidade_id}</td>
                                        <td>{unidade.unidade}</td>
                                        <td>{unidade.endereco}</td>
                                        <td>{unidade.cep}</td>
                                        <td className="w-1">
                                            <Link to={`/unidades/${unidade.unidade_id}`} className='btn btn-ghost tooltip flex w-fit' data-tip="Editar">
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
                                Mostrando {indexOfFirstRecord + 1}-{Math.min(indexOfLastRecord, unidades.length)} de {unidades.length} registros
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
