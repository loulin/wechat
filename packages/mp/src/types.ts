/**
 * 微信公众号 SDK 类型定义
 */

/** Access Token */
export interface AccessToken {
  accessToken: string;
  expireTime: number;
}

/** 公众号配置 */
export interface WechatMPOptions {
  /** 公众号 AppID */
  appid: string;
  /** 公众号 AppSecret */
  secret: string;
  /** 获取缓存的 Token */
  getToken?: () => Promise<AccessToken | null>;
  /** 保存 Token 到缓存 */
  saveToken?: (token: AccessToken) => Promise<void>;
}

/** 用户基本信息 */
export interface UserInfo {
  /** 用户是否订阅 */
  subscribe: 0 | 1;
  /** OpenID */
  openid: string;
  /** 语言 */
  language: string;
  /** 关注时间戳 */
  subscribe_time: number;
  /** UnionID（需绑定开放平台） */
  unionid?: string;
  /** 备注名 */
  remark: string;
  /** 分组 ID */
  groupid: number;
  /** 标签 ID 列表 */
  tagid_list: number[];
  /** 关注渠道来源 */
  subscribe_scene: string;
  /** 二维码扫码场景 */
  qr_scene: number;
  /** 二维码扫码场景描述 */
  qr_scene_str: string;
}

/** 用户列表结果 */
export interface UserListResult {
  /** 总数 */
  total: number;
  /** 本次拉取数量 */
  count: number;
  /** 用户 OpenID 列表 */
  data: { openid: string[] };
  /** 下一个 OpenID */
  next_openid: string;
}

/** 菜单按钮 */
export interface MenuButton {
  type?:
    | 'click'
    | 'view'
    | 'scancode_push'
    | 'scancode_waitmsg'
    | 'pic_sysphoto'
    | 'pic_photo_or_album'
    | 'pic_weixin'
    | 'location_select'
    | 'media_id'
    | 'article_id'
    | 'article_view_limited'
    | 'miniprogram';
  name: string;
  key?: string;
  url?: string;
  media_id?: string;
  appid?: string;
  pagepath?: string;
  article_id?: string;
  sub_button?: MenuButton[];
}

/** 菜单结构 */
export interface Menu {
  button: MenuButton[];
}

/** 模板消息数据 */
export interface TemplateData {
  [key: string]: { value: string; color?: string };
}

/** 模板消息请求 */
export interface TemplateMessageRequest {
  /** 接收者 OpenID */
  touser: string;
  /** 模板 ID */
  template_id: string;
  /** 跳转 URL */
  url?: string;
  /** 小程序跳转 */
  miniprogram?: {
    appid: string;
    pagepath?: string;
  };
  /** 模板数据 */
  data: TemplateData;
}

/** JS-SDK 配置 */
export interface JssdkConfig {
  appId: string;
  timestamp: number;
  nonceStr: string;
  signature: string;
}

/** 标签 */
export interface Tag {
  id: number;
  name: string;
  count: number;
}

/** 客服消息类型 */
export type CustomerMessageType =
  | 'text'
  | 'image'
  | 'voice'
  | 'video'
  | 'music'
  | 'news'
  | 'mpnews'
  | 'msgmenu'
  | 'wxcard'
  | 'miniprogrampage';

/** 素材类型 */
export type MediaType = 'image' | 'voice' | 'video' | 'thumb';
