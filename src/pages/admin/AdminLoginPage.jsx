import { useContext, useMemo, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import { ServiceContext } from '../../contexts/ServiceContext';

const AdminLoginPage = () => {
  const { admin } = useContext(ServiceContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ username: 'admin', password: 'admin123' });
  const [error, setError] = useState('');

  const tips = useMemo(
    () => [
      '管理员：admin / admin123',
      '运营：operator / operator123',
    ],
    [],
  );

  if (admin.isAuthenticated()) {
    return <Navigate to="/admin" replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const result = admin.login(form);

    if (!result.success) {
      setError(result.message);
      return;
    }

    navigate(location.state?.from || '/admin', { replace: true });
  };

  return (
    <main className="pm-admin-login-page">
      <section className="pm-admin-login-panel">
        <div>
          <h1 className="pm-admin-login-title">商城后台登录</h1>
          <p className="pm-help">使用管理员或运营账号进入后台管理界面。</p>
        </div>
        <div className="pm-alert">
          {tips.map((tip) => (
            <p key={tip}>{tip}</p>
          ))}
        </div>
        <form className="pm-admin-login-form" onSubmit={handleSubmit}>
          <label className={`pm-control${error ? ' pm-field-error' : ''}`}>
            <span className="pm-label">账号</span>
            <input className="pm-input" name="username" value={form.username} onChange={handleChange} required />
          </label>
          <label className={`pm-control${error ? ' pm-field-error' : ''}`}>
            <span className="pm-label">密码</span>
            <input className="pm-input" name="password" type="password" value={form.password} onChange={handleChange} required />
            {error ? <span className="pm-help">{error}</span> : null}
          </label>
          <Button block type="submit">进入后台</Button>
        </form>
      </section>
    </main>
  );
};

export default AdminLoginPage;
