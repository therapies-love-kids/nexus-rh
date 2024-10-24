import React from 'react';
import { IoIdCard } from 'react-icons/io5';
import MaskedInput from 'react-text-mask';

interface CNPJInputProps {
    label?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function CNPJInput (props:CNPJInputProps) {
    const { label, value, onChange } = props;
    
    return (
        <div className="form-control mt-4">
            <label className="label">
                <span className="label-text">{label}</span>
            </label>
            <label className="input input-bordered flex items-center gap-2">
                <IoIdCard />
                <MaskedInput
                    className="flex-grow"
                    guide={false}
                    mask={[/\d/, /\d/, '.', /\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/]}
                    onChange={onChange}
                    placeholder="00.000.000/0000-00"
                    type="text"
                    value={value}
                />
            </label>
        </div>
    );
};

