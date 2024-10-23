interface TextInputProps{
    label: string
    value: string
    onChange: any
    type: string
    icon: any
}

export default function TextInput (props:TextInputProps) {
    const { label, value, onChange, icon, type } = props;

    return(
        <div className="form-control mt-4">
            <label className="label">
                <span className="label-text">{label}</span>
            </label>
            <label className="input input-bordered flex items-center gap-2">
                {icon}
                <input 
                    type={type} 
                    placeholder={label} 
                    className="flex-grow"
                    value={value}
                    onChange={onChange} 
                />
            </label>
        </div>
    )
}
