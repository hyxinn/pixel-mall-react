import { useContext, useState } from 'react';
import PermissionGate from '../../components/admin/PermissionGate';
import ProductForm from '../../components/admin/ProductForm';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import StatusTag from '../../components/common/StatusTag';
import { ServiceContext } from '../../contexts/ServiceContext';

const createInitialForm = (categories) => ({
  id: null,
  name: '',
  price: 0,
  categoryId: categories[0]?.id || '',
  stock: 0,
  cover: '/favicon.svg',
  description: '',
  status: 'on-sale',
});

const AdminProductsPage = () => {
  const { admin, good } = useContext(ServiceContext);
  const categories = good.getCategoryList();
  const [filters, setFilters] = useState({ keyword: '', categoryId: 'all', status: 'all' });
  const [form, setForm] = useState(createInitialForm(categories));
  const [editingId, setEditingId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [message, setMessage] = useState('');

  const canManage = admin.hasPermission('products:manage');
  const products = good.getGoodList(filters);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setForm(createInitialForm(categories));
  };

  const openCreateForm = () => {
    setEditingId(null);
    setForm(createInitialForm(categories));
    setIsFormOpen(true);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (editingId) {
      good.updateGood({ ...form, id: editingId });
      setMessage('商品已更新。');
    } else {
      good.addGood(form);
      setMessage('商品已新增。');
    }

    closeForm();
  };

  const handleEdit = (product) => {
    if (!canManage) {
      return;
    }

    setEditingId(product.id);
    setForm({
      id: product.id,
      name: product.name,
      price: product.price,
      categoryId: product.categoryId,
      stock: product.stock,
      cover: product.cover,
      description: product.description,
      status: product.status,
    });
    setIsFormOpen(true);
  };

  const handleDelete = () => {
    if (!deletingProduct || !canManage) {
      setDeletingProduct(null);
      return;
    }

    good.deleteGood(deletingProduct.id);
    setMessage('商品已删除。');
    setDeletingProduct(null);
    if (editingId === deletingProduct.id) {
      closeForm();
    }
  };

  const handleToggleStatus = (productId) => {
    if (!canManage) {
      return;
    }

    const updatedProduct = good.toggleGoodStatus(productId);
    if (!updatedProduct) {
      setMessage('已删除商品不能调整上下架状态。');
      return;
    }

    setMessage(updatedProduct.status === 'on-sale' ? '商品已重新上架。' : '商品已下架。');
    if (editingId === productId) {
      handleEdit(updatedProduct);
    }
  };

  return (
    <div className="pm-admin-products-page">
      <section className="pm-admin-page-header">
        <div>
          <h2 className="pm-section-title">商品管理</h2>
          <p className="pm-help">支持搜索、筛选、上下架、新增和编辑商品。</p>
        </div>
        <PermissionGate permission="products:manage">
          <Button type="button" onClick={openCreateForm}>新增商品</Button>
        </PermissionGate>
      </section>

      {message ? <div className="pm-alert">{message}</div> : null}

      <section className="pm-admin-page-filters">
        <label className="pm-control">
          <span className="pm-label">搜索商品</span>
          <input className="pm-input" name="keyword" value={filters.keyword} onChange={handleFilterChange} placeholder="输入商品名或分类" />
        </label>
        <label className="pm-control">
          <span className="pm-label">分类筛选</span>
          <select className="pm-select" name="categoryId" value={filters.categoryId} onChange={handleFilterChange}>
            <option value="all">全部分类</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </label>
        <label className="pm-control">
          <span className="pm-label">状态筛选</span>
          <select className="pm-select" name="status" value={filters.status} onChange={handleFilterChange}>
            <option value="all">全部状态</option>
            <option value="on-sale">上架中</option>
            <option value="off-sale">已下架</option>
            <option value="deleted">已删除</option>
          </select>
        </label>
      </section>

      {products.length ? (
        <div className="pm-admin-table-panel">
          <div className="pm-table-wrap">
            <table className="pm-table">
              <thead>
                <tr>
                  <th>商品</th>
                  <th>分类</th>
                  <th>价格</th>
                  <th>库存</th>
                  <th>状态</th>
                  <th>更新时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <strong>{product.name}</strong>
                      <p className="pm-help">ID: {product.id}</p>
                    </td>
                    <td>{product.categoryName}</td>
                    <td>¥{product.price}</td>
                    <td>{product.stock}</td>
                    <td>
                      <StatusTag value={product.status}>
                        {product.status === 'on-sale' ? '上架中' : product.status === 'off-sale' ? '已下架' : '已删除'}
                      </StatusTag>
                    </td>
                    <td>{product.updatedAt}</td>
                    <td>
                      <div className="pm-table-actions">
                        <PermissionGate permission="products:manage">
                          <Button type="button" variant="ghost" onClick={() => handleEdit(product)}>编辑</Button>
                        </PermissionGate>
                        <PermissionGate permission="products:manage">
                          <Button type="button" variant="mint" onClick={() => handleToggleStatus(product.id)} disabled={product.status === 'deleted'}>
                            {product.status === 'on-sale' ? '下架' : '上架'}
                          </Button>
                        </PermissionGate>
                        <PermissionGate permission="products:manage">
                          <Button type="button" variant="danger" onClick={() => setDeletingProduct(product)}>删除</Button>
                        </PermissionGate>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState title="暂无商品" description="当前筛选条件下没有找到商品。" />
      )}

      <PermissionGate permission="products:manage">
        <Modal
          cancelText="取消"
          confirmText=""
          onClose={closeForm}
          onConfirm={closeForm}
          open={isFormOpen}
          title={editingId ? '编辑商品' : '新增商品'}
        >
          <div className="pm-admin-panel">
            <p className="pm-help">保存后会同步影响前台商品展示和购买状态。</p>
            <ProductForm
              categories={categories}
              form={form}
              onChange={handleFormChange}
              onSubmit={handleSubmit}
              submitText={editingId ? '保存修改' : '创建商品'}
            />
          </div>
        </Modal>
      </PermissionGate>

      <Modal
        cancelText="取消"
        confirmText="确认删除"
        onClose={() => setDeletingProduct(null)}
        onConfirm={handleDelete}
        open={Boolean(deletingProduct)}
        title="删除商品"
      >
        <p>删除后商品会保留历史订单快照，但前台不会再显示该商品。</p>
        <p>{deletingProduct?.name}</p>
      </Modal>
    </div>
  );
};

export default AdminProductsPage;
