import { Link } from 'react-router-dom';

const FeaturedShopSection = ({ shops = [], title = '特色店铺', id = 'featured-shops-title', className = '' }) => {
  if (!shops.length) {
    return null;
  }

  return (
    <section className={`pm-home-shop-section ${className}`.trim()} aria-labelledby={id}>
      <div className="pm-home-section-heading">
        <h2 id={id}>{title}</h2>
      </div>
      <div className="pm-home-shop-grid">
        {shops.map((shop) => (
          <Link className="pm-home-shop-card" key={shop.id} to={`/shop/${shop.id}`}>
            <div className="pm-home-shop-cover">
              <img src={shop.cover} alt="" />
            </div>
            <div className="pm-home-shop-info">
              <strong>{shop.name}</strong>
              <span>{shop.slogan}</span>
              <small>{shop.products.length} 件精选商品</small>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default FeaturedShopSection;
