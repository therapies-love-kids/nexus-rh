import { useState, useEffect } from 'react';
import { Breadcrumbs, Modal } from "@/components";
import { Link } from 'react-router-dom';
import { IoArrowBack, IoCalendar, IoClose, IoKey, IoPerson } from 'react-icons/io5';
import { FaCopy } from 'react-icons/fa';
import DatePicker from 'react-date-picker';

interface Unidade {
    id: number;
    unidade: string;
}

interface Funcao {
    id: number;
    funcao: string;
}

export default function NovoProfissional() {
    const [nome, setNome] = useState('');
    const [senha, setSenha] = useState('123');
    const [dataIngressoEmpresa, setDataIngressoEmpresa] = useState<Date | null>(null);

    const [cpf, setCpf] = useState('');

    const [modalMessage, setModalMessage] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [unidades, setUnidades] = useState<Unidade[]>([]);
    const [unidadeIds, setUnidadeIds] = useState<number[]>([]); // Mudança para permitir múltiplos IDs
    const [unidadeNomes, setUnidadeNomes] = useState<string[]>([]); // Para armazenar os nomes das unidades selecionadas

    const [funcoes, setFuncoes] = useState<Funcao[]>([]);
    const [funcaoId, setFuncaoId] = useState<number | null>(null);

    const [empresas, setEmpresas] = useState<{ id: number; empresa: string }[]>([]);
    const [empresaId, setEmpresaId] = useState<number | null>(null);

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const unidadeResult = await window.ipcRenderer.invoke(
                    'query-database-postgres',
                    'SELECT id, unidade FROM profissionais_unidade'
                );
                setUnidades(unidadeResult);

                const funcaoResult = await window.ipcRenderer.invoke(
                    'query-database-postgres',
                    'SELECT id, funcao FROM profissionais_funcao'
                );
                setFuncoes(funcaoResult);

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

    useEffect(() => {
        const selectedUnidades = unidades.filter(u => unidadeIds.includes(u.id));
        setUnidadeNomes(selectedUnidades.map(u => u.unidade));
    }, [unidadeIds, unidades]);

    const handleSubmit = async () => {
        if (unidadeIds.length === 0 || funcaoId === null || empresaId === null || !senha || !dataIngressoEmpresa || !cpf ) {
            setModalMessage('Preencha todos os campos obrigatórios: unidade(s), função, empresa, senha, data de ingresso, CPF e número do conselho.');
            setIsModalOpen(true);
            return;
        }
    
        try {
            const table = 'profissionais';
            const columns = [
                'profissional_nome',
                'profissional_funcao_id',
                'profissional_empresa_id',
                'profissional_senha',
                'profissional_dataingressoempresa',
                'profissional_cpf',
                'profissional_crp'
            ];
            const values = [
                nome,
                funcaoId,
                empresaId,
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
                    const insertPromises = unidadeIds.map((unidadeId) => {
                        return window.ipcRenderer.invoke('insert-records-postgres', {
                            table: 'profissionais_unidade_associacao',
                            columns: ['profissional_id', 'unidade_id'],
                            values: [profissionalId, unidadeId], // Preenche com o profissional_id encontrado
                        });
                    });
    
                    // Espera todas as inserções de unidade completarem
                    const associationResults = await Promise.all(insertPromises);
    
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
        const funcaoSelecionada = funcoes.find((f) => f.id === funcaoId);
        const funcaoNome = funcaoSelecionada ? funcaoSelecionada.funcao : '';
    
        const text = `
            Unidades: ${unidadeNomes.join(', ')}
            Função: ${funcaoNome}
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
                            <label className="input input-bordered flex items-center gap-2">
                                <input 
                                    type="text" 
                                    placeholder="CPF do profissional" 
                                    value={cpf}
                                    onChange={(e) => setCpf(e.target.value)} 
                                />
                            </label>
                        </div>

                        <div className="form-control mt-4">
                            <label className="label">
                                <span className="label-text">Unidade(s)</span>
                            </label>
                            <div className="flex flex-col">
                                {unidades.map(unidade => (
                                    <label key={unidade.id} className="flex items-center">
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
                                        <span className="ml-2">{unidade.unidade}</span>
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
                                value={funcaoId || ''}
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
                                value={empresaId || ''}
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
                                <pre data-prefix="2">Função: {funcoes.find((f) => f.id === funcaoId)?.funcao}</pre>
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
