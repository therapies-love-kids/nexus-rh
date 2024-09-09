import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Notification } from '@/components';

interface Profissional {
    id: number;
    profissional_nome: string;
    profissional_senha: string;
    profissional_tipo: string;
}

export default function Login() {
    const [profissionais, setProfissionais] = useState<Profissional[]>([]);
    const [selectedProfissional, setSelectedProfissional] = useState<number | string>('');
    const [senha, setSenha] = useState<string>('');
    const [loginStatus, setLoginStatus] = useState<{ type: 'info' | 'success' | 'error'; message: string } | null>(null);
    const navigate = useNavigate(); // Hook de navegação

    useEffect(() => {
        // Recuperar informações de login do cache local ou cookies
        const storedTipo = localStorage.getItem('profissional_tipo');
        if (storedTipo) {
            // Lógica para redirecionar ou ajustar a UI com base no tipo recuperado
            // Exemplo: navigate('/dashboard'); 
        }

        const fetchProfissionais = async () => {
            try {
                const result = await window.ipcRenderer.invoke('query-database-postgres', 'SELECT id, profissional_nome FROM profissional WHERE profissional_tipo = $1', ['admin']);
                setProfissionais(result as Profissional[]);
            } catch (error) {
                console.error('Error fetching professionals:', error);
            }
        };

        fetchProfissionais();
    }, [navigate]);

    const handleLogin = async () => {
        if (!selectedProfissional) {
            setLoginStatus({ type: 'error', message: 'Please select a professional' });
            return;
        }

        try {
            const result = await window.ipcRenderer.invoke('query-database-postgres', 'SELECT profissional_senha, profissional_tipo FROM profissional WHERE id = $1', [selectedProfissional]);

            if (result.length === 0) {
                setLoginStatus({ type: 'error', message: 'Professional not found' });
                return;
            }

            const hashedPassword = result[0].profissional_senha;
            const profissionalTipo = result[0].profissional_tipo;

            if (senha === hashedPassword) {
                // Salvar informações no cache local e cookie
                localStorage.setItem('profissional_tipo', profissionalTipo);
                document.cookie = `profissional_tipo=${profissionalTipo}; path=/`;

                // Redirecionar para a tela de dashboard
                navigate('/dashboard'); // Atualize para a URL correta da sua aplicação
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
                <h2 className="text-2xl font-bold text-center mb-4">Admin Login</h2>
                
                <select
                    value={selectedProfissional}
                    onChange={(e) => setSelectedProfissional(e.target.value)}
                    className="select w-full mb-4"
                >
                    <option value="">Select a professional</option>
                    {profissionais.map((prof) => (
                        <option key={prof.id} value={prof.id}>{prof.profissional_nome}</option>
                    ))}
                </select>

                <input
                    type="password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="Enter password"
                    className="input w-full mb-4"
                />

                <button
                    onClick={handleLogin}
                    className="btn btn-primary w-full"
                >
                    Login
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
