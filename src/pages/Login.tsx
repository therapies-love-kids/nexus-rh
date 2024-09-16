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
    profissional_mac: string | null; // Adicione a propriedade profissional_mac
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
    const navigate = useNavigate(); // Hook de navegação

    useEffect(() => {
        const fetchUnidades = async () => {
            try {
                const result = await window.ipcRenderer.invoke('query-database-postgres', 'SELECT id, unidade FROM profissionais_unidade');
                setUnidades(result as Unidade[]);
            } catch (error) {
                console.error('Error fetching units:', error);
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
                    console.error('Error fetching roles:', error);
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
                    const result = await window.ipcRenderer.invoke('query-database-postgres', 'SELECT profissional_id, profissional_nome, profissional_senha, profissional_mac FROM profissionais WHERE profissional_unidade_id = $1 AND profissional_funcao_id = $2', [selectedUnidade, selectedFuncao]);
                    setProfissionais(result as Profissional[]);
                } catch (error) {
                    console.error('Error fetching professionals:', error);
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
            setLoginStatus({ type: 'error', message: 'Please fill all fields' });
            return;
        }

        try {
            const result = await window.ipcRenderer.invoke('query-database-postgres', 'SELECT profissional_senha, profissional_mac FROM profissionais WHERE profissional_id = $1', [selectedProfissional]);

            if (result.length === 0) {
                setLoginStatus({ type: 'error', message: 'Professional not found' });
                return;
            }

            const { profissional_senha, profissional_mac } = result[0];

            if (senha === profissional_senha) {
                if (profissional_mac === null) {
                    // Redirecionar para a página específica
                    navigate('/primeiros-passos'); // Atualize para a URL correta da sua aplicação
                } else {
                    // Redirecionar para o dashboard
                    navigate('/dashboard');
                }
            } else {
                setLoginStatus({ type: 'error', message: 'Incorrect password' });
            }
        } catch (error) {
            console.error('Error during login:', error);
            setLoginStatus({ type: 'error', message: 'Error during login' });
        }
    };

    const handleNotificationClose = () => {
        setLoginStatus(null);
    };

    return (
        <div className="min-h-screen w-screen flex flex-col items-center justify-center p-4 bg-gray-100">
            <div className="w-full max-w-md p-6 bg-white shadow-lg rounded-lg">
                <h2 className="text-2xl font-bold text-center mb-4">Login</h2>
                
                <select
                    value={selectedUnidade}
                    onChange={(e) => setSelectedUnidade(e.target.value)}
                    className="select w-full mb-4"
                >
                    <option value="">Select a Unidade</option>
                    {unidades.map((unidade) => (
                        <option key={unidade.id} value={unidade.id}>{unidade.unidade}</option>
                    ))}
                </select>

                {selectedUnidade && (
                    <select
                        value={selectedFuncao}
                        onChange={(e) => setSelectedFuncao(e.target.value)}
                        className="select w-full mb-4"
                    >
                        <option value="">Select a Funcao</option>
                        {funcoes.map((funcao) => (
                            <option key={funcao.id} value={funcao.id}>{funcao.funcao}</option>
                        ))}
                    </select>
                )}

                {selectedFuncao && (
                    <select
                        value={selectedProfissional}
                        onChange={(e) => setSelectedProfissional(e.target.value)}
                        className="select w-full mb-4"
                    >
                        <option value="">Select a Profissional</option>
                        {profissionais.map((prof) => (
                            <option key={prof.profissional_id} value={prof.profissional_id}>{prof.profissional_nome}</option>
                        ))}
                    </select>
                )}

                {selectedProfissional && (
                    <input
                        type="password"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        placeholder="Enter password"
                        className="input w-full mb-4"
                    />
                )}

                <button
                    onClick={handleLogin}
                    className="btn btn-primary w-full"
                >
                    Login
                </button>

                <Link to={"/profissionais"}>
                    a
                </Link>

                {loginStatus && (
                    <Notification
                        type={loginStatus.type}
                        message={loginStatus.message}
                        onClose={handleNotificationClose}
                    />
                )}
            </div>
        </div>
    );
}