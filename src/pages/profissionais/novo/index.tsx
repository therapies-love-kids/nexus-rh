import { useState, useEffect, SetStateAction } from 'react';
import { Breadcrumbs, Modal } from "@/components";
import { Link } from 'react-router-dom';
import { IoArrowBack, IoCalendar, IoClose, IoKey, IoPerson } from 'react-icons/io5';
import { FaCopy } from 'react-icons/fa';
import DatePicker from 'react-date-picker';
import MaskedInput from 'react-text-mask';

interface Unidade {
    id: number;
    unidade: string;
}

interface Empresa {
    cnpj: string;
    id: number;
    empresa: string;
}

interface Departamento {
    id: number;
    departamento: string;
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
    const [unidadeIds, setUnidadeIds] = useState<number[]>([]); // Mudança para permitir múltiplos IDs
    const [unidadeNomes, setUnidadeNomes] = useState<string[]>([]); // Para armazenar os nomes das unidades selecionadas

    const [empresas, setEmpresas] = useState<Empresa[]>([]);
    const [empresaIds, setEmpresasIds] = useState<number[]>([]);
    const [empresaNomes, setEmpresaNomes] = useState<string[]>([]);

    const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
    const [departamentoIds, setDepartamentosIds] = useState<number[]>([]);
    const [departamentoNomes, setDepartamentoNomes] = useState<string[]>([]);

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const unidadeResult = await window.ipcRenderer.invoke(
                    'query-database-postgres',
                    'SELECT id, unidade FROM profissionais_unidade WHERE unidade_status1 = \'ativo\''
                );
                setUnidades(unidadeResult);
                

                const empresaResult = await window.ipcRenderer.invoke(
                    'query-database-postgres',
                    'SELECT id, empresa, cnpj FROM profissionais_empresa WHERE empresa_status1 = \'ativo\''
                );
                setEmpresas(empresaResult);

                const departamentoResult = await window.ipcRenderer.invoke(
                    'query-database-postgres',
                    'SELECT id, departamento FROM profissionais_departamento WHERE departamento_status1 = \'ativo\''
                );
                setDepartamentos(departamentoResult);

            }
            
            catch (error) {
                console.error('Erro ao buscar opções:', error);
            }
        };
        fetchOptions();
    }, []);

    useEffect(() => {
        const selectedUnidades = unidades.filter(u => unidadeIds.includes(u.id));
        setUnidadeNomes(selectedUnidades.map(u => u.unidade));

        const selectedEmpresas = empresas.filter(e => empresaIds.includes(e.id));
        setEmpresaNomes(selectedEmpresas.map(e => e.empresa));

        const selectedDepartamentos = departamentos.filter(d => departamentoIds.includes(d.id));
        setDepartamentoNomes(selectedDepartamentos.map(d => d.departamento));

    }, [unidadeIds, unidades, empresaIds, empresas, departamentoIds, departamentos]);

    const handleSubmit = async () => {
        if (unidadeIds.length === 0 || empresaIds.length === 0 || departamentoIds.length === 0 || !senha || !dataIngressoEmpresa || !cpf ) {
            setModalMessage('Preencha todos os campos obrigatórios: unidade(s), função, empresa, departamento senha, data de ingresso, CPF e número do conselho.');
            setIsModalOpen(true);
            return;
        }
    
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
    
                    // Aqui, vamos usar Promise.all para inserir as unidades de forma simultânea
                    const insertPromisesUnidades = unidadeIds.map((unidadeId) => {
                        return window.ipcRenderer.invoke('insert-records-postgres', {
                            table: 'profissionais_unidade_associacao',
                            columns: ['profissional_id', 'unidade_id'],
                            values: [profissionalId, unidadeId], // Preenche com o profissional_id encontrado
                        });
                    });

                    const insertPromisesEmpresas = empresaIds.map((empresaId) => {
                        return window.ipcRenderer.invoke('insert-records-postgres', {
                            table: 'profissionais_empresa_associacao',
                            columns: ['profissional_id', 'empresa_id'],
                            values: [profissionalId, empresaId], // Preenche com o profissional_id encontrado
                        });
                    });

                    const insertPromisesDepartamentos = departamentoIds.map((departamentoId) => {
                        return window.ipcRenderer.invoke('insert-records-postgres', {
                            table: 'profissionais_departamento_associacao',
                            columns: ['profissional_id', 'departamento_id'],
                            values: [profissionalId, departamentoId], // Preenche com o profissional_id encontrado
                        });
                    });
    
                    // Espera todas as inserções de unidade completarem
                    const associationResults = await Promise.all([
                        ...insertPromisesUnidades,
                        ...insertPromisesEmpresas,
                        ...insertPromisesDepartamentos,
                    ]);
    
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
        const text = `
            Unidades: ${unidadeNomes.join(', ')}
            Login: ${nome}
            Senha provisória: ${senha}
        `;
        navigator.clipboard.writeText(text)
            .then(() => console.log('Texto copiado para a área de transferência!'))
            .catch((error) => console.error('Erro ao copiar o texto:', error));
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

                        <div className='flex gap-10'>
                            <div className="form-control mt-4">
                                <label className="label">
                                    <span className="label-text">Unidades</span>
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
                                        {unidades.map(unidade => (
                                            <tr key={unidade.id}>

                                                <th>
                                                    <input
                                                        type="checkbox"
                                                        value={unidade.id}
                                                        checked={unidadeIds.includes(unidade.id)}
                                                        onChange={() => {
                                                            if (unidadeIds.includes(unidade.id)) {
                                                                setUnidadeIds(unidadeIds.filter(id => id !== unidade.id));
                                                            } else {
                                                                setUnidadeIds([...unidadeIds, unidade.id]);
                                                            }
                                                        }}
                                                        className="checkbox"
                                                    />
                                                </th>
                                                <th>{unidade.id}</th>
                                                <th>{unidade.unidade}</th>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="form-control mt-4">
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
                                            <tr key={departamento.id}>

                                                <th>
                                                    <input
                                                        type="checkbox"
                                                        value={departamento.id}
                                                        checked={departamentoIds.includes(departamento.id)}
                                                        onChange={() => {
                                                            if (departamentoIds.includes(departamento.id)) {
                                                                setDepartamentosIds(departamentoIds.filter(id => id !== departamento.id));
                                                            } else {
                                                                setDepartamentosIds([...departamentoIds, departamento.id]);
                                                            }
                                                        }}
                                                        className="checkbox"
                                                    />
                                                </th>
                                                <th>{departamento.id}</th>
                                                <th>{departamento.departamento}</th>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                
                            </div>
                        </div>


                        
                        <div className="form-control mt-4">
                            <label className="label">
                                <span className="label-text">Empresas</span>
                            </label>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th></th>
                                        <th>ID</th>
                                        <th>Empresa</th>
                                        <th>CNPJ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {empresas.map(empresa => (
                                        <tr key={empresa.id}>
                                            <th>
                                                <input
                                                    type="checkbox"
                                                    value={empresa.id}
                                                    checked={empresaIds.includes(empresa.id)}
                                                    onChange={() => {
                                                        if (empresaIds.includes(empresa.id)) {
                                                            setEmpresasIds(empresaIds.filter(id => id !== empresa.id));
                                                        } else {
                                                            setEmpresasIds([...empresaIds, empresa.id]);
                                                        }
                                                    }}
                                                    className="checkbox"
                                                />
                                            </th>
                                            <th>{empresa.id}</th>
                                            <th>{empresa.empresa}</th>
                                            <th>{empresa.cnpj}</th>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>


                        <button 
                            className="btn btn-primary mt-6" 
                            onClick={handleSubmit}
                        >
                            Adicionar Profissional
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
                    {modalMessage?.includes('sucesso') && (
                        <>
                            <div className="mockup-code relative w-full my-10">
                                <pre data-prefix="1">Unidade: {unidadeNomes} </pre>
                                <pre data-prefix="2"></pre>
                                <pre data-prefix="3">Login: {nome}</pre>
                                <pre data-prefix="4">Senha provisória: {senha}</pre>
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
