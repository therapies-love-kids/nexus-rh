import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Notification } from '@/components';
import "/src/main.scss"

interface Departamento {
    departamento_id: number;
    departamento: string;
}

interface Profissional {
    profissional_id: number;
    profissional_nome: string;
    profissional_senha: string;
}

export default function Login() {
    const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
    const [profissionais, setProfissionais] = useState<Profissional[]>([]);
    const [selectedDepartamento, setSelectedDepartamento] = useState<number | string>('');
    const [selectedProfissional, setSelectedProfissional] = useState<number | string>('');
    const [senha, setSenha] = useState<string>('');
    const [loginStatus, setLoginStatus] = useState<{ type: 'info' | 'success' | 'error'; message: string } | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDepartamentos = async () => {
            try {
                const result = await window.ipcRenderer.invoke('query-database-postgres', 'SELECT departamento_id, departamento FROM profissionais_departamento');
                setDepartamentos(result as Departamento[]);
            } catch (error) {
                console.error('Erro ao buscar departamentos:', error);
            }
        };

        fetchDepartamentos();
    }, []);

    useEffect(() => {
        if (selectedDepartamento) {
            const fetchProfissionais = async () => {
                try {
                    const result = await window.ipcRenderer.invoke('query-database-postgres', `
                        SELECT profissional_id, profissional_nome, profissional_senha 
                        FROM profissionais 
                        WHERE profissional_id IN (
                            SELECT profissional_id 
                            FROM profissionais_departamento_associacao 
                            WHERE departamento_id = $1
                        ) AND profissional_status1 = 'ativo'`, 
                        [selectedDepartamento]);
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
    }, [selectedDepartamento]);

    const handleLogin = async () => {
        if (!selectedProfissional || !senha) {
            setLoginStatus({ type: 'error', message: 'Por favor, preencha todos os campos' });
            return;
        }

        try {
            // Verificar a senha do profissional
            const result = await window.ipcRenderer.invoke('query-database-postgres', 'SELECT profissional_senha, profissional_foto, profissional_nome FROM profissionais WHERE profissional_id = $1', [selectedProfissional]);

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

                // Buscar as unidades associadas ao profissional
                const unidadesResult = await window.ipcRenderer.invoke('query-database-postgres', 'SELECT unidade_id FROM profissionais_unidade_associacao WHERE profissional_id = $1', [selectedProfissional]);

                // Armazenar as unidades no localStorage
                const unidades = unidadesResult.map((row: { unidade_id: number }) => row.unidade_id);
                localStorage.setItem('unidades', JSON.stringify(unidades));

                // Buscar os MACs permitidos para o profissional
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
        <div className="min-h-screen w-screen flex">
            <div className='w-1/2 relative flex items-center justify-center max-h-screen overflow-hidden'>
                
                <div className='absolute bottom-0 backdrop-blur-sm backdrop-brightness-110 z-10 h-20 w-full flex justify-center items-center'>
                    <img src="/public/logo.svg" className='h-10' alt="" />
                </div>
                <img src="/backlogin.jpg" alt="" className='relative w-full h-full bg-cover' />
            </div>
    
            <div className='w-1/2 h-screen flex items-center justify-center py-40 px-40 relative bg-base-200'>
                <div className="w-full h-full p-6 bg-base-100 shadow-xl rounded-lg">
                    <h2 className="text-2xl text-primary font-bold mb-0">Boas vindas.</h2>
    
                    <div className='divider divider-primary mt-0 mb-20 w-40'></div>
    
                    <div className="form-control mt-4">
                        <label className="label">
                            <span className="label-text">Departamento</span>
                        </label>
    
                        <select
                            value={selectedDepartamento}
                            onChange={(e) => setSelectedDepartamento(e.target.value)}
                            className="select select-bordered w-full"
                        >
                            <option value="">Selecione um Departamento</option>
                            {departamentos.map((departamento) => (
                                <option key={departamento.departamento_id} value={departamento.departamento_id}>{departamento.departamento}</option>
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
                            disabled={!selectedDepartamento}
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

                    <div className='divider mt-10'>OU</div>
    
                    <div className="tooltip text-center w-full mt-5" data-tip="Entre em contato com um administrador para recuperar a conta">
                        <a className="cursor-pointer">Esqueci a senha</a>
                    </div>
                    
                    <button className='btn btn-primary'>
                        <Link to={"/inicio"}>Entrar temporário</Link>
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
        </div>
    );
}
