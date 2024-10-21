


import { useState, useEffect } from 'react';
import { Breadcrumbs, Modal } from "@/components";
import { DownloadImageFtp, uploadImageFtp } from '@/utils/hookFTP';
import { Link } from 'react-router-dom';
import { IoArrowBack } from 'react-icons/io5';
import DatePicker from 'react-date-picker';
import MaskedInput from 'react-text-mask';

export default function AtualizarMeuPerfil() {
    const storedProfissionalId = localStorage.getItem('profissional_id');
    // Inicializa o estado com o valor recuperado ou null
    const [profissional_id] = useState<number | null>(storedProfissionalId ? parseInt(storedProfissionalId, 10) : null);
    

    const [nome, setNome] = useState<string>('');
    const [cpf, setCPF] = useState<string>('');
    const [senha, setSenha] = useState<string>('');
    const [mudarSenha, setMudarSenha] = useState(false); // Controla a visibilidade dos campos de nova senha
    const [novaSenha, setNovaSenha] = useState('');
    const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('');
    const [dataNascimento, setDataNascimento] = useState<Date | null>(null);
    const [imageUrls, setImageUrls] = useState<Record<number, string>>({});
    const [modalMessage, setModalMessage] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    const [foto, setFoto] = useState<File | null>(null);
    const [fotoPreview, setFotoPreview] = useState<string | null>(null);

    useEffect(() => {
        const fetchProfissionalData = async () => {
            try {
                if (profissional_id) {
                    const result = await window.ipcRenderer.invoke(
                        'query-database-postgres',
                        `SELECT profissional_nome, profissional_cpf, profissional_senha, profissional_datanascimento, profissional_foto FROM profissionais WHERE profissional_id = ${profissional_id}`
                    );
    
                    const profissional = result[0];
                    const imageUrl = await DownloadImageFtp(`profissionais/fotos/`, profissional.profissional_foto);
                    
                    // Garantir que profissional_id não seja null ou undefined
                    if (profissional_id) {
                        setImageUrls({ [profissional_id.toString()]: imageUrl });
                    }
    
                    setNome(profissional.profissional_nome ?? '');
                    setCPF(profissional.profissional_cpf ?? '');
                    setSenha(profissional.profissional_senha ?? '');
                    setDataNascimento(profissional.profissional_datanascimento ? new Date(profissional.profissional_datanascimento) : null);
                }
            } catch (error) {
                console.log(error);
            }
        };
    
        fetchProfissionalData();
    }, [profissional_id]);

    useEffect(() => {
        if (foto) {
            const previewUrl = URL.createObjectURL(foto);
            setFotoPreview(previewUrl);
            return () => URL.revokeObjectURL(previewUrl);
        }
    }, [foto]);

    const handleFotoUpload = async () => {
        if (!foto) return;
    
        const fileExt = foto.name.split('.').pop();
        const fotoNome = `profissional_${profissional_id}.${fileExt}`;
    
        try {
            await uploadImageFtp('profissionais/fotos', foto.path, fotoNome);
        } catch (error) {
            console.error('Erro ao enviar a imagem:', error);
        }
    };

    const handleSubmit = async () => {
        if (nome === '' || (mudarSenha && (novaSenha === '' || confirmarNovaSenha === '')) || dataNascimento === null) {
            setModalMessage('Preencha todos os campos obrigatórios.');
            setIsModalOpen(true);
            return;
        }

        // Verifica se a nova senha e sua confirmação são iguais
        if (mudarSenha && novaSenha !== confirmarNovaSenha) {
            setModalMessage('As senhas não coincidem.');
            setIsModalOpen(true);
            return;
        }

        try {
            const table = 'profissionais';
            const senhaToUpdate = mudarSenha ? novaSenha : senha; // Usar nova senha se estiver sendo alterada
    
            const updates = {
                profissional_nome: nome,
                profissional_cpf: cpf,
                profissional_senha: senhaToUpdate, // Atualiza a senha com base na lógica
                profissional_datanascimento: dataNascimento.toISOString().split('T')[0]
            };
    
            if (profissional_id) {
                const ids = [profissional_id.toString()];
                const result = await window.ipcRenderer.invoke('update-records-postgres', {
                    table,
                    updates,
                    ids,
                    idColumn: 'profissional_id'
                });
    
                if (result.success) {
                    setModalMessage('Profissional atualizado com sucesso!');
                    if (foto) handleFotoUpload();
                } else {
                    setModalMessage(`Erro ao atualizar profissional: ${result.message}`);
                }
            } else {
                setModalMessage('ID do profissional não encontrado.');
            }
        } catch (error) {
            setModalMessage(`Erro ao atualizar profissional: ${error}`);
        } finally {
            setIsModalOpen(true);
        }
    };

    const [step, setStep] = useState(1);
    const totalSteps = 2;

    const handleNext = () => {
        if (step < totalSteps) setStep(step + 1);
    };

    const handlePrevious = () => {
        if (step > 1) setStep(step - 1);
    };

    return (
        <div className='min-h-screen p-10'>
            <div className="card bg-base-100 shadow-xl w-full">
                <div className="card-body">
                    <div className='flex flex-row items-center gap-2'>
                        <Link to={'/social/perfil'}>
                            <button className="btn btn-ghost w-full"><IoArrowBack /></button>
                        </Link>
                        <p className="card-title m-0 p-0">Atualizar Meu Perfil</p>
                    </div>

                    {step === 1 && (
                        <div>
                            <div className="form-control mt-4">
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
                                <span className="label-text">CPF</span>
                            </label>
                            <MaskedInput
                                type="text"
                                placeholder="000.000.000-00"
                                className="input input-bordered"
                                value={cpf}
                                onChange={(e) => setCPF(e.target.value)}
                                mask={[/\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '-', /\d/, /\d/]}
                                guide={false}
                            />
                            </div>

                            {/* Senha */}
                            <div className="form-control mt-4">
                                <label className="label">
                                    <span className="label-text">Senha</span>
                                </label>

                                <div className='flex flex-row w-full gap-3 '>
                                    <input
                                        type="text"
                                        placeholder="Senha do profissional"
                                        className="w-full input input-bordered input-disabled"
                                        value={senha}
                                        onChange={(e) => setSenha(e.target.value)}
                                        disabled // O campo fica desativado se mudarSenha for false
                                    />
                                    

                                    {/* Botão Mudar Senha */}
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => setMudarSenha(!mudarSenha)} // Alterna o estado de mudarSenha
                                    >
                                        {mudarSenha ? "Cancelar" : "Mudar Senha"}
                                    </button>
                                </div>
                            </div>

                            {/* Campos de Nova Senha e Confirmar Nova Senha */}
                            {mudarSenha && (
                                <div className='p-5 mt-5 border-base-300 border-2 border-dashed'>
                                    <div className="form-control">
                                        <input
                                            type="password"
                                            placeholder="Nova senha"
                                            className="input input-bordered"
                                            value={novaSenha}
                                            onChange={(e) => setNovaSenha(e.target.value)}
                                        />
                                    </div>

                                    <div className="form-control mt-4">
                                        <input
                                            type="password"
                                            placeholder="Confirmar nova senha"
                                            className="input input-bordered"
                                            value={confirmarNovaSenha}
                                            onChange={(e) => setConfirmarNovaSenha(e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="form-control mt-4">
                            <label className="label">
                                <span className="label-text">Data de Nascimento</span>
                            </label>
                            <DatePicker
                                onChange={(value) => setDataNascimento(value as Date)}
                                value={dataNascimento}
                                format="dd/MM/yyyy"
                                className="w-full input input-bordered"
                            />
                            </div>
                        </div>
                )}

                    {step === 2 && (
                        <div>
                            <div className='mt-4 w-full flex justify-center items-center'>
                            {fotoPreview ? (
                                <img src={fotoPreview} alt="Pré-visualização" className="avatar aspect-square mask-square w-72 object-cover rounded-full" />
                            ) : (
                                profissional_id !== null && imageUrls[profissional_id] && (
                                <img src={imageUrls[profissional_id]} alt={nome} className="avatar aspect-square mask-square w-72 object-cover rounded-full" />
                                )
                            )}
                            </div>

                            <div className="form-control mt-4">
                            <input
                                type="file" 
                                className="file-input file-input-bordered w-full" 
                                onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                    setFoto(e.target.files[0]);
                                }
                                }} 
                            />
                            </div>
                        </div>
                    )}

                    <div className="flex gap-10 mt-6">
                        <button
                            className="btn"
                            disabled={step === 1}
                            onClick={handlePrevious}
                        >
                            Anterior
                        </button>

                        <button
                            className="btn btn-primary"
                            onClick={step === totalSteps ? handleSubmit : handleNext}
                        >
                            {step === totalSteps ? 'Concluir' : 'Próximo'}
                        </button>
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <Modal 
                    type={modalMessage?.includes('sucesso') ? 'success' : 'error'} 
                    message={modalMessage || ''} 
                    onClose={() => setIsModalOpen(false)}
                >
                    <p>{modalMessage}</p>
                </Modal>
            )}
        </div>
    );
}
