import React from 'react';
import { IoKey, IoEyeOff, IoEye } from "react-icons/io5";

interface PswInputProps {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    showPassword: boolean;
    togglePassword: () => void;
}

export default function PasswordInput(props: PswInputProps) {
    const { label, value, onChange, showPassword, togglePassword } = props;

    return (
        <div className="form-control mt-4">
            <label className="label">
                <span className="label-text">{label}</span>
            </label>
            <label className="input input-bordered flex items-center gap-2">
                <IoKey />
                <input
                    type={showPassword ? "text" : "password"}
                    placeholder={label}
                    className="flex-grow"
                    value={value}
                    onChange={onChange}
                />
                <button type="button" onClick={togglePassword}>
                    {showPassword ? <IoEyeOff /> : <IoEye />}
                </button>
            </label>
        </div>
    );
}
