import { EmptyState } from './EmptyState.jsx';

export function DataTable({
  headers = [],
  data = [],
  loading = false,
  emptyMessage = 'Không tìm thấy dữ liệu.',
  onRowClick,
  ...props
}) {
  return (
    <div className="table-container">
      <table className="data-table" {...props}>
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th key={header.key || index} style={header.style}>
                {header.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={headers.length} style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                  <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div>
                  <span style={{ color: 'var(--color-secondary)' }}>Đang tải dữ liệu...</span>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={headers.length} style={{ padding: 0 }}>
                <EmptyState message={emptyMessage} />
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={row.id || rowIndex}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                style={{ cursor: onRowClick ? 'pointer' : 'default' }}
              >
                {headers.map((header, columnIndex) => (
                  <td key={columnIndex} style={header.style}>
                    {header.render ? header.render(row, rowIndex) : row[header.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
