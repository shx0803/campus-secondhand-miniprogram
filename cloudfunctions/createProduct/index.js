const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

const PRODUCTS = 'products';
const USERS = 'users';

/**
 * 发布商品
 * 入参：{ title, price, originalPrice?, category, condition, description, images, contact, campus }
 * 返回：{ code, message, data: { id } }
 */
exports.main = async (event, context) => {
  try {
    const { OPENID } = cloud.getWXContext();
    if (!OPENID) {
      throw new Error('未获取到用户身份');
    }

    const {
      title,
      price,
      originalPrice,
      category = 'other',
      condition = '九成新',
      description = '',
      images = [],
      contact = '',
      campus = '东校区'
    } = event || {};

    if (!title || !String(title).trim()) {
      throw new Error('请填写商品标题');
    }
    if (!price || Number(price) <= 0) {
      throw new Error('请填写有效的售价');
    }
    if (!Array.isArray(images) || images.length === 0) {
      throw new Error('请至少上传一张商品图片');
    }

    // 卖家信息从用户档案读取，避免前端伪造
    let sellerName = '同学';
    let sellerAvatar = '';
    const userRes = await db.collection(USERS).where({ _openid: OPENID }).limit(1).get();
    if (userRes.data[0]) {
      sellerName = userRes.data[0].nickname || sellerName;
      sellerAvatar = userRes.data[0].avatar || '';
    }

    const product = {
      _openid: OPENID,
      title: String(title).trim(),
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      category,
      condition,
      description: String(description).trim(),
      images,
      contact: String(contact).trim(),
      campus,
      sellerName,
      sellerAvatar,
      status: 'on_sale',
      views: 0,
      createTime: db.serverDate()
    };

    const res = await db.collection(PRODUCTS).add({ data: product });
    console.info('[createProduct] 发布成功:', res._id);
    return { code: 0, message: 'success', data: { id: res._id } };
  } catch (err) {
    console.error('[createProduct] error:', err);
    return { code: -1, message: err.message || '服务异常', data: null };
  }
};