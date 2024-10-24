import React from 'react';

interface Option {
    id: number;
    name: string;
}

interface SelectInputProps {
    label: string;
    options: Option[];
    selectedId: number | null;
    onSelectionChange: (id: number | null) => void;
}

export default function SelectInput (props: SelectInputProps) {
    const { label, options, selectedId, onSelectionChange } = props
    
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value ? parseInt(e.target.value) : null;
        onSelectionChange(value);
    };

    return (
        <div className="form-control mt-4">
            <label className="label">
                <span className="label-text">{label}</span>
            </label>
            <select value={selectedId ?? ''} onChange={handleChange} className="select select-bordered">
                <option value="" disabled>
                    Selecione uma opção
                </option>
                {options.map(option => (
                    <option key={option.id} value={option.id}>
                        {option.name}
                    </option>
                ))}
            </select>
        </div>
    );
};