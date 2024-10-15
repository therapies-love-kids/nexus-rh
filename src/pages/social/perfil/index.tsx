import { useState, useEffect } from 'react';
import { Modal } from "@/components";
import { fetchImageFromFtp } from '@/utils/imageUtils';
import { Link } from 'react-router-dom';

export default function MeuPerfil() {
    const storedProfissionalId = localStorage.getItem('profissional_id');
    const [profissional_id] = useState<number | null>(storedProfissionalId ? parseInt(storedProfissionalId, 10) : null);
    const [nome, setNome] = useState<string>('');
    const [cpf, setCPF] = useState<string>('');
    const [senha, setSenha] = useState<string>('');
    const [dataNascimento, setDataNascimento] = useState<Date | null>(null);
    const [imageUrls, setImageUrls] = useState<Record<number, string>>({});
    const [isLoading, setIsLoading] = useState<boolean>(true); // Adiciona o estado de carregamento
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [modalMessage, setModalMessage] = useState<string | null>(null);

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
                setModalMessage('Erro ao carregar as informações do profissional.');
                setIsModalOpen(true);
            } finally {
                setIsLoading(false); // Define como falso quando os dados terminarem de carregar
            }
        };
    
        fetchProfissionalData();
    }, [profissional_id]);

    return (
        <div className='min-h-screen p-10'>
            <div className='card bg-base-100'>
                <div className='card-body gap-2'>
                    <p className="card-title m-0 p-0">Meu Perfil</p>
                    <div className='flex gap-10 w-full'>
                        {isLoading ? ( // Exibe o loading enquanto os dados estão sendo carregados
                        <div className='w-full h-full flex justify-center items-center'>
                            <span className="loading loading-spinner loading-lg"></span>
                        </div>
                        ) : (
                            <>
                                <div className='flex items-center'>
                                    {profissional_id !== null && imageUrls[profissional_id] && (
                                        <img src={imageUrls[profissional_id]} alt={nome} className=" w-72 aspect-square object-cover rounded-full" />
                                    )}
                                </div>
                                <div className="divider divider-horizontal divider-end"></div>
                                <div className='w-full'>
                                    <div className="form-control mt-4">
                                        <label className="ml-5 mb-2">
                                            <span className="label-text">Nome do profissional</span>
                                        </label>
                                        <div className="border p-5 rounded-2xl">{nome}</div>
                                    </div>
                                    <div className="form-control mt-4">
                                        <label className="ml-5 mb-2">
                                            <span className="label-text">CPF do profissional</span>
                                        </label>
                                        <div className="border p-5 rounded-2xl">{cpf}</div>
                                    </div>
                                    <div className="form-control mt-4">
                                        <label className="ml-5 mb-2">
                                            <span className="label-text">Senha</span>
                                        </label>
                                        <div className="border p-5 rounded-2xl">{senha}</div>
                                    </div>
                                    <div className="form-control mt-4">
                                        <label className="ml-5 mb-2">
                                            <span className="label-text">Data de Nascimento</span>
                                        </label>
                                        <div className="border p-5 rounded-2xl">
                                            {dataNascimento ? dataNascimento.toLocaleDateString('pt-BR')
                                            : 'Não definida'}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                    {!isLoading && ( // Botão aparece apenas quando os dados são carregados
                        <div className="mt-6">
                            <Link to="/social/perfil/editar" className="btn btn-primary">Editar Informações</Link>
                        </div>
                    )}
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
