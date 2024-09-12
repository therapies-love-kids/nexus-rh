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
}

interface Unidade {
    unidade: string;
}

interface Funcao {
    funcao: string;
}

export default function Profissionais() {
    const [profissionais, setProfissionais] = useState<Profissional[]>([]);
    const [selectedProfissionais, setSelectedProfissionais] = useState<number[]>([]);
    const [filteredProfissionais, setFilteredProfissionais] = useState<Profissional[]>([]);
    const [unidades, setUnidades] = useState<string[]>([]);
    const [funcoes, setFuncoes] = useState<string[]>([]);
    const [imageUrls, setImageUrls] = useState<Record<number, string>>({});
    const [unidadesMap, setUnidadesMap] = useState<Record<string, string>>({});
    const [funcoesMap, setFuncoesMap] = useState<Record<string, string>>({});
    

    // Paginação
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage, setRecordsPerPage] = useState(5);

    const [modal, setModal] = useState<{ type: 'info' | 'success' | 'error'; message: string } | null>(null);

    useEffect(() => {
        const fetchProfissionais = async () => {
            try {
                const result = await window.ipcRenderer.invoke(
                    'query-database-postgres',
                    'SELECT profissional_id, profissional_foto, profissional_nome, profissional_funcao_id, profissional_unidade_id FROM profissionais'
                );
                setProfissionais(result as Profissional[]);
                setFilteredProfissionais(result as Profissional[]);
    
                // Carregar o caminho das imagens para cada profissional
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
        

        fetchProfissionais();
        fetchUnidades();
        fetchFuncoes();
    }, []);

    // Paginação
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentRecords = filteredProfissionais.slice(indexOfFirstRecord, indexOfLastRecord);
    const totalPages = Math.ceil(filteredProfissionais.length / recordsPerPage);

    const handleCheckboxChange = (id: number): void => {
        setSelectedProfissionais(prevSelected =>
            prevSelected.includes(id)
                ? prevSelected.filter(selectedId => selectedId !== id)
                : [...prevSelected, id]
        );
    };

    const handleDeleteRecords = async () => {
        if (selectedProfissionais.length > 0) {
            try {
                setModal({ type: 'info', message: 'Excluindo registros...' });
    
                // Chama o IPC para excluir os registros
                await window.ipcRenderer.invoke('delete-records-postgres', selectedProfissionais);
    
                // Atualiza a lista de profissionais localmente
                const updatedProfissionais = profissionais.filter(
                    (prof) => !selectedProfissionais.includes(prof.profissional_id)
                );
    
                // Atualiza tanto a lista de profissionais quanto a lista filtrada
                setProfissionais(updatedProfissionais);
                setFilteredProfissionais(updatedProfissionais);
    
                // Limpar seleção
                setSelectedProfissionais([]);
    
                setModal({ type: 'success', message: 'Registros excluídos com sucesso!' });
            } catch (error) {
                console.error('Error deleting records:', error);
                setModal({ type: 'error', message: 'Erro ao excluir registros.' });
            }
        } else {
            setModal({ type: 'error', message: 'Nenhum registro selecionado.' });
        }
    };
    

    return (
        <div className='bg-base-200 min-h-screen'>
            <Breadcrumbs />

            <div className="px-24 rounded">
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
                                            <a onClick={handleDeleteRecords}>
                                                Excluir
                                            </a>
                                        </li>
                                        <li>
                                            <a>
                                                Editar
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
                                <Link to={'/addprofissional'}>
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
                                        <td>
                                            <div className="font-bold">{prof.profissional_id}</div>
                                        </td>
                                        <td>
                                            <div className="avatar">
                                                <div className="mask mask-squircle h-12 w-12">
                                                    <img
                                                        src={imageUrls[prof.profissional_id] || '/profissionais/default.png'}
                                                        alt={prof.profissional_nome}
                                                        className="w-16 h-16 object-cover"
                                                    />

                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="font-bold">{prof.profissional_nome}</div>
                                        </td>
                                        <td>
                                            <div className="font-bold">{funcoesMap[prof.profissional_funcao_id] || 'N/A'}</div> {/* Exibe o nome da função */}
                                        </td>
                                        <td>
                                            {unidadesMap[prof.profissional_unidade_id] || 'N/A'} {/* Exibe o nome da unidade */}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Controles de paginação */}
                        <div className='w-full flex justify-center mt-4'>
                            <div className="join">
                                <button 
                                    className="join-item btn btn-ghost"
                                    onClick={() => setCurrentPage(prevPage => Math.max(prevPage - 1, 1))}
                                >
                                    «
                                </button>
                                {[...Array(totalPages)].map((_, index) => (
                                    <button
                                        key={index}
                                        className={`join-item btn ${index + 1 === currentPage ? 'btn-primary' : 'btn-ghost'}`}
                                        onClick={() => setCurrentPage(index + 1)}
                                    >
                                        {index + 1}
                                    </button>
                                ))}
                                <button 
                                    className="join-item btn btn-ghost"
                                    onClick={() => setCurrentPage(prevPage => Math.min(prevPage + 1, totalPages))}
                                >
                                    »
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
