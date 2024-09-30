import { useState, useEffect } from 'react';
import { Breadcrumbs } from "@/components";
import { fetchImageFromFtp } from '@/utils/imageUtils';
import { Link } from 'react-router-dom';
import { IoArrowBack, IoArrowForward } from 'react-icons/io5';
import { Notification }  from '@/components'; // Importa o componente de notificação

interface Profissional {
    profissional_id: number;
    profissional_foto: string;
    profissional_nome: string;
    profissional_funcao_id: string;
}

interface Unidade {
    unidade: string;
}

export default function ProfissionaisDemitidos() {
    const [, setProfissionais] = useState<Profissional[]>([]);
    const [selectedProfissionais, setSelectedProfissionais] = useState<number[]>([]);
    const [filteredProfissionais, setFilteredProfissionais] = useState<Profissional[]>([]);
    const [unidadesMap, setUnidadesMap] = useState<Record<number, Unidade[]>>({});
    const [funcoesMap, setFuncoesMap] = useState<Record<string, string>>({});
    const [imageUrls, setImageUrls] = useState<Record<number, string>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage, setRecordsPerPage] = useState(5);
    const [notification, setNotification] = useState<{ type: 'info' | 'success' | 'error'; message: string } | null>(null); // Estado da notificação


// Tipagem para a função map
    const fetchProfissionais = async () => {
        try {
            const result = await window.ipcRenderer.invoke(
                'query-database-postgres',
                'SELECT profissional_id, profissional_foto, profissional_nome, profissional_funcao_id FROM profissionais WHERE profissional_status1 = \'demitido\''
            );
            
            setProfissionais(result as Profissional[]);
            setFilteredProfissionais(result as Profissional[]);

            const imagePromises = (result as Profissional[]).map(async (profissional: Profissional) => {
                const imageUrl = await fetchImageFromFtp(profissional.profissional_foto);
                return { id: profissional.profissional_id, imageUrl };
            });

            const imageResults = await Promise.all(imagePromises);
            const imageMap: Record<number, string> = {};
            imageResults.forEach(result => {
                imageMap[result.id] = result.imageUrl;
            });

            setImageUrls(imageMap);
        } catch (error) {
            console.error('Erro ao buscar profissionais demitidos:', error);
        }
    };

    const fetchUnidades = async () => {
        try {
            // Tabela de associação de profissionais e unidades
            const result = await window.ipcRenderer.invoke(
                'query-database-postgres',
                `SELECT pu.profissional_id, u.unidade 
                    FROM profissionais_unidade_associacao pu 
                    JOIN profissionais_unidade u ON pu.unidade_id = u.id`
            );
            const unidadesMapping: Record<number, Unidade[]> = {};
            result.forEach((item: { profissional_id: number, unidade: string }) => {
                if (!unidadesMapping[item.profissional_id]) {
                    unidadesMapping[item.profissional_id] = [];
                }
                unidadesMapping[item.profissional_id].push({ unidade: item.unidade });
            });
            setUnidadesMap(unidadesMapping);
        } catch (error) {
            console.error('Erro ao buscar unidades:', error);
        }
    };

    const fetchFuncoes = async () => {
        try {
            const result = await window.ipcRenderer.invoke(
                'query-database-postgres',
                'SELECT id, funcao FROM profissionais_funcao'
            );
            const funcoesMapping: Record<string, string> = {};
            result.forEach((item: { id: string, funcao: string }) => {
                funcoesMapping[item.id] = item.funcao;
            });
            setFuncoesMap(funcoesMapping);
        } catch (error) {
            console.error('Erro ao buscar funções:', error);
        }
    };

    useEffect(() => {
        fetchProfissionais();
        fetchUnidades();
        fetchFuncoes();
    }, []);

    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentRecords = filteredProfissionais.slice(indexOfFirstRecord, indexOfLastRecord);
    const totalPages = Math.ceil(filteredProfissionais.length / recordsPerPage);

    const handleChangeStatus = async (status: 'Demitido' | 'Ativo') => {
        if (selectedProfissionais.length > 0) {
            try {
                setNotification({ type: 'info', message: `Alterando status dos profissionais para ${status}...` });
    
                const updates = {
                    profissional_status1: status.toLowerCase(), // Definindo o status
                };
    
                const result = await window.ipcRenderer.invoke('update-records-postgres', {
                    table: 'profissionais',
                    updates,
                    ids: selectedProfissionais, // IDs dos profissionais selecionados
                    idColumn: 'profissional_id', // Coluna de identificação
                });
    
                if (result.success) {
                    await fetchProfissionais();
                    setSelectedProfissionais([]);
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

    const handleCheckboxChange = (id: number): void => {
        setSelectedProfissionais(prevSelected =>
            prevSelected.includes(id)
                ? prevSelected.filter(selectedId => selectedId !== id)
                : [...prevSelected, id]
        );
    };

    return (
        <div className='bg-base-200 min-h-screen'>
            <Breadcrumbs />

            <div className="mt-10 px-24 rounded">
                <div className='card bg-base-100 shadow-xl w-full mb-10'>
                    <div className="card-body">
                        <div className='flex justify-between'>
                            <h2 className="card-title">Profissionais Demitidos</h2>
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
                                <select 
                                    className="select select-bordered max-w-xs" 
                                    value={recordsPerPage} 
                                    onChange={(e) => {
                                        setRecordsPerPage(parseInt(e.target.value));
                                        setCurrentPage(1); // Resetar para a primeira página ao mudar o intervalo
                                    }}
                                >
                                    <option value="5">5</option>
                                    <option value="10">10</option>
                                    <option value="25">25</option>
                                    <option value="50">50</option>
                                </select>
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
                                                checked={selectedProfissionais.length === currentRecords.length && selectedProfissionais.length > 0}
                                            />
                                        </label>
                                    </th>
                                    <th>ID</th>
                                    <th>Foto</th>
                                    <th>Nome</th>
                                    <th>Nível de Acesso</th>
                                    <th>Unidade de Atuação</th>
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
                                            <div className="avatar">
                                                <div className="mask mask-squircle w-12 h-12">
                                                    <img
                                                        src={imageUrls[prof.profissional_id] || '/images/default.png'}
                                                        alt={`Foto de ${prof.profissional_nome}`}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td>{prof.profissional_nome}</td>
                                        <td>{funcoesMap[prof.profissional_funcao_id] || 'N/A'}</td>
                                        <td>
                                            {unidadesMap[prof.profissional_id]?.map((unidade, index) => (
                                                <div key={index}>{unidade.unidade}</div>
                                            )) || 'Nenhuma unidade'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="flex justify-between items-center">
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
