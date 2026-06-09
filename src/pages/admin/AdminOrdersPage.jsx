import { useContext, useEffect, useState } from 'react';
import PermissionGate from '../../components/admin/PermissionGate';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import StatusTag from '../../components/common/StatusTag';
import Pagination from '../../components/h5/Pagination';
import { ServiceContext } from '../../contexts/ServiceContext';
import { useServiceSnapshot } from '../../hooks/useServices';
import { usePagination } from '../../hooks/usePagination';
import { formatPrice, getProductPriceInfo, getProductTone, resolveProductImageSrc } from '../../utils/productDisplay';

const statusTextMap = {
  0: { tag: 'unpaid', label: '未支付' },
  1: { tag: 'paid', label: '已支付' },
  2: { tag: 'shipped', label: '已发货' },
  3: { tag: 'finished', label: '已完成' },
};

const returnStatusTagMap = {
  pending: 'paid',
  approved: 'shipped',
  rejected: 'deleted',
  shipped: 'draft',
  received: 'on-sale',
  refunded: 'finished',
};

const getOrderItems = (order) => (order.items?.length
  ? order.items
  : [{ goodId: order.goodId, goodSnapshot: order.goodSnapshot, quantity: 1, price: order.price }]);

const getItemSubtotal = (item) => (Number(item.price) || getProductPriceInfo(item.goodSnapshot || item).currentPrice) * (Number(item.quantity) || 1);

const getItemName = (order, goodId) => {
  const item = getOrderItems(order).find((entry) => Number(entry.goodId) === Number(goodId));
  return item?.goodSnapshot?.name || '历史商品';
};

const AdminOrdersPage = () => {
  const { order, api } = useContext(ServiceContext);
  const [filters, setFilters] = useState({ keyword: '', status: 'all', afterSaleStatus: 'all', hasReview: 'all', hasReturn: 'all' });
  const [message, setMessage] = useState('');
  const [viewingOrderId, setViewingOrderId] = useState(null);
  const [reviewReplies, setReviewReplies] = useState({});
  const [returnNotes, setReturnNotes] = useState({});

  const orders = useServiceSnapshot(order, (service) => service.getOrderList(filters));
  const viewingOrder = useServiceSnapshot(order, (service) => (
    viewingOrderId ? service.getOrderById(viewingOrderId) : null
  ));
  const {
    page,
    setPage,
    totalPages,
    total,
    slice: pagedOrders,
    hasPrev,
    hasNext,
  } = usePagination(orders, 10);

  useEffect(() => {
    setPage(1);
  }, [filters, setPage]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  };

  const handleShip = async (orderId) => {
    const result = await api.orders.ship(orderId);
    if (result.success) {
      await api.orders.reload();
    }
    setMessage(result.message);
  };

  const handleReplyReview = async (orderId, reviewId) => {
    const result = await api.orders.replyReview(orderId, reviewId, reviewReplies[reviewId] || '');
    setMessage(result.message);
    if (result.success) {
      setReviewReplies((current) => ({ ...current, [reviewId]: '' }));
    }
  };

  const handleReturnAction = async (orderId, returnId, action) => {
    const result = await api.orders.handleReturn(orderId, returnId, action, returnNotes[returnId] || '');
    setMessage(result.message);
  };

  const handleRefresh = async () => {
    await api.orders.reload();
    setMessage('订单数据已刷新。');
  };

  return (
    <div className="pm-admin-orders-page">
      <div className="pm-admin-page-header">
        <div>
          <h2 className="pm-section-title">订单管理</h2>
          <p className="pm-help">支持订单筛选、发货、评价回复和退货售后流程处理。</p>
        </div>
        <Button type="button" variant="ghost" onClick={handleRefresh}>刷新</Button>
      </div>

      {message ? <div className="pm-alert">{message}</div> : null}

      <section className="pm-admin-page-filters pm-admin-order-filters">
        <label className="pm-control">
          <span className="pm-label">搜索订单</span>
          <input className="pm-input" name="keyword" value={filters.keyword} onChange={handleFilterChange} placeholder="订单号 / 商品 / 用户 / 售后原因" />
        </label>
        <label className="pm-control">
          <span className="pm-label">状态筛选</span>
          <select className="pm-select" name="status" value={filters.status} onChange={handleFilterChange}>
            <option value="all">全部状态</option>
            <option value="0">未支付</option>
            <option value="1">已支付</option>
            <option value="2">已发货</option>
            <option value="3">已完成</option>
          </select>
        </label>
        <label className="pm-control">
          <span className="pm-label">评价筛选</span>
          <select className="pm-select" name="hasReview" value={filters.hasReview} onChange={handleFilterChange}>
            <option value="all">全部评价</option>
            <option value="yes">有评价</option>
            <option value="no">无评价</option>
          </select>
        </label>
        <label className="pm-control">
          <span className="pm-label">售后筛选</span>
          <select className="pm-select" name="hasReturn" value={filters.hasReturn} onChange={handleFilterChange}>
            <option value="all">全部售后</option>
            <option value="yes">有售后</option>
            <option value="no">无售后</option>
          </select>
        </label>
        <label className="pm-control">
          <span className="pm-label">售后状态</span>
          <select className="pm-select" name="afterSaleStatus" value={filters.afterSaleStatus} onChange={handleFilterChange}>
            <option value="all">全部状态</option>
            <option value="pending">待审核</option>
            <option value="approved">已同意</option>
            <option value="shipped">买家已寄回</option>
            <option value="received">商家已收货</option>
            <option value="refunded">已退款</option>
            <option value="rejected">已拒绝</option>
          </select>
        </label>
      </section>

      {orders.length ? (
        <div className="pm-admin-table-panel">
          <div className="pm-table-wrap">
            <table className="pm-table">
              <thead>
                <tr>
                  <th>订单号</th>
                  <th>用户</th>
                  <th>商品</th>
                  <th>金额</th>
                  <th>状态</th>
                  <th>评价/售后</th>
                  <th>物流信息</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {pagedOrders.map((currentOrder) => {
                  const statusView = statusTextMap[currentOrder.status] || statusTextMap[3];
                  const orderItems = getOrderItems(currentOrder);
                  const reviews = currentOrder.reviews || [];
                  const returns = currentOrder.returns || [];
                  const pendingReturns = returns.filter((request) => ['pending', 'shipped', 'received'].includes(request.status));
                  return (
                    <tr key={currentOrder.id}>
                      <td>
                        <strong>{currentOrder.orderNo}</strong>
                        <p className="pm-help">{currentOrder.createTime}</p>
                      </td>
                      <td>{currentOrder.userSnapshot?.nickname || '匿名用户'}</td>
                      <td>
                        <div className="pm-admin-order-items-cell">
                          {orderItems.slice(0, 3).map((item, index) => (
                            <div className="pm-admin-order-item-line" key={`${item.goodId || index}-${index}`}>
                              <strong>{item.goodSnapshot?.name || '历史商品'}</strong>
                              <span>x{item.quantity || 1} · {formatPrice(item.price || 0)} / 件 · 小计 {formatPrice(getItemSubtotal(item))}</span>
                            </div>
                          ))}
                          {orderItems.length > 3 ? <span className="pm-help">还有 {orderItems.length - 3} 件商品</span> : null}
                        </div>
                      </td>
                      <td>{formatPrice(currentOrder.price)}</td>
                      <td><StatusTag value={statusView.tag}>{statusView.label}</StatusTag></td>
                      <td>
                        <div className="pm-admin-order-service-cell">
                          <span>评价 {reviews.length}</span>
                          <span className={pendingReturns.length ? 'is-warning' : ''}>售后 {returns.length}{pendingReturns.length ? ` / 待处理 ${pendingReturns.length}` : ''}</span>
                        </div>
                      </td>
                      <td>
                        <ul className="pm-admin-order-logistics">
                          {(currentOrder.logistics || []).slice(0, 2).map((log) => (
                            <li key={`${currentOrder.id}-${log.time}`}>
                              <strong>{log.time}</strong>
                              <span>{log.text}</span>
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td>
                        <div className="pm-admin-inline-actions">
                          <Button type="button" variant="ghost" onClick={() => setViewingOrderId(currentOrder.id)}>查看</Button>
                          <PermissionGate permission="orders:manage">
                            <Button type="button" variant="mint" onClick={() => handleShip(currentOrder.id)} disabled={currentOrder.status !== 1}>发货</Button>
                          </PermissionGate>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination
            className="pm-admin-pagination"
            page={page}
            totalPages={totalPages}
            total={total}
            onPrev={() => hasPrev && setPage(page - 1)}
            onNext={() => hasNext && setPage(page + 1)}
          />
        </div>
      ) : (
        <EmptyState title="暂无订单" description="当前筛选条件下没有订单数据。" iconSrc="/images/admin/empty/no-order.svg" />
      )}

      <Modal
        cancelText=""
        confirmText=""
        onClose={() => setViewingOrderId(null)}
        onConfirm={() => setViewingOrderId(null)}
        open={Boolean(viewingOrder)}
        title="订单详情"
      >
        {viewingOrder ? (
          <div className="pm-admin-panel pm-admin-detail-panel">
            <div className="pm-admin-detail-grid">
              <div>
                <p className="pm-label">订单号</p>
                <h3 className="pm-admin-card-title">{viewingOrder.orderNo}</h3>
              </div>
              <div>
                <p className="pm-label">状态</p>
                <StatusTag value={(statusTextMap[viewingOrder.status] || statusTextMap[3]).tag}>{(statusTextMap[viewingOrder.status] || statusTextMap[3]).label}</StatusTag>
              </div>
              <div>
                <p className="pm-label">用户</p>
                <p>{viewingOrder.userSnapshot?.nickname || '匿名用户'}</p>
              </div>
              <div>
                <p className="pm-label">金额</p>
                <strong className="pm-price">{formatPrice(viewingOrder.price)}</strong>
              </div>
            </div>
            <div className="pm-admin-detail-grid">
              <div>
                <p className="pm-label">下单时间</p>
                <p>{viewingOrder.createTime}</p>
              </div>
              <div>
                <p className="pm-label">支付时间</p>
                <p>{viewingOrder.payTime || '未支付'}</p>
              </div>
              <div className="pm-admin-detail-span">
                <p className="pm-label">收货信息</p>
                <p className="pm-admin-detail-copy">{viewingOrder.address?.receiver} / {viewingOrder.address?.phone} / {viewingOrder.address?.detail}</p>
              </div>
            </div>
            <div>
              <p className="pm-label">商品清单</p>
              <div className="pm-admin-detail-list">
                {getOrderItems(viewingOrder).map((item, index) => {
                  const snapshot = item.goodSnapshot || item;
                  const priceInfo = getProductPriceInfo(snapshot);
                  const imageSrc = resolveProductImageSrc(snapshot.cover);
                  const quantity = item.quantity || 1;
                  return (
                    <article className="pm-admin-detail-item pm-admin-order-detail-item" key={`${item.goodId || index}-${index}`}>
                      <div className="pm-admin-order-detail-media">
                        {imageSrc ? <img src={imageSrc} alt={snapshot.name || '历史商品'} /> : <div className={`pm-pixel-product ${getProductTone(item.goodId || index)}`} />}
                      </div>
                      <div className="pm-admin-order-detail-copy">
                        <strong>{snapshot.name || '历史商品'}</strong>
                        <span>{snapshot.categoryName || '历史分类'}</span>
                        <span>数量 x{quantity}</span>
                        <span>单价 {formatPrice(item.price || priceInfo.currentPrice)}</span>
                      </div>
                      <div className="pm-admin-order-detail-price">
                        <strong className="pm-price">{formatPrice(getItemSubtotal(item))}</strong>
                        {priceInfo.hasDiscount ? <span className="pm-old-price">{formatPrice(priceInfo.originalPrice * quantity)}</span> : null}
                        {priceInfo.saleTag ? <span className="pm-tag pm-tag-sale">{priceInfo.saleTag}</span> : null}
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
            <div className="pm-admin-order-service-section">
              <p className="pm-label">买家评价</p>
              {viewingOrder.reviews?.length ? (
                <div className="pm-admin-order-service-list">
                  {viewingOrder.reviews.map((review) => (
                    <article className="pm-admin-order-service-card" key={review.id}>
                      <header>
                        <strong>{getItemName(viewingOrder, review.goodId)}</strong>
                        <StatusTag value="finished">{review.rating} 星</StatusTag>
                      </header>
                      <p>{review.content}</p>
                      <small>{review.createdAt}</small>
                      {review.adminReply ? (
                        <blockquote>
                          <strong>商家回复</strong>
                          <span>{review.adminReply}</span>
                          <small>{review.repliedAt}</small>
                        </blockquote>
                      ) : null}
                      <PermissionGate permission="orders:manage">
                        <div className="pm-admin-order-service-form">
                          <textarea
                            className="pm-input pm-textarea"
                            value={reviewReplies[review.id] || ''}
                            onChange={(event) => setReviewReplies((current) => ({ ...current, [review.id]: event.target.value }))}
                            placeholder="回复买家评价"
                            rows="3"
                          />
                          <Button type="button" variant="mint" onClick={() => handleReplyReview(viewingOrder.id, review.id)}>保存回复</Button>
                        </div>
                      </PermissionGate>
                    </article>
                  ))}
                </div>
              ) : <p className="pm-help">暂无买家评价。</p>}
            </div>
            <div className="pm-admin-order-service-section">
              <p className="pm-label">售后申请</p>
              {viewingOrder.returns?.length ? (
                <div className="pm-admin-order-service-list">
                  {viewingOrder.returns.map((request) => (
                    <article className="pm-admin-order-service-card" key={request.id}>
                      <header>
                        <strong>{getItemName(viewingOrder, request.goodId)}</strong>
                        <StatusTag value={returnStatusTagMap[request.status]}>{order.getReturnStatusText(request.status)}</StatusTag>
                      </header>
                      <p>{order.getReturnTypeText(request.type)} · {request.reason}</p>
                      <p>{request.description}</p>
                      <small>申请时间：{request.createdAt}</small>
                      {request.returnTrackingNo ? <small>退货物流：{request.returnTrackingNo}</small> : null}
                      {request.adminNote ? <small>处理备注：{request.adminNote}</small> : null}
                      <PermissionGate permission="orders:manage">
                        <div className="pm-admin-order-service-form">
                          <textarea
                            className="pm-input pm-textarea"
                            value={returnNotes[request.id] ?? request.adminNote ?? ''}
                            onChange={(event) => setReturnNotes((current) => ({ ...current, [request.id]: event.target.value }))}
                            placeholder="填写处理备注"
                            rows="3"
                          />
                          <div className="pm-admin-inline-actions">
                            {request.status === 'pending' ? (
                              <>
                                <Button type="button" variant="mint" onClick={() => handleReturnAction(viewingOrder.id, request.id, 'approve')}>同意</Button>
                                <Button type="button" variant="danger" onClick={() => handleReturnAction(viewingOrder.id, request.id, 'reject')}>拒绝</Button>
                              </>
                            ) : null}
                            {request.status === 'approved' && request.type === 'refund' ? (
                              <Button type="button" variant="primary" onClick={() => handleReturnAction(viewingOrder.id, request.id, 'refund')}>确认退款</Button>
                            ) : null}
                            {request.status === 'shipped' ? (
                              <Button type="button" variant="mint" onClick={() => handleReturnAction(viewingOrder.id, request.id, 'markReceived')}>确认收货</Button>
                            ) : null}
                            {request.status === 'received' ? (
                              <Button type="button" variant="primary" onClick={() => handleReturnAction(viewingOrder.id, request.id, 'refund')}>确认退款</Button>
                            ) : null}
                          </div>
                        </div>
                      </PermissionGate>
                    </article>
                  ))}
                </div>
              ) : <p className="pm-help">暂无售后申请。</p>}
            </div>
            <div>
              <p className="pm-label">物流记录</p>
              <ul className="pm-admin-detail-timeline">
                {(viewingOrder.logistics || []).map((log, index) => (
                  <li key={`${log.time}-${index}`}>
                    <strong>{log.time}</strong>
                    <span>{log.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default AdminOrdersPage;
