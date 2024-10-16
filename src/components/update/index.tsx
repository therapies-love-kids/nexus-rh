import type { ProgressInfo } from 'electron-updater';
import { useCallback, useEffect, useState } from 'react';
import Progress from '@/components/update/Progress';

interface VersionInfo {
    update: boolean;
    version: string;
    newVersion?: string;
}

interface ErrorType {
    message: string;
}

interface UpdateProps {
    children: React.ReactNode;
}

const Update: React.FC<UpdateProps> = ({ children }) => {
    const [verificando, setVerificando] = useState(false);
    const [atualizacaoDisponivel, setAtualizacaoDisponivel] = useState(false);
    const [informacoesVersao, setInformacoesVersao] = useState<VersionInfo>();
    const [erroAtualizacao, setErroAtualizacao] = useState<ErrorType>();
    const [informacoesProgresso, setInformacoesProgresso] = useState<Partial<ProgressInfo>>();
    const [botoesModal, setBotoesModal] = useState<{
        textoCancelar?: string;
        textoConfirmar?: string;
        aoCancelar?: () => void;
        aoConfirmar?: () => void;
    }>({
        aoCancelar: () => {
            const modal = document.getElementById('my_modal_5') as HTMLDialogElement;
            if (modal) modal.close();
        },
        aoConfirmar: () => {
            if (!simulacao) {
                window.ipcRenderer.invoke('start-download');
            } else {
                // Simulação: Se estiver em modo de simulação, não faz o download real
                console.log("Simulação: A atualização não será baixada.");
            }
        },
    });

    const simulacao = false; // Defina aqui se você quer estar em modo de simulação

    const verificarAtualizacao = async () => {
        setVerificando(true);
        if (!simulacao) {
            const resultado = await window.ipcRenderer.invoke('check-update');
            setInformacoesProgresso({ percent: 0 });
            setVerificando(false);
            const modal = document.getElementById('my_modal_5') as HTMLDialogElement;
            if (modal) modal.showModal();

            if (resultado?.error) {
                setAtualizacaoDisponivel(false);
                setErroAtualizacao(resultado?.error);
            }
        } else {
            // Modo de simulação
            setInformacoesVersao({ update: true, version: '1.0.0', newVersion: '1.1.0' });
            setAtualizacaoDisponivel(true);
            setInformacoesProgresso({ percent: 50 }); // Simulação de progresso
            setVerificando(false);
            const modal = document.getElementById('my_modal_5') as HTMLDialogElement;
            if (modal) modal.showModal();
        }
    };

    const aoAtualizacaoDisponivel = useCallback((_event: Electron.IpcRendererEvent, arg1: VersionInfo) => {
        setInformacoesVersao(arg1);
        setErroAtualizacao(undefined);
        if (arg1.update) {
            setBotoesModal(estado => ({
                ...estado,
                textoCancelar: 'Cancelar',
                textoConfirmar: 'Atualizar',
                aoConfirmar: () => {
                    if (!simulacao) {
                        window.ipcRenderer.invoke('start-download');
                    }
                },
            }));
            setAtualizacaoDisponivel(true);
        } else {
            setAtualizacaoDisponivel(false);
        }
    }, [simulacao]);

    const aoErroAtualizacao = useCallback((_event: Electron.IpcRendererEvent, arg1: ErrorType) => {
        setAtualizacaoDisponivel(false);
        setErroAtualizacao(arg1);
    }, []);

    const aoProgressoDownload = useCallback((_event: Electron.IpcRendererEvent, arg1: ProgressInfo) => {
        setInformacoesProgresso(arg1);
    }, []);

    const aoAtualizacaoBaixada = useCallback(() => {
        setInformacoesProgresso({ percent: 100 });
        setBotoesModal(estado => ({
            ...estado,
            textoCancelar: 'Depois',
            textoConfirmar: 'Instalar agora',
            aoConfirmar: () => {
                if (!simulacao) {
                    window.ipcRenderer.invoke('quit-and-install');
                }
            },
        }));
    }, [simulacao]);

    useEffect(() => {
        window.ipcRenderer.on('update-can-available', aoAtualizacaoDisponivel);
        window.ipcRenderer.on('update-error', aoErroAtualizacao);
        window.ipcRenderer.on('download-progress', aoProgressoDownload);
        window.ipcRenderer.on('update-downloaded', aoAtualizacaoBaixada);

        return () => {
            window.ipcRenderer.off('update-can-available', aoAtualizacaoDisponivel);
            window.ipcRenderer.off('update-error', aoErroAtualizacao);
            window.ipcRenderer.off('download-progress', aoProgressoDownload);
            window.ipcRenderer.off('update-downloaded', aoAtualizacaoBaixada);
        };
    }, []);

    return (
        <>
            <dialog id="my_modal_5" className="modal">
                <div className="modal-box card-body text-left">
                    {erroAtualizacao ? (
                        <>
                            <h3 className="card-title font-bold text-lg mb-5">Erro</h3>
                            <div className='mb-5 w-full'>
                                <p className="mb-5">Erro ao baixar a última versão.</p>
                                <p>{erroAtualizacao.message}</p>
                            </div>
                        </>
                    ) : atualizacaoDisponivel ? (
                        <>
                            <h3 className="card-title font-bold text-lg mb-5">Atualização Disponível</h3>
                            <div className='mb-5 w-full'>
                                <div className='w-full flex justify-between'>
                                    <div>
                                        v{informacoesVersao?.version}
                                    </div>
                                    <div>
                                        v{informacoesVersao?.newVersion}
                                    </div>
                                </div>
                                <Progress percent={informacoesProgresso?.percent}></Progress>
                            </div>
                        </>
                    ) : (
                        <>
                            <h3 className="card-title font-bold text-lg mb-5">Nenhuma Atualização Disponível</h3>
                            <p className="mb-5 w-full">{JSON.stringify(informacoesVersao ?? {}, null, 2)}</p>
                        </>
                    )}
                    <div className="card-actions w-full justify-between">
                        <button className="btn btn-neutral" onClick={botoesModal.aoCancelar}>
                            {botoesModal.textoCancelar || 'Fechar'}
                        </button>
                        {atualizacaoDisponivel && (
                            <button className="btn btn-success" onClick={botoesModal.aoConfirmar}>
                                {botoesModal.textoConfirmar || 'Avançar'}
                            </button>
                        )}
                    </div>
                </div>
            </dialog>

            {/* O botão passado como children será renderizado aqui */}
            <div onClick={verificarAtualizacao}>
                {children}
            </div>
        </>
    );
};

export default Update;
