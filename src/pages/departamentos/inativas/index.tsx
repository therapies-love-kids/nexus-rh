import { useState, useEffect } from 'react';
import { Breadcrumbs } from "@/components";
import { Link } from 'react-router-dom';
import { IoArrowBack, IoArrowForward } from 'react-icons/io5';
import { Notification } from "@/components"; // Importando o componente Notification

interface Departamento {
    id: number;
    departamento: string;
}

export default function DepartamentosInativos() {
    const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
    const [selectedDepartamentos, setSelectedDepartamentos] = useState<number[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage, setRecordsPerPage] = useState(5);
    const [notification, setNotification] = useState<{ type: 'info' | 'success' | 'error'; message: string } | null>(null);

    const fetchDepartamentos = async () => {
        try {
            const result = await window.ipcRenderer.invoke(
                'query-database-postgres',
                'SELECT id, departamento FROM profissionais_departamento WHERE departamento_status1 = \'inativo\''
            );
            setDepartamentos(result as Departamento[]);
        } catch (error) {
            console.error('Erro ao buscar departamentos:', error);
        }
    };

    useEffect(() => {
        fetchDepartamentos();
    }, []);

    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentRecords = departamentos.slice(indexOfFirstRecord, indexOfLastRecord);
    const totalPages = Math.ceil(departamentos.length / recordsPerPage);

    const handleCheckboxChange = (id: number): void => {
        setSelectedDepartamentos(prevSelected =>
            prevSelected.includes(id)
                ? prevSelected.filter(selectedId => selectedId !== id)
                : [...prevSelected, id]
        );
    };

    const handleChangeStatus = async (status: 'Inativo' | 'Ativo') => {
        if (selectedDepartamentos.length > 0) {

            try {
                setNotification({ type: 'info', message: `Alterando status do departamento para ${status}...`});

                const updates = {
                    departamento_status1: status.toLowerCase(), // Definindo o status
                };

                const result = await window.ipcRenderer.invoke('update-records-postgres', {
                    table: 'profissionais_departamento',
                    updates,
                    ids: selectedDepartamentos,
                    idColumn: 'id',
                });
                if (result.success) {
                    await fetchDepartamentos();
                    setSelectedDepartamentos([]);
                    setNotification({ type:'success', message: `Status do departamento alterado para ${status} com sucesso!` });
                } else {
                    setNotification({ type: 'error', message: result.message || 'Erro ao alterar o status dos departamentos.' });
                }
            } catch (error) {
                console.error('Erro ao alterar status dos departamentos:', error);
                setNotification({ type: 'error', message: 'Erro ao alterar status dos departamentos.' });
            }
        } else {
            setNotification({ type: 'error', message: 'Nenhum departamento selecionado.' });
        }
    };

    return (
        <div className='bg-base-200 min-h-screen'>
            <Breadcrumbs />

            <div className="mt-10 px-24 rounded">
                <div className='card bg-base-100 shadow-xl w-full mb-10'>
                    <div className="card-body">
                        <div className='flex justify-between'>
                            <h2 className="card-title">Departamentos</h2>
                            <div className='flex gap-2 justify-between'>
                                <div className="dropdown dropdown-end">
                                    <div tabIndex={1} role="button" className="btn">
                                        Ações
                                    </div>
                                    <ul tabIndex={1} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
                                        <li>
                                            <Link to={"/departamentos"}>
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

                                <Link to={'/departamentos/novo'}>
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
                                                        setSelectedDepartamentos(currentRecords.map(e => e.id));
                                                    } else {
                                                        setSelectedDepartamentos([]);
                                                    }
                                                }}
                                                checked={selectedDepartamentos.length === currentRecords.length}
                                            />
                                        </label>
                                    </th>
                                    <th>ID</th>
                                    <th>Nome do Departamento</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentRecords.map((departamento) => (
                                    <tr key={departamento.id}>
                                        <th>
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    className="checkbox"
                                                    checked={selectedDepartamentos.includes(departamento.id)}
                                                    onChange={() => handleCheckboxChange(departamento.id)}
                                                />
                                            </label>
                                        </th>
                                        <td>{departamento.id}</td>
                                        <td>{departamento.departamento}</td>
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
                                Mostrando {indexOfFirstRecord + 1}-{Math.min(indexOfLastRecord, departamentos.length)} de {departamentos.length} registros
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