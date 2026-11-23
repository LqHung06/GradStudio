import { formatDate, getStatusLabel, JOB_KIND, PROPOSAL_STATUS } from '../../constants/status.js';
import '../../styles/chat-components.css';

/** Displays a response Proposal; its owner supplies all actions and state updates. */
export function ProposalCard({ proposal, actions = null }) {
  return (
    <div className="gs-proposal">
      <p><strong>Ngày đề xuất: </strong><time dateTime={proposal.date}>{formatDate(proposal.date)}</time></p>
      <p><strong>Trạng thái: </strong>{getStatusLabel(PROPOSAL_STATUS, proposal.status)}</p>
      {proposal.items.length ? (
        <ol className="gs-proposal__items">
          {proposal.items.map((item, index) => (
            <li key={index}>
              <strong>{getStatusLabel(JOB_KIND, item.kind)}</strong>
              <p><time dateTime={`${proposal.date}T${item.start}`}>{item.start}</time> – <time dateTime={`${proposal.date}T${item.end}`}>{item.end}</time></p>
              <p>Nhân sự: {item.staff.name}</p>
              {item.room && <p>Phòng: {item.room.name}</p>}
            </li>
          ))}
        </ol>
      ) : <p>Chưa có ca nào trong đề xuất.</p>}
      <p><strong>Ghi chú: </strong>{proposal.note || 'Không có ghi chú.'}</p>
      {actions && <div className="gs-proposal__actions">{actions}</div>}
    </div>
  );
}
