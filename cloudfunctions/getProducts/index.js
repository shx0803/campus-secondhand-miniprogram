const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

const PRODUCTS = 'products';
const DEFAULT_PAGE_SIZE = 8;

/** 转义正则特殊字符，避免用户输入破坏查询 */
function escapeRegExp(text) {
  return String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 商品列表：支持分类、关键词、排序、分页
 * 入参：{ category?, keyword?, sort?, page?, pageSize? }
 * 返回：{ code, message, data: { list, total, hasMore } }
 */
exports.main = async (event, context) => {
  try {
    const {
      category = 'all',
      keyword = '',
      sort = 'default',
      page = 1,
      pageSize = DEFAULT_PAGE_SIZE
    } = event || {};

    const conditions = [{ status: 'on_sale' }];
    if (category && category !== 'all') {
      conditions.push({ category });
    }
    if (keyword && String(keyword).trim()) {
      const reg = db.RegExp({ regexp: escapeRegExp(String(keyword).trim()), options: 'i' });
      conditions.push(_.or([{ title: reg }, { description: reg }]));
    }
    const where = conditions.length > 1 ? _.and(conditions) : conditions[0];

    const countRes = await db.collection(PRODUCTS).where(where).count();
    const total = countRes.total;

    let query = db.collection(PRODUCTS).where(where);
    if (sort === 'latest') {
      query = query.orderBy('createTime', 'desc');
    } else if (sort === 'price-asc') {
      query = query.orderBy('price', 'asc');
    } else if (sort === 'price-desc') {
      query = query.orderBy('price', 'desc');
    } else {
      query = query.orderBy('views', 'desc').orderBy('createTime', 'desc');
    }

    const skip = (Math.max(1, page) - 1) * pageSize;
    const res = await query.skip(skip).limit(pageSize).get();

    return {
      code: 0,
      message: 'success',
      data: {
        list: res.data,
        total,
        hasMore: skip + res.data.length < total
      }
    };
  } catch (err) {
    console.error('[getProducts] error:', err);
    return { code: -1, message: err.message || '服务异常', data: null };
  }
};