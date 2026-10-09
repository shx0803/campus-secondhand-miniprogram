const cloud = require('../../utils/cloud');
const seed = require('../../data/seed');

const PAGE_SIZE = 8;

const SORT_TABS = [
  { key: 'default', label: '综合' },
  { key: 'latest', label: '最新' }
];

Page({
  data: {
    category: 'all',
    sort: 'default',
    list: [],
    total: 0,
    page: 1,
    hasMore: true,
    loading: false,
    refreshing: false,

    categories: seed.categories,
    sortTabs: SORT_TABS,
    activeCategoryLabel: '全部',
    isCategoryFiltered: false,
    isPriceActive: false,
    priceArrow: '↑'
  },

  onLoad() {
    this.hasShown = false;
    this.loadData(1, true);
  },

  onShow() {
    // 从其他 Tab 返回时刷新，保证新发布的商品能及时出现
    if (this.hasShown) {
      this.loadData(1, true);
    }
    this.hasShown = true;
  },

  /** 拉取商品列表 */
  loadData(targetPage, replace) {
    this.setData({ loading: true });

    return cloud
      .callFunction('getProducts', {
        category: this.data.category,
        sort: this.data.sort,
        page: targetPage,
        pageSize: PAGE_SIZE
      })
      .then((res) => {
        console.info('[HomePage] 商品列表加载成功:', res.list.length, '总数:', res.total);
        this.setData({
          list: replace ? res.list : this.data.list.concat(res.list),
          total: res.total,
          hasMore: res.hasMore,
          page: targetPage,
          loading: false,
          refreshing: false
        });
      })
      .catch((err) => {
        console.error('[HomePage] 商品列表加载失败:', err);
        this.setData({ loading: false, refreshing: false });
        wx.showToast({ title: '加载失败，请重试', icon: 'none' });
      });
  },

  onRefresh() {
    this.setData({ refreshing: true });
    this.loadData(1, true);
  },

  onLoadMore() {
    if (this.data.loading || this.data.refreshing || !this.data.hasMore) return;
    this.loadData(this.data.page + 1, false);
  },

  /** 分类筛选（首页九宫格 + 排序栏第一个 chip 共用） */
  onCategoryTap(e) {
    const key = e.currentTarget.dataset.key;
    const matched = seed.categories.find((item) => item.key === key);

    this.setData(
      {
        category: key,
        activeCategoryLabel: matched ? matched.label : '全部',
        isCategoryFiltered: key !== 'all',
        refreshing: false
      },
      () => {
        this.loadData(1, true);
      }
    );
  },

  onSortTap(e) {
    const key = e.currentTarget.dataset.key;
    if (key === this.data.sort) return;
    this.setData({ sort: key, isPriceActive: false }, () => {
      this.loadData(1, true);
    });
  },

  onPriceSort() {
    const next = this.data.sort === 'price-asc' ? 'price-desc' : 'price-asc';
    this.setData(
      {
        sort: next,
        isPriceActive: true,
        priceArrow: next === 'price-asc' ? '↑' : '↓'
      },
      () => {
        this.loadData(1, true);
      }
    );
  },

  onSearchTap() {
    wx.navigateTo({ url: '/pages/search/index' });
  },

  onCardTap(e) {
    const product = e.detail.product;
    if (!product) return;
    wx.navigateTo({ url: '/pages/detail/index?id=' + product._id });
  }
});