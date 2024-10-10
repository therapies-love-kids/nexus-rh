


import { useState, useEffect } from 'react';
import { Breadcrumbs, Modal } from "@/components";
import { fetchImageFromFtp } from '@/utils/imageUtils';
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
                    const imageUrl = await fetchImageFromFtp(profissional.profissional_foto);
                    
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
            const ftpResponse = await window.ipcRenderer.invoke('upload-ftp', { localFilePath: foto.path, remoteFileName: fotoNome });
            if (ftpResponse.success) {
                console.log('Imagem enviada ao servidor com sucesso!');
            } else {
                console.error(`Erro ao enviar a imagem: ${ftpResponse.message}`);
            }
        } catch (err) {
            console.error('Erro ao enviar a imagem:', err);
        }
    };

    const handleSubmit = async () => {
        if (nome === '' || senha === '' || dataNascimento === null) {
            setModalMessage('Preencha todos os campos obrigatórios.');
            setIsModalOpen(true);
            return;
        }

        try {
            const table = 'profissionais';
            const updates = {
                profissional_nome: nome,
                profissional_cpf: cpf,
                profissional_senha: senha,
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
            setModalMessage(`Erro ao atualizar profissional ${error}`);
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
        <div className='bg-base-200 min-h-screen'>
            <Breadcrumbs />

            <div className="px-24 rounded">
                <div className="card bg-base-100 shadow-xl w-full my-10">
                    <div className="card-body">
                        <div className='flex flex-row items-center gap-2'>
                            <Link to={'/profissionais'}>
                                <button className="btn btn-ghost w-full"><IoArrowBack /></button>
                            </Link>
                            <p className="card-title m-0 p-0">Atualizar Profissional</p>
                        </div>

                        {step === 1 && (
                            <div>
                                <h2 className='card-title mt-5'>Informações Gerais</h2>
                                <div className="form-control mt-4">
                                    <label className="label">
                                        <span className="label-text">Nome do profissional</span>
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
                                        <span className="label-text">CPF do profissional</span>
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
                                        <span className="label-text">Data de Nascimento</span>
                                    </label>
                                    <DatePicker
                                        onChange={(value) => setDataNascimento(value as Date)}
                                        value={dataNascimento}
                                        format="dd/MM/yyyy"
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div>
                                <h2 className='card-title mt-5'>Imagem</h2>
                                {profissional_id !== null && imageUrls[profissional_id] && (
                                    <img src={imageUrls[profissional_id]} alt={nome} className="w-16 h-16 object-cover rounded-full" />
                                )}

                                <div className="form-control mt-4">
                                    <label className="label">
                                        <span className="label-text">Foto</span>
                                    </label>
                                    <input 
                                        type="file" 
                                        className="file-input file-input-bordered w-full" 
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                setFoto(e.target.files[0]);
                                            }
                                        }} 
                                    />
                                    {fotoPreview && (
                                        <div className="mt-4">
                                            <img src={fotoPreview} alt="Pré-visualização" className="w-32 h-32 object-cover rounded-full" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="flex justify-between mt-6">
                            <button
                                className="btn btn-secondary"
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
