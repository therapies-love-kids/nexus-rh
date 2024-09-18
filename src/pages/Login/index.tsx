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
            const result = await window.ipcRenderer.invoke('query-database-postgres', 'SELECT profissional_senha FROM profissionais WHERE profissional_id = $1', [selectedProfissional]);

            if (result.length === 0) {
                setLoginStatus({ type: 'error', message: 'Profissional não encontrado' });
                return;
            }

            const { profissional_senha } = result[0];

            if (senha === profissional_senha) {
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
                        navigate('/dashboard');
                    } else {
                        navigate('/mac-erro');  // Página de erro de MAC não permitido
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
        <div className="min-h-screen w-screen flex flex-col items-center justify-center p-4 bg-gray-100">
            <div className="w-full max-w-md p-6 bg-white shadow-lg rounded-lg">
                <h2 className="text-2xl font-bold text-center mb-4">Login</h2>
                
                <select
                    value={selectedUnidade}
                    onChange={(e) => setSelectedUnidade(e.target.value)}
                    className="select w-full mb-4"
                >
                    <option value="">Selecione uma Unidade</option>
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
                        <option value="">Selecione uma Função</option>
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
                        <option value="">Selecione um Profissional</option>
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
                        placeholder="Digite a senha"
                        className="input w-full mb-4"
                    />
                )}

                <button
                    onClick={handleLogin}
                    className="btn btn-primary w-full"
                >
                    Entrar
                </button>

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
