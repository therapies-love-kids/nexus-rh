import { useState } from 'react';
import { IoClose, IoFilter, IoCalendar } from 'react-icons/io5';
import DatePicker from 'react-date-picker';

interface FiltrosState {
    data: { de: Date | null, ate: Date | null };
    membro: string;
    prioridade: string;
}

const Filtros = () => {
    const [filtros, setFiltros] = useState<FiltrosState>({
        data: { de: null, ate: null },
        membro: '',
        prioridade: ''
    });

    const adicionarFiltro = (tipo: string, valor: any) => {
        setFiltros(prev => ({
            ...prev,
            [tipo]: valor
        }));
    };

    const removerFiltro = (tipo: string) => {
        setFiltros(prev => ({
            ...prev,
            [tipo]: tipo === 'data' ? { de: null, ate: null } : ''
        }));
    };

    return (
        <div className="flex items-center gap-5">
            {/* Exibindo badges apenas se filtros estiverem selecionados */}
            {filtros.data.de && filtros.data.ate && (
                <div className="badge badge-primary gap-10">
                    {filtros.data.de.toLocaleDateString()} até {filtros.data.ate.toLocaleDateString()}
                    <button onClick={() => removerFiltro('data')}>
                        <IoClose />
                    </button>
                </div>
            )}
            {filtros.membro && (
                <div className="badge badge-primary gap-10">
                    {filtros.membro}
                    <button onClick={() => removerFiltro('membro')}>
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

            <div className="dropdown dropdown-end">
                <div className="btn btn-ghost gap-5" tabIndex={3} role="button">
                    Filtros <IoFilter/>
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
                                        value={filtros.data.de}  // Adicionei o value para vincular ao estado
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
                                        value={filtros.data.ate}  // Adicionei o value aqui também
                                        onChange={(date) => adicionarFiltro('data', { ...filtros.data, ate: date })}
                                    />
                                </label>
                            </div>
                        </div>

                        <div className="mb-5">
                            <span className="label-text">Membros</span>
                            <select
                                className="select select-bordered w-full"
                                value={filtros.membro}
                                onChange={(e) => adicionarFiltro('membro', e.target.value)}
                            >
                                <option disabled selected>Selecionar</option>
                                <option>Pessoa 1</option>
                                <option>Pessoa 2</option>
                            </select>
                        </div>

                        <div className="mb-">
                            <span className="label-text">Prioridade</span>
                            <select
                                className="select select-bordered w-full"
                                value={filtros.prioridade}
                                onChange={(e) => adicionarFiltro('prioridade', e.target.value)}
                            >
                                <option disabled selected>Selecionar</option>
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
