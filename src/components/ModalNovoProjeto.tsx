import { useState } from 'react';

interface ModalNovoProjetoProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ModalNovoProjeto({ isOpen, onClose }: ModalNovoProjetoProps) {
    const [projetoNome, setProjetoNome] = useState('');
    const [projetoDescricao, setProjetoDescricao] = useState('');
    const [projetoDataInicio, setProjetoDataInicio] = useState('');
    const [projetoDataFim, setProjetoDataFim] = useState('');
    const [modalMessage, setModalMessage] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (!projetoNome || !projetoDataInicio || !projetoDataFim) {
            setModalMessage('Preencha todos os campos obrigatórios: "Nome", "Data de Início" e "Data de Fim".');
            return;
        }
    
        try {
            const table = 'tarefas_projetos';
            const columns = ['projeto_nome', 'projeto_descricao', 'projeto_data_inicio', 'projeto_data_fim'];
            const values = [projetoNome, projetoDescricao, projetoDataInicio, projetoDataFim];
    
            const result = await window.ipcRenderer.invoke('insert-records-postgres', { table, columns, values });
    
            if (result.success) {
                setModalMessage('Projeto criado com sucesso!');
    
                // Limpar o formulário após a criação
                setProjetoNome('');
                setProjetoDescricao('');
                setProjetoDataInicio('');
                setProjetoDataFim('');
            } else {
                setModalMessage(`Erro ao adicionar projeto: ${result.message}`);
            }
        } catch (error) {
            console.error('Erro ao adicionar projeto:', error);
            setModalMessage('Erro ao adicionar projeto.');
        }
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="modal modal-open">
            <div className="modal-box">
                <h3 className="text-lg font-bold mb-5">Criar Novo Projeto</h3>

                <div className="form-control">
                    <label className="label">
                        <span className="label-text">Nome do Projeto</span>
                    </label>
                    <input
                        type="text"
                        placeholder="Nome do Projeto"
                        className="input input-bordered"
                        value={projetoNome}
                        onChange={(e) => setProjetoNome(e.target.value)}
                    />
                </div>

                <div className="form-control">
                    <label className="label">
                        <span className="label-text">Descrição</span>
                    </label>
                    <textarea
                        placeholder="Descrição do Projeto"
                        className="textarea textarea-bordered"
                        value={projetoDescricao}
                        onChange={(e) => setProjetoDescricao(e.target.value)}
                    />
                </div>

                <div className="form-control">
                    <label className="label">
                        <span className="label-text">Data de Início</span>
                    </label>
                    <input
                        type="date"
                        className="input input-bordered"
                        value={projetoDataInicio}
                        onChange={(e) => setProjetoDataInicio(e.target.value)}
                    />
                </div>

                <div className="form-control">
                    <label className="label">
                        <span className="label-text">Data de Fim</span>
                    </label>
                    <input
                        type="date"
                        className="input input-bordered"
                        value={projetoDataFim}
                        onChange={(e) => setProjetoDataFim(e.target.value)}
                    />
                </div>

                <div className="modal-action justify-between mt-5">
                    <button className="btn" onClick={onClose}>Fechar</button>
                    <button className="btn btn-success" onClick={handleSubmit}>Criar Projeto</button>
                </div>

                {modalMessage && (
                    <div className={`alert ${modalMessage.includes('sucesso') ? 'alert-success' : 'alert-error'} mt-4`}>
                        <span>{modalMessage}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
