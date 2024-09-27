import { useState, useEffect } from 'react';
import { Breadcrumbs } from "@/components";
import { Link, useNavigate } from 'react-router-dom';
import { IoArrowBack, IoArrowForward } from 'react-icons/io5';
import { Notification } from "@/components"; // Importando o componente Notification

interface Unidade {
    id: number;
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
                'SELECT id, unidade, endereco, cep FROM profissionais_unidade'
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

    const handleCheckboxChange = (id: number): void => {
        setSelectedUnidades(prevSelected =>
            prevSelected.includes(id)
                ? prevSelected.filter(selectedId => selectedId !== id)
                : [...prevSelected, id]
        );
    };

    const navigate = useNavigate();

    const handleEdit = () => {
        if (selectedUnidades.length === 1) {
            const [selectedId] = selectedUnidades;
            navigate(`/unidades/${selectedId}`);
        } else {
            setNotification({ type: 'error', message: 'Selecione apenas uma unidade para editar.' });
        }
    };

    const handleMoveToExcluded = async () => {
        if (selectedUnidades.length === 0) {
            setNotification({ type: 'error', message: 'Nenhuma unidade selecionada.' });
            return;
        }

        try {
            setNotification({ type: 'info', message: 'Movendo unidades para excluídos...' });

            const result = await window.ipcRenderer.invoke('move-records-postgres', {
                sourceTable: 'profissionais_unidade',
                destinationTable: 'profissionais_unidades_inativas',
                ids: selectedUnidades,
                idColumn: 'id' // Definindo a coluna de ID
            });

            if (result.success) {
                await fetchUnidades(); // Atualiza a lista de unidades
                setSelectedUnidades([]); // Limpa as seleções
                setNotification({ type: 'success', message: 'Unidades movidas para excluídos com sucesso!' });
            } else {
                setNotification({ type: 'error', message: result.message || 'Erro ao mover unidades.' });
            }
        } catch (error) {
            console.error('Erro ao mover unidades:', error);
            setNotification({ type: 'error', message: 'Erro ao mover unidades.' });
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
                                            <Link to={"/unidades/inativas"}>
                                                <button>
                                                    Visualizar inativas
                                                </button>
                                            </Link>
                                        </li>
                                        <li>
                                            <button onClick={handleMoveToExcluded}>
                                                Mover para Inativas
                                            </button>
                                        </li>
                                        <li>
                                            <button
                                                className={` ${selectedUnidades.length !== 1 ? 'tooltip text-base-300' : ''}`}
                                                data-tip={selectedUnidades.length !== 1 ? 'Selecione apenas uma unidade para editar.' : ''}
                                                onClick={handleEdit}
                                                disabled={selectedUnidades.length !== 1}
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

                                <Link to={'/unidades/novo'}>
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
                                                        setSelectedUnidades(currentRecords.map(u => u.id));
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
                                </tr>
                            </thead>
                            <tbody>
                                {currentRecords.map((unidade) => (
                                    <tr key={unidade.id}>
                                        <th>
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    className="checkbox"
                                                    checked={selectedUnidades.includes(unidade.id)}
                                                    onChange={() => handleCheckboxChange(unidade.id)}
                                                />
                                            </label>
                                        </th>
                                        <td>{unidade.id}</td>
                                        <td>{unidade.unidade}</td>
                                        <td>{unidade.endereco}</td>
                                        <td>{unidade.cep}</td>
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
