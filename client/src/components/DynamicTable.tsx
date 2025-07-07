import React from 'react';

interface Column<T> {
  accessorKey: keyof T;
  header: string;
  render?: (value: any, row: T) => React.ReactNode;
}

interface DynamicTableProps<T> {
  data: T[];
  columns: Column<T>[];
}

function DynamicTable<T>({ data, columns }: DynamicTableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="table table-zebra">
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th key={index}>{column.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((column, colIndex) => {
                const value = row[column.accessorKey];
                return (
                  <td key={colIndex}>
                    {column.render ? column.render(value, row) : String(value)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DynamicTable;
