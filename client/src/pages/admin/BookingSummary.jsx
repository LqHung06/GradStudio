import { Money } from '../../components/Money.jsx';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import { BOOKING_STATUS, PAYMENT_STATUS, JOB_KIND, formatDate } from '../../constants/status.js';

export function ScheduleSummary({ date, items }) {
  return <>
    <p><time dateTime={date}>{formatDate(date)}</time></p>
    {items.length ? <ul>
      {items.map((item, index) => (
        <li key={index}>
          {JOB_KIND[item.kind]} · {item.start}–{item.end} · {item.staff.name}
          {item.room && <> · {item.room.name}</>}
        </li>
      ))}
    </ul> : <p>Chưa có ca trong lịch.</p>}
  </>;
}

export function BookingSummary({ booking, heading: Heading = 'h3' }) {
  return <>
    <Heading>{booking.code} · {booking.customer.name}</Heading>
    <p><StatusBadge map={BOOKING_STATUS} status={booking.status} />{' '}
      <StatusBadge map={PAYMENT_STATUS} status={booking.paymentStatus} /></p>
    <p>{booking.shootType} · {booking.package.name}</p>
    <ScheduleSummary date={booking.date} items={booking.items} />
    <dl className="admin-amounts">
      <div><dt>Giá gói</dt><dd><Money amount={booking.price} /></dd></div>
      <div><dt>Cọc</dt><dd><Money amount={booking.deposit} /></dd></div>
      <div><dt>Còn lại theo giá gói</dt><dd><Money amount={booking.remaining} /></dd></div>
    </dl>
  </>;
}
