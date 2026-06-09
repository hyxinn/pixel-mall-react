import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

import EmptyState from '../components/common/EmptyState';
import { useServices, useServiceSnapshot } from '../hooks/useServices';

const ChatPage = () => {
  const { messageId } = useParams();
  const { message, user } = useServices();
  const currentUser = useServiceSnapshot(user, (service) => service.getCurrentUser());
  const selectedMessage = useServiceSnapshot(message, (service) => (
    currentUser && messageId ? service.getMessageById(currentUser.id, messageId) : null
  ));
  const thread = selectedMessage?.thread?.length
    ? selectedMessage.thread
    : selectedMessage?.type === 'chat'
      ? [{ id: `${selectedMessage.id}-content`, sender: selectedMessage.title, content: selectedMessage.content, createdAt: selectedMessage.createdAt }]
      : [];

  useEffect(() => {
    if (currentUser && messageId) {
      message.markAsRead(currentUser.id, messageId);
    }
  }, [currentUser, message, messageId]);

  if (!selectedMessage) {
    return (
      <main className="pm-page pm-chat-page">
        <Link className="pm-btn pm-btn-ghost" to="/messages">← 返回消息</Link>
        <EmptyState title="消息不存在" description="这条消息可能已被清理。" iconSrc="/images/admin/empty/no-data-shop.svg" />
      </main>
    );
  }

  return (
    <main className="pm-page pm-chat-page">
      <header className="pm-chat-header">
        <Link className="pm-btn pm-btn-ghost" to="/messages">← 返回消息</Link>
        <div>
          <p className="pm-section-eyebrow">{selectedMessage.type === 'chat' ? 'Merchant Chat' : 'Notice Detail'}</p>
          <h1>{selectedMessage.title}</h1>
        </div>
      </header>

      {selectedMessage.type === 'chat' ? (
        <section className="pm-chat-dialog" aria-label="聊天记录">
          {selectedMessage.productName ? <p className="pm-chat-product">咨询商品：{selectedMessage.productName}</p> : null}
          <div className="pm-chat-thread">
            {thread.map((item) => (
              <div key={item.id} className={`pm-chat-bubble${item.sender === '我' ? ' is-own' : ''}`}>
                <span>{item.sender}</span>
                <p>{item.content}</p>
                <small>{item.createdAt}</small>
              </div>
            ))}
          </div>
          <div className="pm-chat-compose-placeholder">展示聊天记录中，如需继续咨询请稍后接入在线客服。</div>
        </section>
      ) : (
        <article className="pm-message-detail pm-message-detail-page">
          <span className="pm-message-type">系统通知</span>
          <h2>{selectedMessage.title}</h2>
          <p>{selectedMessage.detail || selectedMessage.content}</p>
          <small>{selectedMessage.createdAt}</small>
        </article>
      )}
    </main>
  );
};

export default ChatPage;
