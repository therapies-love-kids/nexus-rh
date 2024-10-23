import { useState, SetStateAction } from 'react';
import { Breadcrumbs, Modal, PasswordInput, DateInput, TextInput, SelectWithBadges, CPFInput, Table, } from "@/components";
import { Link } from 'react-router-dom';
import { IoArrowBack, IoPerson } from 'react-icons/io5';
import { useDepartamentos, useEmpresas, useFuncoes, useUnidades } from "@/hooks/hookProfissionais"
import { FaCopy } from 'react-icons/fa';

export default function NovoProfissional() {
    const [nome, setNome] = useState('');
    const [senha, setSenha] = useState('123');
    const [dataIngressoEmpresa, setDataIngressoEmpresa] = useState<Date | null>(null);
    const [cpf, setCpf] = useState('');
    
    const [modalMessage, setModalMessage] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [unidadeIds, setUnidadeIds] = useState<number[]>([]);
    const [empresaIds, setEmpresasIds] = useState<number[]>([]);
    const [departamentoIds, setDepartamentosIds] = useState<number[]>([]);
    const [funcaoIds, setFuncoesIds] = useState<number[]>([]);

    const unidades = useUnidades(); // Use seu hook
    const empresas = useEmpresas(); // Use seu hook
    const departamentos = useDepartamentos(); // Use seu hook
    const funcoes = useFuncoes(); // Use seu hook

    const isButtonDisabledStep1 = (!nome || !senha || !dataIngressoEmpresa || !cpf);
    const isButtonDisabledStep2 = (!unidadeIds.length || !departamentoIds.length || !funcaoIds.length);
    const isButtonDisabledStep3 = (!empresaIds.length);

    const [showPassword, setShowPassword] = useState<boolean>(false);

    const resetForm = () => {
        setNome('');
        setSenha('123');
        setDataIngressoEmpresa(null);
        setCpf('');
        setUnidadeIds([]);
        setEmpresasIds([]);
        setDepartamentosIds([]);
        setFuncoesIds([]);
    };

    const handleCopyToClipboard = () => {
        const text =
            `Departamentos: ${departamentos.filter(d => departamentoIds.includes(d.departamento_id)).map(d => d.departamento).join(', ')}
            Login: ${nome}
            Senha provisória: ${senha}`;
        navigator.clipboard.writeText(text)
            .then(() => console.log('Texto copiado para a área de transferência!'))
            .catch((error) => console.error('Erro ao copiar o texto:', error));
    };

    const [step, setStep] = useState(1);
    const totalSteps = 3;

    const handleNext = () => {
        if (step < totalSteps) setStep(step + 1);
    };

    const handlePrevious = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        resetForm();
    };


    return (
        <div className='bg-base-200 min-h-screen'>
            <Breadcrumbs />

            <div className="px-24 rounded">
                <div className="card bg-base-100 shadow-xl w-full my-10">
                    <div className="card-body">
                        <div className=' flex flex-row items-center gap-2'>
                            <Link to={'/profissionais'}>
                                <button className="btn btn-ghost w-full"><IoArrowBack /></button>
                            </Link>
                            <p className="card-title m-0 p-0">
                                Adicionar Novo Profissional
                            </p>
                        </div>

                        {step === 1 && (
                            <div>
                                <TextInput
                                    label="Nome do profissional"
                                    value={nome}
                                    onChange={(e: { target: { value: SetStateAction<string>; }; }) => setNome(e.target.value)}
                                    type="text"
                                    icon={<IoPerson />}
                                />

                                <PasswordInput
                                    label="Senha provisória"
                                    value={senha}
                                    onChange={(e) => setSenha(e.target.value)}
                                    showPassword={showPassword}
                                    togglePassword={() => setShowPassword(!showPassword)}
                                />
                                <div className="label">
                                    <span className="label-text-alt">Padrão: <b>123</b></span>
                                </div>

                                <DateInput
                                    label="Data de Ingresso na Empresa"
                                    value={dataIngressoEmpresa}
                                    onChange={(value: SetStateAction<Date | null>) => {
                                        if (value && !Array.isArray(value)) {
                                            setDataIngressoEmpresa(value);
                                        }
                                    }}
                                />

                                <CPFInput
                                    label="CPF"
                                    value={cpf}
                                    onChange={(e) => setCpf(e.target.value)}
                                />
                            </div>
                        )}

                        {step === 2 && (
                            <div>
                                <h2 className="text-lg font-semibold mb-4">Selecione as Unidades, Departamentos e Funções</h2>
                                
                                <SelectWithBadges
                                    label="Unidades"
                                    options={unidades.map(unidade => ({ id: unidade.unidade_id, name: unidade.unidade }))}
                                    selectedIds={unidadeIds}
                                    onSelectionChange={setUnidadeIds}
                                />
                                
                                <SelectWithBadges
                                    label="Departamentos"
                                    options={departamentos.map(departamento => ({ id: departamento.departamento_id, name: departamento.departamento }))}
                                    selectedIds={departamentoIds}
                                    onSelectionChange={setDepartamentosIds}
                                />
                                
                                <SelectWithBadges
                                    label="Funções"
                                    options={funcoes.map(funcao => ({ id: funcao.funcao_id, name: funcao.funcao }))}
                                    selectedIds={funcaoIds}
                                    onSelectionChange={setFuncoesIds}
                                />
                            </div>
                        )}

                        {step === 3 && (
                            <div>
                                <div className="form-control mt-4">
                                    <Table
                                        columns={[
                                            { header: '', accessor: 'select' },
                                            { header: 'Empresa', accessor: 'empresa' },
                                            { header: 'CNPJ', accessor: 'cnpj' },
                                        ]}
                                        data={empresas.map(empresa => ({
                                            select: (
                                                <input
                                                    type="checkbox"
                                                    value={empresa.empresa_id}
                                                    checked={empresaIds.includes(empresa.empresa_id)}
                                                    onChange={() => {
                                                        if (empresaIds.includes(empresa.empresa_id)) {
                                                            setEmpresasIds(empresaIds.filter(id => id !== empresa.empresa_id));
                                                        } else {
                                                            setEmpresasIds([...empresaIds, empresa.empresa_id]);
                                                        }
                                                    }}
                                                    className="checkbox"
                                                />
                                            ),
                                            empresa: empresa.empresa,
                                            cnpj: empresa.cnpj,
                                        }))}
                                        onRowSelect={() => {}} // Lógica de seleção de linha não é necessária aqui
                                    />
                                </div>
                            </div>
                        )}

                        {/* Navegação entre os passos */}
                        <div className="mt-10 flex justify-between">
                            <button
                                className="btn"
                                onClick={handlePrevious}
                                disabled={step === 1}
                            >
                                Voltar
                            </button>
                            {
                                step === 1 ? (
                                    <div className="tooltip tooltip-bottom" data-tip={isButtonDisabledStep1 ? "Preencha todos os campos obrigatórios" : null}>
                                        <button className="btn" onClick={handleNext} disabled={isButtonDisabledStep1}>
                                            Próximo
                                        </button>
                                    </div>
                                ) : step === 2 ? (
                                    <div className="tooltip tooltip-bottom" data-tip={isButtonDisabledStep2 ? "Preencha todos os campos obrigatórios" : null}>
                                        <button className="btn" onClick={handleNext} disabled={isButtonDisabledStep2}>
                                            Próximo
                                        </button>
                                    </div>
                                ) : (
                                    <div className="tooltip tooltip-bottom" data-tip={isButtonDisabledStep3 ? "Preencha todos os campos obrigatórios" : null}>
                                        <button className="btn btn-success" onClick={handleNext} disabled={isButtonDisabledStep3}>
                                            Adicionar Profissional
                                        </button>
                                    </div>
                                )
                            }
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <Modal 
                    type={modalMessage?.includes('sucesso') ? 'success' : 'error'} 
                    message={modalMessage || ''} 
                    onClose={handleCloseModal}
                >
                    <p>{modalMessage}</p>
                    {modalMessage?.includes('sucesso') && (
                        <>
                            <div className="mockup-code relative w-full my-10">
                                <pre data-prefix="1">Departamento: {departamentos.join(', ')} </pre>
                                <pre data-prefix="2">Profissional: {nome}</pre>
                                <pre data-prefix="3">Senha provisória: {senha}</pre>
                                <button
                                    className="absolute z-10 top-4 right-4 cursor-pointer hover:text-secondary"
                                    onClick={handleCopyToClipboard}
                                >
                                <FaCopy/></button>
                            </div>
                        </>
                    )}
                    
                </Modal>
            )}
        </div>
    );
}
