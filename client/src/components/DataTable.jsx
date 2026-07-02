export default function DataTable({ columns, rows, className = '' }) {
  return (
    <div className={`overflow-hidden rounded-lg border border-brand-line bg-white ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-brand-line bg-slate-50">
              {columns.map((column, columnIndex) => (
                <th
                  key={column.key ?? column.header ?? columnIndex}
                  className={`h-11 whitespace-nowrap px-4 text-xs font-bold text-slate-500 ${column.className ?? ''}`}
                >
                  {column.label ?? column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.id ?? index} className="border-b border-slate-100 last:border-b-0 odd:bg-white even:bg-slate-50/60">
                {columns.map((column, columnIndex) => {
                  const value = column.render ? column.render(row, index) : row[column.key];
                  const display = value === null || value === undefined || value === '' ? 'N/A' : value;
                  return (
                    <td key={column.key ?? column.header ?? columnIndex} className={`h-16 px-4 text-sm ${column.cellClassName ?? ''}`}>
                      {display}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
