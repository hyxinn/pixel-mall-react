import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';
import ProductCard from '../components/h5/ProductCard';
import { useServices, useServiceVersion } from '../hooks/useServices';
import { formatPrice, getProductPriceInfo, getProductTone, isLowStockProduct, resolveProductImageSrc } from '../utils/productDisplay';

const DetailPage = () => {
  const { goodId } = useParams();
  const navigate = useNavigate();
  const { good, cart, user, favorite, footprint, message: messageService } = useServices();
  useServiceVersion(good);
  useServiceVersion(favorite);
  const [message, setMessage] = useState('');
  const [failedImageSrc, setFailedImageSrc] = useState('');

  useEffect(() => {
    if (!message) return undefined;
    const timer = window.setTimeout(() => setMessage(''), 2000);
    return () => window.clearTimeout(timer);
  }, [message]);
  const parsedGoodId = Number(goodId);
  const product = good.getGoodById(parsedGoodId);
  const currentUser = user.getCurrentUser();
  const priceInfo = getProductPriceInfo(product);
  const imageSrc = resolveProductImageSrc(product?.cover);
  const shouldShowImage = imageSrc && failedImageSrc !== imageSrc;
  const isSoldOut = !product || product.status !== 'on-sale' || product.stock <= 0;
  const isLowStock = isLowStockProduct(product);
  const shop = product?.shopId ? good.getShopById(product.shopId) : null;
  const recommendedProducts = product ? good.getRecommendedGoods(product.id, product.categoryId, 4) : [];

  const isFavorited =
    currentUser && favorite.isFavorite(currentUser.id, parsedGoodId);
  const detailHighlights = [
    { label: '48小时发货', text: '现货商品由店铺仓库快速打包发出。' },
    { label: '7天无理由', text: '未使用且包装完整支持售后申请。' },
    { label: '破损补寄', text: '签收后发现运输破损可联系客服补寄。' },
  ];
  const detailParams = [
    ['品类', product?.categoryName || '像素好物'],
    ['库存', `${product?.stock || 0} 件`],
    ['风格', priceInfo.saleTag || '奶油像素风'],
    ['场景', product?.categoryId === 'cat-gift' ? '节日送礼' : '日常搭配'],
  ];

  useEffect(() => {
    if (currentUser && product && footprint?.recordView) {
      footprint.recordView(currentUser.id, product.id);
    }
  }, [currentUser, footprint, product]);

  if (!product) {
    return (
      <main className="pm-page pm-detail-page">
        <EmptyState
          title="商品不存在"
          description="该商品可能已下架或被删除。"
          action={
            <Link className="pm-btn pm-btn-primary" to="/home">
              回首页
            </Link>
          }
        />
      </main>
    );
  }

  const requireLogin = (nextPath) => {
    if (!currentUser) {
      navigate(`/login?redirect=${encodeURIComponent(nextPath)}`);
      return false;
    }
    return true;
  };

  const handleAddToCart = () => {
    if (!requireLogin(`/detail/${goodId}`)) {
      return;
    }
    const result = cart.addItem(currentUser.id, product.id, 1);
    setMessage(result.success ? '已加入购物车' : result.message);
  };

  const handleBuyNow = () => {
    if (!requireLogin(`/createOrder/${goodId}`)) {
      return;
    }
    navigate(`/createOrder/${goodId}`);
  };

  const handleFavorite = () => {
    if (!requireLogin(`/detail/${goodId}`)) {
      return;
    }
    const result = favorite.toggleFavorite(currentUser.id, product.id);
    setMessage(result.message);
  };

  const handleContactMerchant = () => {
    if (!requireLogin(`/detail/${goodId}`)) {
      return;
    }
    const chat = messageService.openProductChat(currentUser.id, product);
    navigate(`/messages/chat/${encodeURIComponent(chat.id)}`);
  };

  return (
    <main className="pm-page pm-detail-page">
      <Link className="pm-btn pm-btn-ghost" to="/home">
        ← 返回
      </Link>

      <article className="pm-product-card">
        <div className="pm-product-media">
          {shouldShowImage ? (
            <img src={imageSrc} alt={product.name} onError={() => setFailedImageSrc(imageSrc)} />
          ) : (
            <div className={`pm-pixel-product pm-pixel-product-large ${getProductTone(product.id)}`} />
          )}
        </div>
        <h1 className="pm-product-title">{product.name}</h1>
        <p className="pm-product-desc">{product.description}</p>
        <div className="pm-product-foot">
          <div>
            <strong className="pm-price">{formatPrice(priceInfo.currentPrice)}</strong>
            {priceInfo.hasDiscount ? <span className="pm-old-price">{formatPrice(priceInfo.originalPrice)}</span> : null}
          </div>
          <span className={`pm-tag ${isLowStock ? 'pm-tag-sale' : 'pm-tag-info'}`}>{isLowStock ? `库存告急，仅剩 ${product.stock} 件` : `库存 ${product.stock}`}</span>
          <span className="pm-tag pm-tag-info">{product.categoryName}</span>
          {priceInfo.saleTag ? <span className="pm-tag pm-tag-sale">{priceInfo.saleTag}</span> : null}
          {product.status !== 'on-sale' ? (
            <span className="pm-tag pm-tag-muted">已下架</span>
          ) : null}
        </div>
        {message ? <p className="pm-help">{message}</p> : null}
        <div className="pm-home-actions">
          <Button type="button" variant="primary" disabled={isSoldOut} onClick={handleAddToCart}>
            加入购物车
          </Button>
          <Button type="button" variant="accent" disabled={isSoldOut} onClick={handleBuyNow}>
            立即购买
          </Button>
          <Button type="button" variant="ghost" onClick={handleFavorite}>
            {isFavorited ? '取消收藏' : '收藏商品'}
          </Button>
          <Button type="button" variant="ghost" onClick={handleContactMerchant}>
            联系商家
          </Button>
        </div>
      </article>

      <section className="pm-detail-long" aria-label="商品图文详情">
        {shop ? (
          <article className="pm-detail-shop-card">
            <div>
              <p className="pm-section-eyebrow">Store</p>
              <h2>{shop.name}</h2>
              <span>{shop.slogan}</span>
            </div>
            <Link className="pm-btn pm-btn-ghost" to={`/shop/${shop.id}`}>进店逛逛</Link>
          </article>
        ) : null}

        <div className="pm-detail-service-grid">
          {detailHighlights.map((item) => (
            <div className="pm-detail-service-card" key={item.label}>
              <strong>{item.label}</strong>
              <span>{item.text}</span>
            </div>
          ))}
        </div>

        <article className="pm-detail-section-card pm-detail-promo-card">
          <p className="pm-section-eyebrow">Offer</p>
          <h2>优惠与服务</h2>
          <p>{priceInfo.saleTag || '会员专享下单优惠'}，下单可享满 199 减 20，收藏商品后可接收补货与降价提醒。</p>
        </article>

        <article className="pm-detail-section-card">
          <p className="pm-section-eyebrow">Parameters</p>
          <h2>商品参数</h2>
          <dl className="pm-detail-param-grid">
            {detailParams.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </article>

        <article className="pm-detail-section-card pm-detail-story-card">
          <div className="pm-detail-story-media">
            {shouldShowImage ? (
              <img src={imageSrc} alt="" onError={() => setFailedImageSrc(imageSrc)} />
            ) : (
              <div className={`pm-pixel-product ${getProductTone(product.id)}`} />
            )}
          </div>
          <div className="pm-detail-story-copy">
            <p className="pm-section-eyebrow">Details</p>
            <h2>图文介绍</h2>
            <p>{product.description || `${product.name} 采用柔和像素风设计，适合日常搭配与送礼。`}</p>
            <p>细节采用块面线条和奶油配色，搭配现有商品图案，让页面浏览体验更接近真实商品详情。</p>
            <p>建议与同系列像素好物一起搭配，收藏、通勤、送礼都能保持轻松可爱的风格。</p>
          </div>
        </article>

        <article className="pm-detail-section-card">
          <p className="pm-section-eyebrow">Notice</p>
          <h2>购买须知</h2>
          <ul className="pm-detail-note-list">
            <li>不同屏幕显示可能存在轻微色差，请以实物为准。</li>
            <li>手工测量尺寸可能有少量误差，不影响日常使用。</li>
            <li>售后问题可通过商品页“联系商家”进入客服聊天页查看记录。</li>
          </ul>
        </article>
      </section>

      {recommendedProducts.length ? (
        <section className="pm-detail-recommend-section">
          <div>
            <p className="pm-section-eyebrow">Similar Picks</p>
            <h2>相似推荐</h2>
          </div>
          <div className="pm-detail-recommend-grid">
            {recommendedProducts.map((recommendedProduct, index) => (
              <ProductCard key={recommendedProduct.id} product={recommendedProduct} index={index} showSticker={false} />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
};

export default DetailPage;
