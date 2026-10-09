const cloud = require('../../utils/cloud');
const seed = require('../../data/seed');
const format = require('../../utils/format');

Page({
  data: {
    id: '',
    product: null,
    categoryItem: null,
    descImages: [],
    favorited: false,
    current: 0,
    loading: true,
    showContact: false,
    isSelf: false,

    priceText: '',
    originalPriceText: '',
    viewsText: '',
    timeText: '',
    discount: 0
  },

  onLoad(options) {
    const id = (options && options.id) || '';
    this.setData({ id: id });
    this.loadDetail();
  },

  loadDetail() {
    if (!this.data.id) {
      this.setData({ loading: false });
      return;
    }

    this.setData({ loading: true });

    getApp()
      .ensureLogin()
      .then((globalData) => {
        this.myOpenid = globalData.openid;
        return cloud.callFunction('getProductDetail', { id: this.data.id });
      })
      .then((res) => {
        const product = res.product;
        const categoryItem = seed.findCategory(product.category);
        const discount =
          product.originalPrice && product.originalPrice > product.price
            ? Math.round((product.price / product.originalPrice) * 10)
            : 0;

        console.info('[DetailPage] 详情加载成功:', product.title);

        this.setData({
          product: product,
          categoryItem: categoryItem,
          descImages: product.images.slice(1),
          favorited: res.favorited,
          priceText: format.formatPrice(product.price),
          originalPriceText: product.originalPrice
            ? '¥' + format.formatPrice(product.originalPrice)
            : '',
          viewsText: format.formatViews(product.views),
          timeText: format.formatRelativeTime(product.createTime),
          discount: discount > 0 && discount < 10 ? discount : 0,
          isSelf: !!this.myOpenid && product._openid === this.myOpenid,
          loading: false
        });

        wx.setNavigationBarTitle({
          title: product.title.length > 14 ? product.title.slice(0, 14) + '…' : product.title
        });
      })
      .catch((err) => {
        console.error('[DetailPage] 详情加载失败:', err);
        this.setData({ product: null, loading: false });
      });
  },

  onSwiperChange(e) {
    this.setData({ current: e.detail.current });
  },

  onPreview(e) {
    const index = Number(e.currentTarget.dataset.index);
    const product = this.data.product;
    if (!product) return;
    wx.previewImage({
      current: product.images[index],
      urls: product.images
    });
  },

  onToggleFavorite() {
    const product = this.data.product;
    if (!product) return;

    cloud
      .callFunction('toggleFavorite', { productId: product._id })
      .then((res) => {
        console.info('[DetailPage] 收藏状态变更:', res.favorited);
        this.setData({ favorited: res.favorited });
        wx.showToast({ title: res.favorited ? '已加入收藏' : '已取消收藏', icon: 'none' });
      })
      .catch((err) => {
        console.error('[DetailPage] 收藏失败:', err);
        wx.showToast({ title: '操作失败，请重试', icon: 'none' });
      });
  },

  onContactTap() {
    if (this.data.isSelf) {
      wx.showToast({ title: '这是你自己发布的商品', icon: 'none' });
      return;
    }
    this.setData({ showContact: true });
  },

  onCloseContact() {
    this.setData({ showContact: false });
  },

  onCopyContact() {
    const product = this.data.product;
    if (!product) return;
    wx.setClipboardData({
      data: product.contact,
      success: () => {
        console.info('[DetailPage] 联系方式已复制');
        this.setData({ showContact: false });
      },
      fail: (err) => {
        console.error('[DetailPage] 复制失败:', err);
      }
    });
  },

  /** 阻止弹窗内容区的点击冒泡到遮罩 */
  noop() {},

  goHome() {
    wx.switchTab({ url: '/pages/home/index' });
  }
});