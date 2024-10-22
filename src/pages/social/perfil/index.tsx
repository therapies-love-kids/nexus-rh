import { useState, useEffect } from 'react';
import { Notification } from "@/components";
import { DownloadImageFtp, uploadImageFtp } from '@/utils/hookFTP';
import { IoCamera, IoEye, IoEyeOff } from 'react-icons/io5';
import MaskedInput from 'react-text-mask';

export default function MeuPerfil() {
    const storedProfissionalId = localStorage.getItem('profissional_id');
    const [profissional_id] = useState<number | null>(storedProfissionalId ? parseInt(storedProfissionalId, 10) : null);
    const [nome, setNome] = useState<string>('');
    const [cpf, setCPF] = useState<string>('');
    const [senha, setSenha] = useState<string>('');
    const [mudarSenha, setMudarSenha] = useState(false);
    const [novaSenha, setNovaSenha] = useState('');
    const [dataNascimento, setDataNascimento] = useState<Date | null>(null);
    const [imageUrls, setImageUrls] = useState<Record<number, string>>({});
    const [foto, setFoto] = useState<File | null>(null);
    const [fotoPreview, setFotoPreview] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [isEditable, setIsEditable] = useState<boolean>(false);
    const [editStatus, setEditStatus] = useState<{ type: 'info' | 'success' | 'error'; message: string } | null>(null);

    // Store original values for comparison
    const [originalValues, setOriginalValues] = useState<{
        nome: string;
        cpf: string;
        senha: string;
        dataNascimento: Date | null;
    }>({
        nome: '',
        cpf: '',
        senha: '',
        dataNascimento: null,
    });

    useEffect(() => {
        if (!isEditable) {
          setNome(originalValues.nome);
          setCPF(originalValues.cpf);
          setSenha(originalValues.senha);
          setDataNascimento(originalValues.dataNascimento);
        }
      }, [isEditable]);

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
                    
                    if (profissional_id) {
                        setImageUrls({ [profissional_id.toString()]: imageUrl });
                    }

                    // Set original values
                    const fetchedData = {
                        nome: profissional.profissional_nome ?? '',
                        cpf: profissional.profissional_cpf ?? '',
                        senha: profissional.profissional_senha ?? '',
                        dataNascimento: profissional.profissional_datanascimento ? new Date(profissional.profissional_datanascimento) : null,
                    };

                    setOriginalValues(fetchedData);
                    setNome(fetchedData.nome);
                    setCPF(fetchedData.cpf);
                    setSenha(fetchedData.senha);
                    setDataNascimento(fetchedData.dataNascimento);
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

    const hasChanges = () => {
        return nome !== originalValues.nome ||
               cpf !== originalValues.cpf ||
               senha !== originalValues.senha ||
               dataNascimento?.getTime() !== originalValues.dataNascimento?.getTime() ||
               (foto !== null);
    };

    const hasMandatoryFields = () => {
        return nome !== '' &&
               senha !== '' &&
               cpf !== '' &&
               dataNascimento !== null;
    };

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
        if (hasMandatoryFields() === false) {
            setEditStatus({ type: 'error', message: 'Preencha todos os campos obrigatórios.' });
            return;
        }

        try {
            const table = 'profissionais';
            const senhaToUpdate = mudarSenha ? novaSenha : senha;

            const updates = {
                profissional_nome: nome,
                profissional_cpf: cpf,
                profissional_senha: senhaToUpdate,
                profissional_datanascimento: dataNascimento ? dataNascimento.toISOString().split('T')[0] : null
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
                    setEditStatus({ type: 'success', message: 'Profissional atualizado com sucesso!' });
                    if (foto) handleFotoUpload();
                    setOriginalValues({ nome, cpf, senha: senhaToUpdate, dataNascimento }); // Update original values
                } else {
                    setEditStatus({ type: 'error', message: `Erro ao atualizar profissional: ${result.message}` });
                }
            } else {
                setEditStatus({ type: 'error', message: 'ID do profissional não encontrado.' });
            }
        } catch (error) {
            setEditStatus({ type: 'error', message: `Erro ao atualizar profissional: ${error}` });
        } finally {
            setIsEditable(false);
        }
    };

    function handleNotificationClose(): void {
        setEditStatus(null);
    }

    return (
        <div className='min-h-screen p-10'>
            <div className="card bg-base-100 shadow-xl w-full">
                <div className="card-body">
                    <div className='flex flex-row items-center gap-2'>
                        <p className="card-title m-0 p-0">Meu Perfil</p>
                    </div>
                    <div className='flex flex-row gap-4'>
                        <div className='w-72 flex items-center justify-center'>
                            <img
                                src={fotoPreview || (profissional_id !== null && imageUrls[profissional_id]) || ''}
                                alt={fotoPreview ? 'Pré-visualização' : nome}
                                className={`avatar aspect-square mask-square object-cover rounded-full w-full`}
                            />
                            <div
                                className='absolute tooltip w-72 h-72 rounded-full flex justify-center items-center cursor-pointer'
                                onClick={() => document.getElementById('fotoInput')?.click()}
                                onMouseOver={(e) => e.currentTarget.style.setProperty('--hover-opacity', '1')}
                                onMouseOut={(e) => e.currentTarget.style.setProperty('--hover-opacity', '0')}
                                style={{ ['--hover-opacity']: '0' } as any}
                            >
                                <IoCamera
                                    className='opacity-0 transition duration-300 text-white'
                                    style={{ opacity: 'var(--hover-opacity)' }}
                                    size={48}
                                />
                            </div>
                            <input
                                type="file"
                                id="fotoInput"
                                className="hidden" 
                                onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        setFoto(e.target.files[0]);
                                        setFotoPreview(URL.createObjectURL(e.target.files[0]));
                                    }
                                }} 
                            />
                        </div>
                        <div className="divider divider-horizontal divider-end"></div>
                        <div className='flex flex-col gap-1 flex-grow'>
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
                                    disabled={!isEditable}
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
                                    disabled={!isEditable}
                                />
                            </div>

                            <div className="form-control mt-4">
                                <label className="label">
                                    <span className="label-text">Senha</span>
                                </label>

                                <div className='flex flex-row w-full gap-3 '>
                                    <label className="input input-bordered flex items-center w-full">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Senha do profissional"
                                            className="flex-grow"
                                            value={senha}
                                            onChange={(e) => setSenha(e.target.value)}
                                            disabled={!isEditable}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="ml-2"
                                            disabled={!isEditable}
                                        >
                                            {showPassword ? <IoEyeOff /> : <IoEye />}
                                        </button>
                                    </label>
                                </div>
                            </div>

                            <div className="form-control mt-4">
                                <label className="label">
                                    <span className="label-text">Data de Nascimento</span>
                                </label>
                                <input
                                    type="date"
                                    onChange={(e) => {
                                        const dateValue = e.target.value;
                                        if (dateValue) {
                                            try {
                                                setDataNascimento(new Date(dateValue));
                                            } catch (error) {
                                                console.error('Erro ao setar data de nascimento:', error);
                                            }
                                        } else {
                                            setDataNascimento(null);
                                        }
                                    }}
                                    value={dataNascimento ? dataNascimento.toISOString().split('T')[0] : ''}
                                    className="w-full input input-bordered"
                                    disabled={!isEditable}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-6">
                        {isEditable && (
                            <button
                                className="btn btn-success"
                                onClick={handleSubmit}
                                disabled={!hasChanges() || !hasMandatoryFields()}
                            >
                                Salvar
                            </button>
                        )}
                        <button
                            className="btn btn-primary"
                            onClick={() => setIsEditable(!isEditable)}
                        >
                            {isEditable ? "Cancelar" : "Editar"}
                        </button>
                    </div>
                </div>
            </div>

            {editStatus && (
                <Notification
                    type={editStatus?.type ?? 'info'}
                    message={editStatus?.message ?? ''}
                    onClose={handleNotificationClose}
                />
            )}
        </div>
    );
}
