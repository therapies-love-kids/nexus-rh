import { useState, useEffect, SetStateAction } from 'react';
import { Steps, PasswordInput, DateInput, TextInput, SelectWithBadges, SelectInput, CPFInput, Table, CheckboxInput } from "@/components";
import { IoPerson } from 'react-icons/io5';
import { useDepartamentos, useEmpresas, useFuncoes, useUnidades } from "@/hooks/hookProfissionais";
import { LayoutDashTable } from '@/Layout';
import { useProfissionaisEdit } from '@/hooks/hookProfissionais';
import { useParams } from 'react-router-dom';

export default function ProfissionaisEditar() {
    const { profissional_id } = useParams<{ profissional_id: string }>();
    const { handleSubmit, modalMessage, isModalOpen, handleCloseModal, modalType, profissionalData } = useProfissionaisEdit(Number(profissional_id));

    const [nome, setNome] = useState('');
    const [senha, setSenha] = useState('');
    const [dataIngressoEmpresa, setDataIngressoEmpresa] = useState<Date | null>(null);
    const [cpf, setCpf] = useState('');
    const [funcoesSelecionadas, setFuncoesSelecionadas] = useState<number[]>([]);
    const [funcoesPermissoes, setFuncoesPermissoes] = useState<{ [key: number]: { perm_editar: boolean; perm_criar: boolean; perm_inativar: boolean; perm_excluir: boolean; } }>({});
    
    const [unidadeIds, setUnidadeIds] = useState<number[]>([]);
    const [empresaIds, setEmpresasIds] = useState<number[]>([]);
    const [departamentoIds, setDepartamentosIds] = useState<number[]>([]);

    const unidades = useUnidades();
    const empresas = useEmpresas();
    const departamentos = useDepartamentos();
    const funcoes = useFuncoes();

    const [step, setStep] = useState(1);

    useEffect(() => {
        if (profissionalData) {
            setNome(profissionalData.profissional_nome || '');
            setSenha(profissionalData.profissional_senha || '');
            setDataIngressoEmpresa(profissionalData.profissional_dataingressoempresa || null);
            setCpf(profissionalData.profissional_cpf || '');
            setUnidadeIds(profissionalData.unidades.map((u: any) => u.unidade_id) || []);
            setEmpresasIds(profissionalData.empresas.map((e: any) => e.empresa_id) || []);
            setDepartamentosIds(profissionalData.departamentos.map((d: any) => d.departamento_id) || []);
            setFuncoesSelecionadas(profissionalData.funcoes.map((f: any) => f.funcao_id) || []);
            setFuncoesPermissoes(profissionalData.funcoes.reduce((acc: any, func: any) => {
                acc[func.funcao_id] = { 
                    perm_editar: func.perm_editar,
                    perm_criar: func.perm_criar,
                    perm_inativar: func.perm_inativar,
                    perm_excluir: func.perm_excluir
                };
                return acc;
            }, {}));
        }
    }, [profissionalData]);

    const isButtonDisabled = (currentStep: number) => {
        if (currentStep === 1) {
            return (!nome || !dataIngressoEmpresa || !cpf);
        } else if (currentStep === 2) {
            return (!unidadeIds.length || !departamentoIds.length || !funcoesSelecionadas.length);
        } else if (currentStep === 3) {
            return (!empresaIds.length);
        }
        return false;
    };

    const updatePermissao = (funcaoId: number, permissao: string, value: boolean) => {
        setFuncoesPermissoes(prev => ({
            ...prev,
            [funcaoId]: {
                ...prev[funcaoId],
                [permissao]: value,
            }
        }));
    };

    const handleFinalSubmit = () => {
        handleSubmit(nome, senha, dataIngressoEmpresa, cpf, unidadeIds, empresaIds, departamentoIds, funcoesSelecionadas, funcoesPermissoes);
    };

    const handleRowSelect = (row: any) => {
        const empresaId = row.empresa_id;

        if (empresaIds.includes(empresaId)) {
            setEmpresasIds(empresaIds.filter(id => id !== empresaId));
        } else {
            setEmpresasIds([...empresaIds, empresaId]);
        }
    };

    return (
        <LayoutDashTable
            modal={isModalOpen ? { type: modalType || 'info', message: modalMessage || '', onClose: handleCloseModal } : null}
            cardtitle='Editar Profissional'
        >
            {step === 1 && (
                <div>
                    <TextInput
                        label="Nome do profissional"
                        value={nome}
                        onChange={(e:any) => setNome(e.target.value)}
                        type="text"
                        icon={<IoPerson />}
                    />
                    <PasswordInput
                        label="Senha (deixe em branco para não alterar)"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                    />
                    <div className="label">
                        <span className="label-text-alt">Padrão: <b>123</b></span>
                    </div>
                    <DateInput
                        label="Data de Ingresso na Empresa"
                        value={dataIngressoEmpresa}
                        onChange={(value: SetStateAction<Date | null>) => setDataIngressoEmpresa(value)}
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
                    <SelectInput
                        label="Função"
                        options={funcoes.map(funcao => ({ id: funcao.funcao_id, name: funcao.funcao }))}
                        selectedId={funcoesSelecionadas[0] || null}
                        onSelectionChange={(id) => {
                            setFuncoesSelecionadas(id ? [id] : []);
                            if (id) {
                                setFuncoesPermissoes({ [id]: { perm_editar: false, perm_criar: false, perm_inativar: false, perm_excluir: false } });
                            } else {
                                setFuncoesPermissoes({});
                            }
                        }}
                    />

                {funcoesSelecionadas.map(funcaoId => (
                    <div key={funcaoId} className="my-4">
                        <h3 className="font-semibold">
                            {funcoes.find(funcao => funcao.funcao_id === funcaoId)?.funcao}
                        </h3>

                        <div className="gap-4">
                            <CheckboxInput
                                label="Permitir Edição"
                                checked={funcoesPermissoes[funcaoId]?.perm_editar || false}
                                onChange={(e) => updatePermissao(funcaoId, 'perm_editar', e.target.checked)}
                            />
                            <CheckboxInput
                                label="Permitir Criação"
                                checked={funcoesPermissoes[funcaoId]?.perm_criar || false}
                                onChange={(e) => updatePermissao(funcaoId, 'perm_criar', e.target.checked)}
                            />
                            <CheckboxInput
                                label="Permitir Inativação"
                                checked={funcoesPermissoes[funcaoId]?.perm_inativar || false}
                                onChange={(e) => updatePermissao(funcaoId, 'perm_inativar', e.target.checked)}
                            />
                            <CheckboxInput
                                label="Permitir Exclusão"
                                checked={funcoesPermissoes[funcaoId]?.perm_excluir || false}
                                onChange={(e) => updatePermissao(funcaoId, 'perm_excluir', e.target.checked)}
                            />
                        </div>
                    </div>
                ))}

                </div>
            )}

            {step === 3 && (
                <div>
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
                                    onChange={() => handleRowSelect({
                                        select: null,
                                        empresa: empresa.empresa,
                                        cnpj: empresa.cnpj,
                                        empresa_id: empresa.empresa_id,
                                    })}
                                    className="checkbox"
                                />
                            ),
                            empresa: empresa.empresa,
                            cnpj: empresa.cnpj,
                            empresa_id: empresa.empresa_id,
                        }))}
                        onRowSelect={handleRowSelect}
                    />
                </div>
            )}

            <Steps
                totalSteps={3}
                isButtonDisabled={isButtonDisabled}
                nextButtonText={step === 4 ? 'Finalizar' : 'Próximo'}
                backButtonText='Voltar'
                onStepChange={setStep}
                handleSubmit={handleFinalSubmit}
            />
        </LayoutDashTable>
    );
}
