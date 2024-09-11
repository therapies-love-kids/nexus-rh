import React, { useState, useEffect } from 'react';
import { Breadcrumbs, Modal } from "@/components";
import { IoClose, IoSearch } from 'react-icons/io5';

interface Profissional {
    id: number
    profissional_foto: string | null
    profissional_nome: string
    profissional_tipo: string
    profissional_unidade: string
}

interface Unidade {
    nome: string
}

interface NivelAcesso {
    profissional_tipo: string
}

const logicalOperators = [
    'igual à',
    'maior que',
    'menor que',
    'semelhante à'
]

export default function Profissionais () {
    const [profissionais, setProfissionais] = useState<Profissional[]>([])
    const [selectedProfissionais, setSelectedProfissionais] = useState<number[]>([])
    const [filters, setFilters] = useState<{ column: string; operator: string; value: string }>({
        column: '',
        operator: '',
        value: ''
    })
    const [activeFilters, setActiveFilters] = useState<Array<{ column: string; operator: string; value: string }>>([])
    const [logicalOperatorsBetweenFilters, setLogicalOperatorsBetweenFilters] = useState<string[]>([])
    const [filteredProfissionais, setFilteredProfissionais] = useState<Profissional[]>([])
    const [unidades, setUnidades] = useState<string[]>([])
    const [niveisAcesso, setNiveisAcesso] = useState<string[]>([])
    
    // Paginação
    const [currentPage, setCurrentPage] = useState(1)
    const [recordsPerPage, setRecordsPerPage] = useState(5)

    const [modal, setModal] = useState<{ type: 'info' | 'success' | 'error'; message: string } | null>(null)

    useEffect(() => {
        const fetchProfissionais = async () => {
            try {
                const result = await window.ipcRenderer.invoke(
                    'query-database-postgres',
                    'SELECT id, profissional_foto, profissional_nome, profissional_tipo, profissional_unidade FROM profissional'
                )
                setProfissionais(result as Profissional[])
            } catch (error) {
                console.error('Error fetching professionals:', error)
            }
        }

        const fetchUnidades = async () => {
            try {
                const result = await window.ipcRenderer.invoke(
                    'query-database-postgres',
                    'SELECT nome FROM profissional_unidade'
                )
                setUnidades(result.map((item: Unidade) => item.nome))
            } catch (error) {
                console.error('Error fetching units:', error)
            }
        }

        const fetchNiveisAcesso = async () => {
            try {
                const result = await window.ipcRenderer.invoke(
                    'query-database-postgres',
                    'SELECT profissional_tipo FROM profissional_tipo'
                )
                setNiveisAcesso(result.map((item: NivelAcesso) => item.profissional_tipo.replace(/[()]/g, '')))
            } catch (error) {
                console.error('Error fetching access levels:', error)
            }
        }

        fetchProfissionais()
        fetchUnidades()
        fetchNiveisAcesso()
    }, [])

    useEffect(() => {
        if (activeFilters.length === 0) {
            setFilteredProfissionais(profissionais)
            return
        }
    
        let filtered = [...profissionais]; // Inicializa com todos os profissionais
    
        activeFilters.forEach((filter, index) => {
            let filteredResult = filtered.filter(p => {
                let value: string
                switch (filter.column) {
                    case 'id': value = p.id.toString(); break
                    case 'profissional_nome': value = p.profissional_nome; break
                    case 'profissional_tipo': value = p.profissional_tipo; break
                    case 'profissional_unidade': value = p.profissional_unidade; break
                    default: value = ''
                }
    
                switch (filter.operator) {
                    case 'igual à':
                        return value === filter.value
                    case 'maior que':
                        return parseFloat(value) > parseFloat(filter.value)
                    case 'menor que':
                        return parseFloat(value) < parseFloat(filter.value)
                    case 'semelhante à':
                        return value.includes(filter.value)
                    default:
                        return true
                }
            })
    
            if (index === 0) {
                filtered = filteredResult; // Primeiro filtro é aplicado diretamente
            } else {
                const operatorBetween = logicalOperatorsBetweenFilters[index - 1]
    
                if (operatorBetween === 'E') {
                    filtered = filtered.filter(p => filteredResult.some(f => f.id === p.id))
                } else if (operatorBetween === 'OU') {
                    const filteredIds = new Set([...filtered.map(p => p.id), ...filteredResult.map(f => f.id)])
                    filtered = profissionais.filter(p => filteredIds.has(p.id))
                }
            }
        })
    
        setFilteredProfissionais(filtered)
    }, [activeFilters, logicalOperatorsBetweenFilters, profissionais])

    // Paginação
    const indexOfLastRecord = currentPage * recordsPerPage
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage
    const currentRecords = filteredProfissionais.slice(indexOfFirstRecord, indexOfLastRecord)
    const totalPages = Math.ceil(filteredProfissionais.length / recordsPerPage)

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prevFilters => ({
            ...prevFilters,
            [key]: value
        }))
    }

    const applyFilter = () => {
        setActiveFilters([...activeFilters, filters])
        setLogicalOperatorsBetweenFilters([...logicalOperatorsBetweenFilters, 'OU']); // Adiciona "OU" por padrão
        setFilters({
            column: '',
            operator: '',
            value: ''
        })
    }

    const removeFilter = (index: number) => {
        const newFilters = activeFilters.filter((_, i) => i !== index)
        const newOperators = logicalOperatorsBetweenFilters.filter((_, i) => i !== index)
        setActiveFilters(newFilters)
        setLogicalOperatorsBetweenFilters(newOperators)
    }

    const toggleOperator = (index: number) => {
        setLogicalOperatorsBetweenFilters(prevOperators => 
            prevOperators.map((op, i) => 
                i === index ? (op === 'E' ? 'OU' : 'E') : op
            )
        )
    }

    const handleCheckboxChange = (id: number): void => {
        setSelectedProfissionais(prevSelected => 
            prevSelected.includes(id)
                ? prevSelected.filter(selectedId => selectedId !== id)
                : [...prevSelected, id]
        )
    }

    const isFilterFormValid = () => {
        return filters.column !== '' && filters.operator !== '' && filters.value !== ''
    }

    const handleDeleteRecords = async () => {
        if (selectedProfissionais.length > 0) {
            try {
                setModal({ type: 'info', message: 'Excluindo registros...' })
    
                await window.ipcRenderer.invoke('delete-records-postgres', selectedProfissionais)
    
                // Atualizar a lista de profissionais após exclusão
                const result = await window.ipcRenderer.invoke(
                    'query-database-postgres',
                    'SELECT id, profissional_foto, profissional_nome, profissional_tipo, profissional_unidade FROM profissional'
                )
                setProfissionais(result as Profissional[])
                setSelectedProfissionais([]); // Limpar seleção
    
                setModal({ type: 'success', message: 'Registros excluídos com sucesso!' })
            } catch (error) {
                console.error('Error deleting records:', error)
                setModal({ type: 'error', message: 'Erro ao excluir registros.' })
            }
        } else {
            setModal({ type: 'error', message: 'Nenhum registro selecionado.' })
        }
    }


    return (
        <div className='bg-base-200 min-h-screen'>
            <Breadcrumbs />

            <div className=" px-24 rounded">
                <div className="relative">
                    <div className='card bg-base-100 shadow-xl w-full my-10'>
                        <div className="card-body">
                            <h2 className="card-title">Filtros</h2>
                            <div className='flex justify-between'>
                                <select 
                                    className="select select-bordered w-full max-w-xs" 
                                    onChange={(e) => handleFilterChange('column', e.target.value)}
                                    value={filters.column}
                                >
                                    <option value="" disabled>Selecione a coluna</option>
                                    <option value="id">ID</option>
                                    <option value="profissional_nome">Nome</option>
                                    <option value="profissional_tipo">Nível de Acesso</option>
                                    <option value="profissional_unidade">Unidade</option>
                                </select>
                                <select 
                                    className="select select-bordered w-full max-w-xs" 
                                    onChange={(e) => handleFilterChange('operator', e.target.value)}
                                    value={filters.operator}
                                >
                                    <option value="" disabled>Selecione o operador</option>
                                    {logicalOperators.map(op => (
                                        <option key={op} value={op}>{op}</option>
                                    ))}
                                </select>
                                {filters.column === 'profissional_unidade' || filters.column === 'profissional_tipo' ? (
                                    <select
                                        className="select select-bordered w-full max-w-xs"
                                        onChange={(e) => handleFilterChange('value', e.target.value)}
                                        value={filters.value}
                                    >
                                        <option value="" disabled>Selecione o valor</option>
                                        {(filters.column === 'profissional_unidade' ? unidades : niveisAcesso).map(val => (
                                            <option key={val} value={val}>{val}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <input 
                                        type="text" 
                                        placeholder="Digite o valor" 
                                        className="input input-bordered w-full max-w-xs" 
                                        onChange={(e) => handleFilterChange('value', e.target.value)}
                                        value={filters.value}
                                    />
                                )}
                            </div>
                            <button 
                                className={`btn ${isFilterFormValid() ? '' : 'btn-disabled'} mt-5`} 
                                onClick={applyFilter}
                                disabled={!isFilterFormValid()}
                            >
                                <IoSearch />
                                Aplicar Filtro
                            </button>

                            {/* Filtros Aplicados */}
                            <div className="flex flex-wrap gap-2 mt-4">
                                {activeFilters.map((filter, index) => (
                                    <React.Fragment key={index}>
                                        {index > 0 && (
                                            <button 
                                                className="badge badge-secondary cursor-pointer"
                                                onClick={() => toggleOperator(index - 1)}
                                            >
                                                {logicalOperatorsBetweenFilters[index - 1]}
                                            </button>
                                        )}
                                        <div className="badge badge-info gap-2 pr-3">
                                            <button onClick={() => removeFilter(index)}>
                                                <IoClose /> 
                                            </button>
                                            {`${filter.column} ${filter.operator} ${filter.value}`}
                                        </div>
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className='card bg-base-100 shadow-xl w-full mb-10'>
                        <div className="card-body">
                            <div className='flex justify-between'>
                                <h2 className="card-title">Profissionais</h2>
                                <div className='flex gap-2 justify-between'>

                                    <div className="dropdown dropdown-end">
                                        <div tabIndex={11} role="button" className="btn">
                                            Ações
                                        </div>
                                        <ul tabIndex={11} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
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
                                    <button className="btn btn-primary">Adicionar</button>
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
                                                            setSelectedProfissionais(currentRecords.map(p => p.id))
                                                        } else {
                                                            setSelectedProfissionais([])
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
                                        <tr key={prof.id}>
                                            <th>
                                                <label>
                                                    <input 
                                                        type="checkbox" 
                                                        className="checkbox" 
                                                        checked={selectedProfissionais.includes(prof.id)}
                                                        onChange={() => handleCheckboxChange(prof.id)} 
                                                    />
                                                </label>
                                            </th>
                                            <td>
                                                <div className="font-bold">{prof.id}</div>
                                            </td>
                                            <td>
                                                <div className="avatar">
                                                    <div className="mask mask-squircle h-12 w-12">
                                                        {/* <img
                                                            src=(prof.profissional_foto)
                                                            alt={prof.profissional_nome}
                                                        /> */}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="font-bold">{prof.profissional_nome}</div>
                                            </td>
                                            <td>
                                                <div className="font-bold">{prof.profissional_tipo}</div>
                                            </td>
                                            <td>
                                                {prof.profissional_unidade}
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
            {modal && (
                <Modal 
                    type={modal.type} 
                    message={modal.message} 
                    onClose={() => setModal(null)} 
                />
            )}
        </div>
    )
}