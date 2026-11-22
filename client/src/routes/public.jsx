import { AsyncState } from '../components/AsyncState.jsx';
import { Layout } from '../components/Layout.jsx';
import { Money } from '../components/Money.jsx';
import { useFetch } from '../hooks/useFetch.js';
import { SignInPage } from '../pages/SignInPage.jsx';

// Temporary foundation check route for `/` (verifies useFetch + AsyncState across 4 mock modes).
// TV2 replaces this with the real G1 HomePage and adds `/packages/:id`.
function TempServicesProbePage() {
  const { data, error, loading, reload } = useFetch('/api/services');
  const services = data?.services || [];

  return (
    <Layout>
      <section className="foundation-probe" aria-labelledby="probe-heading">
        <h1 id="probe-heading">GradStudio — Dịch vụ chụp ảnh</h1>
        <p>Trang tạm kiểm tra nền front end và 4 chế độ mock cho GET /api/services.</p>

        <AsyncState
          loading={loading}
          error={error}
          onRetry={reload}
          isEmpty={services.length === 0}
          emptyMessage="Hiện chưa có dịch vụ nào."
        >
          <ul className="probe-list">
            {services.map((service) => (
              <li key={service.id} className="probe-card">
                <h2>{service.name}</h2>
                <p>{service.description}</p>
                <p>
                  Giá từ <Money amount={service.fromPrice} />
                  {service.priceUnit ? ` / ${service.priceUnit}` : ''}
                </p>
              </li>
            ))}
          </ul>
        </AsyncState>
      </section>
    </Layout>
  );
}

export const publicRoutes = [
  { path: '/', element: <TempServicesProbePage /> },
  { path: '/sign-in', element: <SignInPage /> },
];
