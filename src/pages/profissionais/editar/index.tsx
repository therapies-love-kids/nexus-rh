import { useState, useEffect } from 'react';
import { Breadcrumbs, Modal } from "@/components";
import { Link, useParams } from 'react-router-dom';
import { IoArrowBack, IoCalendar, IoKey, IoPerson, IoClose } from 'react-icons/io5';
import DatePicker from 'react-date-picker';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';

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
    const [unidadeId, setUnidadeId] = useState<number | null>(null);

    const [funcoes, setFuncoes] = useState<Funcao[]>([]);
    const [funcaoId, setFuncaoId] = useState<number | null>(null);

    const [empresas, setEmpresas] = useState<Empresa[]>([]);
    const [empresaId, setEmpresaId] = useState<number | null>(null);

    // Carregar os dados do profissional existente
    useEffect(() => {
        const fetchProfissionalData = async () => {
            try {
                if (id) {
                    const result = await window.ipcRenderer.invoke(
                        'query-database-postgres',
                        `SELECT profissional_nome, profissional_unidade_id, profissional_funcao_id, profissional_empresa_id, profissional_senha, profissional_dataingressoempresa FROM profissionais WHERE profissional_id = ${id}`
                    );                
                    const profissional = result[0];
                    setNome(profissional.profissional_nome ?? '');
                    setSenha(profissional.profissional_senha ?? '');
                    setUnidadeId(profissional.profissional_unidade_id ?? null);
                    setFuncaoId(profissional.profissional_funcao_id ?? null);
                    setEmpresaId(profissional.profissional_empresa_id ?? null);
                    setDataIngressoEmpresa(profissional.profissional_dataingressoempresa ? new Date(profissional.profissional_dataingressoempresa) : null);
                }
            } catch (error) {
                console.error('Erro ao carregar os dados do profissional:', error);
            }
        };

        fetchProfissionalData();
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
                console.error('Erro ao buscar opções:', error);
            }
        };
        fetchOptions();
    }, []);

    const handleSubmit = async () => {
        if (nome === '' || senha === '' || unidadeId === null || funcaoId === null || empresaId === null || dataIngressoEmpresa === null) {
            setModalMessage('Preencha todos os campos obrigatórios.');
            setIsModalOpen(true);
            return;
        }
        
        try {
            const table = 'profissionais';
            const updates = {
                profissional_nome: nome,
                profissional_unidade_id: unidadeId,
                profissional_funcao_id: funcaoId,
                profissional_empresa_id: empresaId,
                profissional_senha: senha,
                profissional_dataingressoempresa: dataIngressoEmpresa.toISOString().split('T')[0] // Convertendo para formato YYYY-MM-DD
            };
        
            if (id) {
                const ids = [parseInt(id, 10)];
            
                const result = await window.ipcRenderer.invoke('update-records-postgres', table, updates, ids);
            
                if (result.success) {
                    setModalMessage('Profissional atualizado com sucesso!');
                } else {
                    setModalMessage(`Erro ao atualizar profissional: ${result.message}`);
                }
            } else {
                setModalMessage('ID do profissional não encontrado.');
            }
        } catch (error) {
            console.error('Erro ao atualizar profissional:', error);
            setModalMessage('Erro ao atualizar profissional.');
        } finally {
            setIsModalOpen(true);
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

                        <div className="form-control mt-4">
                            <label className="label">
                                <span className="label-text">Unidade</span>
                            </label>
                            <select
                                className="select select-bordered"
                                value={unidadeId ?? ''}
                                onChange={(e) => setUnidadeId(Number(e.target.value))}
                            >
                                <option value="" disabled>Selecione a unidade</option>
                                {unidades.map((unidadeOption) => (
                                    <option key={unidadeOption.id} value={unidadeOption.id}>
                                        {unidadeOption.unidade}
                                    </option>
                                ))}
                            </select>
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

                        <div className="form-control mt-4">
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

                        <button 
                            className="btn btn-primary mt-6" 
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
