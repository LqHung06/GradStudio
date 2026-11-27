// Staff jobs and preview uploads: docs/api/08-jobs.md (owner TV1).
//
// db.jobs   : mock/data/jobs.json, plus the jobs the payments mock (TV2) adds when a deposit succeeds.
// db.photos : mock/data/photos.json (TV2), plus the photos uploaded here.
// previewCount is not stored: it is counted from db.photos on every answer,
// so every job of a booking shows the same number.

import { nowIso } from '../lib/time.mjs';

const STATUSES = ['todo', 'in_progress', 'done'];
const MAX_UPLOAD = 5 * 1024 * 1024; // 5 MiB = 5,242,880 bytes of file content
const HEADER_SEP = Buffer.from('\r\n\r\n', 'latin1');
const FIRST_UPLOAD_TOTAL = 36; // the first upload brings the rest of the shoot

const JOB_NOT_FOUND = 'Không tìm thấy việc này';

const photosOf = (db, code) => (db.photos || []).filter((p) => p.bookingCode === code);
const bookingOf = (db, code) => (db.bookings || []).find((b) => b.code === code);

// The Job object with exactly the fields of the contract.
function toJob(job, db) {
  return {
    id: job.id,
    bookingCode: job.bookingCode,
    kind: job.kind,
    date: job.date,
    start: job.start,
    end: job.end,
    room: job.room,
    staff: job.staff,
    customer: job.customer,
    packageName: job.packageName,
    status: job.status,
    note: job.note,
    previewCount: photosOf(db, job.bookingCode).length,
  };
}

// By date then start; jobs with no date (edit) last, by booking code.
function byTime(a, b) {
  if (a.date && !b.date) return -1;
  if (!a.date && b.date) return 1;
  if (a.date && b.date) {
    const c = a.date.localeCompare(b.date) || a.start.localeCompare(b.start);
    if (c) return c;
  }
  return a.bookingCode.localeCompare(b.bookingCode) || a.id.localeCompare(b.id);
}

// Own job only: another staff member's job answers 404, so it is not revealed.
const ownJob = (db, id, user) => db.jobs.find((j) => j.id === id && j.staff.id === user.id);

// ---------- multipart ----------

// Reads the "file" part of a multipart/form-data body. Returns null when there is none,
// otherwise { type, size } with the Content-Type line of that part (lower case, '' if missing)
// and the exact byte length of the file payload (excluding multipart boundaries and headers).
function filePart(headers, rawBody) {
  const m = /boundary=(?:"([^"]+)"|([^;]+))/i.exec(String(headers['content-type'] || ''));
  if (!m) return null;
  const delim = Buffer.from('--' + (m[1] || m[2]).trim(), 'latin1');

  let pos = rawBody.indexOf(delim);
  while (pos !== -1) {
    pos += delim.length;
    if (rawBody[pos] === 0x2d && rawBody[pos + 1] === 0x2d) break; // closing "--"
    if (rawBody[pos] === 0x0d && rawBody[pos + 1] === 0x0a) pos += 2;
    else if (rawBody[pos] === 0x0a) pos += 1;

    const next = rawBody.indexOf(delim, pos);
    if (next === -1) break;

    let partEnd = next;
    // RFC 2046: the CRLF right before the next boundary belongs to the delimiter, not the payload.
    if (partEnd >= pos + 2 && rawBody[partEnd - 2] === 0x0d && rawBody[partEnd - 1] === 0x0a) {
      partEnd -= 2;
    } else if (partEnd >= pos + 1 && rawBody[partEnd - 1] === 0x0a) {
      partEnd -= 1;
    }

    const part = rawBody.subarray(pos, partEnd);
    const headerEnd = part.indexOf(HEADER_SEP);
    if (headerEnd !== -1) {
      const head = part.subarray(0, headerEnd).toString('latin1');
      const disposition = /^content-disposition:(.*)$/im.exec(head);
      if (disposition && /(^|;)\s*name="file"\s*(;|$)/i.test(disposition[1].trim())) {
        const type = /^content-type:\s*([^;\r\n]+)/im.exec(head);
        const size = part.length - (headerEnd + HEADER_SEP.length);
        return { type: type ? type[1].trim().toLowerCase() : '', size };
      }
    }
    pos = next;
  }
  return null;
}

// ---------- photos ----------

const two = (n) => String(n).padStart(2, '0');

// ph-NN, NN = the photo's number in the booking. If another booking already uses
// that id, take the highest ph- number in the mock + 1, so ids stay unique.
function photoId(db, n) {
  const id = `ph-${two(n)}`;
  if (!db.photos.some((p) => p.id === id)) return id;
  let max = 0;
  for (const p of db.photos) {
    const m = /^ph-(\d+)$/.exec(p.id);
    if (m) max = Math.max(max, Number(m[1]));
  }
  return `ph-${two(max + 1)}`;
}

function addPhoto(db, code, n, user, at) {
  const photo = {
    id: photoId(db, n),
    bookingCode: code,
    url: `/samples/preview-${two(n)}.svg`,
    alt: `Ảnh xem trước số ${n} (minh họa)`,
    uploadedBy: { id: user.id, name: user.name },
    uploadedAt: at,
  };
  db.photos.push(photo);
  return photo;
}

export default [
  {
    method: 'GET',
    path: '/api/jobs',
    roles: ['staff'],
    handler: ({ query, user, db, fail }) => {
      if (query.status !== undefined && !STATUSES.includes(query.status)) {
        return fail(400, 'VALIDATION', 'Dữ liệu chưa hợp lệ', { status: 'Trạng thái không hợp lệ' });
      }
      const jobs = db.jobs
        .filter((j) => j.staff.id === user.id)
        .filter((j) => query.status === undefined || j.status === query.status)
        .sort(byTime)
        .map((j) => toJob(j, db));
      return { status: 200, body: { jobs } };
    },
  },
  {
    method: 'GET',
    path: '/api/jobs/:id',
    roles: ['staff'],
    handler: ({ params, user, db, fail }) => {
      const job = ownJob(db, params.id, user);
      if (!job) return fail(404, 'NOT_FOUND', JOB_NOT_FOUND);
      return { status: 200, body: { job: toJob(job, db) } };
    },
  },
  {
    method: 'PATCH',
    path: '/api/jobs/:id',
    roles: ['staff'],
    handler: ({ params, body, user, db, fail }) => {
      const job = ownJob(db, params.id, user);
      if (!job) return fail(404, 'NOT_FOUND', JOB_NOT_FOUND);

      const booking = bookingOf(db, job.bookingCode);
      if (booking) {
        if (booking.status === 'cancelled') {
          return fail(409, 'CONFLICT', 'Booking đã hủy, không thể cập nhật công việc');
        }
        if (job.kind === 'makeup' || job.kind === 'shoot') {
          if (booking.paymentStatus === 'paid_in_full' || booking.status === 'completed') {
            return fail(409, 'CONFLICT', 'Khách đã thanh toán đủ 70%, không thể cập nhật việc makeup/chụp ảnh');
          }
        } else if (job.kind === 'edit') {
          if (booking.finalLink || booking.status === 'completed') {
            return fail(409, 'CONFLICT', 'Booking đã gắn link ảnh hoàn chỉnh, không thể cập nhật việc chỉnh ảnh');
          }
          if (booking.paymentStatus !== 'paid_in_full' || !(booking.selection?.selectedCount > 0)) {
            return fail(409, 'CONFLICT', 'Chỉ được cập nhật việc chỉnh ảnh sau khi khách đã lưu danh sách ảnh và thanh toán đủ 70%');
          }
        }
      }

      const fields = {};
      if (body.status === undefined || body.status === null || body.status === '') fields.status = 'Vui lòng chọn trạng thái';
      else if (!STATUSES.includes(body.status)) fields.status = 'Trạng thái không hợp lệ';
      if (body.note !== undefined) {
        if (typeof body.note !== 'string') fields.note = 'Ghi chú không hợp lệ';
        else if (body.note.length > 500) fields.note = 'Ghi chú tối đa 500 ký tự';
      }
      if (Object.keys(fields).length > 0) return fail(400, 'VALIDATION', 'Dữ liệu chưa hợp lệ', fields);

      // Any status may follow any other. A note left out does not change; "" clears it.
      job.status = body.status;
      if (body.note !== undefined) job.note = body.note;
      return { status: 200, body: { job: toJob(job, db) } };
    },
  },
  {
    method: 'POST',
    path: '/api/bookings/:code/previews',
    roles: ['staff'],
    // Order of checks from the contract: token and role (server.mjs), booking and job, file, type, size.
    // A refused upload adds no photo.
    handler: ({ params, headers, rawBody, user, db, fail }) => {
      const code = params.code;

      // 3. Booking and job ownership: read from db.jobs only. "No such booking" and "no job on it" are the same 404.
      const myJobs = db.jobs.filter((j) => j.bookingCode === code && j.staff.id === user.id);
      if (myJobs.length === 0) return fail(404, 'NOT_FOUND', 'Không tìm thấy booking này');
      if (!myJobs.some((j) => j.kind === 'shoot' || j.kind === 'edit')) {
        return fail(403, 'FORBIDDEN', 'Chỉ thợ chụp hoặc chỉnh ảnh của booking này được đăng ảnh xem trước');
      }

      // 4. Booking status: cancelled bookings are read-only history.
      const booking = bookingOf(db, code);
      if (booking && booking.status === 'cancelled') {
        return fail(409, 'CONFLICT', 'Booking đã hủy, không thể đăng ảnh xem trước');
      }

      // 5. The file part.
      const part = filePart(headers, rawBody);
      if (!part) return fail(400, 'VALIDATION', 'Dữ liệu chưa hợp lệ', { file: 'Vui lòng chọn ảnh' });

      // 6. Type, from the Content-Type line of the part.
      if (part.type !== 'image/jpeg' && part.type !== 'image/png') {
        return fail(400, 'VALIDATION', 'Dữ liệu chưa hợp lệ', { file: 'Chỉ nhận ảnh JPEG hoặc PNG' });
      }

      // 7. Exact file payload size (<= 5 MiB = 5,242,880 bytes).
      if (part.size > MAX_UPLOAD) {
        return fail(400, 'VALIDATION', 'Dữ liệu chưa hợp lệ', { file: 'Ảnh tối đa 5 MiB' });
      }

      // Accepted. The mock does not store the file: each photo is an illustration.
      if (!Array.isArray(db.photos)) db.photos = [];
      const existing = photosOf(db, code).length;
      const at = nowIso();
      const photo = addPhoto(db, code, existing + 1, user, at);
      if (existing === 0) {
        // First upload: the uploaded file is ph-01, the mock adds ph-02 … ph-36 "from the shoot".
        for (let n = 2; n <= FIRST_UPLOAD_TOTAL; n++) addPhoto(db, code, n, user, at);
      }
      return { status: 201, body: { photo, totalPhotos: photosOf(db, code).length } };
    },
  },
];
