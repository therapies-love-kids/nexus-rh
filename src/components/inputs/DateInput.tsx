import DatePicker from 'react-date-picker';
import { IoCalendar } from 'react-icons/io5';

interface DateInputProps {
    label?: string;
    onChange: (value: any) => void;
    value: any;
}

export default function DateInput(props: DateInputProps) {
    const { label, onChange, value } = props;

    return(
        <div className="form-control mt-4">
            <label className="label">
                <span className="label-text">{label}</span>
            </label>
            <label className="input input-bordered flex items-center gap-2">
                <IoCalendar />
                <DatePicker
                    calendarIcon={null}
                    clearIcon={null}
                    className="w-full custom-datepicker"
                    dayPlaceholder="dd"
                    format="dd/MM/y"
                    monthPlaceholder="mm"
                    onChange={onChange}
                    value={value}
                    yearPlaceholder="aaaa"
                />
            </label>
        </div>
    )
};
