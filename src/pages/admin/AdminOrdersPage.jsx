import { useContext, useState } from 'react';
import PermissionGate from '../../components/admin/PermissionGate';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import StatusTag from '../../components/common/StatusTag';
import { ServiceContext } from '../../contexts/ServiceContext';

const statusTextMap = {
  0: { tag: 'unpaid', label: '未支付' },
  1: { tag: 'paid', label: '已支付' },
  2: { tag: 'shipped', label: '已发货' },
  3: { tag: 'finished', label: '已完成' },
};

const AdminOrdersPage = () => {
  const { order } = useContext(ServiceContext);
  const [filters, setFilters] = useState({ keyword: '', status: 'all' });
  const [message, setMessage] = useState('');

  const orders = order.getOrderList(filters);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  };

  const handleShip = (orderId) => {
    const success = order.shipOrder(orderId);
    setMessage(success ? '订单已发货。' : '当前订单未支付，不能发货。');
  };

  const handleStatusChange = (orderId, nextStatus) => {
    const result = order.updateOrderStatus(orderId, nextStatus);
    setMessage(result.message);
  };

  return (
    <div className="pm-admin-orders-page">
      <div className="pm-admin-page-header">
        <div>
          <h2 className="pm-section-title">订单管理</h2>
          <p className="pm-help">支持订单筛选、发货、状态调整和物流信息展示。</p>
        </div>
      </div>

      {message ? <div className="pm-alert">{message}</div> : null}

      <section className="pm-admin-page-filters">
        <label className="pm-control">
          <span className="pm-label">搜索订单</span>
          <input className="pm-input" name="keyword" value={filters.keyword} onChange={handleFilterChange} placeholder="订单号 / 商品 / 用户" />
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
                  <th>物流信息</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((currentOrder) => {
                  const statusView = statusTextMap[currentOrder.status] || statusTextMap[3];
                  return (
                    <tr key={currentOrder.id}>
                      <td>
                        <strong>{currentOrder.orderNo}</strong>
                        <p className="pm-help">{currentOrder.createTime}</p>
                      </td>
                      <td>{currentOrder.userSnapshot?.nickname || '匿名用户'}</td>
                      <td>{currentOrder.goodSnapshot?.name || '历史商品'}</td>
                      <td>¥{currentOrder.price}</td>
                      <td><StatusTag value={statusView.tag}>{statusView.label}</StatusTag></td>
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
                          <PermissionGate permission="orders:manage">
                            <Button type="button" variant="mint" onClick={() => handleShip(currentOrder.id)} disabled={currentOrder.status < 1 || currentOrder.status > 1}>发货</Button>
                          </PermissionGate>
                          <PermissionGate permission="orders:manage">
                            <Button type="button" variant="ghost" onClick={() => handleStatusChange(currentOrder.id, 3)} disabled={currentOrder.status !== 2}>完成</Button>
                          </PermissionGate>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState title="暂无订单" description="当前筛选条件下没有订单数据。" />
      )}
    </div>
  );
};

export default AdminOrdersPage;
