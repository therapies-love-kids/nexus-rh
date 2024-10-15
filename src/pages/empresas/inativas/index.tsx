import { useState, useEffect } from 'react';
import { Breadcrumbs } from "@/components";
import { Link, useNavigate } from 'react-router-dom';
import { IoArrowBack, IoArrowForward, IoPencil } from 'react-icons/io5';
import { Notification } from "@/components"; // Importando o componente Notification

interface Empresa {
    empresa_id: number;
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
                'SELECT empresa_id, empresa, cnpj FROM profissionais_empresa WHERE empresa_status1 = \'inativo\''
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

    const handleCheckboxChange = (empresa_id: number): void => {
        setSelectedEmpresas(prevSelected =>
            prevSelected.includes(empresa_id)
                ? prevSelected.filter(selectedId => selectedId !== empresa_id)
                : [...prevSelected, empresa_id]
        );
    };

    const handleChangeStatus = async (status: 'Inativo' | 'Ativo') => {
        if (selectedEmpresas.length > 0) {

            try {
                setNotification({ type: 'info', message: `Alterando status da empresa para ${status}...`});

                const updates = {
                    empresa_status1: status.toLowerCase(), // Definindo o status
                };

                const result = await window.ipcRenderer.invoke('update-records-postgres', {
                    table: 'profissionais_empresa',
                    updates,
                    ids: selectedEmpresas,
                    idColumn: 'empresa_id',
                });
                if (result.success) {
                    await fetchEmpresas();
                    setSelectedEmpresas([]);
                    setNotification({ type:'success', message: `Status da empresa alterado para ${status} com sucesso!` });
                } else {
                    setNotification({ type: 'error', message: result.message || 'Erro ao alterar o status das empresas.' });
                }
            } catch (error) {
                console.error('Erro ao alterar status das empresas:', error);
                setNotification({ type: 'error', message: 'Erro ao alterar status das empresas.' });
            }
        } else {
            setNotification({ type: 'error', message: 'Nenhuma empresa selecionada.' });
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
                                                        setSelectedEmpresas(currentRecords.map(e => e.empresa_id));
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
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentRecords.map((empresa) => (
                                    <tr key={empresa.empresa_id}>
                                        <th>
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    className="checkbox"
                                                    checked={selectedEmpresas.includes(empresa.empresa_id)}
                                                    onChange={() => handleCheckboxChange(empresa.empresa_id)}
                                                />
                                            </label>
                                        </th>
                                        <td>{empresa.empresa_id}</td>
                                        <td>{empresa.empresa}</td>
                                        <td>{empresa.cnpj}</td>
                                        <td className="w-1">
                                            <Link to={`/empresas/${empresa.empresa_id}`} className='btn btn-ghost tooltip flex w-fit' data-tip="Editar">
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
