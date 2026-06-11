import { Link, useNavigate, useParams } from 'react-router-dom';

import EmptyState from '../components/common/EmptyState';
import { carouselActivities } from '../mock/activities';

const activityDetails = {
  'summer-sale': {
    badge: '限时折扣',
    stats: [
      ['满减门槛', '199'],
      ['立减金额', '30'],
      ['适用品类', '全场精选'],
    ],
    steps: ['挑选活动商品', '购物车凑满门槛', '结算页自动抵扣'],
    notes: ['同一订单仅可享受一次满减', '活动库存有限，部分商品售完即止'],
  },
  'new-arrival': {
    badge: '新品首发',
    stats: [
      ['上新系列', '3'],
      ['首发权益', '尝鲜价'],
      ['推荐场景', '通勤出行'],
    ],
    steps: ['进入包包分类', '选择首发配色', '下单锁定新品价'],
    notes: ['新品批次会按付款顺序发货', '不同配色库存和发货时间可能不同'],
  },
  'member-day': {
    badge: '会员专享',
    stats: [
      ['积分倍率', '2x'],
      ['会员折扣', '专属'],
      ['参与方式', '登录'],
    ],
    steps: ['登录会员账号', '选购会员日商品', '订单完成后发放积分'],
    notes: ['积分以订单完成时间为准', '会员折扣商品会不定期更新'],
  },
};

const ActivityPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const activity = carouselActivities.find((item) => item.slug === slug);
  const detail = activityDetails[slug] || {
    badge: '精选活动',
    stats: [
      ['活动权益', '精选'],
      ['适用范围', '商城'],
      ['参与方式', '下单'],
    ],
    steps: ['查看活动规则', '挑选心仪商品', '完成下单参与活动'],
    notes: ['具体优惠以结算页展示为准', '活动说明可能随库存和档期调整'],
  };

  if (!activity) {
    return (
      <main className="pm-page pm-activity-page">
        <EmptyState
          title="活动不存在"
          description="该活动可能已结束，返回首页看看其他优惠。"
          action={<Link className="pm-btn pm-btn-primary" to="/home">返回首页</Link>}
        />
      </main>
    );
  }

  return (
    <main className="pm-page pm-activity-page">
      <header className="pm-activity-topbar">
        <button className="pm-btn pm-btn-ghost pm-back-btn" type="button" onClick={() => navigate(-1)}>返回</button>
        <span>{detail.badge}</span>
      </header>

      <section className="pm-activity-hero">
        <div className="pm-activity-copy">
          <p className="pm-activity-kicker">Pixel Mall 活动</p>
          <h1>{activity.title}</h1>
          <p className="pm-activity-subtitle">{activity.subtitle}</p>
          <p className="pm-activity-desc">{activity.description}</p>
          <div className="pm-activity-actions">
            {activity.cta ? <Link className="pm-btn pm-btn-primary" to={activity.cta.to}>{activity.cta.label}</Link> : null}
            <span>结算页自动匹配可用权益</span>
          </div>
        </div>
        <div className="pm-activity-media">
          {activity.cover ? <img src={activity.cover} alt={activity.title} /> : null}
        </div>
      </section>

      <section className="pm-activity-stats" aria-label="活动权益摘要">
        {detail.stats.map(([label, value]) => (
          <article className="pm-activity-stat" key={label}>
            <strong>{value}</strong>
            <span>{label}</span>
          </article>
        ))}
      </section>

      {activity.highlights?.length ? (
        <section className="pm-activity-section">
          <h2>活动亮点</h2>
          <div className="pm-activity-highlight-grid">
            {activity.highlights.map((highlight, index) => (
              <article className="pm-activity-highlight" key={highlight}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <p>{highlight}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="pm-activity-section pm-activity-rule-section">
        <div className="pm-activity-rule-card">
          <h2>参与方式</h2>
          <ol className="pm-activity-steps">
            {detail.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
        <div className="pm-activity-rule-card">
          <h2>规则说明</h2>
          <ul className="pm-activity-notes">
            {detail.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
};

export default ActivityPage;
