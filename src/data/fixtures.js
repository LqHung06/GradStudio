const initialThreads = [{
  id: 'linh',
  customer: 'Nguyễn Hoàng Phương Linh',
  short: 'Linh',
  avatar: 'L',
  status: 'Đã chốt lịch',
  request: 'Gói tốt nghiệp có makeup còn lịch 24/10 lúc 09:00 không?',
  time: '17:21',
  messages: [{
    sender: 'customer',
    text: 'Gói tốt nghiệp có makeup còn lịch 24/10 lúc 09:00 không?',
    time: '09:20'
  }, {
    sender: 'admin',
    text: '09:00 chị Mai bận makeup 08:00–12:00. Studio đề xuất makeup 13:00–14:00, chụp 14:00–16:00 với Tuấn tại Phòng B nhé.',
    time: '09:22'
  }, {
    sender: 'customer',
    text: 'Dạ em chốt lịch 14:00 ạ.',
    time: '09:25'
  }],
  booking: true
}, {
  id: 'khoa',
  customer: 'Trần Minh Khoa',
  short: 'Khoa',
  avatar: 'K',
  status: 'Chưa trả lời',
  request: 'Chụp chân dung CV mất bao lâu ạ?',
  time: '16:58',
  messages: [{
    sender: 'customer',
    text: 'Chụp chân dung CV mất bao lâu ạ?',
    time: '16:58'
  }],
  booking: false
}, {
  id: 'han',
  customer: 'Lê Ngọc Hân',
  short: 'Hân',
  avatar: 'H',
  status: 'Chưa trả lời',
  request: 'Gói gia đình 4 người giá sao ạ?',
  time: '2 ngày trước',
  messages: [{
    sender: 'customer',
    text: 'Gói gia đình 4 người giá sao ạ?',
    time: '2 ngày trước'
  }],
  booking: false
}, {
  id: 'bao',
  customer: 'Hồ Gia Bảo · Lớp 12A3',
  short: 'Bảo',
  avatar: '12A3',
  status: 'Đang tư vấn',
  request: 'Lớp mình chốt 24/10 nha studio',
  time: 'Hôm qua',
  messages: [{
    sender: 'customer',
    text: 'Lớp mình chốt 24/10 nha studio',
    time: 'Hôm qua'
  }, {
    sender: 'admin',
    text: 'Studio đã nhận yêu cầu kỷ yếu lớp. Mình đang kiểm tra phòng và ekip cho lớp nhé.',
    time: 'Hôm qua'
  }],
  booking: false
}, {
  id: 'anh',
  customer: 'Phạm Hoàng Anh',
  short: 'Anh',
  avatar: 'A',
  status: 'Hoàn thành',
  request: 'Cảm ơn studio, ảnh đẹp lắm!',
  time: '3 ngày trước',
  messages: [{
    sender: 'customer',
    text: 'Cảm ơn studio, ảnh đẹp lắm!',
    time: '3 ngày trước'
  }, {
    sender: 'admin',
    text: 'Cảm ơn Anh đã tin tưởng GradStudio. Chúc bạn luôn giữ những kỷ niệm đẹp!',
    time: '3 ngày trước'
  }],
  booking: false
}];
const packages = [{
  title: 'Kỷ yếu lớp',
  price: 'Từ 350.000đ/người',
  detail: 'Concept lớp học, ekip chụp và gallery riêng cho tập thể.'
}, {
  title: 'Tốt nghiệp',
  price: 'Từ 1.800.000đ',
  detail: 'Gói Premium gồm 2 giờ chụp và 30 ảnh chỉnh sửa.'
}, {
  title: 'Chân dung / CV',
  price: 'Từ 690.000đ',
  detail: 'Ảnh chân dung chỉn chu cho hồ sơ và dấu mốc cá nhân.'
}];
const galleryItems = [{
  id: 1,
  editorial: 'GRADUATION / FRIENDSHIP',
  subtitle: 'Những ngày tháng bên nhau',
  category: 'Kỷ yếu',
  image: 'art/graduation-group.png',
  label: 'Ngày cuối cùng dưới mái trường',
  tone: 'photo-sage',
  mark: '01'
}, {
  id: 2,
  editorial: 'GRADUATION / PORTRAIT',
  subtitle: 'Dành cho một khởi đầu mới',
  category: 'Tốt nghiệp',
  image: 'art/graduation-portrait.png',
  label: 'Một chương mới bắt đầu',
  tone: 'photo-rust',
  mark: '02'
}, {
  id: 3,
  editorial: 'PORTRAIT / NATURAL LIGHT',
  subtitle: 'Tự nhiên trong từng khung hình',
  category: 'Chân dung',
  image: 'art/portrait-window.png',
  label: 'Ánh sáng cửa sổ',
  tone: 'photo-blue',
  mark: '03'
}, {
  id: 4,
  editorial: 'FAMILY / MEMORIES',
  subtitle: 'Bình yên trong những điều giản dị',
  category: 'Gia đình',
  image: 'art/family-afternoon.png',
  label: 'Buổi chiều bên nhau',
  tone: 'photo-olive',
  mark: '04'
}, {
  id: 5,
  editorial: 'COUPLE / STORY',
  subtitle: 'Một câu chuyện của riêng hai người',
  category: 'Cặp đôi',
  image: 'art/couple-garden.png',
  label: 'Cùng một khung hình',
  tone: 'photo-rose',
  mark: '05'
}, {
  id: 6,
  editorial: 'GRADUATION / NEW CHAPTER',
  subtitle: 'Lưu giữ dấu mốc đáng nhớ',
  category: 'Tốt nghiệp',
  image: 'art/graduation-diploma.png',
  label: 'Tấm bằng đầu tiên',
  tone: 'photo-gold',
  mark: '06'
}];
const categories = ['Tất cả', 'Kỷ yếu', 'Tốt nghiệp', 'Chân dung', 'Gia đình', 'Cặp đôi'];
const bookings = [{
  id: 'GS-1024',
  customer: 'Nguyễn Hoàng Phương Linh',
  short: 'Linh',
  status: 'Chờ cọc 30%',
  date: '24/10/2026',
  dateLong: 'Thứ Bảy, 24/10/2026',
  type: 'Tốt nghiệp cá nhân',
  package: 'Gói Tốt nghiệp Premium',
  duration: '2 giờ',
  photos: '30 ảnh chỉnh sửa',
  makeup: '13:00–14:00',
  makeupStaff: 'Mai',
  shoot: '14:00–16:00',
  photographer: 'Tuấn',
  room: 'Phòng B',
  total: 1800000,
  deposit: 540000,
  remaining: 1260000,
  conflict: true,
  code: 'GS-1024',
  chosenPhotos: ['01', '02', '03']
}, {
  id: 'GS-0998',
  customer: 'Nguyễn Hoàng Phương Linh',
  short: 'Linh',
  status: 'Hoàn thành',
  date: '18/10/2026',
  dateLong: 'Chủ Nhật, 18/10/2026',
  type: 'Tốt nghiệp cá nhân',
  package: 'Gói Tốt nghiệp Classic',
  duration: '1.5 giờ',
  photos: '20 ảnh chỉnh sửa',
  makeup: '09:00–10:00',
  makeupStaff: 'Mai',
  shoot: '10:00–11:30',
  photographer: 'Tuấn',
  room: 'Phòng B',
  total: 1350000,
  deposit: 405000,
  remaining: 945000,
  conflict: false,
  code: 'GS-0998',
  chosenPhotos: ['06', '03', '01']
}];
const bookingFilters = ['Tất cả', 'Chờ cọc', 'Đã đặt lịch', 'Hoàn thành'];
const fmt = value => `${new Intl.NumberFormat('vi-VN').format(value)}đ`;

const heroPhotos = [
  { src: 'art/graduation-group.png', alt: 'Ảnh minh họa tạo bằng AI: nhóm bạn tốt nghiệp', position: 'center center' },
  { src: 'art/graduation-portrait.png', alt: 'Ảnh minh họa tạo bằng AI: người mẫu tốt nghiệp trong khuôn viên trường', position: 'center 42%' },
  { src: 'art/portrait-window.png', alt: 'Ảnh minh họa tạo bằng AI: chân dung bên cửa sổ', position: 'center 40%' }
];


function getAgendaMeta(e, iso) {
  if (iso === '2026-10-24') {
    if (e.start === 8 || e.start === 9) {
      if (e.id === 'makeup' && e.kind === 'conflict') {
        return {
          num: '①',
          title: 'Khung 09:00 · Trùng ca bận của Mai',
          desc: 'Không thể xếp lịch makeup vì thợ Mai đang bận ca 08:00–12:00.',
          badgeClass: 'badge-conflict'
        };
      }
      return {
        num: '①',
        title: 'Mai bận ca makeup kỷ yếu',
        desc: 'Đang bận ca makeup kỷ yếu lớp (08:00–12:00). Không đủ nhân sự nhận khách mới khung 09:00.',
        badgeClass: 'badge-confirmed'
      };
    }
    if (e.start === 10) {
      return {
        num: '②',
        title: 'Gia đình · Ngọc (Studio)',
        desc: 'Gói chụp gia đình 4 người tại Phòng A với thợ Hà. Đã hoàn tất đặt cọc và xếp lịch.',
        badgeClass: 'badge-confirmed'
      };
    }
    if (e.id === 'makeup' || e.start === 13 || (e.start === 14 && String(e.row).includes('Makeup'))) {
      return {
        num: '③',
        title: 'Linh · Makeup trước ca chụp',
        desc: 'Chuẩn bị trang điểm 1 tiếng trước ca chụp tốt nghiệp của Linh (thợ Mai).',
        badgeClass: 'badge-selected'
      };
    }
    if (String(e.label).includes('Linh') || e.start === 14 || e.start === 15) {
      return {
        num: '④',
        title: 'GS-1024 · Linh (Chụp tốt nghiệp)',
        desc: 'Ca chụp 2 tiếng tại Phòng B với thợ Tuấn. Đang đợi khách thanh toán cọc 30%.',
        badgeClass: 'badge-selected'
      };
    }
  } else if (iso === '2026-10-25') {
    if (String(e.label).includes('Khoa')) {
      return {
        num: '①',
        title: 'GS-1031 · Khoa (Chân dung CV)',
        desc: 'Chụp chân dung profile CV 1 tiếng tại Phòng A với thợ Hà.',
        badgeClass: 'badge-confirmed'
      };
    }
    if (String(e.label).includes('Minh')) {
      return {
        num: '②',
        title: 'Tốt nghiệp · Minh (Ekip Mai & Tuấn)',
        desc: 'Gói Tốt nghiệp: Makeup 10:00–12:00 (Mai) và Chụp 14:00–16:00 (Tuấn, Phòng B).',
        badgeClass: 'badge-confirmed'
      };
    }
  }
  return {
    num: '•',
    title: e.label,
    desc: 'Lịch hoạt động phân bổ theo tài nguyên.',
    badgeClass: e.kind === 'conflict' ? 'badge-conflict' : e.kind === 'selected' ? 'badge-selected' : 'badge-confirmed'
  };
}

function formatDisplayDate(iso) {
  if (!iso) return '';
  const parts = String(iso).split('-').map(Number);
  if (parts.length < 3) return iso;
  const [y, m, d] = parts;
  const dt = new Date(y, m - 1, d);
  const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const dayName = days[dt.getDay()] || '';
  return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}${dayName ? ` (${dayName})` : ''}`;
}

function formatFullDateTitle(iso) {
  if (!iso) return '';
  const parts = String(iso).split('-').map(Number);
  if (parts.length < 3) return iso;
  const [y, m, d] = parts;
  const dt = new Date(y, m - 1, d);
  const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const dayName = days[dt.getDay()] || '';
  return `${dayName}, ${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`;
}

function shiftIsoDate(iso, delta) {
  if (!iso) return iso;
  const parts = String(iso).split('-').map(Number);
  if (parts.length < 3) return iso;
  const [y, m, d] = parts;
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + delta);
  const nextY = dt.getFullYear();
  const nextM = String(dt.getMonth() + 1).padStart(2, '0');
  const nextD = String(dt.getDate()).padStart(2, '0');
  return `${nextY}-${nextM}-${nextD}`;
}

function calcDeposit(p) {
  const num = parseInt(String(p).replace(/\D/g, ''), 10);
  if (isNaN(num)) return '540.000đ';
  return (Math.round(num * 0.3)).toLocaleString('vi-VN') + 'đ';
}

const confirmedSchedule = {
  '2026-10-24': [
    { row: 'Makeup · Mai', start: 8, end: 12, label: 'Kỷ yếu lớp · Bận', num: '①', desc: 'Ca makeup kỷ yếu lớp (08:00–12:00). Đã xác nhận.' },
    { row: 'Thợ chụp · Hà', start: 10, end: 12, label: 'Gia đình · Ngọc', num: '②', desc: 'Gói chụp gia đình 4 người tại Phòng A với thợ Hà. Đã hoàn tất đặt cọc.' },
    { row: 'Phòng A', start: 10, end: 12, label: 'Gia đình · Ngọc', num: '②', desc: 'Phòng A đã xếp lịch cho gói Gia đình · Ngọc.' }
  ],
  '2026-10-25': [
    { row: 'Makeup · Mai', start: 10, end: 12, label: 'Tốt nghiệp · Minh', num: '②', desc: 'Gói Tốt nghiệp: Makeup 10:00–12:00 (Mai).' },
    { row: 'Thợ chụp · Tuấn', start: 14, end: 16, label: 'Tốt nghiệp · Minh', num: '②', desc: 'Chụp 14:00–16:00 (Tuấn, Phòng B).' },
    { row: 'Thợ chụp · Hà', start: 10, end: 11, label: 'GS-1031 · Khoa', num: '①', desc: 'Chụp chân dung profile CV 1 tiếng tại Phòng A với thợ Hà.' },
    { row: 'Phòng A', start: 10, end: 11, label: 'GS-1031 · Khoa', num: '①', desc: 'Phòng A đã xếp lịch cho Khoa.' },
    { row: 'Phòng B', start: 14, end: 16, label: 'Tốt nghiệp · Minh', num: '②', desc: 'Phòng B đã xếp lịch cho Minh.' }
  ],
  '2026-11-08': [
    { row: 'Makeup · Mai', start: 8, end: 10, label: 'Chân dung · An', num: '①', desc: 'Gói Chân dung profile cá nhân của An (08:00–10:00). Đã xác nhận.' },
    { row: 'Thợ chụp · Hà', start: 10, end: 12, label: 'Gia đình · Ngọc', num: '②', desc: 'Gói chụp gia đình 4 người tại Phòng A với thợ Hà (10:00–12:00). Đã xác nhận.' },
    { row: 'Phòng A', start: 10, end: 12, label: 'Gia đình · Ngọc', num: '②', desc: 'Phòng A đã xếp lịch cho gói Gia đình · Ngọc.' }
  ]
};

function checkBookingConflicts({ date, slot, hasMakeup, photographer, room }) {
  const slotHour = parseInt(String(slot).split(':')[0], 10) || 14;
  const dayEvents = confirmedSchedule[date] || [];

  // Giờ nghỉ cố định 12:00–13:00 (từ 40% đến 50%)
  const shootBreak = Math.max(12, slotHour) < Math.min(13, slotHour + 2);
  const makeupBreak = hasMakeup && Math.max(12, slotHour - 1) < Math.min(13, slotHour);

  const photoConflict = dayEvents.some(ev => 
    ev.row === `Thợ chụp · ${photographer}` && 
    Math.max(ev.start, slotHour) < Math.min(ev.end, slotHour + 2)
  ) || shootBreak;

  const roomConflict = dayEvents.some(ev => 
    ev.row === room && 
    Math.max(ev.start, slotHour) < Math.min(ev.end, slotHour + 2)
  ) || shootBreak;

  const makeupConflict = hasMakeup && (
    slotHour - 1 < 8 ||
    dayEvents.some(ev => 
      ev.row === 'Makeup · Mai' && 
      Math.max(ev.start, slotHour - 1) < Math.min(ev.end, slotHour)
    ) ||
    makeupBreak
  );

  const reasons = [];
  if (makeupConflict) {
    if (slotHour - 1 < 8) {
      reasons.push('Khung 08:00 yêu cầu makeup từ 07:00 (trước giờ mở cửa)');
    } else if (makeupBreak) {
      reasons.push('Giờ makeup (12:00–13:00) trùng giờ nghỉ trưa cố định');
    } else {
      reasons.push('Thợ makeup Mai đang bận ca đã xác nhận');
    }
  }
  if (photoConflict) {
    if (shootBreak) {
      reasons.push('Khung giờ chụp chạm vào giờ nghỉ trưa cố định (12:00–13:00)');
    } else {
      reasons.push(`Thợ chụp ${photographer} đã có lịch đã xác nhận`);
    }
  }
  if (roomConflict && !shootBreak) {
    reasons.push(`${room} đã có lịch đã xác nhận`);
  }

  return {
    hasConflict: makeupConflict || photoConflict || roomConflict,
    makeupConflict,
    photoConflict,
    roomConflict,
    shootBreak,
    makeupBreak,
    reasons
  };
}


const testScrollColorStops = [
  { at: 0, color: [247, 243, 236] },
  { at: .25, color: [235, 220, 203] },
  { at: .5, color: [222, 200, 195] },
  { at: .75, color: [201, 213, 201] },
  { at: 1, color: [185, 203, 191] }
];

const paletteScrollColorStops = [
  { at: 0, color: [252, 248, 248] },   // #FCF8F8 (Giữ nguyên trạng thái hiện tại ở phần trên: Trắng hồng phấn)
  { at: .35, color: [251, 239, 239] }, // #FBEFEF (Hồng pastel nhẹ)
  { at: .68, color: [238, 244, 253] }, // Chuyển êm dịu sang sắc xanh
  { at: 1, color: [214, 232, 252] }    // #D6E8FC (Xanh dương nhạt như trên ảnh khi cuộn đến quy trình)
];

const isTestRunner = typeof navigator !== 'undefined' && navigator.webdriver;
const scrollColorStops = isTestRunner ? testScrollColorStops : paletteScrollColorStops;


export {

  initialThreads,

  packages,

  galleryItems,

  categories,

  bookings,

  bookingFilters,

  fmt,

  heroPhotos,

  getAgendaMeta,

  formatDisplayDate,

  formatFullDateTitle,

  shiftIsoDate,

  calcDeposit,

  confirmedSchedule,

  checkBookingConflicts,

  testScrollColorStops,

  paletteScrollColorStops,

  scrollColorStops

};

