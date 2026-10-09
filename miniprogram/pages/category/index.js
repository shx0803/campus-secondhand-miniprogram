const cloud = require('../../utils/cloud');
const seed = require('../../data/seed');

const PAGE_SIZE = 10;

const SIDE_ITEMS = [{ key: 'all', label: '全部闲置', desc: '同学们都在卖什么' }].concat(
  seed.categories.map((item) => ({
    key: item.key,
    label: item.label,
    desc: item.label + '专区'
  }))
);

Page({
  data: {
    active: 'all',
    activeDesc: SIDE_ITEMS[0].desc,
    sideItems: SIDE_ITEMS,
    list: [],
    total: 0,
    page: 1,
    hasMore: true,
    loading: false
  },

  onLoad() {
    this.loadData(1, true);
  },

  loadData(targetPage, replace) {
    this.setData({ loading: true });

    return cloud
      .callFunction('getProducts', {
        category: this.data.active,
        sort: 'latest',
        page: targetPage,
        pageSize: PAGE_SIZE
      })
      .then((res) => {
        console.info('[CategoryPage] 加载成功:', this.data.active, res.list.length);
        this.setData({
          list: replace ? res.list : this.data.list.concat(res.list),
          total: res.total,
          hasMore: res.hasMore,
          page: targetPage,
          loading: false
        });
      })
      .catch((err) => {
        console.error('[CategoryPage] 加载失败:', err);
        this.setData({ loading: false });
        wx.showToast({ title: '加载失败，请重试', icon: 'none' });
      });
  },

  onSideTap(e) {
    const key = e.currentTarget.dataset.key;
    if (key === this.data.active) return;
    const matched = SIDE_ITEMS.find((item) => item.key === key);
    this.setData(
      {
        active: key,
        activeDesc: matched ? matched.desc : SIDE_ITEMS[0].desc
      },
      () => {
        this.loadData(1, true);
      }
    );
  },

  onLoadMore() {
    if (this.data.loading || !this.data.hasMore) return;
    this.loadData(this.data.page + 1, false);
  },

  onCardTap(e) {
    const product = e.detail.product;
    if (!product) return;
    wx.navigateTo({ url: '/pages/detail/index?id=' + product._id });
  }
});