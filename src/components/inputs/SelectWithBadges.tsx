import React, { useState } from 'react';
import { IoClose } from 'react-icons/io5';

interface SelectBoxProps {
    label: string;
    options: Array<{ id: number; name: string }>;
    selectedIds: number[];
    onSelectionChange: (ids: number[]) => void;
}

export default function SelectBox(props:SelectBoxProps) {
    const { label, options, selectedIds, onSelectionChange } = props;
    const [isOpen, setIsOpen] = useState(false);
    const toggleDropdown = () => setIsOpen(prev => !prev);

    const handleOptionToggle = (id: number) => {
        if (selectedIds.includes(id)) {
            onSelectionChange(selectedIds.filter(selectedId => selectedId !== id));
        } else {
            onSelectionChange([...selectedIds, id]);
        }
    };

    const handleRemove = (id: number) => {
        onSelectionChange(selectedIds.filter(selectedId => selectedId !== id));
    };

    return (
        <div className="form-control mt-4">
            <label className="label">
                <span className="label-text">{label}</span>
            </label>
            <div className="relative">
                <button type="button" onClick={toggleDropdown} className="input input-bordered flex items-center justify-between">
                    <span>{selectedIds.length ? `Selecionados: ${selectedIds.length}` : 'Selecione...'}</span>
                    <span>{isOpen ? '▲' : '▼'}</span>
                </button>
                {isOpen && (
                    <div className="absolute bg-white border border-gray-300 rounded shadow-lg z-10 mt-1">
                        {options.map(option => (
                            <div key={option.id} className="flex items-center justify-between p-2 hover:bg-gray-200">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.includes(option.id)}
                                        onChange={() => handleOptionToggle(option.id)}
                                    />
                                    {option.name}
                                </label>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div className="mt-2">
                {selectedIds.map(id => {
                    const option = options.find(opt => opt.id === id);
                    return (
                        <div key={id} className="badge badge-primary gap-2">
                            {option?.name}
                            <button onClick={() => handleRemove(id)} className="ml-1">
                                <IoClose />
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};