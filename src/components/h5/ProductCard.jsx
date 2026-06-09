import { useState } from 'react';
import { Link } from 'react-router-dom';

import { formatPrice, getProductPriceInfo, getProductTone, isLowStockProduct, resolveProductImageSrc } from '../../utils/productDisplay';

const ProductCard = ({
  product,
  index = 0,
  showSticker = true,
  showAddLink = false,
  onAddToCart,
  cartQuantity = 0,
  isCartAnimating = false,
  className = '',
}) => {
  const tone = getProductTone(product.id);
  const sticker = String(index + 1).padStart(2, '0');
  const isSoldOut = product.stock <= 0 || product.status !== 'on-sale';
  const isLowStock = isLowStockProduct(product);
  const priceInfo = getProductPriceInfo(product);
  const imageSrc = resolveProductImageSrc(product.cover);
  const [failedImageSrc, setFailedImageSrc] = useState('');
  const shouldShowImage = imageSrc && failedImageSrc !== imageSrc;

  return (
    <article className={`pm-product-card pm-product-card-collectible pm-home-product-card ${className}`.trim()}>
      {showSticker ? <span className="pm-sticker-label pm-home-product-sticker">{sticker}</span> : null}
      <div className="pm-product-media">
        {cartQuantity > 0 ? <span className="pm-product-cart-badge">已加购 x{cartQuantity}</span> : null}
        {isCartAnimating ? <span className="pm-product-cart-pop" aria-live="polite">+1</span> : null}
        {shouldShowImage ? (
          <img src={imageSrc} alt={product.name} onError={() => setFailedImageSrc(imageSrc)} />
        ) : (
          <div className={`pm-pixel-product ${tone}`} />
        )}
      </div>
      <div className="pm-home-product-meta">
        <span>{product.categoryName || '像素好物'}</span>
        <h3 className="pm-product-title">{product.name}</h3>
        <span className={`pm-product-stock${isLowStock ? ' is-low' : ''}`}>
          {isLowStock ? `库存告急 · 仅剩 ${product.stock} 件` : `库存 ${product.stock}`}
        </span>
        <div className="pm-product-foot">
          <div className="pm-product-price-stack">
            <strong className="pm-price">{formatPrice(priceInfo.currentPrice)}</strong>
            {priceInfo.hasDiscount ? <span className="pm-old-price">原价 {formatPrice(priceInfo.originalPrice)}</span> : null}
            {priceInfo.saleTag ? <span className="pm-tag pm-tag-sale">{priceInfo.saleTag}</span> : null}
          </div>
          <Link to={`/detail/${product.id}`}>详情</Link>
          {showAddLink && onAddToCart ? (
            <button
              className="pm-btn pm-btn-ghost pm-product-add-btn"
              type="button"
              disabled={isSoldOut}
              onClick={() => onAddToCart(product)}
            >
              加购
            </button>
          ) : null}
        </div>
        {isSoldOut ? <span className="pm-tag pm-tag-muted">不可购买</span> : null}
      </div>
    </article>
  );
};

export default ProductCard;
