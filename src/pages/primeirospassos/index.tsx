import { useParams } from 'react-router-dom';
import { useState, useEffect } from "react";
import DatePicker from "react-date-picker";
import { IoArrowBack, IoCalendar, IoClose } from "react-icons/io5";
import { Link } from "react-router-dom";
import { Notification } from '@/components'; // Importa o componente de notificação

export default function PrimeirosPassos() {
    const [step, setStep] = useState(1);
    const [senha, setSenha] = useState("");
    const [foto, setFoto] = useState<File | null>(null);
    const [horaEntrada, setHoraEntrada] = useState("");
    const [horaSaida, setHoraSaida] = useState("");
    const [dataNascimento, setDataNascimento] = useState<Date | null>(null);
    const [notification, setNotification] = useState<{ type: 'info' | 'success' | 'error', message: string } | null>(null);

    const { id } = useParams();

    async function handleFinalSubmit() {
        const fileExt = foto?.name.split('.').pop();
        const fotoNome = `profissional_${id}.${fileExt}`;
    
        try {
            // Chama o IPC para obter o endereço MAC
            const macAddress = await window.ipcRenderer.invoke('get-mac-address');
            
            const updates = {
                profissional_senha: senha,
                profissional_foto: fotoNome,
                profissional_horaentrada: horaEntrada,
                profissional_horasaida: horaSaida,
                profissional_datanascimento: dataNascimento,
                profissional_mac: macAddress, // Adiciona o MAC ao registro
            };
    
            const response = await window.ipcRenderer.invoke('update-records-postgres', 'profissionais', updates, [id]);
    
            if (response.success) {
                setNotification({ type: 'success', message: 'Informações atualizadas com sucesso!' });
    
                if (foto) {
                    const localPath = foto.path;
                    const remoteFileName = fotoNome;
    
                    const ftpResponse = await window.ipcRenderer.invoke('upload-ftp', { localPath, remoteFileName });
                    if (ftpResponse.success) {
                        setNotification({ type: 'success', message: 'Imagem enviada ao servidor com sucesso!' });
                    } else {
                        setNotification({ type: 'error', message: `Erro ao enviar a imagem: ${ftpResponse.message}` });
                    }
                }
            } else {
                setNotification({ type: 'error', message: `Erro ao atualizar informações: ${response.message}` });
            }
        } catch (err) {
            console.error('Erro ao enviar dados:', err);
            setNotification({ type: 'error', message: 'Erro ao enviar dados.' });
        }
    }

    function validateStep() {
        if (step === 1 && !senha) {
            setNotification({ type: 'error', message: 'Por favor, insira uma senha.' });
            return false;
        }
        if (step === 2 && (!foto || !dataNascimento)) {
            setNotification({ type: 'error', message: 'Por favor, envie uma foto e selecione a data de nascimento.' });
            return false;
        }
        if (step === 3 && (!horaEntrada || !horaSaida)) {
            setNotification({ type: 'error', message: 'Por favor, insira o horário de entrada e saída.' });
            return false;
        }
        return true;
    }

    function handleNextStep() {
        if (validateStep()) {
            setStep(step + 1);
        }
    }

    useEffect(() => {
        if (step === 4) {
            handleFinalSubmit(); // Envia as informações automaticamente ao chegar na etapa 4
        }
    }, [step]);

    return (
        <div className='bg-base-200 min-h-screen'>
            <div className="px-24 pt-40 w-full flex flex-col items-center">
                <ul className="steps w-full">
                    <li className={`step ${step >= 1 ? "step-primary" : ""}`}>Escolha sua senha</li>
                    <li className={`step ${step >= 2 ? "step-primary" : ""}`}>Informações pessoais</li>
                    <li className={`step ${step >= 3 ? "step-primary" : ""}`}>Horário de serviço</li>
                    <li data-content="✓" className={`step ${step === 4 ? "step-primary" : ""}`}>Fim</li>
                </ul>

                <div className="card bg-base-100 shadow-xl w-full my-10">
                    <div className="card-body">
                        <div className='flex flex-row items-center gap-2'>
                            {step <= 4 && step > 1 && (
                                <button className="btn btn-ghost" onClick={() => setStep(step - 1)}>
                                    <IoArrowBack />
                                </button>
                            )}
                            <p className="card-title m-0 p-0">
                                {step === 1 ? "Escolha sua senha" : step === 2 ? "Informações pessoais" : step === 3 ? "Horário de serviço" : "Concluído"}
                            </p>
                        </div>

                        {step === 1 && (
                            <div className="form-control mt-4">
                                <label className="label">
                                    <span className="label-text">Senha de acesso</span>
                                </label>
                                <input
                                    type="password"
                                    placeholder="Senha de acesso"
                                    className="input input-bordered"
                                    value={senha}
                                    onChange={(e) => setSenha(e.target.value)}
                                    required
                                />
                            </div>
                        )}

                        {step === 2 && (
                            <div className="form-control mt-4">
                                <input 
                                    type="file" 
                                    className="file-input file-input-bordered w-full max-w-xs" 
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files.length > 0) {
                                            setFoto(e.target.files[0]);
                                        }
                                    }} 
                                    required
                                />
                                <div className="form-control mt-4">
                                    <label className="label">
                                        <span className="label-text">Data de Nascimento</span>
                                    </label>
                                    <label className="input input-bordered flex items-center gap-2 w-full">
                                        <IoCalendar />
                                        <DatePicker
                                            onChange={(value) => {
                                                if (value instanceof Date || value === null) {
                                                    setDataNascimento(value);
                                                }
                                            }}
                                            value={dataNascimento}
                                            format="dd/MM/yyyy"
                                            className="w-full custom-datepicker"
                                            calendarIcon={<IoCalendar />}
                                            clearIcon={<IoClose />}
                                            dayPlaceholder="dd"
                                            monthPlaceholder="mm"
                                            yearPlaceholder="aaaa"
                                            required
                                        />
                                    </label>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="form-control mt-4">
                                <label className="label">
                                    <span className="label-text">Horário de Entrada</span>
                                </label>
                                <input
                                    type="time"
                                    className="input input-bordered"
                                    value={horaEntrada}
                                    onChange={(e) => setHoraEntrada(e.target.value)}
                                    required
                                />
                                <label className="label mt-4">
                                    <span className="label-text">Horário de Saída</span>
                                </label>
                                <input
                                    type="time"
                                    className="input input-bordered"
                                    value={horaSaida}
                                    onChange={(e) => setHoraSaida(e.target.value)}
                                    required
                                />
                            </div>
                        )}

                        {step === 4 && (
                            <div className="flex flex-col items-center mt-4">
                                <h2 className="text-2xl font-bold mt-4">Cadastro Completo!</h2>
                                <p className="text-center mt-2">Parabéns, suas informações foram registradas com sucesso.</p>
                                <Link to="/inicio">
                                    <button className="btn btn-success mt-6">Ir para o Aplicativo</button>
                                </Link>
                            </div>
                        )}

                        <div className="card-actions justify-between mt-6">
                            {step < 4 && (
                                <button
                                    className="btn btn-primary"
                                    onClick={handleNextStep}
                                >
                                    Próximo
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {notification && (
                <Notification
                    type={notification.type}
                    message={notification.message}
                    onClose={() => setNotification(null)}
                />
            )}
        </div>
    );
}
