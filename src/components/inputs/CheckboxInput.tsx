interface CheckboxInput {
    checked: boolean;
    label: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function CheckboxInput(props: CheckboxInput) {
    const {label, checked, onChange } = props

    return (
        <div className="form-control mt-4 w-auto">
            <label className="flex items-center cursor-pointer">
                <input
                    className="checkbox"
                    checked={checked}
                    onChange={onChange}
                    type="checkbox"
                />
                <span className="label-text ml-2">{label}</span>
            </label>
        </div>
        
    );
};

