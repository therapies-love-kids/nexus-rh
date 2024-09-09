import React, { useEffect } from 'react';

interface NotificationProps {
    type: 'info' | 'success' | 'error'; // Tipos possíveis para a notificação
    message: string; // Mensagem a ser exibida
    onClose: () => void; // Função de callback para fechar a notificação
}

const Notification: React.FC<NotificationProps> = ({ type, message, onClose }) => {
    let alertClass = '';

    // Define a classe com base no tipo de notificação
    switch (type) {
        case 'info':
            alertClass = 'alert-info';
            break;
        case 'success':
            alertClass = 'alert-success';
            break;
        case 'error':
            alertClass = 'alert-error';
            break;
        default:
            alertClass = 'alert-info'; // Classe padrão se o tipo não for reconhecido
    }

    useEffect(() => {
        // Define o tempo para a notificação desaparecer automaticamente
        const timer = setTimeout(() => {
            onClose(); // Fecha a notificação
        }, 3000); // Tempo em milissegundos (3 segundos)
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed bottom-0 left-0 w-full z-50">
            <div className="toast toast-end">
                <div className={`alert ${alertClass}`}>
                    <span>{message}</span>
                </div>
            </div>
        </div>
    );
};

export default Notification;