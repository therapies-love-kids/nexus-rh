import React from 'react';
import { IoArrowBack, IoArrowForward } from 'react-icons/io5';

interface TableColumn<T> {
    header: string;
    accessor: keyof T; // Use keyof para restringir aos tipos do objeto
}

interface GenericTableProps<T> {
    data: T[];
    columns: TableColumn<T>[];
    selectedItems: number[];
    onSelectItem: (id: number) => void;
    onSelectAll: (select: boolean) => void;
    currentPage: number;
    setCurrentPage: (page: number) => void;
    recordsPerPage: number;
    totalRecords: number;
}

function GenericTable<T extends Record<string, any>>({
    data,
    columns,
    selectedItems,
    onSelectItem,
    onSelectAll,
    currentPage,
    setCurrentPage,
    recordsPerPage,
    totalRecords,
}: GenericTableProps<T>) {
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentRecords = data.slice(indexOfFirstRecord, indexOfLastRecord);
    const totalPages = Math.ceil(totalRecords / recordsPerPage);

    return (
        <div>
            <table className="table">
                <thead>
                    <tr>
                        <th>
                            <label>
                                <input
                                    type="checkbox"
                                    className="checkbox"
                                    onChange={(e) => onSelectAll(e.target.checked)}
                                    checked={selectedItems.length === data.length}
                                />
                            </label>
                        </th>
                        {columns.map((column, index) => (
                            <th key={index}>{column.header}</th>
                        ))}
                        <th></th> {/* Ações */}
                    </tr>
                </thead>
                <tbody>
                    {currentRecords.map((item) => (
                        <tr key={item[columns[0].accessor]}>
                            <th>
                                <label>
                                    <input
                                        type="checkbox"
                                        className="checkbox"
                                        checked={selectedItems.includes(item[columns[0].accessor] as number)}
                                        onChange={() => onSelectItem(item[columns[0].accessor] as number)}
                                    />
                                </label>
                            </th>
                            {columns.map((column) => (
                                <td key={column.accessor as string}>
                                    {item[column.accessor] as React.ReactNode} {/* Garantindo que seja um ReactNode */}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="flex justify-between items-center mt-4">
                <div className="flex items-center gap-5">
                    <button className="btn" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
                        <IoArrowBack />
                    </button>
                    <div>Página {currentPage}</div>
                    <button className="btn" onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>
                        <IoArrowForward />
                    </button>
                </div>
                <div className="text-sm text-gray-600">
                    Mostrando {indexOfFirstRecord + 1}-{Math.min(indexOfLastRecord, totalRecords)} de {totalRecords} registros
                </div>
            </div>
        </div>
    );
}

export default GenericTable;
