import { useEffect, useState } from 'react';
import { AppShell } from '../../../components/layout/AppShell.jsx';
import { useAuth } from '../../../app/providers/AuthProvider.jsx';
import { getDashboardSummary } from '../api/dashboardApi.js';

const adminModules = [
  'Product Management',
  'Ingredient Management',
  'Stock Import',
  'Recipe Management',
  'Reports',
];

const staffModules = ['POS Order', 'Order History'];

export function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getDashboardSummary()
      .then((response) => {
        setSummary(response.data);
      })
      .catch((dashboardError) => {
        setError(dashboardError.message || 'Không tải được dashboard.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const modules = user?.role === 'ADMIN' ? adminModules : staffModules;

  return (
    <AppShell>
      <main className="dashboard-page">
        <section className="welcome-card">
          <div>
            <p className="eyebrow">Dashboard ban đầu</p>
            <h3>{user?.role === 'ADMIN' ? 'Admin Workspace' : 'Staff Workspace'}</h3>
            <p>
              Màn này dùng để kiểm tra kết nối frontend, backend, JWT và Supabase DB
              trước khi team bắt đầu chia module.
            </p>
          </div>
          <div className="status-card">
            <span>API</span>
            <strong>{error ? 'Error' : 'Connected'}</strong>
          </div>
        </section>

        {error ? <div className="alert error">{error}</div> : null}

        <section className="summary-grid">
          <SummaryCard label="Products" value={summary?.counts?.products} loading={isLoading} />
          <SummaryCard label="Ingredients" value={summary?.counts?.ingredients} loading={isLoading} />
          <SummaryCard label="Orders" value={summary?.counts?.orders} loading={isLoading} />
          <SummaryCard label="Low stock" value={summary?.counts?.lowStockIngredients} loading={isLoading} />
        </section>

        <section className="module-card">
          <div className="section-heading">
            <p className="eyebrow">Next tasks</p>
            <h3>Module sẽ giao cho member</h3>
          </div>

          <div className="module-grid">
            {modules.map((module) => (
              <article key={module} className="module-item">
                <strong>{module}</strong>
                <span>Pending implementation</span>
              </article>
            ))}
          </div>
        </section>
      </main>
    </AppShell>
  );
}

function SummaryCard({ label, value, loading }) {
  return (
    <article className="summary-card">
      <span>{label}</span>
      <strong>{loading ? '...' : value ?? 0}</strong>
    </article>
  );
}
