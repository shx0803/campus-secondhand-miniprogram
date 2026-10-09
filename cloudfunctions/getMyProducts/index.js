const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

const PRODUCTS = 'products';

/**
 * 我发布的商品
 * 返回：{ code, message, data: { list } }
 */
exports.main = async (event, context) => {
  try {
    const { OPENID } = cloud.getWXContext();
    if (!OPENID) {
      throw new Error('未获取到用户身份');
    }

    const res = await db
      .collection(PRODUCTS)
      .where({ _openid: OPENID })
      .orderBy('createTime', 'desc')
      .limit(100)
      .get();

    return { code: 0, message: 'success', data: { list: res.data } };
  } catch (err) {
    console.error('[getMyProducts] error:', err);
    return { code: -1, message: err.message || '服务异常', data: null };
  }
};