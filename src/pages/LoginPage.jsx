import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import Button from '../components/common/Button';
import { useServices } from '../hooks/useServices';
import {
  collectErrors,
  validatePassword,
  validateRequired,
  validateUsername,
} from '../utils/validation';

const LoginPage = () => {
  const { api } = useServices();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') === 'register' ? 'register' : 'login';
  const redirect = searchParams.get('redirect') || '/home';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const switchMode = (nextMode) => {
    const next = new URLSearchParams(searchParams);
    if (nextMode === 'register') {
      next.set('mode', 'register');
    } else {
      next.delete('mode');
    }
    navigate(`/login?${next.toString()}`, { replace: true });
    setErrors({});
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const fieldErrors = collectErrors([
      ['username', validateUsername(username)],
      ['password', mode === 'register' ? validatePassword(password) : validateRequired(password, '密码')],
      ['nickname', mode === 'register' ? validateRequired(nickname, '昵称') : ''],
    ]);
    setErrors(fieldErrors);

    if (Object.keys(fieldErrors).length) {
      return;
    }

    setSubmitting(true);
    const result =
      mode === 'register'
        ? await api.user.register({ username: username.trim(), password, nickname: nickname.trim() })
        : await api.user.login(username.trim(), password);

    setSubmitting(false);

    if (!result.success) {
      setErrors({ form: result.message });
      return;
    }

    navigate(decodeURIComponent(redirect), { replace: true });
  };

  return (
    <main className="pm-page pm-login-page">
      <section className="pm-login-panel">
        <header className="pm-login-hero">
          <span className="pm-login-logo" aria-hidden="true">PM</span>
          <div className="pm-login-heading">
            <p className="pm-login-eyebrow">Pixel Mall</p>
            <h1 className="pm-login-title">{mode === 'register' ? '创建你的账号' : '欢迎回来'}</h1>
            <p className="pm-login-subtitle">{mode === 'register' ? '注册后即可同步收藏、足迹和订单。' : '登录后继续查看收藏、订单和购物车。'}</p>
          </div>
        </header>

        <div className="pm-login-switch" role="tablist" aria-label="登录注册切换">
          <button
            type="button"
            className={`pm-login-switch-btn${mode === 'login' ? ' is-active' : ''}`}
            onClick={() => switchMode('login')}
            aria-selected={mode === 'login'}
          >
            登录
          </button>
          <button
            type="button"
            className={`pm-login-switch-btn${mode === 'register' ? ' is-active' : ''}`}
            onClick={() => switchMode('register')}
            aria-selected={mode === 'register'}
          >
            注册
          </button>
        </div>

        <form className="pm-login-form" onSubmit={handleSubmit} noValidate>
          {mode === 'register' ? (
            <div className={`pm-control${errors.nickname ? ' pm-field-error' : ''}`}>
              <label className="pm-label" htmlFor="nickname">昵称</label>
              <input
                id="nickname"
                className="pm-input"
                placeholder="给自己取个昵称"
                autoComplete="nickname"
                value={nickname}
                onChange={(event) => setNickname(event.target.value)}
              />
              {errors.nickname ? <p className="pm-help has-error">{errors.nickname}</p> : null}
            </div>
          ) : null}
          <div className={`pm-control${errors.username ? ' pm-field-error' : ''}`}>
            <label className="pm-label" htmlFor="username">用户名</label>
            <input
              id="username"
              className="pm-input"
              placeholder="请输入用户名"
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
            {errors.username ? <p className="pm-help has-error">{errors.username}</p> : null}
          </div>
          <div className={`pm-control${errors.password ? ' pm-field-error' : ''}`}>
            <label className="pm-label" htmlFor="password">密码</label>
            <input
              id="password"
              type="password"
              className="pm-input"
              placeholder={mode === 'register' ? '至少 6 位密码' : '请输入密码'}
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            {errors.password ? <p className="pm-help has-error">{errors.password}</p> : null}
          </div>
          {errors.form ? <p className="pm-help has-error">{errors.form}</p> : null}
          <Button type="submit" variant="primary" block disabled={submitting}>
            {submitting ? '提交中...' : mode === 'register' ? '注册并登录' : '登录'}
          </Button>
        </form>

        <footer className="pm-login-footer">
          <p className="pm-login-demo">演示账号 <strong>shopper</strong> / <strong>shopper123</strong></p>
          <Link className="pm-login-home-link" to="/home">返回首页</Link>
        </footer>
      </section>
    </main>
  );
};

export default LoginPage;
