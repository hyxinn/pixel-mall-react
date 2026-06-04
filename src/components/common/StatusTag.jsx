const classMap = {
  'on-sale': 'pm-tag pm-tag-new',
  'off-sale': 'pm-tag pm-tag-muted',
  deleted: 'pm-tag pm-tag-danger',
  draft: 'pm-tag pm-tag-info',
  paid: 'pm-tag pm-tag-hot',
  shipped: 'pm-tag pm-tag-info',
  finished: 'pm-tag pm-tag-new',
  unpaid: 'pm-tag pm-tag-sale',
};

const StatusTag = ({ value, children }) => {
  return <span className={classMap[value] || 'pm-tag'}>{children || value}</span>;
};

export default StatusTag;
