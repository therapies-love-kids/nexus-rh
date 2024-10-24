import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { IoArrowBack, IoArrowForward, IoPencil } from 'react-icons/io5';
import { useProfissionais } from '@/hooks/hookProfissionais';
import { LayoutDashTable } from '@/Layout';

interface Profissional {
    profissional_id: number;
    profissional_foto: any;
    profissional_nome: any;
    imageUrl?: any;
}

export default function Profissionais() {
    const [selectedProfissionais, setSelectedProfissionais] = useState<number[]>([]);
    const [filteredProfissionais, setFilteredProfissionais] = useState<Profissional[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage, setRecordsPerPage] = useState(5);
    const [notification, setNotification] = useState<{ type: 'info' | 'success' | 'error'; message: any } | null>(null);
    const [viewStatus, setviewStatus] = useState(false);

    const [visibleColumns, setVisibleColumns] = useState({
        id: true,
        foto: true,
        nome: true,
        funcoes: true,
        unidades: true,
        empresas: true,
        departamentos: true,
    });

    const { profissionais, unidades, funcoes, empresas, departamentos } = useProfissionais(
        'profissionais/fotos', 
        viewStatus ? 'inativo' : 'ativo', 
        undefined,       
        undefined,       
        undefined,       
        undefined        
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

    const toggleColumn = (column: keyof typeof visibleColumns) => {
        setVisibleColumns(prev => ({ ...prev, [column]: !prev[column] }));
    };
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
        <LayoutDashTable
            notification={notification}
            onCloseNotification={() => setNotification(null)}
        >
            <div className='flex justify-between items-center'>
                <h2 className="card-title">
                {viewStatus ? 'Profissionais Inativos' : 'Profissionais'}
                </h2>

                <div className='flex gap-2 justify-between'>
                    <div className="dropdown dropdown-end">
                        <div tabIndex={1} role="button" className="btn">
                            Ações
                        </div>
                        <ul tabIndex={1} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
                            <li>
                                <a onClick={() => setviewStatus(!viewStatus)}>
                                    {viewStatus ? 'Visualizar Ativos' : 'Visualizar Inativos'}
                                </a>
                            </li>
                            {viewStatus ? (
                                <li>
                                    <a onClick={() => handleChangeStatus('Ativo')}>
                                        Mover para Ativos
                                    </a>
                                </li>
                            ) : (
                                <li>
                                    <a onClick={() => handleChangeStatus('Inativo')}>
                                        Mover para Inativos
                                    </a>
                                </li>
                            )}
                        </ul>
                    </div>

                    <div className="dropdown dropdown-end">
                        <div tabIndex={1} role="button" className="btn">
                            Colunas
                        </div>
                        <ul tabIndex={1} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
                            {Object.keys(visibleColumns).map(column => (
                                <li key={column}>
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={visibleColumns[column as keyof typeof visibleColumns]}
                                            onChange={() => toggleColumn(column as keyof typeof visibleColumns)}
                                        />
                                        {column.charAt(0).toUpperCase() + column.slice(1)}
                                    </label>
                                </li>
                            ))}
                        </ul>
                    </div>

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
                        {visibleColumns.id && <th>ID</th>}
                        {visibleColumns.foto && <th>Foto</th>}
                        {visibleColumns.nome && <th>Nome</th>}
                        {visibleColumns.funcoes && <th>Funções</th>}
                        {visibleColumns.unidades && <th>Unidades</th>}
                        {visibleColumns.empresas && <th>Empresas</th>}
                        {visibleColumns.departamentos && <th>Departamentos</th>}
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
                            {visibleColumns.id && <td>{prof.profissional_id}</td>}
                            {visibleColumns.foto && (
                                <td>
                                    <img src={prof.imageUrl} alt={prof.profissional_nome} className="w-16 h-16 object-cover rounded-full" />
                                </td>
                            )}
                            {visibleColumns.nome && <td>{prof.profissional_nome}</td>}
                            {visibleColumns.funcoes && (
                                <td>
                                    {funcoes[prof.profissional_id]?.map(funcao => (
                                        <div key={funcao.funcao_id}>{funcao.funcao}</div>
                                    ))}
                                </td>
                            )}
                            {visibleColumns.unidades && (
                                <td>
                                    {unidades[prof.profissional_id]?.map(unidade => (
                                        <div key={unidade.unidade_id}>{unidade.unidade}</div>
                                    ))}
                                </td>
                            )}
                            {visibleColumns.empresas && (
                            <td>
                                {(empresas[prof.profissional_id] || []).map((empresa: any) => (
                                <div key={empresa.empresa_id}>{empresa.empresa}</div>
                                ))}
                            </td>
                            )}
                            {visibleColumns.departamentos && (
                                <td>
                                    {(departamentos[prof.profissional_id] || []).map((departamento: any) => (
                                        <div key={departamento.departamento_id}>{departamento.departamento}</div>
                                    ))}
                                </td>
                            )}
                            <td className="w-1">
                                <Link to={`/profissionais/${prof.profissional_id}`} className='btn btn-ghost tooltip flex w-fit' data-tip="Editar">
                                    <IoPencil />
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="grid grid-cols-3 justify-center items-center w-full mt-4 text-center">
                <div className="flex items-center justify-start gap-5">
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

                <div className="text-sm text-neutral">
                    {indexOfFirstRecord + 1} - {Math.min(indexOfLastRecord, filteredProfissionais.length)} de {filteredProfissionais.length}
                </div>

                <div className='w-full flex justify-end'>
                    <select className="select select-bordered w-18" onChange={(e) => setRecordsPerPage(parseInt(e.target.value))}>
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                    </select>
                </div>
            </div>

        </LayoutDashTable>
    );
}
