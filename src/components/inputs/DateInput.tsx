import DatePicker from 'react-date-picker';
import { IoCalendar, IoClose } from 'react-icons/io5';

interface DateInputProps {
    label: string;
    value: any;
    onChange: any;
}

export default function DateInput(props: DateInputProps) {
    const { label, value, onChange } = props;

    return(
        <div className="form-control mt-4">
            <label className="label">
                <span className="label-text">{label}</span>
            </label>
            <label className="input input-bordered flex items-center gap-2">
                <IoCalendar />
                <DatePicker
                    onChange={onChange}
                    value={value}
                    format="dd/MM/y"
                    className="w-full custom-datepicker"
                    calendarIcon={<IoCalendar />}
                    clearIcon={<IoClose />}
                    dayPlaceholder="dd"
                    monthPlaceholder="mm"
                    yearPlaceholder="aaaa"
                />
            </label>
        </div>
    )
};
