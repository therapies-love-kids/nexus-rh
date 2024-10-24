import React from 'react';
import { IoLocationSharp } from 'react-icons/io5';
import MaskedInput from 'react-text-mask';

interface CEPInputProps {
    label?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function CEPInput (props:CEPInputProps) {
    const { label, value, onChange } = props;
    
    return (
        <div className="form-control mt-4">
            <label className="label">
                <span className="label-text">{label}</span>
            </label>
            <label className="input input-bordered flex items-center gap-2">
                <IoLocationSharp />
                <MaskedInput
                    className="flex-grow"
                    guide={false}
                    mask={[/\d/, /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/]}
                    onChange={onChange}
                    placeholder="00000-000"
                    type="text"
                    value={value}
                />
            </label>
        </div>
    );
};

