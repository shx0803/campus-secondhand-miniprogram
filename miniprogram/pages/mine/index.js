const cloud = require('../../utils/cloud');

const TABS = [
  { key: 'published', label: '我发布的' },
  { key: 'favorite', label: '我收藏的' }
];

Page({
  data: {
    user: null,
    tabs: TABS,
    activeTab: 'published',
    myProducts: [],
    favorites: [],
    currentList: [],
    totalViews: 0,
    loading: true
  },

  // 每次进入页面（含首次渲染）都刷新，保证新发布的商品立即可见
  onShow() {
    this.loadData();
  },

  loadData() {
    this.setData({ loading: true });

    getApp()
      .ensureLogin()
      .then((globalData) => {
        this.setData({ user: globalData.user });
        return Promise.all([
          cloud.callFunction('getMyProducts'),
          cloud.callFunction('getMyFavorites')
        ]);
      })
      .then((res) => {
        const myProducts = res[0].list;
        const favorites = res[1].list;
        const totalViews = myProducts.reduce((sum, item) => sum + (item.views || 0), 0);

        console.info(
          '[MinePage] 数据加载完成，发布:',
          myProducts.length,
          '收藏:',
          favorites.length
        );

        this.setData({
          myProducts: myProducts,
          favorites: favorites,
          totalViews: totalViews,
          currentList: this.data.activeTab === 'published' ? myProducts : favorites,
          loading: false
        });
      })
      .catch((err) => {
        console.error('[MinePage] 数据加载失败:', err);
        this.setData({ loading: false });
        wx.showToast({ title: '加载失败，请重试', icon: 'none' });
      });
  },

  onTabTap(e) {
    const key = e.currentTarget.dataset.key;
    if (key === this.data.activeTab) return;
    this.setData({
      activeTab: key,
      currentList: key === 'published' ? this.data.myProducts : this.data.favorites
    });
  },

  onCardTap(e) {
    const product = e.detail.product;
    if (!product) return;
    wx.navigateTo({ url: '/pages/detail/index?id=' + product._id });
  },

  onEmptyAction() {
    if (this.data.activeTab === 'published') {
      wx.switchTab({ url: '/pages/publish/index' });
    } else {
      wx.switchTab({ url: '/pages/home/index' });
    }
  }
});