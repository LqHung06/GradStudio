// Receive routes: docs/api/11-receive.md (owner TV2).

export default [
  {
    method: 'POST',
    path: '/api/bookings/:code/receive',
    roles: ['customer'],
    handler: ({ params, user, db, fail }) => {
      const booking = (db.bookings || []).find(
        (b) => b.code === params.code && b.customer?.id === user.id,
      );
      if (!booking) return fail(404, 'NOT_FOUND', 'Không tìm thấy booking');

      if (booking.status === 'completed') {
        return fail(409, 'CONFLICT', 'Booking này đã hoàn thành nhận ảnh');
      }
      if (booking.status !== 'booked') {
        return fail(409, 'CONFLICT', 'Booking chưa ở trạng thái Đã đặt lịch');
      }
      if (booking.paymentStatus !== 'paid_in_full') {
        return fail(409, 'CONFLICT', 'Vui lòng thanh toán 70% còn lại trước khi nhận ảnh');
      }
      if (!booking.finalLink) {
        return fail(409, 'CONFLICT', 'Studio chưa gửi link ảnh hoàn chỉnh');
      }

      booking.status = 'completed';
      const conv = (db.conversations || []).find((c) => c.id === booking.conversationId);
      if (conv) conv.status = 'done';

      return { status: 200, body: { booking } };
    },
  },
];
