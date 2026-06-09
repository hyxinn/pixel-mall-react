export const ORDER_STATUS_TABS = [
  { key: 'all', label: '全部', icon: 'all' },
  { key: '0', label: '待支付', icon: 'unpaid' },
  { key: '1', label: '已支付', icon: 'paid' },
  { key: '2', label: '已发货', icon: 'shipped' },
  { key: '3', label: '已完成', icon: 'finished' },
];

export const orderListPathForStatus = (statusKey) => {
  if (!statusKey || statusKey === 'all') {
    return '/orderList';
  }
  return `/orderList?status=${statusKey}`;
};
