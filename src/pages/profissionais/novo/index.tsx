import { useState, useEffect, SetStateAction } from 'react';
import { Breadcrumbs, Modal } from "@/components";
import { Link } from 'react-router-dom';
import { IoArrowBack, IoCalendar, IoClose, IoEye, IoEyeOff, IoKey, IoPerson } from 'react-icons/io5';
import { FaCopy } from 'react-icons/fa';
import DatePicker from 'react-date-picker';
import MaskedInput from 'react-text-mask';

interface Unidade {
    unidade_id: number;
    unidade: string;
}

interface Empresa {
    cnpj: string;
    empresa_id: number;
    empresa: string;
}

interface Departamento {
    departamento_id: number;
    departamento: string;
}

interface Funcao {
    funcao_id: number;
    funcao: string;
}

export default function NovoProfissional() {
    const [nome, setNome] = useState('');
    const [senha, setSenha] = useState('123');
    const [dataIngressoEmpresa, setDataIngressoEmpresa] = useState<Date | null>(null);

    const [selectedProfissionais, setSelectedProfissionais] = useState<number[]>([]);
    const [cpf, setCpf] = useState('');

    const [modalMessage, setModalMessage] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [unidades, setUnidades] = useState<Unidade[]>([]);
    const [unidadeIds, setUnidadeIds] = useState<number[]>([]);
    const [unidadeNomes, setUnidadeNomes] = useState<string[]>([]);

    const [empresas, setEmpresas] = useState<Empresa[]>([]);
    const [empresaIds, setEmpresasIds] = useState<number[]>([]);
    const [empresaNomes, setEmpresaNomes] = useState<string[]>([]);

    const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
    const [departamentoIds, setDepartamentosIds] = useState<number[]>([]);
    const [departamentoNomes, setDepartamentoNomes] = useState<string[]>([]);

    const [funcoes, setFuncoes] = useState<Funcao[]>([]);
    const [funcaoIds, setFuncoesIds] = useState<number[]>([]);
    const [funcaoNomes, setFuncaoNomes] = useState<string[]>([]);
    const [funcoesPermissoes, setFuncoesPermissoes] = useState<{ [key: number]: { perm_editar: boolean; perm_criar: boolean; perm_inativar: boolean; perm_excluir: boolean } }>({});

    const isButtonDisabledStep1 = (!nome || !senha || !dataIngressoEmpresa || !cpf);
    const isButtonDisabledStep2 = (!unidadeIds.length || !departamentoIds.length || !funcaoIds.length);
    const isButtonDisabledStep3 = (!empresaIds.length);

    const [showPassword, setShowPassword] = useState<boolean>(false);

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const unidadeResult = await window.ipcRenderer.invoke(
                    'query-database-postgres',
                    'SELECT unidade_id, unidade FROM profissionais_unidade WHERE unidade_status1 = \'ativo\''
                );
                setUnidades(unidadeResult);

                const empresaResult = await window.ipcRenderer.invoke(
                    'query-database-postgres',
                    'SELECT empresa_id, empresa, cnpj FROM profissionais_empresa WHERE empresa_status1 = \'ativo\''
                );
                setEmpresas(empresaResult);

                const departamentoResult = await window.ipcRenderer.invoke(
                    'query-database-postgres',
                    'SELECT departamento_id, departamento FROM profissionais_departamento WHERE departamento_status1 = \'ativo\''
                );
                setDepartamentos(departamentoResult);

                const funcaoResult = await window.ipcRenderer.invoke(
                    'query-database-postgres',
                    'SELECT funcao_id, funcao FROM profissionais_funcao WHERE funcao_status1 = \'ativo\''
                );
                setFuncoes(funcaoResult);

            }
            catch (error) {
                console.error('Erro ao buscar opções:', error);
            }
        };
        fetchOptions();
    }, []);

    useEffect(() => {
        const selectedUnidades = unidades.filter(u => unidadeIds.includes(u.unidade_id));
        setUnidadeNomes(selectedUnidades.map(u => u.unidade));

        const selectedEmpresas = empresas.filter(e => empresaIds.includes(e.empresa_id));
        setEmpresaNomes(selectedEmpresas.map(e => e.empresa));

        const selectedDepartamentos = departamentos.filter(d => departamentoIds.includes(d.departamento_id));
        setDepartamentoNomes(selectedDepartamentos.map(d => d.departamento));

        const selectedFuncoes = funcoes.filter(f => funcaoIds.includes(f.funcao_id));
        setFuncaoNomes(selectedFuncoes.map(f => f.funcao));

    }, [unidadeIds, unidades, empresaIds, empresas, departamentoIds, departamentos, funcaoIds, funcoes]);

    // Função de Reset
    const resetForm = () => {
        setNome('');
        setSenha('123');
        setDataIngressoEmpresa(null);
        setCpf('');
        setUnidadeIds([]);
        setEmpresasIds([]);
        setDepartamentosIds([]);
        setFuncoesIds([]);
        setFuncoesPermissoes({});
        // Opcional: se necessário resetar outros estados
        // setSelectedProfissionais([]);
    };

    const handleSubmit = async () => {    
        try {
            const table = 'profissionais';
            const columns = [
                'profissional_nome',
                'profissional_senha',
                'profissional_dataingressoempresa',
                'profissional_cpf',
            ];
            const values = [
                nome,
                senha,
                dataIngressoEmpresa,
                cpf
            ];
    
            // Insere o profissional
            const result = await window.ipcRenderer.invoke('insert-records-postgres', { table, columns, values });
    
            if (result.success) {
                // Busca o ID do profissional inserido com base no nome
                const query = `SELECT profissional_id FROM profissionais WHERE profissional_nome = $1`;
                const searchResult = await window.ipcRenderer.invoke('query-database-postgres', query, [nome]);
    
                if (searchResult.length > 0) {
                    const profissionalId = searchResult[0].profissional_id;
    
                    // Inserções das associações
                    const insertPromisesUnidades = unidadeIds.map((unidadeId) => {
                        return window.ipcRenderer.invoke('insert-records-postgres', {
                            table: 'profissionais_unidade_associacao',
                            columns: ['profissional_id', 'unidade_id'],
                            values: [profissionalId, unidadeId],
                        });
                    });
    
                    const insertPromisesEmpresas = empresaIds.map((empresaId) => {
                        return window.ipcRenderer.invoke('insert-records-postgres', {
                            table: 'profissionais_empresa_associacao',
                            columns: ['profissional_id', 'empresa_id'],
                            values: [profissionalId, empresaId],
                        });
                    });
    
                    const insertPromisesDepartamentos = departamentoIds.map((departamentoId) => {
                        return window.ipcRenderer.invoke('insert-records-postgres', {
                            table: 'profissionais_departamento_associacao',
                            columns: ['profissional_id', 'departamento_id'],
                            values: [profissionalId, departamentoId],
                        });
                    });
    
                    const insertPromisesFuncoes = funcaoIds.map((funcaoId) => {
                        const permissoes = funcoesPermissoes[funcaoId] || {
                            perm_editar: false,
                            perm_criar: false,
                            perm_inativar: false,
                            perm_excluir: false,
                        };
    
                        return window.ipcRenderer.invoke('insert-records-postgres', {
                            table: 'profissionais_funcao_associacao',
                            columns: [
                                'profissional_id',
                                'funcao_id',
                                'perm_editar',
                                'perm_criar',
                                'perm_inativar',
                                'perm_excluir',
                            ],
                            values: [
                                profissionalId,
                                funcaoId,
                                permissoes.perm_editar,
                                permissoes.perm_criar,
                                permissoes.perm_inativar,
                                permissoes.perm_excluir,
                            ],
                        });
                    });
    
                    // Espera todas as inserções completarem
                    const associationResults = await Promise.all([
                        ...insertPromisesUnidades,
                        ...insertPromisesEmpresas,
                        ...insertPromisesDepartamentos,
                        ...insertPromisesFuncoes,
                    ]);
    
                    // Mensagem de sucesso
                    setModalMessage('Usuário criado com sucesso!');
                } else {
                    setModalMessage('Erro: Não foi possível encontrar o ID do profissional inserido.');
                }
            } else {
                setModalMessage(`Erro ao adicionar profissional: ${result.message}`);
            }
        } catch (error) {
            console.error('Erro ao adicionar profissional:', error);
            setModalMessage('Erro ao adicionar profissional.');
        } finally {
            setIsModalOpen(true);
        }
    };
    
    const handleCopyToClipboard = () => {
        const text =
            `Departamentos: ${departamentoNomes.join(', ')}
            Login: ${nome}
            Senha provisória: ${senha}`;
        navigator.clipboard.writeText(text)
            .then(() => console.log('Texto copiado para a área de transferência!'))
            .catch((error) => console.error('Erro ao copiar o texto:', error));
    };

    const [step, setStep] = useState(1); // Controla a etapa atual
    const totalSteps = 3; // Número total de etapas

    const handleNext = () => {
        if (step < totalSteps) setStep(step + 1);
    };

    const handlePrevious = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        resetForm(); // Redefine o formulário aqui
    };

    return (
        <div className='bg-base-200 min-h-screen'>
            <Breadcrumbs />

            <div className="px-24 rounded">
                <div className="card bg-base-100 shadow-xl w-full my-10">
                    <div className="card-body">
                        <div className=' flex flex-row items-center gap-2'>
                            <Link to={'/profissionais'}>
                                <button className="btn btn-ghost w-full"><IoArrowBack /></button>
                            </Link>
                            <p className="card-title m-0 p-0">
                                Adicionar Novo Profissional
                            </p>
                        </div>

                        {step === 1 && (
                            <div>
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
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Senha do profissional"
                                            className="flex-grow"
                                            value={senha}
                                            onChange={(e) => setSenha(e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <IoEyeOff /> : <IoEye />}
                                        </button>
                                    </label>
                                    <div className="label">
                                        <span className="label-text-alt">Padrão: <b>123</b></span>
                                    </div>
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
                                            format="dd/MM/y"
                                            className="w-full custom-datepicker"
                                            calendarIcon={<IoCalendar />}
                                            clearIcon={<IoClose />}
                                            dayPlaceholder="dd"
                                            monthPlaceholder="mm"
                                            yearPlaceholder="aaaa"
                                        />
                                    </label>
                                </div>

                                <div className="form-control mt-4">
                                    <label className="label">
                                        <span className="label-text">CPF</span>
                                    </label>
                                    <MaskedInput
                                        type="text"
                                        placeholder="CPF (000.000.000-00)"
                                        className="input input-bordered"
                                        value={cpf}
                                        onChange={(e: { target: { value: SetStateAction<string>; }; }) => setCpf(e.target.value)}
                                        mask={[/\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '-', /\d/, /\d/]}
                                        guide={false}
                                    />
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div>
                                <div className='flex gap-10'>
                                    <div className="form-control mt-4 w-1/2">
                                        <label className="label">
                                            <span className="label-text">Unidades</span>
                                        </label>
                                        <table className="table">
                                            <thead>
                                                <tr>
                                                    <th></th>
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
                                                                checked={unidadeIds.includes(unidade.unidade_id)}
                                                                onChange={() => {
                                                                    if (unidadeIds.includes(unidade.unidade_id)) {
                                                                        setUnidadeIds(unidadeIds.filter(unidade_id => unidade_id !== unidade.unidade_id));
                                                                    } else {
                                                                        setUnidadeIds([...unidadeIds, unidade.unidade_id]);
                                                                    }
                                                                }}
                                                                className="checkbox"
                                                            />
                                                        </th>
                                                        <th>{unidade.unidade}</th>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="form-control mt-4 w-1/2">
                                        <label className="label">
                                            <span className="label-text">Departamentos</span>
                                        </label>
                                        <table className="table">
                                            <thead>
                                                <tr>
                                                    <th></th>
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
                                                                checked={departamentoIds.includes(departamento.departamento_id)}
                                                                onChange={() => {
                                                                    if (departamentoIds.includes(departamento.departamento_id)) {
                                                                        setDepartamentosIds(departamentoIds.filter(departamento_id => departamento_id !== departamento.departamento_id));
                                                                    } else {
                                                                        setDepartamentosIds([...departamentoIds, departamento.departamento_id]);
                                                                    }
                                                                }}
                                                                className="checkbox"
                                                            />
                                                        </th>
                                                        <th>{departamento.departamento}</th>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        
                                    </div>

                                    <div className="form-control mt-4 w-full">
                                        <label className="label">
                                            <span className="label-text">Funções</span>
                                        </label>
                                        <table className="table">
                                            <thead>
                                                <tr>
                                                    <th></th>
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
                                                                checked={funcaoIds.includes(funcao.funcao_id)}
                                                                onChange={() => {
                                                                    if (funcaoIds.includes(funcao.funcao_id)) {
                                                                        setFuncoesIds(funcaoIds.filter(funcao_id => funcao_id !== funcao.funcao_id));
                                                                        // Remover permissões quando a função for desmarcada
                                                                        const updatedPermissoes = { ...funcoesPermissoes };
                                                                        delete updatedPermissoes[funcao.funcao_id];
                                                                        setFuncoesPermissoes(updatedPermissoes);
                                                                    } else {
                                                                        setFuncoesIds([...funcaoIds, funcao.funcao_id]);
                                                                        // Inicializar permissões padrão quando a função for marcada
                                                                        setFuncoesPermissoes({
                                                                            ...funcoesPermissoes,
                                                                            [funcao.funcao_id]: {
                                                                                perm_editar: false,
                                                                                perm_criar: false,
                                                                                perm_inativar: false,
                                                                                perm_excluir: false,
                                                                            }
                                                                        });
                                                                    }
                                                                }}
                                                                className="checkbox"
                                                            />
                                                        </th>
                                                        <th>{funcao.funcao}</th>
                                                        <th>
                                                            <input
                                                                type="checkbox"
                                                                className="checkbox"
                                                                checked={funcoesPermissoes[funcao.funcao_id]?.perm_editar || false}
                                                                onChange={(e) => {
                                                                    setFuncoesPermissoes({
                                                                        ...funcoesPermissoes,
                                                                        [funcao.funcao_id]: {
                                                                            ...funcoesPermissoes[funcao.funcao_id],
                                                                            perm_editar: e.target.checked,
                                                                        }
                                                                    });
                                                                }}
                                                            />
                                                        </th>
                                                        <th>
                                                            <input
                                                                type="checkbox"
                                                                className="checkbox"
                                                                checked={funcoesPermissoes[funcao.funcao_id]?.perm_criar || false}
                                                                onChange={(e) => {
                                                                    setFuncoesPermissoes({
                                                                        ...funcoesPermissoes,
                                                                        [funcao.funcao_id]: {
                                                                            ...funcoesPermissoes[funcao.funcao_id],
                                                                            perm_criar: e.target.checked,
                                                                        }
                                                                    });
                                                                }}
                                                            />
                                                        </th>
                                                        <th>
                                                            <input
                                                                type="checkbox"
                                                                className="checkbox"
                                                                checked={funcoesPermissoes[funcao.funcao_id]?.perm_inativar || false}
                                                                onChange={(e) => {
                                                                    setFuncoesPermissoes({
                                                                        ...funcoesPermissoes,
                                                                        [funcao.funcao_id]: {
                                                                            ...funcoesPermissoes[funcao.funcao_id],
                                                                            perm_inativar: e.target.checked,
                                                                        }
                                                                    });
                                                                }}
                                                            />
                                                        </th>
                                                        <th>
                                                            <input
                                                                type="checkbox"
                                                                className="checkbox"
                                                                checked={funcoesPermissoes[funcao.funcao_id]?.perm_excluir || false}
                                                                onChange={(e) => {
                                                                    setFuncoesPermissoes({
                                                                        ...funcoesPermissoes,
                                                                        [funcao.funcao_id]: {
                                                                            ...funcoesPermissoes[funcao.funcao_id],
                                                                            perm_excluir: e.target.checked,
                                                                        }
                                                                    });
                                                                }}
                                                            />
                                                        </th>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div>
                                <div className="form-control mt-4">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th></th>
                                                <th>Empresa</th>
                                                <th>CNPJ</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {empresas.map(empresa => (
                                                <tr key={empresa.empresa_id}>
                                                    <th className='text-xs'>
                                                        <input
                                                            type="checkbox"
                                                            value={empresa.empresa_id}
                                                            checked={empresaIds.includes(empresa.empresa_id)}
                                                            onChange={() => {
                                                                if (empresaIds.includes(empresa.empresa_id)) {
                                                                    setEmpresasIds(empresaIds.filter(empresa_id => empresa_id !== empresa.empresa_id));
                                                                } else {
                                                                    setEmpresasIds([...empresaIds, empresa.empresa_id]);
                                                                }
                                                            }}
                                                            className="checkbox"
                                                        />
                                                    </th>
                                                    <th className='text-xs'>{empresa.empresa}</th>
                                                    <th className='text-xs'>{empresa.cnpj}</th>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Navegação entre os passos */}
                        <div className="mt-10 flex justify-between">
                            <button
                                className="btn"
                                onClick={handlePrevious}
                                disabled={step === 1}
                            >
                                Voltar
                            </button>
                            {
                                step === 1 ? (
                                    <div className="tooltip tooltip-bottom" data-tip={isButtonDisabledStep1 ? "Preencha todos os campos obrigatórios" : null}>
                                        <button className="btn" onClick={handleNext} disabled={isButtonDisabledStep1}>
                                            Próximo
                                        </button>
                                    </div>
                                ) : step === 2 ? (
                                    <div className="tooltip tooltip-bottom" data-tip={isButtonDisabledStep2 ? "Preencha todos os campos obrigatórios" : null}>
                                        <button className="btn" onClick={handleNext} disabled={isButtonDisabledStep2}>
                                            Próximo
                                        </button>
                                    </div>
                                ) : (
                                    <div className="tooltip tooltip-bottom" data-tip={isButtonDisabledStep3 ? "Preencha todos os campos obrigatórios" : null}>
                                        <button className="btn btn-success" onClick={handleNext} disabled={isButtonDisabledStep3}>
                                            Adicionar Profissional
                                        </button>
                                    </div>
                                )
                            }
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <Modal 
                    type={modalMessage?.includes('sucesso') ? 'success' : 'error'} 
                    message={modalMessage || ''} 
                    onClose={handleCloseModal}
                >
                    <p>{modalMessage}</p>
                    {modalMessage?.includes('sucesso') && (
                        <>
                            <div className="mockup-code relative w-full my-10">
                                <pre data-prefix="1">Departamento: {departamentoNomes.join(', ')} </pre>
                                <pre data-prefix="2">Profissional: {nome}</pre>
                                <pre data-prefix="3">Senha provisória: {senha}</pre>
                                <button
                                    className="absolute z-10 top-4 right-4 cursor-pointer hover:text-secondary"
                                    onClick={handleCopyToClipboard}
                                >
                                <FaCopy/></button>
                            </div>
                        </>
                    )}
                    
                </Modal>
            )}
        </div>
    );
}
