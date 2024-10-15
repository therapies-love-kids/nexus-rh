import { useState, useEffect } from 'react';
import { IoClose, IoFilter, IoCalendar } from 'react-icons/io5';
import DatePicker from 'react-date-picker';

interface FiltrosState {
    data: { de: Date | null; ate: Date | null };
    profissional: string;
    prioridade: string;
    departamento: number | undefined;
    projeto: number | undefined;
}

interface FiltrosProps {
    departamentos: { departamento_id: number; departamento: string }[];
    selectedDepartamento: number | undefined;
    setSelectedDepartamento: React.Dispatch<React.SetStateAction<number | undefined>>;
    projetos: { projeto_id: number; projeto_nome: string }[];
    selectedProjeto: number | undefined;
    setSelectedProjeto: React.Dispatch<React.SetStateAction<number | undefined>>;
    profissionais: { profissional_id: number; profissional_nome: string }[];
    selectedProfissional: number | null;
    setSelectedProfissional: React.Dispatch<React.SetStateAction<number | null>>;
    filtroProfissionalNome: string; 
}

const Filtros = ({ departamentos, selectedDepartamento, setSelectedDepartamento, projetos, selectedProjeto, setSelectedProjeto, profissionais, selectedProfissional, setSelectedProfissional, filtroProfissionalNome }: FiltrosProps) => {

    const [filtros, setFiltros] = useState<FiltrosState>({
        data: { de: null, ate: null },
        profissional: selectedProfissional ? selectedProfissional.toString() : '',
        prioridade: '',
        departamento: selectedDepartamento,
        projeto: selectedProjeto
    });

    const handleProfissionalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const profissionalId = Number(e.target.value);
        setSelectedProfissional(profissionalId);
        setFiltros(prev => ({ ...prev, profissional: profissionalId.toString() }));
    };

    useEffect(() => {
        if (selectedProfissional) {
            setFiltros(prev => ({ ...prev, profissional: selectedProfissional.toString() }));
        }
    }, [selectedProfissional]);

    const adicionarFiltro = (tipo: string, valor: any) => {
        setFiltros(prev => ({
            ...prev,
            [tipo]: valor
        }));
    };

    const removerFiltro = (tipo: string) => {
        setFiltros(prev => ({
            ...prev,
            [tipo]: tipo === 'data' ? { de: null, ate: null } : tipo === 'departamento' ? undefined : tipo === 'projeto' ? undefined : ''
        }));
        // Resetando os estados correspondentes
        if (tipo === 'departamento') {
            setSelectedDepartamento(undefined);
        }
        if (tipo === 'projeto') {
            setSelectedProjeto(undefined);
        }
    };

    return (
        <div className="flex items-center gap-5">
            {filtros.data.de && filtros.data.ate && (
                <div className="badge badge-primary gap-10">
                    {filtros.data.de.toLocaleDateString()} até {filtros.data.ate.toLocaleDateString()}
                    <button onClick={() => removerFiltro('data')}>
                        <IoClose />
                    </button>
                </div>
            )}
            {filtroProfissionalNome && (
                <div className="badge badge-primary gap-10">
                    {filtroProfissionalNome}
                    <button onClick={() => removerFiltro('profissional')}>
                        <IoClose />
                    </button>
                </div>
            )}
            {filtros.prioridade && (
                <div className="badge badge-primary gap-10">
                    {filtros.prioridade}
                    <button onClick={() => removerFiltro('prioridade')}>
                        <IoClose />
                    </button>
                </div>
            )}
            {filtros.departamento && (
                <div className="badge badge-primary gap-10">
                    {departamentos.find(dep => dep.departamento_id === filtros.departamento)?.departamento}
                    <button onClick={() => removerFiltro('departamento')}>
                        <IoClose />
                    </button>
                </div>
            )}
            {filtros.projeto && (
                <div className="badge badge-primary gap-10">
                    {projetos.find(proj => proj.projeto_id === filtros.projeto)?.projeto_nome}
                    <button onClick={() => removerFiltro('projeto')}>
                        <IoClose />
                    </button>
                </div>
            )}

            <div className="dropdown dropdown-end">
                <div className="btn btn-ghost gap-5" tabIndex={3} role="button">
                    Filtros <IoFilter />
                </div>
                <div tabIndex={3} className="dropdown-content card bg-base-100 w-[50vw] shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title mb-5">Filtros</h2>

                        <div>
                            <span className="label-text">Data</span>
                            <div className="flex items-center gap-5 mb-5">
                                <label className="input input-bordered flex items-center gap-2 w-full">
                                    <span className="label-text">de</span>
                                    <DatePicker
                                        format="dd/MM/y"
                                        className="w-full custom-datepicker"
                                        calendarIcon={<IoCalendar />}
                                        clearIcon={<IoClose />}
                                        dayPlaceholder="dd"
                                        monthPlaceholder="mm"
                                        yearPlaceholder="aaaa"
                                        value={filtros.data.de}
                                        onChange={(date) => adicionarFiltro('data', { ...filtros.data, de: date })}
                                    />
                                </label>
                                <label className="input input-bordered flex items-center gap-2 w-full">
                                    <span className="label-text">até</span>
                                    <DatePicker
                                        format="dd/MM/y"
                                        className="w-full custom-datepicker"
                                        calendarIcon={<IoCalendar />}
                                        clearIcon={<IoClose />}
                                        dayPlaceholder="dd"
                                        monthPlaceholder="mm"
                                        yearPlaceholder="aaaa"
                                        value={filtros.data.ate}
                                        onChange={(date) => adicionarFiltro('data', { ...filtros.data, ate: date })}
                                    />
                                </label>
                            </div>
                        </div>

                        <div className="mb-5">
                            <span className="label-text">Departamentos</span>
                            <select className="select select-bordered w-full" value={selectedDepartamento} onChange={e => {
                                const departamentoId = Number(e.target.value);
                                setSelectedDepartamento(departamentoId);
                                adicionarFiltro('departamento', departamentoId);
                            }}>
                                <option value="">Selecionar Departamento</option>
                                {departamentos.map(departamento => (
                                    <option key={departamento.departamento_id} value={departamento.departamento_id}>
                                        {departamento.departamento}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-5">
                            <span className="label-text">Projetos</span>
                                <select className="select select-bordered w-full" value={selectedProjeto} onChange={e => {
                                    const projetoId = Number(e.target.value);
                                    setSelectedProjeto(projetoId);
                                    adicionarFiltro('projeto', projetoId);
                                }}>
                                <option value="">Selecionar Projeto</option>
                                {projetos.map(projeto => (
                                    <option key={projeto.projeto_id} value={projeto.projeto_id}>
                                        {projeto.projeto_nome}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-5">
                            <span className="label-text">Profissionais</span>
                            <select 
                                className="select select-bordered w-full" 
                                value={selectedProfissional ?? ''} 
                                onChange={handleProfissionalChange}
                            >
                                <option value="" disabled>Selecione um Profissional</option>
                                {profissionais.map((profissional) => (
                                    <option key={profissional.profissional_id} value={profissional.profissional_id}>
                                        {profissional.profissional_nome}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-5">
                            <span className="label-text">Prioridade</span>
                            <select
                                className="select select-bordered w-full"
                                value={filtros.prioridade}
                                onChange={(e) => adicionarFiltro('prioridade', e.target.value)}
                            >
                                <option disabled>Selecionar</option>
                                <option>Baixa</option>
                                <option>Média</option>
                                <option>Alta</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Filtros;
