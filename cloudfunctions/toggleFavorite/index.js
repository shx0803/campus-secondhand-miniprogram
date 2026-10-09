const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

const FAVORITES = 'favorites';

/**
 * 收藏 / 取消收藏
 * 入参：{ productId }
 * 返回：{ code, message, data: { favorited, total } }
 */
exports.main = async (event, context) => {
  try {
    const { OPENID } = cloud.getWXContext();
    if (!OPENID) {
      throw new Error('未获取到用户身份');
    }

    const { productId } = event || {};
    if (!productId) {
      throw new Error('缺少商品 id');
    }

    const exist = await db
      .collection(FAVORITES)
      .where({ _openid: OPENID, productId })
      .limit(1)
      .get();

    let favorited;
    if (exist.data.length > 0) {
      await db.collection(FAVORITES).doc(exist.data[0]._id).remove();
      favorited = false;
    } else {
      await db.collection(FAVORITES).add({
        data: { _openid: OPENID, productId, createTime: db.serverDate() }
      });
      favorited = true;
    }

    const totalRes = await db.collection(FAVORITES).where({ _openid: OPENID }).count();
    console.info('[toggleFavorite]', productId, '->', favorited);

    return {
      code: 0,
      message: 'success',
      data: { favorited, total: totalRes.total }
    };
  } catch (err) {
    console.error('[toggleFavorite] error:', err);
    return { code: -1, message: err.message || '服务异常', data: null };
  }
};