import { useState, useEffect } from 'react';
import { Breadcrumbs } from "@/components";
import { fetchImageFromFtp } from '@/utils/imageUtils';
import { Link, useNavigate } from 'react-router-dom';
import { IoArrowBack, IoArrowForward } from 'react-icons/io5';
import {Notification} from "@/components"; // Importando o componente Notification

interface Profissional {
    profissional_id: number;
    profissional_foto: string;
    profissional_nome: string;
    profissional_funcao_id: string;
    profissional_unidade_id: string;
    profissional_status: string;
}

export default function Profissionais() {
    const [, setProfissionais] = useState<Profissional[]>([]);
    const [selectedProfissionais, setSelectedProfissionais] = useState<number[]>([]);
    const [filteredProfissionais, setFilteredProfissionais] = useState<Profissional[]>([]);
    const [unidadesMap, setUnidadesMap] = useState<Record<string, string>>({});
    const [funcoesMap, setFuncoesMap] = useState<Record<string, string>>({});
    const [imageUrls, setImageUrls] = useState<Record<number, string>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage, setRecordsPerPage] = useState(5);
    const [notification, setNotification] = useState<{ type: 'info' | 'success' | 'error'; message: string } | null>(null); // Estado para a notificação

    const fetchProfissionais = async () => {
        try {
            const result = await window.ipcRenderer.invoke(
                'query-database-postgres',
                'SELECT profissional_id, profissional_foto, profissional_nome, profissional_funcao_id, profissional_unidade_id, profissional_status FROM profissionais'
            );
            setProfissionais(result as Profissional[]);
            setFilteredProfissionais(result as Profissional[]);

            const imagePromises = (result as Profissional[]).map(async (profissional) => {
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
            console.error('Erro ao buscar profissionais:', error);
        }
    };

    const fetchUnidades = async () => {
        try {
            const result = await window.ipcRenderer.invoke(
                'query-database-postgres',
                'SELECT id, unidade FROM profissionais_unidade'
            );
            const unidadesMapping: Record<string, string> = {};
            result.forEach((item: { id: string, unidade: string }) => {
                unidadesMapping[item.id] = item.unidade;
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
                const currentDate = new Date();
                const formattedDate = currentDate.toISOString();

                setNotification({ type: 'info', message: `Movendo profissionais para ${status}...` });

                const result = await window.ipcRenderer.invoke('move-records-postgres', {
                    sourceTable: status === 'Demitido' ? 'profissionais' : 'profissionais_demitidos',
                    destinationTable: status === 'Demitido' ? 'profissionais_demitidos' : 'profissionais',
                    ids: selectedProfissionais,
                    demissaoData: status === 'Demitido' ? formattedDate : undefined,
                    clearDemissaoData: status === 'Ativo'
                });

                if (result.success) {
                    await fetchProfissionais();
                    setSelectedProfissionais([]);
                    setNotification({ type: 'success', message: `Profissionais movidos para ${status} com sucesso!` });
                } else {
                    setNotification({ type: 'error', message: result.message || 'Erro ao mover profissionais.' });
                }
            } catch (error) {
                console.error('Erro ao mover profissionais:', error);
                setNotification({ type: 'error', message: 'Erro ao mover profissionais.' });
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

    const navigate = useNavigate();

    const handleEdit = () => {
        if (selectedProfissionais.length === 1) {
            const [selectedId] = selectedProfissionais;
            navigate(`/profissionais/editar/${selectedId}`);
        } else {
            setNotification({ type: 'error', message: 'Selecione apenas um profissional para editar.' });
        }
    };

    return (
        <div className='bg-base-200 min-h-screen'>
            <Breadcrumbs />

            <div className=" mt-10 px-24 rounded">
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
                                        <li>
                                            <div className={` ${selectedProfissionais.length !== 1 ? 'tooltip text-base-300' : ''}`} data-tip={selectedProfissionais.length !== 1 ? 'Selecione apenas um profissional para editar.' : ''}>
                                                <button
                                                    className={` ${selectedProfissionais.length !== 1 ? '' : ''}`}
                                                    onClick={handleEdit}
                                                    disabled={selectedProfissionais.length !== 1}
                                                >
                                                    Editar informações
                                                </button>
                                            </div>
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
                                            {imageUrls[prof.profissional_id] ? (
                                                <div className="avatar">
                                                    <div className="mask mask-squircle w-12 h-12">
                                                        <img src={imageUrls[prof.profissional_id]} alt={`Foto de ${prof.profissional_nome}`} />
                                                    </div>
                                                </div>
                                            ) : (
                                                'Sem foto'
                                            )}
                                        </td>
                                        <td>{prof.profissional_nome}</td>
                                        <td>{funcoesMap[prof.profissional_funcao_id]}</td>
                                        <td>{unidadesMap[prof.profissional_unidade_id]}</td>
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
                    {notification && (
                        <Notification
                            type={notification.type}
                            message={notification.message}
                            onClose={() => setNotification(null)} // Função para fechar a notificação
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
