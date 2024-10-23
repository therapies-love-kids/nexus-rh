import { useState } from 'react';
import { IoKey, IoEyeOff, IoEye } from "react-icons/io5";

interface PswInputProps {
    label: string;
    value: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void; // Adicionando onChange como prop
}

export default function PasswordInput(props: PswInputProps) {
    const { label, value, onChange } = props;
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
                    type={showPassword ? "text" : "password"}
                    placeholder={label}
                    className="flex-grow"
                    value={value}
                    onChange={onChange} // Chamando a função onChange passada como prop
                />
                <button type="button" onClick={togglePasswordVisibility}>
                    {showPassword ? <IoEyeOff /> : <IoEye />}
                </button>
            </label>
        </div>
    );
}
