import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Notification } from '@/components';
import "/src/main.scss"
import { IoEyeOff, IoEye } from 'react-icons/io5';
import { useDepartamentos, useProfissionais } from '@/utils/hookProfissionais';

export default function Login() {
    const [selectedDepartamento, setSelectedDepartamento] = useState<number | string>('');
    const [selectedProfissional, setSelectedProfissional] = useState<number | string>('');
    const [senha, setSenha] = useState<string>('');
    const [loginStatus, setLoginStatus] = useState<{ type: 'info' | 'success' | 'error'; message: string } | null>(null);
    const navigate = useNavigate();
    
    // Usando o hook para buscar departamentos
    const fetchProfissionais = async () => {};
    const departamentos = useDepartamentos(selectedDepartamento, fetchProfissionais, 'ativo');

    // Usando o hook para buscar profissionais
    const profissionais = useProfissionais(undefined, 'profissionais/fotos', 'ativo');

    const [mostrarSenha, setMostrarSenha] = useState<boolean>(false);

    const handleLogin = async () => {
        if (!selectedProfissional || !senha) {
            setLoginStatus({ type: 'error', message: 'Por favor, preencha todos os campos' });
            return;
        }

        try {
            const result = await window.ipcRenderer.invoke('query-database-postgres',
                'SELECT profissional_senha, profissional_foto, profissional_nome FROM profissionais WHERE profissional_id = $1', [selectedProfissional]);

            if (result.length === 0) {
                setLoginStatus({ type: 'error', message: 'Profissional não encontrado' });
                return;
            }

            const { profissional_senha, profissional_foto, profissional_nome } = result[0];

            if (senha === profissional_senha) {
                localStorage.setItem('profissional_id', selectedProfissional.toString());
                localStorage.setItem('profissional_foto', profissional_foto);
                localStorage.setItem('profissional_nome', profissional_nome);
                localStorage.setItem('departamento_id', selectedDepartamento.toString());

                const unidadesResult = await window.ipcRenderer.invoke('query-database-postgres', 'SELECT unidade_id FROM profissionais_unidade_associacao WHERE profissional_id = $1', [selectedProfissional]);
                
                const unidades = unidadesResult.map((row: { unidade_id: number }) => row.unidade_id);
                localStorage.setItem('unidades', JSON.stringify(unidades));

                const macResults = await window.ipcRenderer.invoke('query-database-postgres', 'SELECT mac FROM profissionais_mac WHERE profissional_id = $1', [selectedProfissional]);

                const macAtual = await window.ipcRenderer.invoke('get-mac-address');

                if (macResults.length === 0) {
                    navigate(`/primeiros-passos/${selectedProfissional}`);
                } else {
                    const macPermitido = macResults.some((row: { mac: string }) => row.mac === macAtual);

                    if (macPermitido) {
                        navigate('/inicio');
                    } else {
                        navigate('/mac-erro');
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

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    };

    return (
        <div className="min-h-screen w-screen flex">
            <div className='w-1/2 relative flex items-center justify-center max-h-screen overflow-hidden'>
                <div className='absolute bottom-0 backdrop-blur-sm backdrop-brightness-110 z-10 h-20 w-full flex justify-center items-center'>
                    <img src="logo.svg" className='h-10' alt="" />
                </div>
                <img src="backlogin.jpg" alt="" className='relative w-full h-full bg-cover' />
            </div>
    
            <div className='w-1/2 h-screen flex items-center justify-center py-10 px-10 relative bg-base-200'>
                <div className="w-full h-auto card bg-base-100">
                    <div className='card-body' onKeyDown={handleKeyDown}>
                        <h2 className="card-title">Login</h2>
                        <div className="form-control mt-4">
                            <label className="label">
                                <span className="label-text">Departamento</span>
                            </label>
                            <select
                                value={selectedDepartamento}
                                onChange={(e) => {
                                    setSelectedDepartamento(Number(e.target.value)); // Converter o valor para number
                                    setSelectedProfissional(''); // Resetando o profissional ao mudar o departamento
                                }}
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
        
                            <div className="relative">
                                <label className="input input-bordered flex items-center gap-2 w-full">
                                    <input
                                        type={mostrarSenha ? 'text' : 'password'}
                                        value={senha}
                                        onChange={(e) => setSenha(e.target.value)}
                                        placeholder="Digite a senha"
                                        className="flex-grow"
                                        disabled={!selectedProfissional}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setMostrarSenha(!mostrarSenha)}
                                        disabled={!selectedProfissional}
                                    >
                                        {mostrarSenha ? <IoEyeOff/> : <IoEye/>}
                                    </button>
                                </label>
                            </div>
                        </div>
        
                        <button
                            onClick={handleLogin}
                            className="btn btn-primary w-full mt-4"
                        >
                            Entrar
                        </button>

                        <div className='divider mt-10'>OU</div>
        
                        <div className="tooltip text-center w-full mt-4" data-tip="Entre em contato com um administrador para recuperar a conta">
                            <a className="cursor-pointer">Esqueci a senha</a>
                        </div>
                    </div>

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
