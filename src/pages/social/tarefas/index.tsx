import { fetchImageFromFtp } from "@/utils/imageUtils";
import { useEffect, useState } from "react";
import { IoAdd, IoPencil, IoSettings } from "react-icons/io5";
import Filtros from "@/components/FiltrosTarefas";
import Tarefa from "@/components/Tarefa";
import ModalNovoProjeto from "@/components/ModalNovoProjeto";

export default function SocialTarefas() {
    const storedDepartamentoId = localStorage.getItem('departamento_id');
    const storedProfissionalId = localStorage.getItem('profissional_id');

    const [selectedDepartamento, setSelectedDepartamento] = useState<number | undefined>(storedDepartamentoId ? parseInt(storedDepartamentoId, 10) : undefined);
    const [departamentos, setDepartamentos] = useState<{ departamento_id: number, departamento: string }[]>([]);
    const [selectedProfissional, setSelectedProfissional] = useState<number | null>(storedProfissionalId ? parseInt(storedProfissionalId, 10) : null);
    const [profissional_id] = useState<number | null>(storedProfissionalId ? parseInt(storedProfissionalId, 10) : null);
    const [profissionais, setProfissionais] = useState<{ profissional_id: number; profissional_nome: string }[]>([]);
    const [filtroProfissionalNome, setFiltroProfissionalNome] = useState<string>(''); 

    const [imageUrls, setImageUrls] = useState<Record<number, string>>({});
    const [projetos, setProjetos] = useState<{ projeto_id: number, projeto_nome: string }[]>([]);
    const [selectedProjeto, setSelectedProjeto] = useState<number | undefined>(undefined);
    const [isFirstLoad, setIsFirstLoad] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);
    const fetchProfissionais = async (departamentoId: number) => {
        try {
            const result = await window.ipcRenderer.invoke('query-database-postgres', `
                SELECT profissional_id, profissional_nome 
                FROM profissionais 
                WHERE profissional_id IN (
                    SELECT profissional_id 
                    FROM profissionais_departamento_associacao 
                    WHERE departamento_id = $1
                ) AND profissional_status1 = 'ativo'`, 
                [departamentoId]
            );
            setProfissionais(result);

            if (selectedProfissional && isFirstLoad) {
                const profissional = result.find((p: { profissional_id: number }) => p.profissional_id === selectedProfissional);
                if (profissional) {
                    setFiltroProfissionalNome(profissional.profissional_nome);
                }
                setIsFirstLoad(false);
            }
        } catch (error) {
            console.error('Erro ao buscar profissionais:', error);
        }
    };

    const [tarefas, setTarefas] = useState<{ 
        tarefa_id: number; 
        tarefa_titulo: string; 
        tarefa_descricao: string; 
        tarefa_status: string; 
        tarefa_prioridade: any; 
        tarefa_data_criacao: string; 
        tarefa_data_vencimento: string; 
        tarefa_departamento_id: number; 
        tarefa_unidade_id: number; 
        funcao_id: number; 
        tarefa_atribuida_por: number; 
        tarefa_projeto_id: number; 
    }[]>([]);

    const fetchTarefas = async (departamentoId: number) => {
        try {
            const result = await window.ipcRenderer.invoke(
                'query-database-postgres',
                `SELECT tarefa_id, tarefa_titulo, tarefa_descricao, tarefa_status, tarefa_prioridade, tarefa_data_criacao, tarefa_data_vencimento, tarefa_departamento_id, tarefa_unidade_id, funcao_id, tarefa_atribuida_por, tarefa_projeto_id 
                    FROM tarefas 
                    WHERE tarefa_departamento_id = $1`,
                [departamentoId]
            );
            setTarefas(result);
        } catch (error) {
            console.error('Erro ao buscar tarefas:', error);
        }
    };

    useEffect(() => {
        const fetchDepartamentos = async () => {
            const result = await window.ipcRenderer.invoke(
                'query-database-postgres',
                `SELECT departamento_id, departamento FROM profissionais_departamento WHERE departamento_status1 = 'ativo'`
            );
            setDepartamentos(result);
            if (selectedDepartamento) {
                fetchProfissionais(selectedDepartamento);
            }
        };
        fetchDepartamentos();
    }, [selectedDepartamento]);

    useEffect(() => {
        if (selectedDepartamento) {
            fetchProfissionais(selectedDepartamento);
            fetchTarefas(selectedDepartamento);
        }
    }, [selectedDepartamento]);

    useEffect(() => {
        const fetchProfissionalData = async () => {
            if (profissional_id) {
                const result = await window.ipcRenderer.invoke(
                    'query-database-postgres',
                    `SELECT profissional_foto FROM profissionais WHERE profissional_id = ${profissional_id}`
                );
                const profissional = result[0];
                const imageUrl = await fetchImageFromFtp(profissional.profissional_foto);
                if (profissional_id) {
                    setImageUrls({ [profissional_id]: imageUrl });
                }
            }
        };

        const fetchProjetos = async () => {
            const result = await window.ipcRenderer.invoke(
                'query-database-postgres',
                `SELECT projeto_id, projeto_nome FROM tarefas_projetos WHERE projeto_status = 'ativo'`
            );
            setProjetos(result);
        };

        fetchProfissionalData();
        fetchProjetos();
    }, [profissional_id]);

    return (
        <div className="">
            <div className="h-28 p-10 flex items-center justify-between gap-10">
                <div className="flex items-center">
                    <h2 className="text-2xl">Tarefas</h2>
                </div>

                <div className="flex items-center gap-10">
                    <Filtros 
                        departamentos={departamentos} // Passando departamentos
                        selectedDepartamento={selectedDepartamento} 
                        setSelectedDepartamento={setSelectedDepartamento}
                        projetos={projetos} // Passando projetos
                        selectedProjeto={selectedProjeto} 
                        setSelectedProjeto={setSelectedProjeto}
                        profissionais={profissionais} 
                        selectedProfissional={selectedProfissional} 
                        setSelectedProfissional={setSelectedProfissional}
                        filtroProfissionalNome={filtroProfissionalNome} 
                    />

                    <div className="dropdown dropdown-end">
                        <div tabIndex={0} role="button" className="btn btn-ghost"><IoSettings /></div>
                        <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
                            <li><button onClick={openModal}>Novo Projeto</button></li>
                            <li><a>Arquivar Projeto</a></li>
                            <li><a>Tarefas arquivadas</a></li>
                            <li><a>Projetos arquivados</a></li>
                        </ul>
                    </div>
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
                                key={tarefa.tarefa_id} // Adicione uma chave única
                                titulo={tarefa.tarefa_titulo}
                                prioridade={tarefa.tarefa_prioridade}
                                horas={5} // Ajuste este valor conforme necessário
                                subtarefas={[
                                    { nome: "Subtarefa 1", concluida: false }, // Exemplos, substitua por dados reais
                                    { nome: "Subtarefa 2", concluida: true }
                                ]}
                                comentarios={[
                                    { id: 1, texto: "Comentário 1" }, // Exemplos, substitua por dados reais
                                    { id: 2, texto: "Comentário 2" }
                                ]}
                                anexos={[
                                    { id: 1, nome: "Arquivo 1.pdf" }, // Exemplos, substitua por dados reais
                                    { id: 2, nome: "Imagem 1.png" },
                                    { id: 3, nome: "Documento 1.docx" }
                                ]}
                                imageUrl={profissional_id !== null ? imageUrls[profissional_id] : null}
                            />
                        ))}
                    </div>
                    <button className="btn btn-ghost">
                        <IoAdd /> Tarefa
                    </button>
                </div>
                <button className="btn btn-ghost">
                    <IoAdd /> Coluna
                </button>
            </div>
            <ModalNovoProjeto isOpen={isModalOpen} onClose={closeModal} />
        </div>
    );
}
