function buildCompactCode(value, prefix = 'ID') {
  const rawValue = value === undefined || value === null ? '' : String(value);
  const normalizedValue = rawValue.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const compactPart = normalizedValue.slice(0, 8) || 'UNKNOWN';
  const normalizedPrefix = String(prefix || 'ID').toUpperCase();

  return `${normalizedPrefix}-${compactPart}`;
}

export function CompactCode({ value, prefix = 'ID' }) {
  return (
    <span
      title={value ? `Original ID: ${value}` : 'Original ID unavailable'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: '96px',
        padding: '6px 10px',
        borderRadius: '999px',
        border: '1px solid var(--color-outline-variant)',
        backgroundColor: 'var(--color-surface-container-low)',
        color: 'var(--color-primary)',
        fontSize: '12px',
        fontWeight: '700',
        fontFamily: '"IBM Plex Mono", "Cascadia Code", Consolas, monospace',
        letterSpacing: '0.04em',
        whiteSpace: 'nowrap',
      }}
    >
      {buildCompactCode(value, prefix)}
    </span>
  );
}

export { buildCompactCode };

export default CompactCode;
