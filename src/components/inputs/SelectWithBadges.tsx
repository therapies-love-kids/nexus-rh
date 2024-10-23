import React, { useState, useEffect, useRef } from 'react';
import { IoChevronDown, IoChevronUp, IoClose } from 'react-icons/io5';

interface SelectBoxProps {
    label: string;
    options: Array<{ id: number; name: string }>;
    selectedIds: number[];
    onSelectionChange: (ids: number[]) => void;
}

export default function SelectBox(props: SelectBoxProps) {
    const { label, options, selectedIds, onSelectionChange } = props;
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const openDropdown = () => setIsOpen(true);

    const toggleDropdown = (event: React.MouseEvent) => {
        event.stopPropagation();
        setIsOpen(prev => !prev);
    };

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

    const handleClear = () => {
        onSelectionChange([]);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="form-control mt-4" ref={dropdownRef}>
            {label && (
                <label className="label">
                    <span className="label-text">{label}</span>
                </label>
            )}
            <div className="relative">
                <div className="input input-bordered flex items-center justify-between cursor-pointer" onClick={openDropdown}>
                    {selectedIds.length ? (
                        <div className="flex flex-wrap items-center gap-1">
                            {selectedIds.map(id => {
                                const option = options.find(opt => opt.id === id);
                                return (
                                    <span key={id} className="badge badge-primary mr-1 flex items-center">
                                        {option?.name}
                                        <button onClick={(e) => { e.stopPropagation(); handleRemove(id); }} className="ml-1 hover:text-error">
                                            <IoClose />
                                        </button>
                                    </span>
                                );
                            })}
                        </div>
                    ) : (
                        <span>{label}</span>
                    )}
                    <div className="flex justify-end gap-3">
                        <button className="mr-1 hover:text-error" onClick={handleClear}>
                            <IoClose/>
                        </button>
                        <button onClick={toggleDropdown} className="mr-1">
                            {isOpen ? <IoChevronUp /> : <IoChevronDown />}
                        </button>
                    </div>
                </div>
                {isOpen && (
                    <div className="absolute bg-base-100 border border-base-300 rounded shadow-lg z-10 mt-1 max-h-[300px] overflow-y-auto">
                        {options.map(option => (
                            <div key={option.id} className={`p-2 cursor-pointer ${selectedIds.includes(option.id) ? 'bg-primary text-primary-content' : 'hover:bg-base-200'}`} onClick={() => handleOptionToggle(option.id)}>
                                {option.name}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}


