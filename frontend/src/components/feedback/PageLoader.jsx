export function PageLoader({ text = 'Đang tải...' }) {
  return (
    <main className="page-loader">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        <div className="spinner" aria-hidden="true" />
        <p style={{ color: 'var(--color-secondary)', fontWeight: '500', fontSize: '14px', margin: 0 }}>{text}</p>
      </div>
    </main>
  );
}
