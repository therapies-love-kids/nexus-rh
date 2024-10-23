import { useState, SetStateAction } from 'react';
import { Steps, PasswordInput, DateInput, TextInput, SelectWithBadges, CPFInput, Table, } from "@/components";
import { IoPerson } from 'react-icons/io5';
import { useDepartamentos, useEmpresas, useFuncoes, useUnidades } from "@/hooks/hookProfissionais"
import { FaCopy } from 'react-icons/fa';
import { LayoutDashTable } from '@/Layout';

export default function NovoProfissional() {
    const [nome, setNome] = useState('');
    const [senha, setSenha] = useState('123');
    const [dataIngressoEmpresa, setDataIngressoEmpresa] = useState<Date | null>(null);
    const [cpf, setCpf] = useState('');
    
    const [modalMessage] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [unidadeIds, setUnidadeIds] = useState<number[]>([]);
    const [empresaIds, setEmpresasIds] = useState<number[]>([]);
    const [departamentoIds, setDepartamentosIds] = useState<number[]>([]);
    const [funcaoIds, setFuncoesIds] = useState<number[]>([]);

    const unidades = useUnidades();
    const empresas = useEmpresas();
    const departamentos = useDepartamentos();
    const funcoes = useFuncoes();

    const [step, setStep] = useState(1);

    const isButtonDisabled = (currentStep: number) => {
        if (currentStep === 1) {
            return (!nome || !senha || !dataIngressoEmpresa || !cpf);
        } else if (currentStep === 2) {
            return (!unidadeIds.length || !departamentoIds.length || !funcaoIds.length);
        } else if (currentStep === 3) {
            return (!empresaIds.length);
        }
        return false;
    };

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
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        resetForm();
    };

    return (
        <LayoutDashTable
            modal={isModalOpen ? { type: 'success', message: modalMessage || '',onClose: handleCloseModal } : null}
            cardtitle='Adicionar Profissional'
        >

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
                    <h2 className="text-lg font-semibold mb-4">Selecione as Categorias</h2>
                    
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
                            onRowSelect={() => {}}
                        />
                    </div>
                </div>
            )}

            <Steps
                totalSteps={3}
                isButtonDisabled={isButtonDisabled}
                nextButtonText={step === 3 ? 'Finalizar' : 'Próximo'}
                backButtonText='Voltar'
                onStepChange={setStep}
            />

            {isModalOpen && (
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
            )}

        </LayoutDashTable>
    
    )
}
