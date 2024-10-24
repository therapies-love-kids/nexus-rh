interface CheckboxInput {
    label: string;
    checked: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function CheckboxInput(props: CheckboxInput) {
    const {label, checked, onChange } = props

    return (
        <label className="flex items-center">
            <input type="checkbox" checked={checked} onChange={onChange} className="mr-2" />
            {label}
        </label>
    );
};

