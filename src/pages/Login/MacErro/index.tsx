import { IoArrowBack } from "react-icons/io5";
import { FaCopy } from "react-icons/fa";
import { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { Notification } from "@/components"; // Import do seu componente de notificação

export default function MacErro() {
    const [macAddress, setMacAddress] = useState<string | null>(null);
    const [notification, setNotification] = useState<{ type: 'info' | 'success' | 'error'; message: string } | null>(null);

    useEffect(() => {
        const fetchMacAddress = async () => {
            const mac = await window.ipcRenderer.invoke('get-mac-address');
            setMacAddress(mac);
        };

        fetchMacAddress();
    }, []);

    const handleCopyToClipboard = () => {
        if (macAddress) {
            navigator.clipboard.writeText(macAddress);
            setNotification({ type: 'success', message: 'MAC copiado para a área de transferência!' });
        }
    };

    const handleNotificationClose = () => {
        setNotification(null);
    };

    const handleReload = () => {
        window.location.reload();
    };

    return (
        <div className='bg-base-200 h-screen'>
            <div className="px-24 h-full w-full flex flex-col items-center justify-center">
                <div className="card bg-base-100 shadow-xl w-full">
                    <div className="card-body">
                        <div className='flex flex-row items-center gap-2'>
                            <Link to={"/"}>
                                <button className="btn btn-ghost">
                                    <IoArrowBack />
                                </button>
                            </Link>
                            <h2 className="card-title m-0 p-0">
                                Dispositivo não liberado
                            </h2>
                        </div>
                        <div className=" bg-base-200 shadow-inner rounded-xl p-6 flex flex-col justify-center gap-10">
                            <article className="prose flex flex-row gap-20 items-center">
                                <h1 className='text-9xl'>:(</h1>
                                <div className="flex flex-col gap-2">
                                    <h1>Ops...</h1>
                                    <h1>Dispositivo não autorizado</h1>
                                </div>
                            </article>
                        </div>

                        <div className="mockup-code relative w-full my-10">
                            <pre data-prefix="1"><code>Mac: {macAddress || 'Carregando...'}</code></pre>
                            <FaCopy
                                className='absolute z-10 top-4 right-4 cursor-pointer'
                                onClick={handleCopyToClipboard}
                            />
                        </div>

                        <h2 className="card-title mt-4">
                            Possíveis causas
                        </h2>
                        <ul className="list-disc list-inside">
                            <li>Você está tentando acessar o sistema de um dispositivo novo ou diferente.</li>
                            <li>O endereço MAC deste dispositivo pode ter sido alterado.</li>
                            <li>O registro do dispositivo no nosso servidor foi removido ou alterado.</li>
                        </ul>

                        <h2 className="card-title mt-4">
                            Como proceder?
                        </h2>
                        <ul className="list-disc list-inside">
                            <li>Certifique-se de que está usando o dispositivo correto autorizado para acessar o sistema.</li>
                            <li>Se for um dispositivo novo, copie o MAC acima e peça para um administrador adicionar o novo dispositivo ao seu perfil.</li>
                        </ul>

                        <div className="mt-10 flex gap-5">
                            <button onClick={handleReload}  className="btn btn-primary">
                                Atualizar
                            </button>
                            <Link to={"/"}>
                                <button className="btn btn-primary">
                                    Voltar para o Login
                                </button>
                            </Link>

                        </div>
                    </div>
                </div>
            </div>

            {/* Renderiza a notificação se ela existir */}
            {notification && (
                <Notification
                    type={notification.type}
                    message={notification.message}
                    onClose={handleNotificationClose}
                />
            )}
        </div>
    );
}
