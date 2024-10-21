import { useParams } from 'react-router-dom';
import { useState, useEffect } from "react";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { Notification } from '@/components';
import { uploadImageFtp } from '@/utils/hookFTP';

export default function PrimeirosPassos() {
    const [step, setStep] = useState(1);
    const [senha, setSenha] = useState("");
    const [foto, setFoto] = useState<File | null>(null);
    const [fotoPreview, setFotoPreview] = useState<string | null>(null);
    const [horaEntrada, setHoraEntrada] = useState("");
    const [horaSaida, setHoraSaida] = useState("");
    const [dataNascimento, setDataNascimento] = useState<Date | null>(null);
    const [notification, setNotification] = useState<{ type: 'info' | 'success' | 'error', message: string } | null>(null);
    
    const { profissional_id } = useParams();
    
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [mostrarSenhaResumo, setMostrarSenhaResumo] = useState(false);

    const isButtonDisabledStep1 = (!senha);
    const isButtonDisabledStep2 = (!dataNascimento);
    const isButtonDisabledStep3 = (!horaEntrada || !horaSaida);

    async function handleFinalSubmit() {
        const fileExt = foto?.name.split('.').pop();
        const fotoNome = `profissional_${profissional_id}.${fileExt}`;
        
        try {
            const macAddress = await window.ipcRenderer.invoke('get-mac-address');
            
            const updates = {
                profissional_senha: senha,
                profissional_foto: fotoNome,
                profissional_horaentrada: horaEntrada,
                profissional_horasaida: horaSaida,
                profissional_datanascimento: dataNascimento,
            };
    
            const response = await window.ipcRenderer.invoke('update-records-postgres', {
                table: 'profissionais',
                updates,
                ids: [profissional_id],
                idColumn: 'profissional_id'
            });
    
            if (response.success) {
                setNotification({ type: 'success', message: 'Informações atualizadas com sucesso!' });
    
                if (typeof macAddress === 'string' && macAddress && profissional_id) {
                    const macInsertResponse = await window.ipcRenderer.invoke('insert-records-postgres', {
                        table: 'profissionais_mac',
                        columns: ['profissional_id', 'mac'],
                        values: [profissional_id, macAddress],
                    });
                
                    if (macInsertResponse.success) {
                        setNotification({ type: 'success', message: 'MAC registrado com sucesso!' });
                        window.location.href = '/';
                    } else {
                        setNotification({ type: 'error', message: `Erro ao registrar MAC: ${macInsertResponse.message}` });
                    }
                } else {
                    setNotification({ type: 'error', message: 'Endereço MAC ou ID não são válidos.' });
                }
                
                if (foto) {
                    const localFilePath = foto.path;
                    const fotoNome = `profissional_${profissional_id}.${foto.name.split('.').pop()}`;
                
                    try {
                        // Usa a função adaptada passando a pasta base
                        await uploadImageFtp('profissionais/fotos', localFilePath, fotoNome);
                    } catch (error) {
                        setNotification({ type: 'error', message: `Erro ao enviar a imagem` });
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

    const totalSteps = 4;

    const handleNext = () => {
        if (step < totalSteps) setStep(step + 1);
    };

    const handlePrevious = () => {
        if (step > 1) setStep(step - 1);
    };

    // Atualize a pré-visualização da imagem quando a foto for carregada
    useEffect(() => {
        if (foto) {
            const previewUrl = URL.createObjectURL(foto);
            setFotoPreview(previewUrl);

            return () => URL.revokeObjectURL(previewUrl); // Limpeza do URL temporário
        }
    }, [foto]);

    return (
        <div className='bg-base-200 min-h-screen'>
            <div className="px-24 pt-40 w-full flex flex-col items-center">
                <ul className="steps w-full">
                    <li className={`step ${step >= 1 ? "step-primary" : ""}`}>Escolha sua senha</li>
                    <li className={`step ${step >= 2 ? "step-primary" : ""}`}>Informações pessoais</li>
                    <li className={`step ${step >= 3 ? "step-primary" : ""}`}>Horário de serviço</li>
                    <li className={`step ${step === 4 ? "step-primary" : ""}`}>Resumo</li>
                </ul>

                <div className="card bg-base-100 shadow-xl w-full my-10">
                    <div className="card-body">
                        <div className='flex flex-row items-center gap-2'>
                            <p className="card-title m-0 p-0">
                                {step === 1 ? "Escolha sua senha" : step === 2 ? "Informações pessoais" : step === 3 ? "Horário de serviço" : "Resumo"}
                            </p>
                        </div>

                        {step === 1 && (
                            <div className="form-control mt-4">
                                <label className="label">
                                    <span className="label-text">Senha de acesso</span>
                                </label>
                                <div className="relative">
                                <label className="input input-bordered flex items-center gap-2">
                                    <input
                                        type={mostrarSenha ? "text" : "password"}
                                        placeholder="Senha de acesso"
                                        className="flex-grow"
                                        value={senha}
                                        onChange={(e) => setSenha(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setMostrarSenha(!mostrarSenha)}
                                    >
                                        {mostrarSenha ? <IoEyeOff /> : <IoEye />}
                                    </button>
                                </label>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="form-control mt-4">
                                <label className="label">
                                    <span className="label-text">Foto (opcional)</span>
                                </label>
                                <div lang="pt-BR">
                                    <input
                                        type="file"
                                        className="file-input file-input-bordered w-full"
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files.length > 0) {
                                                setFoto(e.target.files[0]);
                                            }
                                        }}
                                    />
                                </div>
                                
                                {/* Pré-visualização da imagem */}
                                {fotoPreview && (
                                    <div className="mt-4">
                                        <img
                                            src={fotoPreview}
                                            alt="Pré-visualização"
                                            className="w-40 h-40 object-cover rounded-full"
                                        />
                                    </div>
                                )}

                                <div className="form-control mt-4">
                                    <label className="label">
                                        <span className="label-text">Data de Nascimento</span>
                                    </label>
                                    <label className="input input-bordered flex items-center gap-2 w-full">
                                        <input
                                            type="date"
                                            onChange={(e) => {
                                                const value = e.target.value ? new Date(e.target.value) : null;
                                                setDataNascimento(value);
                                            }}
                                            value={dataNascimento ? dataNascimento.toISOString().split('T')[0] : ''}
                                            className="w-full"
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
                            <div className="flex flex-col items-center mt-4 space-y-2">
                                {fotoPreview && (
                                    <div className="mt-4">
                                        <img
                                            src={fotoPreview}
                                            alt="Pré-visualização"
                                            className="w-40 h-40 object-cover rounded-full"
                                        />
                                    </div>
                                )}
                                <p>
                                    <strong>Senha: </strong>
                                    {mostrarSenhaResumo ? senha : '*'.repeat(senha.length)}&nbsp;
                                    <button onClick={() => setMostrarSenhaResumo(!mostrarSenhaResumo)}>
                                        {mostrarSenhaResumo ? <IoEyeOff /> : <IoEye />}
                                    </button>
                                </p>
                                <p><strong>Data de nascimento:</strong> {dataNascimento ? dataNascimento.toLocaleDateString() : 'N/A'}</p>
                                <p><strong>Horário de entrada:</strong> {horaEntrada}</p>
                                <p><strong>Horário de saída:</strong> {horaSaida}</p>
                            </div>
                        )}

                        <div className='flex justify-between mt-10'>
                            <button
                                className="btn"
                                onClick={handlePrevious}
                                disabled={step === 1}
                            >
                                Voltar
                            </button>
                            {
                                step === 1 ? (
                                    <div className="tooltip tooltip-bottom" data-tip={isButtonDisabledStep1 ? "Preencha todos os campos obrigatórios" : null}>
                                        <button className="btn" onClick={handleNext} disabled={isButtonDisabledStep1}>
                                            Próximo
                                        </button>
                                    </div>
                                ) : step === 2 ? (
                                    <div className="tooltip tooltip-bottom" data-tip={isButtonDisabledStep2 ? "Preencha todos os campos obrigatórios" : null}>
                                        <button className="btn" onClick={handleNext} disabled={isButtonDisabledStep2}>
                                            Próximo
                                        </button>
                                    </div>
                                ) : step === 3 ? (
                                    <div className="tooltip tooltip-bottom" data-tip={isButtonDisabledStep3 ? "Preencha todos os campos obrigatórios" : null}>
                                        <button className="btn" onClick={handleNext} disabled={isButtonDisabledStep3}>
                                            Próximo
                                        </button>
                                    </div>
                                ) : (
                                    <div>
                                        <button className="btn btn-success" onClick={handleFinalSubmit}>
                                            Finalizar
                                        </button>
                                    </div>
                                )
                            }
                        </div>
                    </div>
                </div>
            </div>
            {notification && <Notification type={notification.type} message={notification.message} onClose={() => setNotification(null)} />}
        </div>
    );
}
