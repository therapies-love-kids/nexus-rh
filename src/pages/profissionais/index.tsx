import { useState, useEffect } from 'react';
import { Breadcrumbs } from "@/components";
import { fetchImageFromFtp } from '@/utils/imageUtils';
import { Link, useNavigate } from 'react-router-dom';
import { IoArrowBack, IoArrowForward, IoPencil } from 'react-icons/io5';
import { Notification } from "@/components"; // Importando o componente Notification

interface Profissional {
    profissional_id: number;
    profissional_foto: string;
    profissional_nome: string;
}

interface Unidade {
    unidade: string;
}

interface Funcao {
    funcao: string;
}

export default function Profissionais() {
    const [, setProfissionais] = useState<Profissional[]>([]);
    const [selectedProfissionais, setSelectedProfissionais] = useState<number[]>([]);
    const [filteredProfissionais, setFilteredProfissionais] = useState<Profissional[]>([]);
    const [unidadesMap, setUnidadesMap] = useState<Record<number, Unidade[]>>({});
    const [funcoesMap, setFuncoesMap] = useState<Record<number, Funcao[]>>({});
    const [imageUrls, setImageUrls] = useState<Record<number, string>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage, setRecordsPerPage] = useState(5);
    const [notification, setNotification] = useState<{ type: 'info' | 'success' | 'error'; message: string } | null>(null);

    const fetchProfissionais = async () => {
        try {
            const result = await window.ipcRenderer.invoke(
                'query-database-postgres',
                'SELECT profissional_id, profissional_foto, profissional_nome FROM profissionais WHERE profissional_status1 = \'ativo\''
            );
            setProfissionais(result as Profissional[]);
            setFilteredProfissionais(result as Profissional[]);

            const imagePromises = (result as Profissional[]).map(async (profissional) => {
                const imageUrl = await fetchImageFromFtp(profissional.profissional_foto);
                return { profissional_id: profissional.profissional_id, imageUrl };
            });

            const imageResults = await Promise.all(imagePromises);
            const imageMap: Record<number, string> = {};
            imageResults.forEach(result => {
                imageMap[result.profissional_id] = result.imageUrl;
            });

            setImageUrls(imageMap);
        } catch (error) {
            console.error('Erro ao buscar profissionais:', error);
        }
    };

    const fetchUnidades = async () => {
        try {
            // Tabela de associação de profissionais e unidades
            const result = await window.ipcRenderer.invoke(
                'query-database-postgres',
                `SELECT pu.profissional_id, u.unidade 
                    FROM profissionais_unidade_associacao pu 
                    JOIN profissionais_unidade u ON pu.unidade_id = u.unidade_id`
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
                `SELECT pu.profissional_id, u.funcao 
                    FROM profissionais_funcao_associacao pu 
                    JOIN profissionais_funcao u ON pu.funcao_id = u.funcao_id`
            );
            const funcoesMapping: Record<number, Funcao[]> = {};
            result.forEach((item: { profissional_id: number, funcao: string }) => {
                if (!funcoesMapping[item.profissional_id]) {
                    funcoesMapping[item.profissional_id] = [];
                }
                funcoesMapping[item.profissional_id].push({ funcao: item.funcao });
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
    
    const handleCheckboxChange = (profissional_id: number): void => {
        setSelectedProfissionais(prevSelected =>
            prevSelected.includes(profissional_id)
                ? prevSelected.filter(selectedId => selectedId !== profissional_id)
                : [...prevSelected, profissional_id]
        );
    };

    const navigate = useNavigate();

    return (
        <div className='bg-base-200 min-h-screen'>
            <Breadcrumbs />

            <div className="mt-10 px-24 rounded">
                <div className='card bg-base-100 shadow-xl w-full mb-10'>
                    <div className="card-body">
                        <div className='flex justify-between'>
                            <h2 className="card-title">Profissionais</h2>
                            <div className='flex gap-2 justify-between'>
                                <div className="dropdown dropdown-end">
                                    <div tabIndex={1} role="button" className="btn">
                                        Ações
                                    </div>
                                    <ul tabIndex={1} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
                                        <li>
                                            <Link to="/profissionais/demitidos">
                                                Visualizar Demitidos
                                            </Link>
                                        </li>
                                        <li>
                                            <a onClick={() => handleChangeStatus('Demitido')}>
                                                Mover para Demitidos
                                            </a>
                                        </li>
                                        {/* <li>
                                            <button
                                                className={` ${selectedProfissionais.length !== 1 ? 'tooltip text-gray-400 text-start cursor-not-allowed' : ''}`}
                                                data-tip={selectedProfissionais.length !== 1 ? 'Selecione apenas um profissional para editar.' : ''}
                                                onClick={handleEdit}
                                                disabled={selectedProfissionais.length !== 1}
                                            >
                                                Editar
                                            </button>
                                        </li> */}
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
                                            <img src={imageUrls[prof.profissional_id]} alt={prof.profissional_nome} className="w-16 h-16 object-cover rounded-full" />
                                        </td>
                                        <td>{prof.profissional_nome}</td>
                                        <td>
                                            {unidadesMap[prof.profissional_id]?.map((unidade, index) => (
                                                <div key={index}>{unidade.unidade}</div>
                                            )) || 'Nenhuma unidade'}
                                        </td>
                                        <td>
                                            {funcoesMap[prof.profissional_id]?.map((funcao, index) => (
                                                <div key={index}>{funcao.funcao}</div>
                                            )) || 'Nenhuma função'}
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
