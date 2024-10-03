import { useState, useEffect } from 'react';
import { Breadcrumbs, Modal } from "@/components";
import { Link, useParams } from 'react-router-dom';
import { IoArrowBack, IoCalendar, IoKey, IoPerson, IoClose } from 'react-icons/io5';
import DatePicker from 'react-date-picker';

interface Unidade {
    unidade_id: number;
    unidade: string;
}

interface Departamento {
    departamento_id: number;
    departamento: string;
}

interface Empresa {
    empresa_id: number;
    empresa: string;
}

interface Funcao {
    funcao_id: number;
    funcao: string;
}

export default function AtualizarProfissional() {
    const { profissional_id } = useParams<{ profissional_id: string }>();

    const [nome, setNome] = useState<string>('');
    const [senha, setSenha] = useState<string>('');
    const [dataIngressoEmpresa, setDataIngressoEmpresa] = useState<Date | null>(null);

    const [modalMessage, setModalMessage] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    const [unidades, setUnidades] = useState<Unidade[]>([]);
    const [selectedUnidades, setSelectedUnidades] = useState<number[]>([]);

    const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
    const [selectedDepartamentos, setSelectedDepartamentos] = useState<number[]>([]);

    const [empresas, setEmpresas] = useState<Empresa[]>([]);
    const [selectedEmpresas, setSelectedEmpresas] = useState<number[]>([]);

    const [funcoes, setFuncoes] = useState<Funcao[]>([]);
    const [selectedFuncoes, setSelectedFuncoes] = useState<number[]>([]);

    const [macs, setMacs] = useState<string[]>([]);
    const [newMac, setNewMac] = useState<string>('');

    // Função para buscar os MACs do profissional
    const fetchMacs = async () => {
        try {
            const result = await window.ipcRenderer.invoke(
                'query-database-postgres',
                `SELECT mac FROM profissionais_mac WHERE profissional_id = ${profissional_id}`
            );
            setMacs(result.map((row: any) => row.mac));
        } catch (error) {
            console.log(error);
        }
    };

    // Carregar os MACs ao montar o componente
    useEffect(() => {
        if (profissional_id) {
            fetchMacs();
        }
    }, [profissional_id]);

    const handleDeleteMac = async (macToDelete: string) => {
        try {
            await window.ipcRenderer.invoke(
                'query-database-postgres',
                {
                    text: 'DELETE FROM profissionais_mac WHERE profissional_id = $1 AND mac = $2',
                    values: [profissional_id, macToDelete]
                }
            );
            setMacs(macs.filter(mac => mac !== macToDelete)); // Atualizar a lista de MACs
        } catch (error) {
            console.log(error);
            setModalMessage(`Erro ao deletar MAC: ${error}`);
            setIsModalOpen(true);
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
                    columns: 'mac',
                    values: [profissional_id, newMac]
                }
            );
            setMacs([...macs, newMac]); // Atualizar a lista de MACs
            setNewMac(''); // Limpar o campo
        } catch (error) {
            console.log(error);
        }
    };

    const fetchUnidades = async () => {
        try {
            const result = await window.ipcRenderer.invoke(
                'query-database-postgres',
                `SELECT unidade_id FROM profissionais_unidade_associacao WHERE profissional_id = ${profissional_id}`
            );
            const IdsAssociados = result.map((row: any) => row.unidade_id);
            setSelectedUnidades(IdsAssociados);
        } catch (error) {
            console.log(error);
        }
    };

    const fetchDepartamentos = async () => {
        try {
            const result = await window.ipcRenderer.invoke(
                'query-database-postgres',
                `SELECT departamento_id FROM profissionais_departamento_associacao WHERE profissional_id = ${profissional_id}`
            );
            const IdsAssociados = result.map((row: any) => row.departamento_id);
            setSelectedDepartamentos(IdsAssociados);
        } catch (error) {
            console.log(error);
        }
    };

    const fetchEmpresas = async () => {
        try {
            const result = await window.ipcRenderer.invoke(
                'query-database-postgres',
                `SELECT empresa_id FROM profissionais_empresa_associacao WHERE profissional_id = ${profissional_id}`
            );
            const IdsAssociados = result.map((row: any) => row.empresa_id);
            setSelectedEmpresas(IdsAssociados);
        } catch (error) {
            console.log(error);
        }
    };

    const fetchFuncoes = async () => {
        try {
            const result = await window.ipcRenderer.invoke(
                'query-database-postgres',
                `SELECT funcao_id FROM profissionais_funcao_associacao WHERE profissional_id = ${profissional_id}`
            );
            const IdsAssociados = result.map((row: any) => row.funcao_id);
            setSelectedFuncoes(IdsAssociados);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        const fetchProfissionalData = async () => {
            try {
                if (profissional_id) {
                    const result = await window.ipcRenderer.invoke(
                        'query-database-postgres',
                        `SELECT profissional_nome, profissional_senha, profissional_dataingressoempresa FROM profissionais WHERE profissional_id = ${profissional_id}`
                    );                
                    const profissional = result[0];
                    setNome(profissional.profissional_nome ?? '');
                    setSenha(profissional.profissional_senha ?? '');
                    setDataIngressoEmpresa(profissional.profissional_dataingressoempresa ? new Date(profissional.profissional_dataingressoempresa) : null);

                    await fetchUnidades();
                    await fetchDepartamentos();
                    await fetchEmpresas();
                    await fetchFuncoes();
                }
            } catch (error) {
                console.log(error);
            }
        };

        fetchProfissionalData();
        fetchMacs();
    }, [profissional_id]);

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const unidadeResult = await window.ipcRenderer.invoke(
                    'query-database-postgres',
                    'SELECT unidade_id, unidade FROM profissionais_unidade'
                );
                setUnidades(unidadeResult);

                const departamentoResult = await window.ipcRenderer.invoke(
                    'query-database-postgres',
                    'SELECT departamento_id, departamento FROM profissionais_departamento'
                );
                setDepartamentos(departamentoResult);

                const empresaResult = await window.ipcRenderer.invoke(
                    'query-database-postgres',
                    'SELECT empresa_id, empresa FROM profissionais_empresa'
                );
                setEmpresas(empresaResult);

                const funcaoResult = await window.ipcRenderer.invoke(
                    'query-database-postgres',
                    'SELECT funcao_id, funcao FROM profissionais_funcao'
                );
                setFuncoes(funcaoResult);
            } catch (error) {
                console.log(error);
            }
        };
        fetchOptions();
    }, []);

    const handleUnidadeChange = (unidade_id: number) => {
        if (selectedUnidades.includes(unidade_id)) {
            handleDeleteUnidade(unidade_id);
        } else {
            setSelectedUnidades([...selectedUnidades, unidade_id]);
        }
    };

    const handleDepartamentoChange = (departamento_id: number) => {
        if (selectedDepartamentos.includes(departamento_id)) {
            handleDeleteDepartamento(departamento_id);
        } else {
            setSelectedDepartamentos([...selectedDepartamentos, departamento_id]);
        }
    };

    const handleEmpresaChange = (empresa_id: number) => {
        if (selectedEmpresas.includes(empresa_id)) {
            handleDeleteEmpresa(empresa_id);
        } else {
            setSelectedEmpresas([...selectedEmpresas, empresa_id]);
        }
    };

    const handleFuncaoChange = (funcao_id: number) => {
        if (selectedFuncoes.includes(funcao_id)) {
            handleDeleteFuncao(funcao_id);
        } else {
            setSelectedFuncoes([...selectedFuncoes, funcao_id]);
        }
    };

    const handleSubmit = async () => {
        if (nome === '' || senha === '' || dataIngressoEmpresa === null) {
            setModalMessage('Preencha todos os campos obrigatórios.');
            setIsModalOpen(true);
            return;
        }
        
        try {
            const table = 'profissionais';
            const updates = {
                profissional_nome: nome,
                profissional_senha: senha,
                profissional_dataingressoempresa: dataIngressoEmpresa.toISOString().split('T')[0] // Convertendo para formato YYYY-MM-DD
            };
    
            if (profissional_id) {
                const ids = [parseInt(profissional_id, 10)];
                
                const result = await window.ipcRenderer.invoke('update-records-postgres', {
                    table,
                    updates,
                    ids,
                    idColumn: 'profissional_id'
                });

                if (result.success) {
                    await updateUnidades(profissional_id, selectedUnidades);
                    await updateDepartamentos(profissional_id, selectedDepartamentos);
                    await updateEmpresas(profissional_id, selectedEmpresas);
                    await updateFuncoes(profissional_id, selectedFuncoes);
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

    const updateUnidades = async (profissionalId: string, unidadeIds: number[]) => {
        try {
            const UnidadesResult = await window.ipcRenderer.invoke(
                'query-database-postgres',
                `SELECT unidade_id FROM profissionais_unidade_associacao WHERE profissional_id = ${profissionalId}`
            );
            const CurrentUnidadeIds = UnidadesResult.map((row: any) => row.unidade_id);

            const UnidadesRemove = CurrentUnidadeIds.filter((unidade_id: number) => !unidadeIds.includes(unidade_id));
            const UnidadesAdd = unidadeIds.filter(unidade_id => !CurrentUnidadeIds.includes(unidade_id));
            for (const unidadeId of UnidadesRemove) {
                await handleDeleteUnidade(unidadeId);
            }

            for (const unidadeId of UnidadesAdd) {
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

    const updateDepartamentos = async (profissionalId: string, departamentoIds: number[]) => {
        try {
            const DepartamentoResult = await window.ipcRenderer.invoke(
                'query-database-postgres',
                `SELECT departamento_id FROM profissionais_departamento_associacao WHERE profissional_id = ${profissionalId}`
            );
            const CurrentDepartamentoIds = DepartamentoResult.map((row: any) => row.departamento_id);

            const DepartamentosRemove = CurrentDepartamentoIds.filter((departamento_id: number) => !departamentoIds.includes(departamento_id));
            const DepartamentosAdd = departamentoIds.filter(departamento_id => !CurrentDepartamentoIds.includes(departamento_id));
            for (const departamentoId of DepartamentosRemove) {
                await handleDeleteDepartamento(departamentoId);
            }

            for (const departamentoId of DepartamentosAdd) {
                await window.ipcRenderer.invoke('insert-records-postgres', {
                    table: 'profissionais_departamento_associacao',
                    columns: ['profissional_id', 'departamento_id'],
                    values: [profissionalId, departamentoId]
                });
            }
        } catch (error) {
            console.log(`Erro ao atualizar associações de departamentos: ${error}`);
            setModalMessage(`Erro ao atualizar associações de departamentos: ${error}`);
            setIsModalOpen(true);
        }
    };

    const updateEmpresas = async (profissionalId: string, empresasId: number[]) => {
        try {
            const EmpresaResult = await window.ipcRenderer.invoke(
                'query-database-postgres',
                `SELECT empresa_id FROM profissionais_empresa_associacao WHERE profissional_id = ${profissionalId}`
            );
            const CurrentEmpresasId = EmpresaResult.map((row: any) => row.empresa_id);

            const EmpresasRemove = CurrentEmpresasId.filter((empresa_id: number) => !empresasId.includes(empresa_id));
            const EmpresasAdd = empresasId.filter(empresa_id => !CurrentEmpresasId.includes(empresa_id));
            for (const empresaId of EmpresasRemove) {
                await handleDeleteEmpresa(empresaId);
            }

            for (const empresaId of EmpresasAdd) {
                await window.ipcRenderer.invoke('insert-records-postgres', {
                    table: 'profissionais_empresa_associacao',
                    columns: ['profissional_id', 'empresa_id'],
                    values: [profissionalId, empresaId]
                });
            }
        } catch (error) {
            console.log(`Erro ao atualizar associações de empresas: ${error}`);
            setModalMessage(`Erro ao atualizar associações de empresas: ${error}`);
            setIsModalOpen(true);
        }
    };

    const updateFuncoes = async (profissionalId: string, funcoesId: number[]) => {
        try {
            const FuncaoResult = await window.ipcRenderer.invoke(
                'query-database-postgres',
                `SELECT funcao_id FROM profissionais_funcao_associacao WHERE profissional_id = ${profissionalId}`
            );
            const CurrentFuncoesId = FuncaoResult.map((row: any) => row.funcao_id);

            const FuncoesRemove = CurrentFuncoesId.filter((funcao_id: number) => !funcoesId.includes(funcao_id));
            const FuncoesAdd = funcoesId.filter(funcao_id => !CurrentFuncoesId.includes(funcao_id));
            for (const funcaoId of FuncoesRemove) {
                await handleDeleteFuncao(funcaoId);
            }

            for (const funcaoId of FuncoesAdd) {
                await window.ipcRenderer.invoke('insert-records-postgres', {
                    table: 'profissionais_funcao_associacao',
                    columns: ['profissional_id', 'funcao_id'],
                    values: [profissionalId, funcaoId]
                });
            }
        } catch (error) {
            console.log(`Erro ao atualizar associações de funções: ${error}`);
            setModalMessage(`Erro ao atualizar associações de funções: ${error}`);
            setIsModalOpen(true);
        }
    };


    const handleDeleteUnidade = async (unidadeId: number) => {
        try {
            const querydeletion = `
                DELETE FROM profissionais_unidade_associacao
                WHERE unidade_id = $1 AND profissional_id = $2
            `;
    
            await window.ipcRenderer.invoke('query-database-postgres', {
                text: querydeletion,
                values: [unidadeId, profissional_id],
            });
    
            setSelectedUnidades(selectedUnidades.filter((selectedId) => selectedId !== unidadeId));
        } catch (error) {
            console.log(`Erro ao remover unidade: ${error}`);
        }
    };

    const handleDeleteDepartamento = async (departamentoId: number) => {
        try {
            const querydeletion = `
                DELETE FROM profissionais_departamento_associacao
                WHERE departamento_id = $1 AND profissional_id = $2
            `;
    
            await window.ipcRenderer.invoke('query-database-postgres', {
                text: querydeletion,
                values: [departamentoId, profissional_id],
            });
    
            setSelectedDepartamentos(selectedDepartamentos.filter((selectedId) => selectedId !== departamentoId));
        } catch (error) {
            console.log(`Erro ao remover departamentos: ${error}`);
        }
    };
    
    const handleDeleteEmpresa = async (empresaId: number) => {
        try {
            const querydeletion = `
                DELETE FROM profissionais_empresa_associacao
                WHERE empresa_id = $1 AND profissional_id = $2
            `;
    
            await window.ipcRenderer.invoke('query-database-postgres', {
                text: querydeletion,
                values: [empresaId, profissional_id],
            });
    
            setSelectedEmpresas(selectedEmpresas.filter((selectedId) => selectedId !== empresaId));
        } catch (error) {
            console.log(`Erro ao remover empresas: ${error}`);
        }
    };

    const handleDeleteFuncao = async (funcaoId: number) => {
        try {
            const querydeletion = `
                DELETE FROM profissionais_funcao_associacao
                WHERE funcao_id = $1 AND profissional_id = $2
            `;
    
            await window.ipcRenderer.invoke('query-database-postgres', {
                text: querydeletion,
                values: [funcaoId, profissional_id],
            });
    
            setSelectedFuncoes(selectedFuncoes.filter((selectedId) => selectedId !== funcaoId));
        } catch (error) {
            console.log(`Erro ao remover função: ${error}`);
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

                        <div className="form-control my-10">
                            <label className="label">
                                <span className="label-text">Unidades</span>
                            </label>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th></th>
                                        <th>ID</th>
                                        <th>Unidade</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {unidades.map(unidade => (
                                        <tr key={unidade.unidade_id}>
                                            <th>
                                                <input
                                                    type="checkbox"
                                                    value={unidade.unidade_id}
                                                    checked={selectedUnidades.includes(unidade.unidade_id)}
                                                    onChange={() => handleUnidadeChange(unidade.unidade_id)}
                                                    className="checkbox"
                                                />
                                            </th>
                                            <th>{unidade.unidade_id}</th>
                                            <th>{unidade.unidade}</th>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="form-control my-10">
                            <label className="label">
                                <span className="label-text">Departamentos</span>
                            </label>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th></th>
                                        <th>ID</th>
                                        <th>Departamento</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {departamentos.map(departamento => (
                                        <tr key={departamento.departamento_id}>
                                            <th>
                                                <input
                                                    type="checkbox"
                                                    value={departamento.departamento_id}
                                                    checked={selectedDepartamentos.includes(departamento.departamento_id)}
                                                    onChange={() => handleDepartamentoChange(departamento.departamento_id)}
                                                    className="checkbox"
                                                />
                                            </th>
                                            <th>{departamento.departamento_id}</th>
                                            <th>{departamento.departamento}</th>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="form-control my-10">
                            <label className="label">
                                <span className="label-text">Empresas</span>
                            </label>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th></th>
                                        <th>ID</th>
                                        <th>Empresa</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {empresas.map(empresa => (
                                        <tr key={empresa.empresa_id}>
                                            <th>
                                                <input
                                                    type="checkbox"
                                                    value={empresa.empresa_id}
                                                    checked={selectedEmpresas.includes(empresa.empresa_id)}
                                                    onChange={() => handleEmpresaChange(empresa.empresa_id)}
                                                    className="checkbox"
                                                />
                                            </th>
                                            <th>{empresa.empresa_id}</th>
                                            <th>{empresa.empresa}</th>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="form-control my-10">
                            <label className="label">
                                <span className="label-text">Funções</span>
                            </label>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th></th>
                                        <th>ID</th>
                                        <th>Função</th>
                                        <th>Editar</th>
                                        <th>Criar</th>
                                        <th>Inativar</th>
                                        <th>Excluir</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {funcoes.map(funcao => (
                                        <tr key={funcao.funcao_id}>
                                            <th>
                                                <input
                                                    type="checkbox"
                                                    value={funcao.funcao_id}
                                                    checked={selectedFuncoes.includes(funcao.funcao_id)}
                                                    onChange={() => handleFuncaoChange(funcao.funcao_id)}
                                                    className="checkbox"
                                                />
                                            </th>
                                            <th>{funcao.funcao_id}</th>
                                            <th>{funcao.funcao}</th>
                                            <th>
                                                <input
                                                    type="checkbox"
                                                    className="checkbox"
                                                />
                                            </th>
                                            <th>
                                                <input
                                                    type="checkbox"
                                                    className="checkbox"
                                                />
                                            </th>
                                            <th>
                                                <input
                                                    type="checkbox"
                                                    className="checkbox"
                                                />
                                            </th>
                                            <th>
                                                <input
                                                    type="checkbox"
                                                    className="checkbox"
                                                />
                                            </th>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
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
