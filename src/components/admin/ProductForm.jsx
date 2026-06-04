const ProductForm = ({ form, categories, onChange, onSubmit, submitText = '保存商品' }) => {
  return (
    <form className="pm-admin-form" onSubmit={onSubmit}>
      <label className="pm-control">
        <span className="pm-label">商品名称</span>
        <input className="pm-input" name="name" value={form.name} onChange={onChange} required />
      </label>
      <label className="pm-control">
        <span className="pm-label">商品价格</span>
        <input className="pm-input" min="0" name="price" step="0.01" type="number" value={form.price} onChange={onChange} required />
      </label>
      <label className="pm-control">
        <span className="pm-label">所属分类</span>
        <select className="pm-select" name="categoryId" value={form.categoryId} onChange={onChange} required>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
      </label>
      <label className="pm-control">
        <span className="pm-label">库存</span>
        <input className="pm-input" min="0" name="stock" type="number" value={form.stock} onChange={onChange} required />
      </label>
      <label className="pm-control pm-admin-form-wide">
        <span className="pm-label">封面地址</span>
        <input className="pm-input" name="cover" value={form.cover} onChange={onChange} required />
      </label>
      <label className="pm-control pm-admin-form-wide">
        <span className="pm-label">商品描述</span>
        <textarea className="pm-textarea" name="description" value={form.description} onChange={onChange} required />
      </label>
      <label className="pm-control">
        <span className="pm-label">商品状态</span>
        <select className="pm-select" name="status" value={form.status} onChange={onChange}>
          <option value="on-sale">上架中</option>
          <option value="off-sale">已下架</option>
        </select>
      </label>
      <div className="pm-control pm-admin-form-wide">
        <button className="pm-btn pm-btn-primary" type="submit">{submitText}</button>
      </div>
    </form>
  );
};

export default ProductForm;
