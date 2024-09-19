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

    const [modalMessage, setModalMessage] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [unidades, setUnidades] = useState<Unidade[]>([]);
    const [unidadeId, setUnidadeId] = useState<number | null>(null);
    const [unidadeNome, setUnidadeNome] = useState<string | null>(null);

    const [funcoes, setFuncoes] = useState<Funcao[]>([]);
    const [funcaoId, setFuncaoId] = useState<number | null>(null);

    const [empresas, setEmpresas] = useState<{ id: number; empresa: string }[]>([]);
    const [empresaId, setEmpresaId] = useState<number | null>(null);

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

    useEffect(() => {
        if (unidadeId !== null) {
            const unidade = unidades.find((u) => u.id === unidadeId);
            setUnidadeNome(unidade ? unidade.unidade : null);
        }
    }, [unidadeId, unidades]);

    const handleSubmit = async () => {
        if (unidadeId === null || funcaoId === null || empresaId === null || !senha || !dataIngressoEmpresa) {
            setModalMessage('Preencha todos os campos obrigatórios: unidade, função, empresa, senha e data de ingresso.');
            setIsModalOpen(true);
            return;
        }
    
        try {
            const table = 'profissionais';
            const columns = ['profissional_nome', 'profissional_unidade_id', 'profissional_funcao_id', 'profissional_empresa_id', 'profissional_senha', 'profissional_dataingressoempresa'];
            const values = [nome, unidadeId, funcaoId, empresaId, senha, dataIngressoEmpresa];
    
            const result = await window.ipcRenderer.invoke('insert-records-postgres', { table, columns, values });
    
            if (result.success) {
                setModalMessage('Usuário criado com sucesso!');
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
            Unidade: ${unidadeNome}
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
                                <span className="label-text">Unidade</span>
                            </label>
                            <select
                                className="select select-bordered"
                                value={unidadeId || ''}
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
                                <pre data-prefix="1">Unidade: {unidadeNome}</pre>
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
