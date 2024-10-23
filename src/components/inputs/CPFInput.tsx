import React from 'react';
import MaskedInput from 'react-text-mask';

interface CPFInputProps {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const CPFInput: React.FC<CPFInputProps> = ({ label, value, onChange }) => {
    return (
        <div className="form-control mt-4">
            <label className="label">
                <span className="label-text">{label}</span>
            </label>
            <label className="input input-bordered flex items-center gap-2">
                <MaskedInput
                    type="text"
                    placeholder="CPF (000.000.000-00)"
                    className="flex-grow"
                    value={value}
                    onChange={onChange}
                    mask={[/\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '-', /\d/, /\d/]}
                    guide={false}
                />
            </label>
        </div>
    );
};

export default CPFInput;
