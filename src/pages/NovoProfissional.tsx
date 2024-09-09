import { useState, useEffect } from 'react';
import { Breadcrumbs, Modal } from "@/components";

interface Unidade {
    nome: string;
}

interface NivelAcesso {
    profissional_tipo: string;
}

export default function NovoProfissional () {
    const [nome, setNome] = useState('');
    const [tipo, setTipo] = useState('');
    const [unidade, setUnidade] = useState('');
    const [foto, setFoto] = useState<File | null>(null);
    const [modalMessage, setModalMessage] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [unidades, setUnidades] = useState<string[]>([]);
    const [niveisAcesso, setNiveisAcesso] = useState<string[]>([]);

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const unidadeResult = await window.ipcRenderer.invoke(
                    'query-database-postgres',
                    'SELECT nome FROM profissional_unidade'
                );
                setUnidades(unidadeResult.map((item: Unidade) => item.nome));
    
                const nivelResult = await window.ipcRenderer.invoke(
                    'query-database-postgres',
                    'SELECT profissional_tipo FROM profissional_tipo'
                );
                setNiveisAcesso(nivelResult.map((item: NivelAcesso) => item.profissional_tipo.replace(/[()]/g, '')));
            } catch (error) {
                console.error('Erro ao buscar opções:', error);
            }
        };
    
        fetchOptions();
    }, []);
    
    const handleSubmit = async () => {
        try {
            // Gerar o nome do arquivo para a foto
            const fotoNome = `${nome.replace(/\s+/g, '-').toLowerCase()}.png`; // Nome da foto
    
            // Dados a serem inseridos
            const table = 'profissional';
            const columns = ['profissional_nome', 'profissional_tipo', 'profissional_unidade', 'profissional_foto'];
            const values = [nome, tipo, unidade, fotoNome]; // Nome da foto para o banco de dados
    
            // Enviar os dados para a base de dados
            const result = await window.ipcRenderer.invoke('insert-into-database', { table, columns, values });
    
            if (result && result.success) {
                // Se a foto estiver presente, envie-a para o servidor
                if (foto) {
                    const formData = new FormData();
                    formData.append('file', foto, fotoNome);
    
                    await fetch('http://192.168.1.13/upload/index.php', {
                        method: 'POST',
                        body: formData,
                    });                    
                }
                setModalMessage('Profissional adicionado com sucesso!');
            } else {
                setModalMessage(`Erro ao adicionar profissional: ${result ? result.error : 'Desconhecido'}`);
            }
        } catch (error) {
            console.error('Erro ao adicionar profissional:', error);
            setModalMessage('Erro ao adicionar profissional.');
        } finally {
            setIsModalOpen(true);
        }
    };
    
    return (
        <div className='bg-base-200 min-h-screen'>
            <Breadcrumbs />
    
            <div className="px-24 rounded">
                <div className="card bg-base-100 shadow-xl w-full my-10">
                    <div className="card-body">
                        <h2 className="card-title">Adicionar Novo Profissional</h2>
    
                        <div className="form-control">
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
                                <span className="label-text">Tipo</span>
                            </label>
                            <select
                                className="select select-bordered"
                                value={tipo}
                                onChange={(e) => setTipo(e.target.value)}
                            >
                                <option value="" disabled>Selecione o tipo</option>
                                {niveisAcesso.map((nivel) => (
                                    <option key={nivel} value={nivel}>{nivel}</option>
                                ))}
                            </select>
                        </div>
    
                        <div className="form-control mt-4">
                            <label className="label">
                                <span className="label-text">Unidade</span>
                            </label>
                            <select
                                className="select select-bordered"
                                value={unidade}
                                onChange={(e) => setUnidade(e.target.value)}
                            >
                                <option value="" disabled>Selecione a unidade</option>
                                {unidades.map((unidadeOption) => (
                                    <option key={unidadeOption} value={unidadeOption}>{unidadeOption}</option>
                                ))}
                            </select>
                        </div>
    
                        <div className="form-control mt-4">
                            <label className="label">
                                <span className="label-text">Foto</span>
                            </label>
                            <input 
                                type="file" 
                                className="file-input file-input-bordered" 
                                onChange={(e) => setFoto(e.target.files ? e.target.files[0] : null)} 
                            />
                        </div>
    
                        <button 
                            className="btn btn-primary mt-6" 
                            onClick={handleSubmit}
                        >
                            Adicionar Profissional
                        </button>
                    </div>
                </div>
            </div>
    
            {/* Modal */}
            {isModalOpen && (
                <Modal 
                    type={modalMessage?.includes('sucesso') ? 'success' : 'error'} 
                    message={modalMessage || ''} 
                    onClose={() => setIsModalOpen(false)} 
                />
            )}
        </div>
    );
};
