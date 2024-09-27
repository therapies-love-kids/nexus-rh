import { useState, useEffect } from 'react';
import { Breadcrumbs, Modal } from "@/components";
import { Link, useParams } from 'react-router-dom';
import { IoArrowBack, IoCalendar, IoKey, IoPerson, IoClose } from 'react-icons/io5';
import DatePicker from 'react-date-picker';

interface Unidade {
    id: number;
    unidade: string;
}

interface Funcao {
    id: number;
    funcao: string;
}

interface Empresa {
    id: number;
    empresa: string;
}

export default function AtualizarProfissional() {
    const { id } = useParams<string>(); // Obter ID do profissional via parâmetros da URL
    const [nome, setNome] = useState<string>('');
    const [senha, setSenha] = useState<string>('');
    const [dataIngressoEmpresa, setDataIngressoEmpresa] = useState<Date | null>(null);

    const [modalMessage, setModalMessage] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    const [unidades, setUnidades] = useState<Unidade[]>([]);
    const [selectedUnidades, setSelectedUnidades] = useState<number[]>([]); // Lista de unidades selecionadas

    const [funcoes, setFuncoes] = useState<Funcao[]>([]);
    const [funcaoId, setFuncaoId] = useState<number | null>(null);

    const [empresas, setEmpresas] = useState<Empresa[]>([]);
    const [empresaId, setEmpresaId] = useState<number | null>(null);

    const [macs, setMacs] = useState<string[]>([]);
    const [newMac, setNewMac] = useState<string>('');

    // Função para buscar os MACs do profissional
    const fetchMacs = async () => {
        try {
            const result = await window.ipcRenderer.invoke(
                'query-database-postgres',
                `SELECT mac FROM profissionais_mac WHERE profissional_id = ${id}`
            );
            setMacs(result.map((row: any) => row.mac));
        } catch (error) {
            console.log(error);
        }
    };

    // Carregar os MACs ao montar o componente
    useEffect(() => {
        if (id) {
            fetchMacs();
        }
    }, [id]);

    const handleDeleteMac = async (macToDelete: string) => {
        try {
            await window.ipcRenderer.invoke(
                'delete-records-postgres',
                { 
                    table: 'profissionais_mac', 
                    ids: [macToDelete], // Considerando que você usará a coluna 'mac' como ID
                    idColumn: 'mac' // Passando a coluna como parâmetro
                }
            );
            setMacs(macs.filter(mac => mac !== macToDelete)); // Atualizar a lista de MACs
        } catch (error) {
            console.log(error);
        }
    };

    const handleAddMac = async () => {
        if (newMac.trim() === '') {
            setModalMessage('O campo de MAC não pode estar vazio.');
            setIsModalOpen(true);
            return;
        }
    
        try {
            await window.ipcRenderer.invoke(
                'insert-records-postgres',
                {
                    table: 'profissionais_mac',
                    columns: ['profissional_id', 'mac'],
                    values: [id, newMac]
                }
            );
            setMacs([...macs, newMac]); // Atualizar a lista de MACs
            setNewMac(''); // Limpar o campo
        } catch (error) {
            console.log(error);
        }
    };

    const fetchAssociatedUnits = async () => {
        try {
            const result = await window.ipcRenderer.invoke(
                'query-database-postgres',
                `SELECT unidade_id FROM profissionais_unidade_associacao WHERE profissional_id = ${id}`
            );
            const associatedIds = result.map((row: any) => row.unidade_id);
            // console.log('IDs das unidades associadas:', associatedIds); // Log dos IDs das unidades
            setSelectedUnidades(associatedIds); // Atualiza o estado com as unidades associadas
        } catch (error) {
            console.log(error);
        }
    };

    // Carregar os dados do profissional existente
    useEffect(() => {
        const fetchProfissionalData = async () => {
            try {
                if (id) {
                    const result = await window.ipcRenderer.invoke(
                        'query-database-postgres',
                        `SELECT profissional_nome, profissional_funcao_id, profissional_empresa_id, profissional_senha, profissional_dataingressoempresa FROM profissionais WHERE profissional_id = ${id}`
                    );                
                    const profissional = result[0];
                    setNome(profissional.profissional_nome ?? '');
                    setSenha(profissional.profissional_senha ?? '');
                    setFuncaoId(profissional.profissional_funcao_id ?? null);
                    setEmpresaId(profissional.profissional_empresa_id ?? null);
                    setDataIngressoEmpresa(profissional.profissional_dataingressoempresa ? new Date(profissional.profissional_dataingressoempresa) : null);

                    // Carregar unidades associadas após obter os dados do profissional
                    await fetchAssociatedUnits();
                }
            } catch (error) {
                console.log(error);
            }
        };

        fetchProfissionalData();
        fetchMacs(); // Certifique-se de buscar os MACs também
    }, [id]);


    // Carregar as opções de unidade, função e empresa
    useEffect(() => {
        const fetchOptions = async () => {
            try {
                // Fetch unidades
                const unidadeResult = await window.ipcRenderer.invoke(
                    'query-database-postgres',
                    'SELECT id, unidade FROM profissionais_unidade'
                );
                setUnidades(unidadeResult);

                // Fetch funções
                const funcaoResult = await window.ipcRenderer.invoke(
                    'query-database-postgres',
                    'SELECT id, funcao FROM profissionais_funcao'
                );
                setFuncoes(funcaoResult);

                // Fetch empresas
                const empresaResult = await window.ipcRenderer.invoke(
                    'query-database-postgres',
                    'SELECT id, empresa FROM profissionais_empresa'
                );
                setEmpresas(empresaResult);
            } catch (error) {
                console.log(error);
            }
        };
        fetchOptions();
    }, []);

    // Função para lidar com a seleção de unidades
    const handleUnidadeChange = (id: number) => {
        if (selectedUnidades.includes(id)) {
            handleDeleteUnit(id); // Se já estiver selecionada, remover
        } else {
            setSelectedUnidades([...selectedUnidades, id]); // Se não estiver, adicionar
        }
    };

    const handleSubmit = async () => {
        if (nome === '' || senha === '' || funcaoId === null || empresaId === null || dataIngressoEmpresa === null) {
            setModalMessage('Preencha todos os campos obrigatórios.');
            setIsModalOpen(true);
            return;
        }
        
        try {
            const table = 'profissionais';
            const updates = {
                profissional_nome: nome,
                profissional_funcao_id: funcaoId,
                profissional_empresa_id: empresaId,
                profissional_senha: senha,
                profissional_dataingressoempresa: dataIngressoEmpresa.toISOString().split('T')[0] // Convertendo para formato YYYY-MM-DD
            };
    
            if (id) {
                const ids = [parseInt(id, 10)];
                
                const result = await window.ipcRenderer.invoke('update-records-postgres', {
                    table,
                    updates,
                    ids,
                    idColumn: 'profissional_id'
                });

                if (result.success) {
                    await updateUnitAssociations(id, selectedUnidades);
                    setModalMessage('Profissional atualizado com sucesso!');
                } else {
                    setModalMessage(`Erro ao atualizar profissional: ${result.message}`);
                }
            } else {
                setModalMessage('ID do profissional não encontrado.');
            }
        } catch (error) {
            setModalMessage(`Erro ao atualizar profissional ${error}`);
        } finally {
            setIsModalOpen(true);
        }
    };

    // Função para atualizar as unidades associadas
    const updateUnitAssociations = async (profissionalId: string, unidadeIds: number[]) => {
        try {
            // Obter unidades atualmente associadas
            const currentUnitsResult = await window.ipcRenderer.invoke(
                'query-database-postgres',
                `SELECT unidade_id FROM profissionais_unidade_associacao WHERE profissional_id = ${profissionalId}`
            );
            const currentUnitIds = currentUnitsResult.map((row: any) => row.unidade_id);
    
            // Unidades a serem removidas
            const unitsToRemove = currentUnitIds.filter((id: number) => !unidadeIds.includes(id));
            // Unidades a serem adicionadas
            const unitsToAdd = unidadeIds.filter(id => !currentUnitIds.includes(id));
    
            // Remover unidades
            for (const unidadeId of unitsToRemove) {
                await handleDeleteUnit(unidadeId); // Usa a função de deleção separada
            }
    
            // Adicionar unidades
            for (const unidadeId of unitsToAdd) {
                await window.ipcRenderer.invoke('insert-records-postgres', {
                    table: 'profissionais_unidade_associacao',
                    columns: ['profissional_id', 'unidade_id'],
                    values: [profissionalId, unidadeId]
                });
            }
        } catch (error) {
            console.log(`Erro ao atualizar associações de unidades: ${error}`);
            setModalMessage(`Erro ao atualizar associações de unidades: ${error}`);
            setIsModalOpen(true);
        }
    };

    const handleDeleteUnit = async (unidadeId: number) => {
        try {
            const querydeletion = `
                DELETE FROM profissionais_unidade_associacao
                WHERE unidade_id = $1 AND profissional_id = $2
            `;
    
            await window.ipcRenderer.invoke('query-database-postgres', {
                text: querydeletion,
                values: [unidadeId, id],
            });
    
            setSelectedUnidades(selectedUnidades.filter((selectedId) => selectedId !== unidadeId));
        } catch (error) {
            console.log(`Erro ao remover unidade: ${error}`);
        }
    };
    

    return (
        <div className='bg-base-200 min-h-screen'>
            <Breadcrumbs />

            <div className="px-24 rounded">
                <div className="card bg-base-100 shadow-xl w-full my-10">
                    <div className="card-body">
                        <div className='flex flex-row items-center gap-2'>
                            <Link to={'/profissionais'}>
                                <button className="btn btn-ghost w-full"><IoArrowBack /></button>
                            </Link>
                            <p className="card-title m-0 p-0">
                                Atualizar Profissional
                            </p>
                        </div>

                        <div className="form-control mt-4">
                            <label className="label">
                                <span className="label-text">Nome do profissional</span>
                            </label>
                            <label className="input input-bordered flex items-center gap-2">
                                <IoPerson />
                                <input 
                                    type="text" 
                                    placeholder="Nome do profissional" 
                                    className="flex-grow"
                                    value={nome}
                                    onChange={(e) => setNome(e.target.value)} 
                                />
                            </label>
                        </div>
                        
                        <div className="form-control mt-4">
                            <label className="label">
                                <span className="label-text">Senha provisória</span>
                            </label>
                            <label className="input input-bordered flex items-center gap-2">
                                <IoKey />
                                <input
                                    type="password"
                                    placeholder="Senha do profissional"
                                    className="flex-grow"
                                    value={senha}
                                    onChange={(e) => setSenha(e.target.value)}
                                />
                            </label>
                        </div>

                        <div className="form-control mt-4">
                            <label className="label">
                                <span className="label-text">Data de Ingresso na Empresa</span>
                            </label>
                            <label className="input input-bordered flex items-center gap-2">
                                <IoCalendar />
                                <DatePicker
                                    onChange={(value) => {
                                        if (value && !Array.isArray(value)) {
                                            setDataIngressoEmpresa(value as Date);
                                        }
                                    }}
                                    value={dataIngressoEmpresa}
                                    format="dd/MM/yyyy"
                                    className="w-full custom-datepicker"
                                    calendarIcon={<IoCalendar />}
                                    clearIcon={<IoClose />}
                                    dayPlaceholder="dd"
                                    monthPlaceholder="mm"
                                    yearPlaceholder="aaaa"
                                />
                            </label>
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Unidades</span>
                            </label>
                            <div className="flex flex-col gap-2">
                                {unidades.map(unidade => (
                                    <label key={unidade.id} className="label cursor-pointer gap-4 w-fit">
                                        <input
                                            type="checkbox"
                                            checked={selectedUnidades.includes(unidade.id)}
                                            onChange={() => handleUnidadeChange(unidade.id)}
                                            className="checkbox"
                                        />
                                        <span className="label-text">{unidade.unidade}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="form-control mt-4">
                            <label className="label">
                                <span className="label-text">Função</span>
                            </label>
                            <select
                                className="select select-bordered"
                                value={funcaoId ?? ''}
                                onChange={(e) => setFuncaoId(Number(e.target.value))}
                            >
                                <option value="" disabled>Selecione a função</option>
                                {funcoes.map((funcaoOption) => (
                                    <option key={funcaoOption.id} value={funcaoOption.id}>
                                        {funcaoOption.funcao}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-control my-4">
                            <label className="label">
                                <span className="label-text">Empresa</span>
                            </label>
                            <select
                                className="select select-bordered"
                                value={empresaId ?? ''}
                                onChange={(e) => setEmpresaId(Number(e.target.value))}
                            >
                                <option value="" disabled>Selecione a empresa</option>
                                {empresas.map((empresaOption) => (
                                    <option key={empresaOption.id} value={empresaOption.id}>
                                        {empresaOption.empresa}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="divider mt-8">DISPOSITIVOS AUTORIZADOS</div>

                        <div className="overflow-x-auto mt-4">
                            <table className="table">
                                {/* Cabeçalho */}
                                <thead>
                                    <tr>
                                        <th>MAC</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Exibir MACs */}
                                    {macs.map((mac, index) => (
                                        <tr key={index}>
                                            <td>{mac}</td>
                                            <td>
                                                <button
                                                    className="btn btn-error"
                                                    onClick={() => handleDeleteMac(mac)}
                                                >
                                                    Excluir
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {/* Linha para adicionar novo MAC */}
                                    <tr>
                                        <td>
                                            <input
                                                type="text"
                                                placeholder="Novo MAC"
                                                className="input input-bordered w-full"
                                                value={newMac}
                                                onChange={(e) => setNewMac(e.target.value)}
                                            />
                                        </td>
                                        <td>
                                            <button className="btn btn-primary" onClick={handleAddMac}>
                                                Adicionar
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <button 
                            className="btn btn-primary mt-20" 
                            onClick={handleSubmit}
                        >
                            Atualizar Profissional
                        </button>

                    </div>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <Modal 
                    type={modalMessage?.includes('sucesso') ? 'success' : 'error'} 
                    message={modalMessage || ''} 
                    onClose={() => setIsModalOpen(false)}
                >
                    <p>{modalMessage}</p>
                </Modal>
            )}
        </div>
    );
}
