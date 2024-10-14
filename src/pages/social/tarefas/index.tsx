import { fetchImageFromFtp } from "@/utils/imageUtils";
import { useEffect, useState } from "react";
import { IoAdd, IoChatbox, IoClipboard, IoPencil, IoSettings, IoTime } from "react-icons/io5";
import Filtros from "@/components/FiltrosTarefas";

export default function SocialTarefas() {
    const storedProfissionalId = localStorage.getItem('profissional_id');
    const [profissional_id] = useState<number | null>(storedProfissionalId ? parseInt(storedProfissionalId, 10) : null);
    const [imageUrls, setImageUrls] = useState<Record<number, string>>({});
    const [departamentos, setDepartamentos] = useState<{ departamento_id: number, departamento: string }[]>([]);
    const [projetos, setProjetos] = useState<{ projeto_id: number, projeto: string }[]>([]);

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
                    setImageUrls({ [profissional_id.toString()]: imageUrl });
                }
            }
        };

        const fetchDepartamentos = async () => {
            const result = await window.ipcRenderer.invoke(
                'query-database-postgres',
                `SELECT departamento_id, departamento FROM profissionais_departamento WHERE departamento_status1 = 'ativo'`
            );
            setDepartamentos(result);
        };

        // Adicione aqui a função para buscar os projetos
        const fetchProjetos = async () => {
            const result = await window.ipcRenderer.invoke(
                'query-database-postgres',
                `SELECT projeto_id, projeto_nome FROM tarefas_projetos WHERE projeto_status = 'ativo'` // Modifique conforme necessário
            );
            setProjetos(result);
        };

        fetchProfissionalData();
        fetchDepartamentos();
        fetchProjetos();  // Chame a função para buscar projetos
    }, [profissional_id]);


    return (
        <div className="">
            <div className="h-28 p-10 flex items-center justify-between gap-10">
                <div className="flex items-center">
                    <h2 className="text-2xl">Tarefas</h2>
                </div>

                <div className="flex items-center gap-10">

                    <select className="select select-ghost">
                        <option selected disabled>Selecione um Departamento</option>
                        {departamentos.map((dep) => (
                            <option key={dep.departamento_id} value={dep.departamento_id}>
                                {dep.departamento}
                            </option>
                        ))}
                    </select>

                    <select className="select select-ghost">
                        <option selected disabled>Selecione um Projeto</option>
                        {projetos.map((proj) => (
                            <option key={proj.projeto_id} value={proj.projeto_id}>
                                {proj.projeto}
                            </option>
                        ))}
                    </select>

                    <Filtros />
                    <div className="dropdown dropdown-end">
                        <div tabIndex={0} role="button" className="btn btn-ghost"><IoSettings /></div>
                        <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
                            <li><a>Novo Projeto</a></li>
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
                        <div className="border-base-300 border-2 p-2 rounded-xl border-dashed min-h-28 mb-5">
                            <div className="badge badge-primary">
                                Prioridade baixa
                            </div>
                            <div className="badge badge-warning">
                                Prioridade média
                            </div>
                            <div className="badge badge-error">
                                Prioridade alta
                            </div>
                            <h2 className="mt-5 text-xl">Título da tarefa</h2>
                            <div className="flex items-center gap-2">
                                {profissional_id !== null && imageUrls[profissional_id] && (
                                    <img src={imageUrls[profissional_id]} alt="foto" className="w-8 aspect-square object-cover rounded-full" />
                                )}
                                <div className="flex items-center justify-center rounded-full border-2 border-dashed aspect-square w-8"><IoAdd /></div>
                            </div>
                            <h2 className="mt-10">Subtarefas</h2>
                            <div>
                                <div className="form-control">
                                    <label className="label cursor-pointer gap-3 w-fit">
                                        <input type="checkbox" defaultChecked className="checkbox" />
                                        <span className="label-text">Subtarefa 1</span>
                                    </label>
                                </div>
                            </div>
                            <div className="divider mb-2"></div>
                            <div className="flex items-center justify-between text-sm mb-2">
                                <div className="flex items-center gap-2"><IoTime />5h</div>
                                <div className="flex items-center gap-2"><IoChatbox />1</div>
                                <div className="flex items-center gap-2"><IoClipboard />3</div>
                            </div>
                        </div>
                    </div>
                    <button className="btn btn-ghost">
                        <IoAdd /> Tarefa
                    </button>
                </div>
                <button className="btn btn-ghost">
                    <IoAdd /> Coluna
                </button>
            </div>
        </div>
    );
}