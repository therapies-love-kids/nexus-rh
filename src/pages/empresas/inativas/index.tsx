import { useState, useEffect } from 'react';
import { Breadcrumbs } from "@/components";
import { Link, useNavigate } from 'react-router-dom';
import { IoArrowBack, IoArrowForward } from 'react-icons/io5';
import { Notification } from "@/components"; // Importando o componente Notification

interface Empresa {
    id: number;
    empresa: string;
    cnpj: string;
}

export default function Empresas() {
    const [empresas, setEmpresas] = useState<Empresa[]>([]);
    const [selectedEmpresas, setSelectedEmpresas] = useState<number[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage, setRecordsPerPage] = useState(5);
    const [notification, setNotification] = useState<{ type: 'info' | 'success' | 'error'; message: string } | null>(null);

    const fetchEmpresas = async () => {
        try {
            const result = await window.ipcRenderer.invoke(
                'query-database-postgres',
                'SELECT id, empresa, cnpj FROM profissionais_empresas_inativas'
            );
            setEmpresas(result as Empresa[]);
        } catch (error) {
            console.error('Erro ao buscar empresas:', error);
        }
    };

    useEffect(() => {
        fetchEmpresas();
    }, []);

    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentRecords = empresas.slice(indexOfFirstRecord, indexOfLastRecord);
    const totalPages = Math.ceil(empresas.length / recordsPerPage);

    const handleCheckboxChange = (id: number): void => {
        setSelectedEmpresas(prevSelected =>
            prevSelected.includes(id)
                ? prevSelected.filter(selectedId => selectedId !== id)
                : [...prevSelected, id]
        );
    };

    const navigate = useNavigate();

    const handleEdit = () => {
        if (selectedEmpresas.length === 1) {
            const [selectedId] = selectedEmpresas;
            navigate(`/empresas/editar/${selectedId}`);
        } else {
            setNotification({ type: 'error', message: 'Selecione apenas uma empresa para editar.' });
        }
    };

    const handleMoveToExcluded = async () => {
        if (selectedEmpresas.length === 0) {
            setNotification({ type: 'error', message: 'Nenhuma empresa selecionada.' });
            return;
        }

        try {
            setNotification({ type: 'info', message: 'Movendo empresas para excluídas...' });

            const result = await window.ipcRenderer.invoke('move-records-postgres', {
                sourceTable: 'profissionais_empresas_inativas',
                destinationTable: 'profissionais_empresa',
                ids: selectedEmpresas,
                idColumn: 'id' // Definindo a coluna de ID
            });

            if (result.success) {
                await fetchEmpresas(); // Atualiza a lista de empresas
                setSelectedEmpresas([]); // Limpa as seleções
                setNotification({ type: 'success', message: 'Empresas movidas para excluídas com sucesso!' });
            } else {
                setNotification({ type: 'error', message: result.message || 'Erro ao mover empresas.' });
            }
        } catch (error) {
            console.error('Erro ao mover empresas:', error);
            setNotification({ type: 'error', message: 'Erro ao mover empresas.' });
        }
    };

    return (
        <div className='bg-base-200 min-h-screen'>
            <Breadcrumbs />

            <div className="mt-10 px-24 rounded">
                <div className='card bg-base-100 shadow-xl w-full mb-10'>
                    <div className="card-body">
                        <div className='flex justify-between'>
                            <h2 className="card-title">Empresas</h2>
                            <div className='flex gap-2 justify-between'>
                                <div className="dropdown dropdown-end">
                                    <div tabIndex={1} role="button" className="btn">
                                        Ações
                                    </div>
                                    <ul tabIndex={1} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
                                        <li>
                                            <Link to={"/empresas"}>
                                                <button>
                                                    Visualizar Ativos
                                                </button>
                                            </Link>
                                        </li>
                                        <li>
                                            <button onClick={handleMoveToExcluded}>
                                                Mover para Ativos
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

                                <Link to={'/empresas/nova'}>
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
                                                        setSelectedEmpresas(currentRecords.map(e => e.id));
                                                    } else {
                                                        setSelectedEmpresas([]);
                                                    }
                                                }}
                                                checked={selectedEmpresas.length === currentRecords.length}
                                            />
                                        </label>
                                    </th>
                                    <th>ID</th>
                                    <th>Nome da Empresa</th>
                                    <th>CNPJ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentRecords.map((empresa) => (
                                    <tr key={empresa.id}>
                                        <th>
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    className="checkbox"
                                                    checked={selectedEmpresas.includes(empresa.id)}
                                                    onChange={() => handleCheckboxChange(empresa.id)}
                                                />
                                            </label>
                                        </th>
                                        <td>{empresa.id}</td>
                                        <td>{empresa.empresa}</td>
                                        <td>{empresa.cnpj}</td>
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
                                Mostrando {indexOfFirstRecord + 1}-{Math.min(indexOfLastRecord, empresas.length)} de {empresas.length} registros
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
