const format = require('../../utils/format');

Component({
  options: {
    addGlobalClass: true
  },

  properties: {
    product: {
      type: Object,
      value: null,
      observer(val) {
        this.refresh(val);
      }
    },
    /** 展示形态：grid 双列瀑布流 / list 单列横向 */
    layout: {
      type: String,
      value: 'grid'
    }
  },

  data: {
    priceText: '0',
    originalPriceText: '',
    viewsText: '0',
    timeText: '',
    isNew: false
  },

  methods: {
    /** 把原始数据格式化成展示文案，避免在 WXML 里做运算 */
    refresh(product) {
      if (!product || !product._id) return;
      this.setData({
        priceText: format.formatPrice(product.price),
        originalPriceText: product.originalPrice
          ? '¥' + format.formatPrice(product.originalPrice)
          : '',
        viewsText: format.formatViews(product.views),
        timeText: format.formatRelativeTime(product.createTime),
        isNew: product.condition === '全新'
      });
    },

    onTap() {
      // 事件名刻意避开原生 tap，防止原生 tap 冒泡出宿主节点导致父页面重复响应
      this.triggerEvent('select', { product: this.data.product });
    },

    onImageError() {
      console.error('[ProductCard] 图片加载失败:', this.data.product && this.data.product._id);
    }
  }
});