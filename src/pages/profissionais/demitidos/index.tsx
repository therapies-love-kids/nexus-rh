import { useState, useEffect } from 'react';
import { Breadcrumbs } from "@/components";
import { fetchImageFromFtp } from '@/utils/imageUtils';
import { Link } from 'react-router-dom';

interface Profissional {
    profissional_id: number;
    profissional_foto: string;
    profissional_nome: string;
    profissional_funcao_id: string;
    profissional_unidade_id: string;
    profissional_status: string;
}

interface Unidade {
    unidade: string;
}

interface Funcao {
    funcao: string;
}

export default function ProfissionaisDemitidos() {
    const [profissionais, setProfissionais] = useState<Profissional[]>([]);
    const [selectedProfissionais, setSelectedProfissionais] = useState<number[]>([]);
    const [filteredProfissionais, setFilteredProfissionais] = useState<Profissional[]>([]);
    const [unidadesMap, setUnidadesMap] = useState<Record<string, string>>({});
    const [funcoesMap, setFuncoesMap] = useState<Record<string, string>>({});
    const [imageUrls, setImageUrls] = useState<Record<number, string>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage, setRecordsPerPage] = useState(5);
    const [modal, setModal] = useState<{ type: 'info' | 'success' | 'error'; message: string } | null>(null);

    const fetchProfissionais = async () => {
        try {
            const result = await window.ipcRenderer.invoke(
                'query-database-postgres',
                `SELECT profissional_id, profissional_foto, profissional_nome, profissional_funcao_id, profissional_unidade_id, profissional_status FROM profissionais_demitidos`
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
            console.error('Erro ao buscar profissionais demitidos:', error);
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

    const handleChangeStatus = async () => {
        if (selectedProfissionais.length > 0) {
            try {
                setModal({ type: 'info', message: 'Reativando profissionais...' });
    
                // Chama o IPC para mover os registros e limpar a data de demissão
                const result = await window.ipcRenderer.invoke('move-records-postgres', {
                    sourceTable: 'profissionais_demitidos',
                    destinationTable: 'profissionais',
                    ids: selectedProfissionais,
                    clearDemissaoData: true // Passa a flag para limpar a data de demissão
                });
    
                if (result.success) {
                    await fetchProfissionais(); // Recarrega a lista de profissionais
                    setSelectedProfissionais([]); // Limpa seleção
                    setModal({ type: 'success', message: 'Profissionais reativados com sucesso!' });
                } else {
                    setModal({ type: 'error', message: result.message || 'Erro ao reativar profissionais.' });
                }
            } catch (error) {
                console.error('Erro ao reativar profissionais:', error);
                setModal({ type: 'error', message: 'Erro ao reativar profissionais.' });
            }
        } else {
            setModal({ type: 'error', message: 'Nenhum profissional selecionado.' });
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
                                            <a onClick={handleChangeStatus}>
                                                Mover para Ativo
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
                                        <td>{unidadesMap[prof.profissional_unidade_id] || 'N/A'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className='flex justify-between mt-4'>
                            <p>Página {currentPage} de {totalPages}</p>
                            <div className="btn-group">
                                <button
                                    className={`btn ${currentPage === 1 ? 'btn-disabled' : ''}`}
                                    onClick={() => setCurrentPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                >
                                    Anterior
                                </button>
                                <button
                                    className={`btn ${currentPage === totalPages ? 'btn-disabled' : ''}`}
                                    onClick={() => setCurrentPage(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                >
                                    Próxima
                                </button>
                            </div>
                        </div>

                        {modal && (
                            <div className={`alert alert-${modal.type}`}>
                                <span>{modal.message}</span>
                                <button className="btn btn-sm" onClick={() => setModal(null)}>Fechar</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}