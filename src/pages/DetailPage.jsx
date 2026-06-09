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
  const { good, user, favorite, footprint, api } = useServices();
  const goodRevision = useServiceVersion(good);
  const favoriteRevision = useServiceVersion(favorite);
  const [message, setMessage] = useState('');
  const [product, setProduct] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [failedImageSrc, setFailedImageSrc] = useState('');
  const [recommendedProducts, setRecommendedProducts] = useState([]);

  useEffect(() => {
    if (!message) return undefined;
    const timer = window.setTimeout(() => setMessage(''), 2000);
    return () => window.clearTimeout(timer);
  }, [message]);
  const parsedGoodId = Number(goodId);
  const currentUser = user.getCurrentUser();
  const currentUserId = currentUser?.id;
  const priceInfo = getProductPriceInfo(product);
  const imageSrc = resolveProductImageSrc(product?.cover);
  const shouldShowImage = imageSrc && failedImageSrc !== imageSrc;
  const isSoldOut = !product || product.status !== 'on-sale' || product.stock <= 0;
  const isLowStock = isLowStockProduct(product);
  const shop = product?.shopId ? good.getShopById(product.shopId) : null;
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
    let isMounted = true;

    Promise.all([
      api.products.detail(parsedGoodId),
      currentUserId ? api.favorites.isFavorite(currentUserId, parsedGoodId) : Promise.resolve(false),
    ]).then(([nextProduct, nextIsFavorited]) => {
      if (isMounted) {
        setProduct(nextProduct);
        setIsFavorited(Boolean(nextIsFavorited));
        setLoaded(true);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [api, parsedGoodId, currentUserId, goodRevision, favoriteRevision]);

  useEffect(() => {
    let isMounted = true;

    if (!product) {
      return () => {
        isMounted = false;
      };
    }

    api.products.recommended(product.id, product.categoryId, 4).then((list) => {
      if (isMounted) {
        setRecommendedProducts(list);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [api, product]);

  useEffect(() => {
    if (currentUser && product && footprint?.recordView) {
      api.footprints.recordView(currentUser.id, product.id);
    }
  }, [api, currentUser, footprint, product]);

  if (!loaded) {
    return (
      <main className="pm-page pm-detail-page">
        <EmptyState title="商品加载中" description="正在通过 Mock API 获取商品详情。" />
      </main>
    );
  }

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

  const handleAddToCart = async () => {
    if (!requireLogin(`/detail/${goodId}`)) {
      return;
    }
    const result = await api.cart.add(currentUser.id, product.id, 1);
    setMessage(result.success ? '已加入购物车' : result.message);
  };

  const handleBuyNow = () => {
    if (!requireLogin(`/createOrder/${goodId}`)) {
      return;
    }
    navigate(`/createOrder/${goodId}`);
  };

  const handleFavorite = async () => {
    if (!requireLogin(`/detail/${goodId}`)) {
      return;
    }
    const result = await api.favorites.toggle(currentUser.id, product.id);
    setIsFavorited(Boolean(result.favorited));
    setMessage(result.message);
  };

  const handleContactMerchant = () => {
    if (!requireLogin(`/detail/${goodId}`)) {
      return;
    }
    api.messages.openProductChat(currentUser.id, product).then((chat) => {
      navigate(`/messages/chat/${encodeURIComponent(chat.id)}`);
    });
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
