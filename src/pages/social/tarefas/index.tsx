import { useState } from "react";
import { useDepartamentos, useProfissionalImage, useTarefas, useProjetos, useProfissionais } from "@/utils/useEffect";
import { IoPencil } from "react-icons/io5";
import Filtros from "@/components/FiltrosTarefas";
import Tarefa from "@/components/Tarefa";
import ModalNovaTarefa from "@/components/ModalNovaTarefa";
import ModalNovaColuna from "@/components/ModalNovaColuna";

export default function SocialTarefas() {
    // Recuperando valores do localStorage
    const storedDepartamentoId = localStorage.getItem('departamento_id');
    const storedProfissionalId = localStorage.getItem('profissional_id');
    
    const [selectedDepartamento, setSelectedDepartamento] = useState<number | undefined>(
        storedDepartamentoId ? parseInt(storedDepartamentoId, 10) : undefined
    );
    const [selectedProjeto, setSelectedProjeto] = useState<number | undefined>(undefined);
    const [selectedProfissional, setSelectedProfissional] = useState<number | null>(
        storedProfissionalId ? parseInt(storedProfissionalId, 10) : null
    );
    const [filtroProfissionalNome, setFiltroProfissionalNome] = useState<string>(''); 

    const profissionais = useProfissionais(selectedDepartamento);
    const departamentos = useDepartamentos(selectedDepartamento, async () => Promise.resolve());
    const tarefas = useTarefas(selectedDepartamento);
    const profissionalImageUrl = useProfissionalImage(selectedProfissional);
    const projetos = useProjetos(selectedDepartamento);

    return (
        <div className="container">
            <div className="h-28 p-10 flex items-center justify-between gap-10">
                <div className="flex items-center">
                    <h2 className="text-2xl">Tarefas</h2>
                </div>

                <div className="flex items-center gap-10">
                    <Filtros 
                        departamentos={departamentos}
                        selectedDepartamento={selectedDepartamento} 
                        setSelectedDepartamento={setSelectedDepartamento}
                        projetos={projetos} 
                        selectedProjeto={selectedProjeto} 
                        setSelectedProjeto={setSelectedProjeto}
                        profissionais={profissionais} 
                        selectedProfissional={selectedProfissional} 
                        setSelectedProfissional={setSelectedProfissional}
                        filtroProfissionalNome={filtroProfissionalNome} 
                        setFiltroProfissionalNome={setFiltroProfissionalNome} // Adicionando função de filtro
                    />
                </div>
            </div>
            <div className="flex gap-10 max-w-full m-10">
                <div className="w-96">
                    <button className="btn btn-ghost">
                        <IoPencil /> Título da coluna 
                    </button>
                    <div className="bg-base-100 overflow-x-auto h-[70vh] rounded-xl p-2">
                        {tarefas.map(tarefa => (
                            <Tarefa
                                key={tarefa.tarefa_id}
                                titulo={tarefa.tarefa_titulo}
                                prioridade={tarefa.tarefa_prioridade}
                                horas={5} // Placeholder
                                subtarefas={[{ nome: "Subtarefa 1", concluida: false }, { nome: "Subtarefa 2", concluida: true }]} // Placeholder
                                comentarios={[{ id: 1, texto: "Comentário 1" }, { id: 2, texto: "Comentário 2" }]} // Placeholder
                                anexos={[{ id: 1, nome: "Arquivo 1.pdf" }, { id: 2, nome: "Imagem 1.png" }, { id: 3, nome: "Documento 1.docx" }]} // Placeholder
                                imageUrl={profissionalImageUrl} // Imagem do profissional
                            />
                        ))}
                    </div>
                    <ModalNovaTarefa departamentoId={selectedDepartamento} />
                </div>
                <ModalNovaColuna projetoId={selectedProjeto} />
            </div>
        </div>
    );
}
