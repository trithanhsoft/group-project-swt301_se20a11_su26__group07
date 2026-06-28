export function TagBadge({ label }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '6px 10px',
        borderRadius: '999px',
        backgroundColor: 'var(--color-surface-container-low)',
        border: '1px solid var(--color-outline-variant)',
        color: 'var(--color-primary)',
        fontSize: '12px',
        fontWeight: '700',
        whiteSpace: 'nowrap',
      }}
    >
      {label || 'Khác'}
    </span>
  );
}

export default TagBadge;
