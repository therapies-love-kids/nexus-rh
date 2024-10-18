interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    fields: { label: string; type: string; value: any; setValue: React.Dispatch<any> }[];
    onSubmit: () => void;
    submitText: string;
    modalMessage?: string;
}

export default function ModalInsert({ isOpen, onClose, title, fields, onSubmit, submitText, modalMessage }: ModalProps) {
if (!isOpen) return null;

    return (
        <div className="modal modal-open">
        <div className="modal-box">
            <h3 className="text-lg font-bold mb-5">{title}</h3>

            {fields.map((field, index) => (
            <div key={index} className="form-control">
                <label className="label">
                <span className="label-text">{field.label}</span>
                </label>
                {field.type === 'textarea' ? (
                <textarea
                    placeholder={field.label}
                    className="textarea textarea-bordered"
                    value={field.value}
                    onChange={(e) => field.setValue(e.target.value)}
                />
                ) : (
                <input
                    type={field.type}
                    placeholder={field.label}
                    className="input input-bordered"
                    value={field.value}
                    onChange={(e) => field.setValue(e.target.value)}
                />
                )}
            </div>
            ))}

            {modalMessage && <p className="text-red-500">{modalMessage}</p>}

            <div className="modal-action">
            <button className="btn btn-primary" onClick={onSubmit}>
                {submitText}
            </button>
            <button className="btn" onClick={onClose}>
                Fechar
            </button>
            </div>
        </div>
        </div>
    );
}
