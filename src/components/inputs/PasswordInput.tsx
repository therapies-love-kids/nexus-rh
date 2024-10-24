import { useState } from 'react';
import { IoKey, IoEyeOff, IoEye } from "react-icons/io5";

interface PasswordInputProps {
    label?: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    value: string;
}

export default function PasswordInput(props: PasswordInputProps) {
    const { label, onChange, placeholder, value } = props;
    const [showPassword, setShowPassword] = useState<boolean>(false);

    const togglePasswordVisibility = () => {
        setShowPassword(prev => !prev);
    };

    return (
        <div className="form-control mt-4">
            <label className="label">
                <span className="label-text">{label}</span>
            </label>
            <label className="input input-bordered flex items-center gap-2">
                <IoKey />
                <input
                    className="flex-grow"
                    onChange={onChange}
                    placeholder={placeholder}
                    type={showPassword ? "text" : "password"}
                    value={value}
                />
                <button type="button" onClick={togglePasswordVisibility}>
                    {showPassword ? <IoEyeOff /> : <IoEye />}
                </button>
            </label>
        </div>
    );
}
