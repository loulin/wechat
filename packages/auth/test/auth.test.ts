import { describe, it, expect } from 'vitest';
import { WechatAuth } from '../src/index.js';

describe('WechatAuth', () => {
  const auth = new WechatAuth({
    appid: 'wx1234567890',
    appsecret: 'testsecret',
  });

  describe('getAuthorizeURL', () => {
    it('should generate authorize URL with snsapi_base', () => {
      const url = auth.getAuthorizeURL('https://example.com/callback');
      expect(url).toContain('https://open.weixin.qq.com/connect/oauth2/authorize');
      expect(url).toContain('appid=wx1234567890');
      expect(url).toContain('redirect_uri=https%3A%2F%2Fexample.com%2Fcallback');
      expect(url).toContain('scope=snsapi_base');
      expect(url).toContain('#wechat_redirect');
    });

    it('should generate authorize URL with snsapi_userinfo', () => {
      const url = auth.getAuthorizeURL('https://example.com/callback', 'snsapi_userinfo', 'test');
      expect(url).toContain('scope=snsapi_userinfo');
      expect(url).toContain('state=test');
    });
  });

  describe('with component', () => {
    const componentAuth = new WechatAuth({
      appid: 'wx1234567890',
      appsecret: 'testsecret',
      componentAppid: 'wxcomponent123',
      getComponentAccessToken: async () => 'test_component_token',
    });

    it('should include component_appid in authorize URL', () => {
      const url = componentAuth.getAuthorizeURL('https://example.com/callback');
      expect(url).toContain('component_appid=wxcomponent123');
    });
  });
});
