import { useState } from "react";
import { IoAdd } from "react-icons/io5";

export default function ModalNovaColuna({ projetoId }: { projetoId: number | undefined }) {
    const [colunaNome, setColunaNome] = useState('');
    const [modalMessage, setModalMessage] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (!colunaNome || !projetoId) {
            setModalMessage('Preencha todos os campos obrigatórios.');
            return;
        }

        try {
            const table = 'tarefas_colunas';
            const columns = ['coluna_nome', 'coluna_projeto_id'];
            const values = [colunaNome, projetoId];

            const result = await window.ipcRenderer.invoke('insert-records-postgres', { table, columns, values });

            if (result.success) {
                setModalMessage('Coluna criada com sucesso!');
                setColunaNome(''); // Limpar o campo após sucesso
            } else {
                setModalMessage(`Erro ao adicionar coluna: ${result.message}`);
            }
        } catch (error) {
            console.error('Erro ao adicionar coluna:', error);
            setModalMessage('Erro ao adicionar coluna.');
        }
    };

    return (
        <>
            {/* Botão para abrir o modal */}
            <label htmlFor="modal_nova_coluna" className="btn">
                <IoAdd /> Coluna
            </label>

            {/* Checkbox para controlar o modal */}
            <input type="checkbox" id="modal_nova_coluna" className="modal-toggle" />

            {/* Modal */}
            <div className="modal" role="dialog">
                <div className="modal-box">
                    <h3 className="font-bold text-lg">Nova Coluna</h3>
                    
                    <input
                        type="text"
                        placeholder="Nome da Coluna"
                        className="input input-bordered w-full my-4"
                        value={colunaNome}
                        onChange={(e) => setColunaNome(e.target.value)}
                    />

                    {modalMessage && (
                        <p className="text-red-500 mb-4">{modalMessage}</p>
                    )}

                    <div className="modal-action">
                        {/* Botão de submit */}
                        <button className="btn" onClick={handleSubmit}>
                            Criar Coluna
                        </button>
                        {/* Botão para fechar o modal */}
                        <label htmlFor="modal_nova_coluna" className="btn">Fechar</label>
                    </div>
                </div>
            </div>
        </>
    );
}