// Define os tipos para as colunas e os dados
interface Column {
    header: string;
    accessor: string;
}

interface Row {
    [key: string]: any;
}

interface TableProps {
    columns: Column[];
    data: Row[];
    onRowSelect: (row: Row) => void;
}

export default function Table({ columns, data, onRowSelect }: TableProps) {
    return (
        <div className="overflow-x-auto">
            <table className="table w-full">
                <thead>
                    <tr>
                        {columns.map((column, index) => (
                            <th key={index} className='text-xs'>{column.header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, rowIndex) => (
                        <tr key={rowIndex} onClick={() => onRowSelect(row)}>
                            {columns.map((column, colIndex) => (
                                <td key={colIndex} className='text-xs'>{row[column.accessor]}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
