import { useState, useEffect } from 'react';
import { Breadcrumbs, Modal } from "@/components";
import { Link } from 'react-router-dom';

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
    const [senha, setSenha] = useState('');
    const [dataIngressoEmpresa, setDataIngressoEmpresa] = useState('');

    const [modalMessage, setModalMessage] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [unidades, setUnidades] = useState<Unidade[]>([]);
    const [unidadeId, setUnidadeId] = useState<number | null>(null);

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

    const handleDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let input = e.target.value;
    
        // Permitir que o usuário digite números e "/"
        const regex = /^(\d{0,2})(\/?)(\d{0,2})(\/?)(\d{0,4})$/;
    
        if (regex.test(input)) {
            // Adicionar "/" automaticamente conforme o usuário digita
            if (input.length === 2 || input.length === 5) {
                input += '/';
            }
            setDataIngressoEmpresa(input);
        }
    };

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
    
            const result = await window.ipcRenderer.invoke('insert-into-database', { table, columns, values });
    
            if (result.success) {
                setModalMessage('Profissional adicionado com sucesso!');
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
    
    return (
        <div className='bg-base-200 min-h-screen'>
            <Breadcrumbs />

            <div className="px-24 rounded">
                <div className="card bg-base-100 shadow-xl w-full my-10">
                    <div className="card-body">
                        <h2 className="card-title">Adicionar Novo Profissional</h2>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Nome</span>
                            </label>
                            <input 
                                type="text" 
                                placeholder="Nome do profissional" 
                                className="input input-bordered"
                                value={nome}
                                onChange={(e) => setNome(e.target.value)} 
                            />
                        </div>

                        <div className="form-control mt-4">
                            <label className="label">
                                <span className="label-text">Data de Ingresso na Empresa</span>
                            </label>
                            <input
                                type="text"
                                placeholder="dd/mm/aaaa"
                                className="input input-bordered"
                                value={dataIngressoEmpresa}
                                onChange={handleDataChange}
                                maxLength={10}  // Limita o comprimento a 10 caracteres (dd/mm/aaaa)
                            />
                        </div>


                        <div className="form-control mt-4">
                            <label className="label">
                                <span className="label-text">Senha</span>
                            </label>
                            <input
                                type="password"
                                placeholder="Senha do profissional"
                                className="input input-bordered"
                                value={senha}
                                onChange={(e) => setSenha(e.target.value)}
                            />
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
                        <Link to={'/profissionais'}>
                            <button className="btn btn-neutral mt-2 w-full">Voltar</button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <Modal 
                    type={modalMessage?.includes('sucesso') ? 'success' : 'error'} 
                    message={modalMessage || ''} 
                    onClose={() => setIsModalOpen(false)} 
                />
            )}
        </div>
    );
}