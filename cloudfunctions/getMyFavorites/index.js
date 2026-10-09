const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

const PRODUCTS = 'products';
const FAVORITES = 'favorites';

/**
 * 我的收藏列表（保持收藏时间倒序）
 * 返回：{ code, message, data: { list } }
 */
exports.main = async (event, context) => {
  try {
    const { OPENID } = cloud.getWXContext();
    if (!OPENID) {
      throw new Error('未获取到用户身份');
    }

    const favRes = await db
      .collection(FAVORITES)
      .where({ _openid: OPENID })
      .orderBy('createTime', 'desc')
      .limit(100)
      .get();

    const ids = favRes.data.map((item) => item.productId);
    if (ids.length === 0) {
      return { code: 0, message: 'success', data: { list: [] } };
    }

    const prodRes = await db.collection(PRODUCTS).where({ _id: _.in(ids) }).get();
    const map = new Map(prodRes.data.map((item) => [item._id, item]));
    const list = ids.map((id) => map.get(id)).filter(Boolean);

    return { code: 0, message: 'success', data: { list } };
  } catch (err) {
    console.error('[getMyFavorites] error:', err);
    return { code: -1, message: err.message || '服务异常', data: null };
  }
};