import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Notification } from '@/components';

interface Unidade {
    id: number;
    unidade: string;
}

interface Funcao {
    id: number;
    funcao: string;
}

interface Profissional {
    profissional_id: number;
    profissional_nome: string;
    profissional_senha: string;
}

export default function Login() {
    const [unidades, setUnidades] = useState<Unidade[]>([]);
    const [funcoes, setFuncoes] = useState<Funcao[]>([]);
    const [profissionais, setProfissionais] = useState<Profissional[]>([]);
    const [selectedUnidade, setSelectedUnidade] = useState<number | string>('');
    const [selectedFuncao, setSelectedFuncao] = useState<number | string>('');
    const [selectedProfissional, setSelectedProfissional] = useState<number | string>('');
    const [senha, setSenha] = useState<string>('');
    const [loginStatus, setLoginStatus] = useState<{ type: 'info' | 'success' | 'error'; message: string } | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUnidades = async () => {
            try {
                const result = await window.ipcRenderer.invoke('query-database-postgres', 'SELECT id, unidade FROM profissionais_unidade');
                setUnidades(result as Unidade[]);
            } catch (error) {
                console.error('Erro ao buscar unidades:', error);
            }
        };

        fetchUnidades();
    }, []);

    useEffect(() => {
        if (selectedUnidade) {
            const fetchFuncoes = async () => {
                try {
                    const result = await window.ipcRenderer.invoke('query-database-postgres', 'SELECT id, funcao FROM profissionais_funcao WHERE id >= $1', [selectedUnidade]);
                    setFuncoes(result as Funcao[]);
                } catch (error) {
                    console.error('Erro ao buscar funções:', error);
                }
            };

            fetchFuncoes();
        } else {
            setFuncoes([]);
            setSelectedFuncao('');
            setProfissionais([]);
            setSelectedProfissional('');
        }
    }, [selectedUnidade]);

    useEffect(() => {
        if (selectedUnidade && selectedFuncao) {
            const fetchProfissionais = async () => {
                try {
                    const result = await window.ipcRenderer.invoke('query-database-postgres', 'SELECT profissional_id, profissional_nome, profissional_senha FROM profissionais WHERE profissional_unidade_id = $1 AND profissional_funcao_id = $2', [selectedUnidade, selectedFuncao]);
                    setProfissionais(result as Profissional[]);
                } catch (error) {
                    console.error('Erro ao buscar profissionais:', error);
                }
            };

            fetchProfissionais();
        } else {
            setProfissionais([]);
            setSelectedProfissional('');
        }
    }, [selectedUnidade, selectedFuncao]);

    const handleLogin = async () => {
        if (!selectedProfissional || !senha) {
            setLoginStatus({ type: 'error', message: 'Por favor, preencha todos os campos' });
            return;
        }
    
        try {
            // Verificar a senha do profissional
            const result = await window.ipcRenderer.invoke('query-database-postgres', 'SELECT profissional_senha, profissional_foto FROM profissionais WHERE profissional_id = $1', [selectedProfissional]);
    
            if (result.length === 0) {
                setLoginStatus({ type: 'error', message: 'Profissional não encontrado' });
                return;
            }
    
            const { profissional_senha, profissional_foto, profissional_nome } = result[0];
    
            if (senha === profissional_senha) {
                // Armazenar o ID e a foto do profissional no localStorage
                localStorage.setItem('profissional_id', selectedProfissional.toString());
                localStorage.setItem('profissional_foto', profissional_foto);
                localStorage.setItem('profissional_nome', profissional_nome);
    
                // Buscar os MACs permitidos para o profissional na nova tabela
                const macResults = await window.ipcRenderer.invoke('query-database-postgres', 'SELECT mac FROM profissionais_mac WHERE profissional_id = $1', [selectedProfissional]);
    
                const macAtual = await window.ipcRenderer.invoke('get-mac-address');
    
                // Se não há MAC registrado para o profissional
                if (macResults.length === 0) {
                    navigate(`/primeiros-passos/${selectedProfissional}`);
                } else {
                    // Verificar se o MAC atual está entre os MACs permitidos
                    const macPermitido = macResults.some((row: { mac: string }) => row.mac === macAtual);
    
                    if (macPermitido) {
                        navigate('/inicio');
                    } else {
                        navigate('/mac-erro'); // Página de erro de MAC não permitido
                    }
                }
            } else {
                setLoginStatus({ type: 'error', message: 'Senha incorreta' });
            }
        } catch (error) {
            console.error('Erro durante o login:', error);
            setLoginStatus({ type: 'error', message: 'Erro durante o login' });
        }
    };
    

    const handleNotificationClose = () => {
        setLoginStatus(null);
    };

    return (
    <div className="min-h-screen w-screen flex bg-gradient-to-l to-primary/50 from-accent/50">
        <div className='w-2/5 relative flex items-center justify-center'>
            <img src="/LogoVertical.svg" className='w-1/2 p-5' alt="" />
        </div>

        <div className='w-3/5 h-screen flex items-center justify-center py-40 px-40 relative'>
            <div className="z-10 absolute right-10 w-2/3 h- p-6 bg-base-100 shadow-xl rounded-lg">
                <h2 className="text-2xl font-bold mb-0">Login</h2>

                <div className='divider divider-primary mt-0 mb-20 w-40'></div>
                
                <div className="form-control mt-4">
                    <label className="label">
                        <span className="label-text">Unidade</span>
                    </label>
                    <select
                        value={selectedUnidade}
                        onChange={(e) => setSelectedUnidade(e.target.value)}
                        className="select select-bordered w-full"
                    >
                        <option value="">Selecione uma Unidade</option>
                        {unidades.map((unidade) => (
                            <option key={unidade.id} value={unidade.id}>{unidade.unidade}</option>
                        ))}
                    </select>
                </div>


                <div className="form-control mt-4">
                    <label className="label">
                        <span className="label-text">Função</span>
                    </label>

                    <select
                        value={selectedFuncao}
                        onChange={(e) => setSelectedFuncao(e.target.value)}
                        className="select select-bordered w-full"
                        disabled={!selectedUnidade}
                    >
                        <option value="">Selecione uma Função</option>
                        {funcoes.map((funcao) => (
                            <option key={funcao.id} value={funcao.id}>{funcao.funcao}</option>
                        ))}
                    </select>
                </div>


                <div className="form-control mt-4">
                    <label className="label">
                        <span className="label-text">Profissional</span>
                    </label>
                    <select
                        value={selectedProfissional}
                        onChange={(e) => setSelectedProfissional(e.target.value)}
                        className="select select-bordered w-full"
                        disabled={!selectedFuncao}
                    >
                        <option value="">Selecione um Profissional</option>
                        {profissionais.map((prof) => (
                            <option key={prof.profissional_id} value={prof.profissional_id}>{prof.profissional_nome}</option>
                        ))}
                    </select>
                </div>


                <div className="form-control mt-4">
                    <label className="label">
                        <span className="label-text">Senha</span>
                    </label>

                    <input
                        type="password"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        placeholder="Digite a senha"
                        className="input input-bordered w-full mb-4"
                        disabled={!selectedProfissional}
                    />
                </div>

                

                <button
                    onClick={handleLogin}
                    className="btn btn-primary w-full mt-20"
                >
                    Entrar
                </button>

                <div className="tooltip text-center w-full mt-5" data-tip="Entre em contato com um administrador para recuperar a senha">
                    <a className="cursor-pointer">Esqueci a senha</a>
                </div>

                <Link to={"/inicio"}>Entrar temporário</Link>

                {loginStatus && (
                    <Notification
                        type={loginStatus.type}
                        message={loginStatus.message}
                        onClose={handleNotificationClose}
                    />
                )}
            </div>

            <div className='absolute inset-0'>
                <img
                    src="/clouds.svg"
                    className='h-full w-full object-cover object-left'
                    alt="Clouds"
                />
            </div>
        </div>
    </div>
    );
}
