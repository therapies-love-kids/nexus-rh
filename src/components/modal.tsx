import React from 'react';

interface ModalProps {
    type: 'info' | 'success' | 'error';
    message: string;
    onClose: () => void;
    children: React.ReactNode; // Atualizado para React.ReactNode
}

const Modal: React.FC<ModalProps> = ({ type, message, onClose, children }) => {
    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg p-6 w-96">
                <div className={`text-lg font-bold
                    ${type === 'success' ? 'text-success' : type === 'error' ? 'text-error' : 'text-primary'}
                    `}>
                    {type === 'success' ? 'Sucesso' : type === 'error' ? 'Erro' : 'Informação'}
                </div>
                <div className="mt-4">
                    {/* Renderizando o conteúdo passado como children */}
                    {children}
                </div>
                <div className="mt-6 flex justify-end">
                    <button className={`btn btn-primary
                        ${type === 'success' ? 'btn-success' : type === 'error' ? 'btn-error' : 'btn-primary'}
                        
                        `} onClick={onClose}>
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Modal;