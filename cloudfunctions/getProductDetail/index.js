const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

const PRODUCTS = 'products';
const FAVORITES = 'favorites';

/**
 * 商品详情：返回商品信息、浏览量 +1、当前用户是否已收藏
 * 入参：{ id }
 * 返回：{ code, message, data: { product, favorited } }
 */
exports.main = async (event, context) => {
  try {
    const { id } = event || {};
    if (!id) {
      throw new Error('缺少商品 id');
    }

    const { OPENID } = cloud.getWXContext();
    const detail = await db.collection(PRODUCTS).doc(id).get();
    const product = detail.data;

    // 浏览量自增（失败不影响详情返回）
    try {
      await db.collection(PRODUCTS).doc(id).update({ data: { views: _.inc(1) } });
      product.views = (product.views || 0) + 1;
    } catch (viewErr) {
      console.error('[getProductDetail] 浏览量自增失败:', viewErr);
    }

    let favorited = false;
    if (OPENID) {
      const favRes = await db
        .collection(FAVORITES)
        .where({ _openid: OPENID, productId: id })
        .count();
      favorited = favRes.total > 0;
    }

    return { code: 0, message: 'success', data: { product, favorited } };
  } catch (err) {
    console.error('[getProductDetail] error:', err);
    return { code: -1, message: err.message || '商品不存在或已被下架', data: null };
  }
};