// Payment routes: docs/api/06-payments.md (owner TV2).

import {
  createPaymentAttempt,
  getPaymentDetails,
  processGatewayCallback,
} from '../lib/payments.mjs';

export default [
  {
    method: 'POST',
    path: '/api/bookings/:code/payments',
    roles: ['customer'],
    handler: ({ params, body, user, db, fail }) => {
      const kind = typeof body.kind === 'string' ? body.kind.trim() : '';
      if (kind !== 'deposit' && kind !== 'remaining') {
        return fail(400, 'VALIDATION', 'Dữ liệu chưa hợp lệ', {
          kind: 'Loại thanh toán phải là deposit hoặc remaining',
        });
      }

      const booking = (db.bookings || []).find(
        (b) => b.code === params.code && b.customer?.id === user.id,
      );
      if (!booking) return fail(404, 'NOT_FOUND', 'Không tìm thấy booking');

      const res = createPaymentAttempt(db, { booking, kind });
      if (!res.ok) return fail(res.status, res.code, res.message, res.fields, res.details);
      return { status: res.status, body: res.body };
    },
  },
  {
    method: 'GET',
    path: '/api/payments/:id',
    roles: ['customer', 'admin'],
    handler: ({ params, user, db, fail }) => {
      const res = getPaymentDetails(db, { paymentId: params.id, user });
      if (!res.ok) return fail(res.status, res.code, res.message, res.fields, res.details);
      return { status: res.status, body: res.body };
    },
  },
  {
    method: 'POST',
    path: '/api/test-gateway/:paymentId',
    roles: ['customer'],
    handler: async ({ params, body, user, db, fail }) => {
      const result = typeof body.result === 'string' ? body.result.trim() : '';
      if (result !== 'success' && result !== 'failed') {
        return fail(400, 'VALIDATION', 'Dữ liệu chưa hợp lệ', {
          result: 'Kết quả phải là success hoặc failed',
        });
      }

      if (body.gatewayCaptured !== undefined && typeof body.gatewayCaptured !== 'boolean') {
        return fail(400, 'VALIDATION', 'Dữ liệu chưa hợp lệ', {
          gatewayCaptured: 'Trường gatewayCaptured phải là boolean',
        });
      }

      const res = await processGatewayCallback(db, {
        paymentId: params.paymentId,
        result,
        gatewayCaptured: Boolean(body.gatewayCaptured),
        user,
      });
      if (!res.ok) return fail(res.status, res.code, res.message, res.fields, res.details);
      return { status: res.status, body: res.body };
    },
  },
];
