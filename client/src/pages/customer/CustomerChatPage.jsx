import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { apiFetch, ApiError } from '../../api/client.js';
import { AsyncState } from '../../components/AsyncState.jsx';
import { ChatThread } from '../../components/chat/ChatThread.jsx';
import { ProposalCard } from '../../components/chat/ProposalCard.jsx';
import { FormField } from '../../components/FormField.jsx';
import { Layout } from '../../components/Layout.jsx';
import { Money } from '../../components/Money.jsx';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import { CONVERSATION_STATUS } from '../../constants/status.js';
import { useFetch } from '../../hooks/useFetch.js';
import { useForm } from '../../hooks/useForm.js';
import '../../styles/customer-pages.css';

function mapRequestServerFields(fields) {
  const mapped = {};
  for (const [key, msg] of Object.entries(fields || {})) {
    const cleanKey = key.startsWith('request.') ? key.slice('request.'.length) : key;
    mapped[cleanKey] = msg;
  }
  return mapped;
}

export function CustomerChatPage() {
  const [searchParams] = useSearchParams();
  const initialPackageId = searchParams.get('packageId') || '';

  const conversationsReq = useFetch('/api/conversations');
  const servicesReq = useFetch('/api/services');
  const packagesReq = useFetch('/api/packages');
  const extrasReq = useFetch('/api/extras');

  const conversations = conversationsReq.data?.conversations || [];
  const services = servicesReq.data?.services || [];
  const packages = packagesReq.data?.packages || [];
  const extras = extrasReq.data?.extras || [];

  const [selectedId, setSelectedId] = useState('');
  const [replyingId, setReplyingId] = useState(null);
  const [proposalError, setProposalError] = useState(null);
  const [requestSuccess, setRequestSuccess] = useState(null);

  useEffect(() => {
    if (!selectedId && conversations.length > 0) {
      setSelectedId(conversations[0].id);
    } else if (selectedId && conversations.length > 0 && !conversations.some((c) => c.id === selectedId)) {
      setSelectedId(conversations[0].id);
    }
  }, [conversations, selectedId]);

  const detailReq = useFetch(selectedId ? `/api/conversations/${encodeURIComponent(selectedId)}` : null);
  const conversation = detailReq.data?.conversation || null;

  const allShootTypes = useMemo(() => {
    const seen = new Set();
    const list = [];
    for (const s of services) {
      for (const st of s.shootTypes || []) {
        if (!seen.has(st)) {
          seen.add(st);
          list.push(st);
        }
      }
    }
    return list;
  }, [services]);

  const newConvForm = useForm({
    initial: { newText: '' },
    validate: ({ newText }) => {
      const trimmed = newText.trim();
      if (!trimmed) return { newText: 'Vui lòng nhập nội dung cần tư vấn.' };
      if (newText.length > 1000) return { newText: 'Tin nhắn tối đa 1000 ký tự.' };
      return {};
    },
    onSubmit: async ({ newText }, { reset, setServerErrors }) => {
      try {
        const res = await apiFetch('/api/conversations', {
          method: 'POST',
          body: { text: newText.trim() },
        });
        const created = res.conversation;
        const summary = {
          id: created.id,
          customer: created.customer,
          topic: created.topic,
          status: created.status,
          lastMessage: created.lastMessage,
          bookingCode: created.bookingCode,
          updatedAt: created.updatedAt,
        };
        conversationsReq.setData((prev) => ({
          conversations: [summary, ...(prev?.conversations || [])],
        }));
        setSelectedId(created.id);
        detailReq.setData({ conversation: created });
        reset({ newText: '' });
      } catch (err) {
        if (err instanceof ApiError && err.status === 400 && err.fields?.text) {
          setServerErrors({ newText: err.fields.text });
          return;
        }
        throw err;
      }
    },
  });

  const requestForm = useForm({
    initial: {
      packageId: initialPackageId,
      shootType: '',
      preferredDate: '',
      preferredTime: '',
      extraIds: [],
      text: '',
    },
    validate: (v) => {
      const errs = {};
      if (!v.packageId) errs.packageId = 'Vui lòng chọn gói chụp.';
      if (!v.shootType.trim()) errs.shootType = 'Vui lòng chọn hoặc nhập loại chụp.';
      if (!v.preferredDate) {
        errs.preferredDate = 'Vui lòng chọn ngày mong muốn.';
      } else if (!/^\d{4}-\d{2}-\d{2}$/.test(v.preferredDate)) {
        errs.preferredDate = 'Ngày không đúng định dạng YYYY-MM-DD.';
      }
      if (!v.preferredTime) {
        errs.preferredTime = 'Vui lòng chọn giờ mong muốn.';
      } else if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(v.preferredTime)) {
        errs.preferredTime = 'Giờ không đúng định dạng HH:mm.';
      }
      if (!v.text.trim()) {
        errs.text = 'Vui lòng nhập lời nhắn kèm yêu cầu.';
      } else if (v.text.length > 1000) {
        errs.text = 'Lời nhắn tối đa 1000 ký tự.';
      }
      return errs;
    },
    onSubmit: async (v, { reset, setServerErrors }) => {
      if (!selectedId) return;
      setRequestSuccess(null);
      try {
        const res = await apiFetch(`/api/conversations/${encodeURIComponent(selectedId)}/messages`, {
          method: 'POST',
          body: {
            text: v.text.trim(),
            request: {
              shootType: v.shootType.trim(),
              packageId: v.packageId,
              preferredDate: v.preferredDate,
              preferredTime: v.preferredTime,
              extraIds: v.extraIds,
            },
          },
        });
        detailReq.setData((prev) => {
          if (!prev?.conversation) return prev;
          return {
            conversation: {
              ...prev.conversation,
              status: res.conversation.status,
              lastMessage: res.conversation.lastMessage,
              updatedAt: res.conversation.updatedAt,
              messages: [...prev.conversation.messages, res.message],
            },
          };
        });
        conversationsReq.setData((prev) => ({
          conversations: (prev?.conversations || []).map((c) =>
            c.id === res.conversation.id ? res.conversation : c,
          ),
        }));
        reset({
          packageId: v.packageId,
          shootType: v.shootType,
          preferredDate: '',
          preferredTime: '',
          extraIds: [],
          text: '',
        });
        setRequestSuccess('Đã gửi yêu cầu đặt lịch vào cuộc trò chuyện.');
      } catch (err) {
        if (err instanceof ApiError && err.status === 400 && err.fields && Object.keys(err.fields).length > 0) {
          setServerErrors(mapRequestServerFields(err.fields));
          return;
        }
        throw err;
      }
    },
  });

  useEffect(() => {
    if (packages.length === 0) return;
    const chosen = packages.find((p) => p.id === requestForm.values.packageId) || packages[0];
    if (!requestForm.values.packageId && chosen) {
      requestForm.setFieldValue('packageId', chosen.id);
    }
  }, [packages]);

  const shootTypeChoices = useMemo(() => {
    const chosenPkg = packages.find((p) => p.id === requestForm.values.packageId);
    const chosenService = chosenPkg ? services.find((s) => s.id === chosenPkg.serviceId) : null;
    if (chosenService?.shootTypes?.length) {
      return chosenService.shootTypes;
    }
    return allShootTypes;
  }, [allShootTypes, packages, requestForm.values.packageId, services]);

  useEffect(() => {
    if (shootTypeChoices.length > 0 && !shootTypeChoices.includes(requestForm.values.shootType)) {
      requestForm.setFieldValue('shootType', shootTypeChoices[0]);
    }
  }, [shootTypeChoices]);

  function toggleExtra(extraId) {
    const current = requestForm.values.extraIds || [];
    const next = current.includes(extraId)
      ? current.filter((id) => id !== extraId)
      : [...current, extraId];
    requestForm.setFieldValue('extraIds', next);
  }

  async function handleSendMessage(text) {
    if (!selectedId) return;
    const res = await apiFetch(`/api/conversations/${encodeURIComponent(selectedId)}/messages`, {
      method: 'POST',
      body: { text },
    });
    detailReq.setData((prev) => {
      if (!prev?.conversation) return prev;
      return {
        conversation: {
          ...prev.conversation,
          status: res.conversation.status,
          lastMessage: res.conversation.lastMessage,
          updatedAt: res.conversation.updatedAt,
          messages: [...prev.conversation.messages, res.message],
        },
      };
    });
    conversationsReq.setData((prev) => ({
      conversations: (prev?.conversations || []).map((c) =>
        c.id === res.conversation.id ? res.conversation : c,
      ),
    }));
  }

  async function handleProposalReply(proposal, decision) {
    if (!selectedId || replyingId) return;
    setProposalError(null);
    setReplyingId(proposal.id);
    try {
      const res = await apiFetch(
        `/api/conversations/${encodeURIComponent(selectedId)}/proposals/${encodeURIComponent(proposal.id)}`,
        {
          method: 'PATCH',
          body: { decision },
        },
      );
      detailReq.setData((prev) => {
        if (!prev?.conversation) return prev;
        return {
          conversation: {
            ...prev.conversation,
            status: res.conversation.status,
            lastMessage: res.conversation.lastMessage,
            updatedAt: res.conversation.updatedAt,
            acceptedProposalId:
              decision === 'accepted' ? res.proposal.id : prev.conversation.acceptedProposalId,
            messages: prev.conversation.messages.map((msg) =>
              msg.type === 'proposal' && msg.proposal?.id === res.proposal.id
                ? { ...msg, proposal: res.proposal }
                : msg,
            ),
          },
        };
      });
      conversationsReq.setData((prev) => ({
        conversations: (prev?.conversations || []).map((c) =>
          c.id === res.conversation.id ? res.conversation : c,
        ),
      }));
    } catch (err) {
      setProposalError(err?.message || 'Không thể cập nhật phản hồi đề xuất giờ, vui lòng thử lại.');
    } finally {
      setReplyingId(null);
    }
  }

  return (
    <Layout>
      <div className="section-header-row">
        <div>
          <p className="section-eyebrow">Tư vấn &amp; thống nhất giờ chụp</p>
          <h1>Chat với GradStudio</h1>
        </div>
      </div>

      <div className="customer-chat-layout">
        <aside className="chat-sidebar-panel" aria-labelledby="conv-list-heading">
          <h2 id="conv-list-heading">Cuộc trò chuyện của bạn</h2>

          <AsyncState
            loading={conversationsReq.loading}
            error={conversationsReq.error}
            onRetry={conversationsReq.reload}
            isEmpty={conversations.length === 0}
            emptyMessage="Bạn chưa có cuộc trò chuyện nào. Hãy tạo cuộc trò chuyện mới bên dưới."
          >
            <ul className="conversation-list">
              {conversations.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className="conversation-item-btn"
                    aria-current={item.id === selectedId ? 'true' : undefined}
                    onClick={() => {
                      setSelectedId(item.id);
                      setProposalError(null);
                      setRequestSuccess(null);
                    }}
                  >
                    <span className="conversation-item-top">
                      <strong>{item.topic}</strong>
                      <StatusBadge map={CONVERSATION_STATUS} status={item.status} />
                    </span>
                    <span className="conversation-item-preview">{item.lastMessage?.text}</span>
                  </button>
                </li>
              ))}
            </ul>
          </AsyncState>

          <div className="new-conversation-box">
            <h3>Tạo cuộc trò chuyện mới</h3>
            <form onSubmit={newConvForm.handleSubmit} noValidate>
              <FormField
                name="newText"
                label="Tin nhắn mở đầu"
                type="textarea"
                value={newConvForm.values.newText}
                error={newConvForm.errors.newText}
                onChange={newConvForm.handleChange}
                required
                inputProps={{ placeholder: 'Ví dụ: Mình muốn hỏi lịch chụp tốt nghiệp tháng 10…' }}
              />
              {newConvForm.submitError && (
                <p className="form-alert" role="alert">
                  {newConvForm.submitError}
                </p>
              )}
              <button
                type="submit"
                className="button button-dark"
                disabled={newConvForm.submitting}
              >
                {newConvForm.submitting ? 'Đang tạo…' : 'Bắt đầu cuộc trò chuyện'}
              </button>
            </form>
          </div>
        </aside>

        <div className="chat-main-column">
          <section className="chat-main-panel" aria-labelledby="active-conv-heading">
            {!selectedId ? (
              <>
                <h2 id="active-conv-heading">Nội dung trao đổi</h2>
                <p>Chọn một cuộc trò chuyện bên trái hoặc tạo cuộc trò chuyện mới để bắt đầu.</p>
              </>
            ) : (
              <AsyncState
                loading={detailReq.loading}
                error={detailReq.error}
                onRetry={detailReq.reload}
                isEmpty={!conversation}
                emptyMessage="Không tìm thấy nội dung cuộc trò chuyện."
              >
                {conversation && (
                  <>
                    <div className="chat-thread-header">
                      <div>
                        <h2 id="active-conv-heading">{conversation.topic}</h2>
                        <StatusBadge map={CONVERSATION_STATUS} status={conversation.status} />
                      </div>
                      {conversation.bookingCode && (
                        <Link
                          className="button button-outline"
                          to={`/my-bookings/${conversation.bookingCode}`}
                        >
                          Xem booking {conversation.bookingCode}
                        </Link>
                      )}
                    </div>

                    <p className="chat-hold-notice">
                      Đồng ý giờ đề xuất chỉ xác nhận khung giờ hai bên thống nhất; lịch chỉ được giữ chính thức sau khi bạn thanh toán cọc 30% thành công.
                    </p>

                    {proposalError && (
                      <p className="form-alert" role="alert">
                        {proposalError}
                      </p>
                    )}

                    <ChatThread
                      messages={conversation.messages}
                      viewerRole="customer"
                      onSend={handleSendMessage}
                      renderProposal={(proposal) => (
                        <ProposalCard
                          proposal={proposal}
                          actions={
                            proposal.status === 'pending' ? (
                              <>
                                <button
                                  type="button"
                                  className="button button-coral"
                                  disabled={replyingId === proposal.id}
                                  onClick={() => handleProposalReply(proposal, 'accepted')}
                                >
                                  {replyingId === proposal.id ? 'Đang gửi…' : 'Đồng ý giờ này'}
                                </button>
                                <button
                                  type="button"
                                  className="button button-outline"
                                  disabled={replyingId === proposal.id}
                                  onClick={() => handleProposalReply(proposal, 'declined')}
                                >
                                  Từ chối
                                </button>
                              </>
                            ) : null
                          }
                        />
                      )}
                    />
                  </>
                )}
              </AsyncState>
            )}
          </section>

          {selectedId && (
            <section className="booking-request-panel" aria-labelledby="booking-request-heading">
              <h2 id="booking-request-heading">Gửi yêu cầu đặt lịch</h2>
              <p className="extras-note">
                Yêu cầu sẽ xuất hiện trực tiếp trong cuộc trò chuyện để studio kiểm tra lịch trống và đề xuất giờ phù hợp.
              </p>

              <AsyncState
                loading={packagesReq.loading || servicesReq.loading}
                error={packagesReq.error || servicesReq.error}
                onRetry={() => {
                  packagesReq.reload();
                  servicesReq.reload();
                  extrasReq.reload();
                }}
                isEmpty={packages.length === 0}
                emptyMessage="Chưa tải được danh sách gói chụp để gửi yêu cầu."
              >
                <form onSubmit={requestForm.handleSubmit} noValidate>
                  <div className="request-form-grid">
                    <FormField
                      name="packageId"
                      label="Gói chụp"
                      error={requestForm.errors.packageId}
                      required
                    >
                      {(controlProps) => (
                        <select
                          {...controlProps}
                          value={requestForm.values.packageId}
                          onChange={requestForm.handleChange}
                        >
                          <option value="">-- Chọn gói chụp --</option>
                          {packages.map((pkg) => (
                            <option key={pkg.id} value={pkg.id}>
                              {pkg.name} ({pkg.durationHours} giờ · {pkg.editedPhotos} ảnh)
                            </option>
                          ))}
                        </select>
                      )}
                    </FormField>

                    <FormField
                      name="shootType"
                      label="Loại chụp"
                      error={requestForm.errors.shootType}
                      required
                    >
                      {(controlProps) =>
                        shootTypeChoices.length > 0 ? (
                          <select
                            {...controlProps}
                            value={requestForm.values.shootType}
                            onChange={requestForm.handleChange}
                          >
                            <option value="">-- Chọn loại chụp --</option>
                            {shootTypeChoices.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            {...controlProps}
                            type="text"
                            value={requestForm.values.shootType}
                            onChange={requestForm.handleChange}
                          />
                        )
                      }
                    </FormField>

                    <FormField
                      name="preferredDate"
                      label="Ngày mong muốn"
                      type="date"
                      value={requestForm.values.preferredDate}
                      error={requestForm.errors.preferredDate}
                      onChange={requestForm.handleChange}
                      required
                    />

                    <FormField
                      name="preferredTime"
                      label="Giờ mong muốn"
                      type="time"
                      value={requestForm.values.preferredTime}
                      error={requestForm.errors.preferredTime}
                      onChange={requestForm.handleChange}
                      required
                    />
                  </div>

                  {requestForm.values.packageId && (() => {
                    const selectedPkg = packages.find((p) => p.id === requestForm.values.packageId);
                    if (!selectedPkg) return null;
                    return (
                      <p className="extras-note">
                        Giá trọn gói dự kiến: <Money amount={selectedPkg.price} /> (cọc 30% sau khi studio tạo booking).
                      </p>
                    );
                  })()}

                  <fieldset className="extras-fieldset">
                    <legend>Dịch vụ thêm (tùy chọn, không tính giá riêng)</legend>
                    <AsyncState
                      loading={extrasReq.loading}
                      error={extrasReq.error}
                      onRetry={extrasReq.reload}
                      isEmpty={extras.length === 0}
                      emptyMessage="Hiện không có dịch vụ thêm."
                    >
                      {extras.map((extra) => (
                        <label key={extra.id} className="checkbox-option">
                          <input
                            type="checkbox"
                            checked={(requestForm.values.extraIds || []).includes(extra.id)}
                            onChange={() => toggleExtra(extra.id)}
                          />
                          <span>
                            <strong>{extra.name}</strong>
                            <span className="checkbox-option-note">{extra.note}</span>
                          </span>
                        </label>
                      ))}
                    </AsyncState>
                    {requestForm.errors.extraIds && (
                      <p className="field-error">{requestForm.errors.extraIds}</p>
                    )}
                  </fieldset>

                  <FormField
                    name="text"
                    label="Lời nhắn kèm yêu cầu"
                    type="textarea"
                    value={requestForm.values.text}
                    error={requestForm.errors.text}
                    onChange={requestForm.handleChange}
                    required
                    inputProps={{ placeholder: 'Ví dụ: Mình muốn đặt lịch chụp tốt nghiệp có makeup.' }}
                  />

                  {requestForm.submitError && (
                    <p className="form-alert" role="alert">
                      {requestForm.submitError}
                    </p>
                  )}

                  {requestSuccess && (
                    <p className="form-success-note" role="status">
                      {requestSuccess}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="button button-coral"
                    disabled={requestForm.submitting}
                  >
                    {requestForm.submitting ? 'Đang gửi yêu cầu…' : 'Gửi yêu cầu đặt lịch'}
                  </button>
                </form>
              </AsyncState>
            </section>
          )}
        </div>
      </div>
    </Layout>
  );
}
