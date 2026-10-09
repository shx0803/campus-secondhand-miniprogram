const cloud = require('../../utils/cloud');

const HISTORY_KEY = 'search_history';
const MAX_HISTORY = 10;
const PAGE_SIZE = 10;

const HOT_KEYWORDS = ['iPad', '考研书', '自行车', '蓝牙耳机', '吉他', '台灯', '键盘', '羽绒服'];

Page({
  data: {
    keyword: '',
    submittedKeyword: '',
    showResult: false,
    history: [],
    hotKeywords: HOT_KEYWORDS,
    list: [],
    total: 0,
    page: 1,
    hasMore: true,
    loading: false
  },

  onLoad() {
    try {
      const cached = wx.getStorageSync(HISTORY_KEY);
      if (Array.isArray(cached)) {
        this.setData({ history: cached });
      }
    } catch (err) {
      console.error('[SearchPage] 读取搜索历史失败:', err);
    }
  },

  /** 保存搜索历史（去重 + 最多 10 条） */
  saveHistory(value) {
    const next = [value]
      .concat(
        this.data.history.filter(function (item) {
          return item !== value;
        })
      )
      .slice(0, MAX_HISTORY);

    this.setData({ history: next });
    try {
      wx.setStorageSync(HISTORY_KEY, next);
    } catch (err) {
      console.error('[SearchPage] 保存搜索历史失败:', err);
    }
  },

  /** 执行搜索 */
  doSearch(value, targetPage, replace) {
    if (!value) return;
    this.setData({ loading: true });

    return cloud
      .callFunction('getProducts', {
        keyword: value,
        page: targetPage,
        pageSize: PAGE_SIZE
      })
      .then((res) => {
        console.info('[SearchPage] 搜索完成:', value, res.list.length);
        this.setData({
          list: replace ? res.list : this.data.list.concat(res.list),
          total: res.total,
          hasMore: res.hasMore,
          page: targetPage,
          loading: false
        });
      })
      .catch((err) => {
        console.error('[SearchPage] 搜索失败:', err);
        this.setData({ loading: false });
        wx.showToast({ title: '搜索失败，请重试', icon: 'none' });
      });
  },

  /** 输入框内容变化 */
  onInput(e) {
    const value = e.detail.value;
    this.setData({ keyword: value });

    if (!value) {
      this.setData({
        submittedKeyword: '',
        showResult: false,
        list: [],
        total: 0,
        page: 1,
        hasMore: true
      });
    }
  },

  onConfirm(e) {
    this.handleSearch(e.detail.value);
  },

  handleSearch(rawValue) {
    const value = (rawValue || '').trim();
    if (!value) {
      wx.showToast({ title: '请输入搜索内容', icon: 'none' });
      return;
    }
    this.setData({ keyword: value, submittedKeyword: value, showResult: true });
    this.saveHistory(value);
    this.doSearch(value, 1, true);
  },

  onTagTap(e) {
    this.handleSearch(e.currentTarget.dataset.value);
  },

  onClearHistory() {
    this.setData({ history: [] });
    try {
      wx.removeStorageSync(HISTORY_KEY);
    } catch (err) {
      console.error('[SearchPage] 清空搜索历史失败:', err);
    }
  },

  onLoadMore() {
    if (this.data.loading || !this.data.hasMore || !this.data.submittedKeyword) return;
    this.doSearch(this.data.submittedKeyword, this.data.page + 1, false);
  },

  onCardTap(e) {
    const product = e.detail.product;
    if (!product) return;
    wx.navigateTo({ url: '/pages/detail/index?id=' + product._id });
  },

  goBack() {
    wx.navigateBack();
  }
});