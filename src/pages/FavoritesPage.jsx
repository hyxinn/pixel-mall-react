import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import EmptyState from '../components/common/EmptyState';
import Button from '../components/common/Button';
import ProductCard from '../components/h5/ProductCard';
import Pagination from '../components/h5/Pagination';
import { usePagination } from '../hooks/usePagination';
import { useServices, useServiceVersion } from '../hooks/useServices';

const FavoritesPage = () => {
  const { good, favorite, user, api } = useServices();
  const goodRevision = useServiceVersion(good);
  const favoriteRevision = useServiceVersion(favorite);
  const currentUser = user.getCurrentUser();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    let isMounted = true;
    api.favorites.list(currentUser.id).then((list) => {
      if (isMounted) {
        setProducts(list);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [api, currentUser.id, goodRevision, favoriteRevision]);

  const { page, setPage, totalPages, slice, total, hasPrev, hasNext } = usePagination(products, 6);

  const handleRemove = async (productId) => {
    await api.favorites.remove(currentUser.id, productId);
  };

  if (!products.length) {
    return (
      <main className="pm-page pm-favorites-page">
        <h1>我的收藏</h1>
        <div className="pm-favorites-empty">
          <EmptyState
            title="还没有收藏"
            description="在商品详情页点击收藏，把喜欢的像素好物留在这里。"
            action={
              <Link className="pm-btn pm-btn-primary" to="/home">
                去逛逛
              </Link>
            }
          />
        </div>
      </main>
    );
  }

  return (
    <main className="pm-page pm-favorites-page">
      <header className="pm-favorites-toolbar">
        <div>
          <p className="pm-section-eyebrow">My Favorites</p>
          <h1>我的收藏</h1>
        </div>
        <Link className="pm-btn pm-btn-ghost" to="/profile">
          返回我的
        </Link>
      </header>

      <section className="pm-favorites-grid">
        {slice.map((product, index) => (
          <div key={product.id} className="pm-favorites-item">
            <ProductCard product={product} index={index} showSticker={false} />
            <Button type="button" variant="danger" onClick={() => handleRemove(product.id)}>
              取消收藏
            </Button>
          </div>
        ))}
      </section>

      <Pagination
        page={page}
        totalPages={totalPages}
        total={total}
        onPrev={() => hasPrev && setPage(page - 1)}
        onNext={() => hasNext && setPage(page + 1)}
      />
    </main>
  );
};

export default FavoritesPage;
