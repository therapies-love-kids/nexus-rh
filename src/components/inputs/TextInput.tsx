interface TextInputProps{
    icon?: any
    label?: string
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string
    type: string
    value: string
}

export default function TextInput (props:TextInputProps) {
    const { icon, label, onChange, placeholder, type, value } = props;

    return(
        <div className="form-control mt-4">
            <label className="label">
                <span className="label-text">{label}</span>
            </label>
            <label className="input input-bordered flex items-center gap-2">
                {icon}
                <input
                    className="flex-grow"
                    onChange={onChange}
                    placeholder={placeholder}
                    type={type}
                    value={value}
                />
            </label>
        </div>
    )
}
