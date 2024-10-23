import { useState, useEffect } from 'react';
import { Breadcrumbs } from "@/components";
import { Link } from 'react-router-dom';
import { IoArrowBack, IoArrowForward, IoPencil } from 'react-icons/io5';
import { Notification } from "@/components";
import { useProfissionais } from '@/hooks/hookProfissionais';

interface Profissional {
    profissional_id: number;
    profissional_foto: string;
    profissional_nome: string;
    imageUrl?: string;  // Inclui o campo imageUrl retornado pelo hook
}

export default function Profissionais() {
    const [selectedProfissionais, setSelectedProfissionais] = useState<number[]>([]);
    const [filteredProfissionais, setFilteredProfissionais] = useState<Profissional[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage, setRecordsPerPage] = useState(5);
    const [notification, setNotification] = useState<{ type: 'info' | 'success' | 'error'; message: string } | null>(null);

    const { profissionais, unidades, funcoes, empresas, departamentos } = useProfissionais(
        'profissionais/fotos', // baseFolder
        'inativo',               // status
        undefined,       // ID do departamento (ou undefined)
        undefined,       // ID da unidade (ou undefined)
        undefined,       // ID da função (ou undefined)
        undefined        // ID da empresa (ou undefined)
    );

    useEffect(() => {
        const uniqueProfissionais = Array.from(new Set(profissionais.map(p => p.profissional_id)))
            .map(id => profissionais.find(p => p.profissional_id === id));
        setFilteredProfissionais(uniqueProfissionais);
    }, [profissionais]);
    
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentRecords = filteredProfissionais.slice(indexOfFirstRecord, indexOfLastRecord);
    const totalPages = Math.ceil(filteredProfissionais.length / recordsPerPage);

    const handleChangeStatus = async (status: 'Inativo' | 'Ativo') => {
        if (selectedProfissionais.length > 0) {
            try {
                setNotification({ type: 'info', message: `Alterando status dos profissionais para ${status}...` });
    
                const updates = {
                    profissional_status1: status.toLowerCase(),
                };
    
                const result = await window.ipcRenderer.invoke('update-records-postgres', {
                    table: 'profissionais',
                    updates,
                    ids: selectedProfissionais,
                    idColumn: 'profissional_id',
                });
    
                if (result.success) {
                    // Atualiza os profissionais removendo os que foram inativados
                    setFilteredProfissionais(prevProfissionais => 
                        prevProfissionais.filter(p => !selectedProfissionais.includes(p.profissional_id))
                    );
                    setSelectedProfissionais([]);
                    setNotification({ type: 'success', message: `Status dos profissionais alterado para ${status} com sucesso!` });
                } else {
                    setNotification({ type: 'error', message: result.message || 'Erro ao alterar status dos profissionais.' });
                }
            } catch (error) {
                setNotification({ type: 'error', message: 'Erro ao alterar status dos profissionais.' });
            }
        } else {
            setNotification({ type: 'error', message: 'Nenhum profissional selecionado.' });
        }
    };
    
    const handleCheckboxChange = (profissional_id: number): void => {
        setSelectedProfissionais(prevSelected =>
            prevSelected.includes(profissional_id)
                ? prevSelected.filter(selectedId => selectedId !== profissional_id)
                : [...prevSelected, profissional_id]
        );
    };

    return (
        <div className='bg-base-200 min-h-screen'>
            <Breadcrumbs />

            <div className="mt-10 px-24 rounded">
                <div className='card bg-base-100 shadow-xl w-full mb-10'>
                    <div className="card-body">
                        <div className='flex justify-between'>
                            <h2 className="card-title">Profissionais Inativos</h2>
                            <div className='flex gap-2 justify-between'>
                                <div className="dropdown dropdown-end">
                                    <div tabIndex={1} role="button" className="btn">
                                        Ações
                                    </div>
                                    <ul tabIndex={1} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
                                        <li>
                                            <Link to="/profissionais">
                                                Visualizar Ativos
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
                                <Link to={'/profissionais/novo'}>
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
                                                        setSelectedProfissionais(currentRecords.map(p => p.profissional_id));
                                                    } else {
                                                        setSelectedProfissionais([]);
                                                    }
                                                }}
                                                checked={selectedProfissionais.length === currentRecords.length}
                                            />
                                        </label>
                                    </th>
                                    <th>ID</th>
                                    <th>Foto</th>
                                    <th>Nome</th>
                                    <th>Unidades</th>
                                    <th>Funções</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentRecords.map((prof) => (
                                    <tr key={prof.profissional_id}>
                                        <th>
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    className="checkbox"
                                                    checked={selectedProfissionais.includes(prof.profissional_id)}
                                                    onChange={() => handleCheckboxChange(prof.profissional_id)}
                                                />
                                            </label>
                                        </th>
                                        <td>{prof.profissional_id}</td>
                                        <td>
                                            <img src={prof.imageUrl} alt={prof.profissional_nome} className="w-16 h-16 object-cover rounded-full" />
                                        </td>
                                        <td>{prof.profissional_nome}</td>
                                        <td>
                                            {unidades[prof.profissional_id]?.map(unidade => (
                                                <div key={unidade.unidade_id}>{unidade.unidade}</div>
                                            ))}
                                        </td>
                                        <td>
                                            {funcoes[prof.profissional_id]?.map(funcao => (
                                                <div key={funcao.funcao_id}>{funcao.funcao}</div>
                                            ))}
                                        </td>
                                        <td className="w-1">
                                            <Link to={`/profissionais/${prof.profissional_id}`} className='btn btn-ghost tooltip flex w-fit' data-tip="Editar">
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
                                Mostrando {indexOfFirstRecord + 1}-{Math.min(indexOfLastRecord, filteredProfissionais.length)} de {filteredProfissionais.length} registros
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
