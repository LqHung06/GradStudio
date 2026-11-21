// Catalog routes: docs/api/02-catalog.md (owner TV2).

export default [
  {
    method: 'GET',
    path: '/api/services',
    roles: null,
    handler: ({ db }) => ({ status: 200, body: { services: db.services || [] } }),
  },
  {
    method: 'GET',
    path: '/api/packages',
    roles: null,
    handler: ({ query, db, fail }) => {
      const services = db.services || [];
      const packages = db.packages || [];
      if (!query.serviceId) return { status: 200, body: { packages } };

      const service = services.find((s) => s.id === query.serviceId);
      if (!service) {
        return fail(400, 'VALIDATION', 'Dữ liệu chưa hợp lệ', {
          serviceId: 'Dịch vụ không tồn tại',
        });
      }
      return {
        status: 200,
        body: { packages: packages.filter((p) => p.serviceId === query.serviceId) },
      };
    },
  },
  {
    method: 'GET',
    path: '/api/packages/:id',
    roles: null,
    handler: ({ params, db, fail }) => {
      const services = db.services || [];
      const packages = db.packages || [];
      const pkg = packages.find((p) => p.id === params.id);
      if (!pkg) return fail(404, 'NOT_FOUND', 'Không tìm thấy gói chụp này');
      const svc = services.find((s) => s.id === pkg.serviceId);
      return {
        status: 200,
        body: {
          package: {
            ...pkg,
            service: svc ? { id: svc.id, name: svc.name } : null,
          },
        },
      };
    },
  },
  {
    method: 'GET',
    path: '/api/extras',
    roles: null,
    handler: ({ db }) => ({ status: 200, body: { extras: db.extras || [] } }),
  },
  {
    method: 'GET',
    path: '/api/portfolio',
    roles: null,
    handler: ({ db }) => ({ status: 200, body: { photos: db.portfolio || [] } }),
  },
  {
    method: 'GET',
    path: '/api/reviews',
    roles: null,
    handler: ({ db }) => ({ status: 200, body: { reviews: db.reviews || [] } }),
  },
];
