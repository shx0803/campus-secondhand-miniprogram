/**
 * 本地数据层（无后端模式）
 *
 * 与 cloudfunctions/ 下的 7 个云函数保持完全一致的入参 / 出参契约，
 * 数据落在 wx.setStorageSync，因此发布、收藏在开发者工具里可以真实持久化。
 */

const seed = require('./seed');

const PRODUCTS_KEY = 'xianzhi_products';
const FAVORITES_KEY = 'xianzhi_favorites';
const USER_KEY = 'xianzhi_user';

const DEFAULT_PAGE_SIZE = 8;

/* ============================================
 * 基础读写
 * ============================================ */

function ensureProducts() {
  let list = wx.getStorageSync(PRODUCTS_KEY);
  if (!Array.isArray(list) || list.length === 0) {
    list = seed.seedProducts.map(function (item) {
      return Object.assign({}, item);
    });
    wx.setStorageSync(PRODUCTS_KEY, list);
  }
  return list;
}

function saveProducts(list) {
  wx.setStorageSync(PRODUCTS_KEY, list);
}

function getFavoriteMap() {
  let map = wx.getStorageSync(FAVORITES_KEY);
  if (!map || typeof map !== 'object' || Array.isArray(map)) {
    map = {};
  }
  if (!Array.isArray(map[seed.MOCK_OPENID])) {
    map[seed.MOCK_OPENID] = ['p001', 'p007'];
    wx.setStorageSync(FAVORITES_KEY, map);
  }
  return map;
}

function saveFavoriteMap(map) {
  wx.setStorageSync(FAVORITES_KEY, map);
}

function getCurrentUser() {
  let user = wx.getStorageSync(USER_KEY);
  if (!user || !user.openid) {
    user = Object.assign({}, seed.mockUser);
    wx.setStorageSync(USER_KEY, user);
  }
  return user;
}

function escapeRegExp(text) {
  return String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/* ============================================
 * 接口实现
 * ============================================ */

/** 登录：返回当前用户身份 */
function login() {
  const user = getCurrentUser();
  return { openid: user.openid, user: user };
}

/**
 * 商品列表：支持分类、关键词、排序、分页
 * @returns {{list: Array, total: number, hasMore: boolean}}
 */
function getProducts(query) {
  const params = query || {};
  const category = params.category || 'all';
  const keyword = (params.keyword || '').trim();
  const sort = params.sort || 'default';
  const page = Number(params.page) || 1;
  const pageSize = Number(params.pageSize) || DEFAULT_PAGE_SIZE;

  const reg = keyword ? new RegExp(escapeRegExp(keyword), 'i') : null;

  let list = ensureProducts().filter(function (item) {
    if (item.status !== 'on_sale') return false;
    if (category !== 'all' && item.category !== category) return false;
    if (reg && !reg.test(item.title) && !reg.test(item.description)) return false;
    return true;
  });

  if (sort === 'latest') {
    list = list.slice().sort(function (a, b) {
      return b.createTime - a.createTime;
    });
  } else if (sort === 'price-asc') {
    list = list.slice().sort(function (a, b) {
      return a.price - b.price;
    });
  } else if (sort === 'price-desc') {
    list = list.slice().sort(function (a, b) {
      return b.price - a.price;
    });
  } else {
    list = list.slice().sort(function (a, b) {
      return b.views - a.views || b.createTime - a.createTime;
    });
  }

  const total = list.length;
  const start = (Math.max(1, page) - 1) * pageSize;
  const paged = list.slice(start, start + pageSize);

  return { list: paged, total: total, hasMore: start + paged.length < total };
}

/** 商品详情：浏览量自增 + 返回当前用户是否已收藏 */
function getProductDetail(params) {
  const id = (params || {}).id;
  const list = ensureProducts();
  const index = list.findIndex(function (item) {
    return item._id === id;
  });
  if (index < 0) {
    throw new Error('商品不存在或已被下架');
  }

  const next = list.slice();
  next[index] = Object.assign({}, next[index], { views: next[index].views + 1 });
  saveProducts(next);

  const user = getCurrentUser();
  const favorites = getFavoriteMap()[user.openid] || [];

  return {
    product: next[index],
    favorited: favorites.indexOf(id) > -1
  };
}

/** 发布商品 */
function createProduct(payload) {
  const data = payload || {};
  if (!data.title || !data.price) {
    throw new Error('标题和价格不能为空');
  }
  const user = getCurrentUser();
  const product = {
    _id: 'p_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
    _openid: user.openid,
    title: data.title,
    price: data.price,
    originalPrice: data.originalPrice,
    category: data.category,
    condition: data.condition,
    description: data.description,
    images: data.images || [],
    contact: data.contact,
    campus: data.campus,
    sellerName: user.nickname,
    sellerAvatar: user.avatar,
    status: 'on_sale',
    views: 0,
    createTime: Date.now()
  };
  saveProducts([product].concat(ensureProducts()));
  return { id: product._id };
}

/** 我发布的商品 */
function getMyProducts() {
  const user = getCurrentUser();
  const list = ensureProducts()
    .filter(function (item) {
      return item._openid === user.openid;
    })
    .sort(function (a, b) {
      return b.createTime - a.createTime;
    });
  return { list: list };
}

/** 收藏 / 取消收藏 */
function toggleFavorite(params) {
  const productId = (params || {}).productId;
  if (!productId) {
    throw new Error('缺少商品 id');
  }
  const user = getCurrentUser();
  const map = getFavoriteMap();
  const current = map[user.openid] || [];
  const exists = current.indexOf(productId) > -1;

  map[user.openid] = exists
    ? current.filter(function (id) {
        return id !== productId;
      })
    : [productId].concat(current);
  saveFavoriteMap(map);

  return { favorited: !exists, total: map[user.openid].length };
}

/** 我的收藏列表 */
function getMyFavorites() {
  const user = getCurrentUser();
  const ids = getFavoriteMap()[user.openid] || [];
  const products = ensureProducts();
  const list = ids
    .map(function (id) {
      return products.find(function (item) {
        return item._id === id;
      });
    })
    .filter(function (item) {
      return !!item;
    });
  return { list: list };
}

module.exports = {
  login: login,
  getProducts: getProducts,
  getProductDetail: getProductDetail,
  createProduct: createProduct,
  getMyProducts: getMyProducts,
  toggleFavorite: toggleFavorite,
  getMyFavorites: getMyFavorites
};