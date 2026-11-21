// Gallery routes: docs/api/09-gallery.md (owner TV2).

const selectionsByDb = new WeakMap();

function getSelectionMap(db) {
  let map = selectionsByDb.get(db);
  if (!map) {
    map = new Map();
    selectionsByDb.set(db, map);
  }
  return map;
}

export default [
  {
    method: 'GET',
    path: '/api/bookings/:code/photos',
    roles: ['customer', 'admin', 'staff'],
    handler: ({ params, user, db, fail }) => {
      const booking = (db.bookings || []).find((b) => b.code === params.code);
      if (!booking) return fail(404, 'NOT_FOUND', 'Không tìm thấy booking');

      if (user.role === 'customer' && booking.customer?.id !== user.id) {
        return fail(404, 'NOT_FOUND', 'Không tìm thấy booking');
      }
      if (user.role === 'staff') {
        const assigned = (db.jobs || []).some(
          (j) => j.bookingCode === booking.code && j.staff?.id === user.id,
        );
        if (!assigned) return fail(403, 'FORBIDDEN', 'Bạn không được phân công vào booking này');
      }

      const photos = (db.photos || []).filter((p) => p.bookingCode === booking.code);
      const limit = booking.selection?.limit ?? booking.package?.editedPhotos ?? 30;
      const selectedIds = getSelectionMap(db).get(booking.code) || [];

      return {
        status: 200,
        body: {
          bookingCode: booking.code,
          limit,
          selectedIds,
          photos,
        },
      };
    },
  },
  {
    method: 'PUT',
    path: '/api/bookings/:code/selection',
    roles: ['customer'],
    handler: ({ params, body, user, db, fail }) => {
      const booking = (db.bookings || []).find(
        (b) => b.code === params.code && b.customer?.id === user.id,
      );
      if (!booking) return fail(404, 'NOT_FOUND', 'Không tìm thấy booking');

      if (booking.status !== 'booked') {
        return fail(409, 'CONFLICT', 'Booking chưa ở trạng thái Đã đặt lịch');
      }
      if (booking.paymentStatus === 'paid_in_full') {
        return fail(409, 'CONFLICT', 'Không thể thay đổi lựa chọn ảnh sau khi đã thanh toán 70% còn lại');
      }

      const limit = booking.selection?.limit ?? booking.package?.editedPhotos ?? 30;
      const pkgName = booking.package?.name || 'Gói hiện tại';

      if (!Array.isArray(body.photoIds)) {
        return fail(400, 'VALIDATION', 'Dữ liệu chưa hợp lệ', {
          photoIds: 'Danh sách ảnh chọn phải là một mảng',
        });
      }

      const uniqueIds = [...new Set(body.photoIds.filter((id) => typeof id === 'string' && id.trim() !== ''))];
      if (uniqueIds.length === 0) {
        return fail(400, 'VALIDATION', 'Dữ liệu chưa hợp lệ', {
          photoIds: 'Vui lòng chọn ít nhất 1 ảnh',
        });
      }
      if (uniqueIds.length > limit) {
        return fail(400, 'VALIDATION', 'Dữ liệu chưa hợp lệ', {
          photoIds: `${pkgName} cho chọn tối đa ${limit} ảnh`,
        });
      }

      const validIds = new Set(
        (db.photos || []).filter((p) => p.bookingCode === booking.code).map((p) => p.id),
      );
      const invalid = uniqueIds.find((id) => !validIds.has(id));
      if (invalid) {
        return fail(400, 'VALIDATION', 'Dữ liệu chưa hợp lệ', {
          photoIds: `Ảnh ${invalid} không thuộc booking ${booking.code}`,
        });
      }

      getSelectionMap(db).set(booking.code, uniqueIds);
      if (!booking.selection) booking.selection = { limit, selectedCount: 0 };
      booking.selection.selectedCount = uniqueIds.length;

      return {
        status: 200,
        body: {
          bookingCode: booking.code,
          limit,
          selectedIds: uniqueIds,
        },
      };
    },
  },
];
