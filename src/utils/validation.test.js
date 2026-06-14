import test from 'node:test';
import assert from 'node:assert/strict';

import {
  collectErrors,
  validatePassword,
  validatePhone,
  validateRequired,
  validateUsername,
} from './validation.js';

test('validateRequired reports empty trimmed values', () => {
  assert.equal(validateRequired('', '用户名'), '用户名不能为空');
  assert.equal(validateRequired('   ', '收货人'), '收货人不能为空');
  assert.equal(validateRequired('像素顾客', '收货人'), '');
});

test('validatePhone accepts only mainland China style 11 digit phone numbers', () => {
  assert.equal(validatePhone('13800000000'), '');
  assert.equal(validatePhone('23800000000'), '请输入 11 位有效手机号');
  assert.equal(validatePhone('1380000000'), '请输入 11 位有效手机号');
});

test('validatePassword and validateUsername enforce minimum length', () => {
  assert.equal(validatePassword('12345'), '密码至少 6 位');
  assert.equal(validatePassword('123456'), '');
  assert.equal(validateUsername('ab'), '用户名至少 3 个字符');
  assert.equal(validateUsername('abc'), '');
});

test('collectErrors keeps only fields with messages', () => {
  assert.deepEqual(
    collectErrors([
      ['username', '用户名至少 3 个字符'],
      ['password', ''],
      ['phone', '请输入 11 位有效手机号'],
    ]),
    {
      username: '用户名至少 3 个字符',
      phone: '请输入 11 位有效手机号',
    },
  );
});
