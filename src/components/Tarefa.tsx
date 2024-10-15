import { useState } from "react";
import { IoAdd, IoChatbox, IoClipboard, IoPencil, IoSettings, IoTime } from "react-icons/io5";

interface TarefaProps {
    titulo: string;
    prioridade: 'baixa' | 'media' | 'alta';
    horas: number;
    subtarefas: { nome: string; concluida: boolean }[];
    comentarios: { id: number; texto: string }[]; // Mudando para um array de objetos para incluir texto
    anexos: { id: number; nome: string }[]; // Mudando para um array de objetos para incluir o nome do arquivo
    imageUrl: string | null;
}

export default function Tarefa({
        titulo,
        prioridade,
        horas,
        subtarefas,
        comentarios,
        anexos,
        imageUrl
    }: TarefaProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const renderPrioridadeBadge = () => {
        if (prioridade === 'baixa') return <div className="badge badge-primary">Prioridade baixa</div>;
        if (prioridade === 'media') return <div className="badge badge-warning">Prioridade média</div>;
        if (prioridade === 'alta') return <div className="badge badge-error">Prioridade alta</div>;
    };

    return (
        <>
            <div className="border-base-300 border-2 p-2 rounded-xl border-dashed min-h-28 mb-5">
                {renderPrioridadeBadge()}
                <h2 className="mt-5 text-xl">{titulo}</h2>
                <div className="flex items-center gap-2">
                {imageUrl ? (
                    <img src={imageUrl} alt="foto" className="w-8 aspect-square object-cover rounded-full" />
                ) : (
                    <div className="flex items-center justify-center rounded-full border-2 border-dashed aspect-square w-8">
                    <IoAdd />
                    </div>
                )}
                </div>

                <h2 className="mt-10">Subtarefas</h2>
                <div>
                {subtarefas.map((subtarefa, index) => (
                    <div className="form-control" key={index}>
                    <label className="label cursor-pointer gap-3 w-fit">
                        <input type="checkbox" className="checkbox" checked={subtarefa.concluida} readOnly />
                        <span className="label-text">{subtarefa.nome}</span>
                    </label>
                    </div>
                ))}
                </div>

                <div className="divider mb-2"></div>

                <div className="flex items-center justify-between text-sm mb-2">
                <div className="flex items-center gap-2">
                    <IoTime />
                    {horas}h
                </div>
                <div className="flex items-center gap-2">
                    <IoChatbox />
                    {comentarios.length}
                </div>
                <div className="flex items-center gap-2">
                    <IoClipboard />
                    {anexos.length}
                </div>
                </div>

                <button className="btn btn-sm btn-outline mt-2" onClick={openModal}>
                Detalhes
                </button>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="modal modal-open" role="dialog">
                <div className="modal-box">
                    <h3 className="text-lg font-bold">{titulo}</h3>
                    <p className="py-4">Detalhes da tarefa aqui...</p>

                    <h4>Subtarefas:</h4>
                    <ul className="list-disc pl-5">
                    {subtarefas.map((subtarefa, index) => (
                        <li key={index}>
                        {subtarefa.nome} {subtarefa.concluida && <span className="text-green-500">(Concluída)</span>}
                        </li>
                    ))}
                    </ul>

                    <h4 className="mt-4">Comentários:</h4>
                    <ul className="list-disc pl-5">
                    {comentarios.map(comentario => (
                        <li key={comentario.id}>{comentario.texto}</li>
                    ))}
                    </ul>

                    <h4 className="mt-4">Anexos:</h4>
                    <ul className="list-disc pl-5">
                    {anexos.map(anexo => (
                        <li key={anexo.id}>{anexo.nome}</li>
                    ))}
                    </ul>

                    <div className="flex justify-between mt-4">
                    <div>
                        <strong>Horas Estimadas:</strong> {horas}h
                    </div>
                    </div>

                    <div className="modal-action">
                    <button className="btn" onClick={closeModal}>Fechar</button>
                    </div>
                </div>
                </div>
            )}
        </>
    );
}
