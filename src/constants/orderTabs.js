export const ORDER_STATUS_TABS = [
  { key: 'all', label: '全部' },
  { key: '0', label: '待付款' },
  { key: '1', label: '待发货' },
  { key: '2', label: '待收货' },
  { key: 'service', label: '退款/售后' },
];

export const orderListPathForStatus = (statusKey) => {
  if (!statusKey || statusKey === 'all') {
    return '/orderList';
  }
  return `/orderList?status=${statusKey}`;
};
