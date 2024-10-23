import { useState } from "react";
import { IoAdd } from "react-icons/io5";

export default function ModalNovaTarefa({ departamentoId }: { departamentoId: number | undefined }) {
    const [modalMessage, setModalMessage] = useState<string | null>(null);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = event.target as HTMLFormElement;
        const formData = new FormData(form);
        const tarefaTitulo = formData.get('tarefaTitulo') as string;
        const tarefaDescricao = formData.get('tarefaDescricao') as string;
        const tarefaDataVencimento = formData.get('tarefaDataVencimento') as string;

        if (!tarefaTitulo || !tarefaDataVencimento || !departamentoId) {
            setModalMessage('Preencha todos os campos obrigatórios: "Título" e "Data de Vencimento".');
            return;
        }

        try {
            const table = 'tarefas';
            const columns = ['tarefa_titulo', 'tarefa_descricao', 'tarefa_data_vencimento', 'tarefa_departamento_id'];
            const values = [tarefaTitulo, tarefaDescricao, tarefaDataVencimento, departamentoId];

            const result = await window.ipcRenderer.invoke('insert-records-postgres', { table, columns, values });

            if (result.success) {
                setModalMessage('Tarefa criada com sucesso!');
                form.reset(); // Limpar os campos após a tarefa ser criada
            } else {
                setModalMessage(`Erro ao adicionar tarefa: ${result.message}`);
            }
        } catch (error) {
            console.error('Erro ao adicionar tarefa:', error);
            setModalMessage('Erro ao adicionar tarefa.');
        }
    };

    return (
        <>
            {/* Botão para abrir o modal */}
            <label htmlFor="modal_nova_tarefa" className="btn">
                <IoAdd /> Tarefa
            </label>

            {/* Checkbox para controlar o modal */}
            <input type="checkbox" id="modal_nova_tarefa" className="modal-toggle" />

            {/* Modal */}
            <div className="modal" role="dialog">
                <div className="modal-box">
                    <h3 className="font-bold text-lg">Nova Tarefa</h3>

                    <form onSubmit={handleSubmit}>
                        <input
                            type="text"
                            name="tarefaTitulo"
                            placeholder="Título da Tarefa"
                            className="input input-bordered w-full my-4"
                            required
                        />

                        <textarea
                            name="tarefaDescricao"
                            placeholder="Descrição"
                            className="input input-bordered w-full my-4"
                        />

                        <input
                            type="date"
                            name="tarefaDataVencimento"
                            placeholder="Data de Vencimento"
                            className="input input-bordered w-full my-4"
                            required
                        />

                        {modalMessage && (
                            <p className="text-red-500 mb-4">{modalMessage}</p>
                        )}

                        <div className="modal-action">
                            {/* Botão de submit */}
                            <button className="btn">Criar Tarefa</button>
                            {/* Botão para fechar o modal */}
                            <label htmlFor="modal_nova_tarefa" className="btn">Fechar</label>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}