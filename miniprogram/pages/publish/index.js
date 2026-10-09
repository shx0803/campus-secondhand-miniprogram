const cloud = require('../../utils/cloud');
const seed = require('../../data/seed');

const MAX_IMAGES = 5;
const MAX_TITLE = 30;
const MAX_DESC = 300;

function emptyForm() {
  return {
    images: [],
    title: '',
    price: '',
    originalPrice: '',
    category: 'digital',
    condition: seed.conditions[1],
    description: '',
    contact: '',
    campus: seed.campuses[0]
  };
}

Page({
  data: Object.assign(emptyForm(), {
    submitting: false,
    maxImages: MAX_IMAGES,
    maxTitle: MAX_TITLE,
    maxDesc: MAX_DESC,
    categories: seed.categories,
    conditions: seed.conditions,
    campuses: seed.campuses
  }),

  /* ---------- 图片 ---------- */

  onChooseImage() {
    const remain = MAX_IMAGES - this.data.images.length;
    if (remain <= 0) {
      wx.showToast({ title: '最多上传 ' + MAX_IMAGES + ' 张图片', icon: 'none' });
      return;
    }

    wx.chooseMedia({
      count: remain,
      mediaType: ['image'],
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const paths = res.tempFiles.map((file) => file.tempFilePath);
        console.info('[PublishPage] 已选择图片:', paths.length);
        this.setData({
          images: this.data.images.concat(paths).slice(0, MAX_IMAGES)
        });
      },
      fail: (err) => {
        console.error('[PublishPage] 选择图片失败:', err);
      }
    });
  },

  onPreview(e) {
    const index = Number(e.currentTarget.dataset.index);
    wx.previewImage({
      current: this.data.images[index],
      urls: this.data.images
    });
  },

  onRemoveImage(e) {
    const index = Number(e.currentTarget.dataset.index);
    this.setData({
      images: this.data.images.filter((_, i) => i !== index)
    });
  },

  /**
   * 图片落盘：
   *  云函数模式 → 上传到云存储并返回 fileID
   *  本地模式   → 把临时文件转存为本地永久路径，重启后依然可见
   */
  prepareImages(paths) {
    if (cloud.isCloudEnabled()) {
      const tasks = paths.map((path, index) =>
        wx.cloud
          .uploadFile({
            cloudPath: 'products/' + Date.now() + '_' + index + '.png',
            filePath: path
          })
          .then((res) => res.fileID)
      );
      return Promise.all(tasks);
    }

    const fs = wx.getFileSystemManager();
    const saved = paths.map((path) => {
      try {
        return fs.saveFileSync(path);
      } catch (err) {
        console.error('[PublishPage] 图片转存失败:', err);
        return path;
      }
    });
    return Promise.resolve(saved);
  },

  /* ---------- 表单 ---------- */

  onTitleInput(e) {
    this.setData({ title: e.detail.value });
  },

  onPriceInput(e) {
    this.setData({ price: e.detail.value });
  },

  onOriginalPriceInput(e) {
    this.setData({ originalPrice: e.detail.value });
  },

  onContactInput(e) {
    this.setData({ contact: e.detail.value });
  },

  onDescInput(e) {
    this.setData({ description: e.detail.value });
  },

  onCategoryTap(e) {
    this.setData({ category: e.currentTarget.dataset.key });
  },

  onConditionTap(e) {
    this.setData({ condition: e.currentTarget.dataset.value });
  },

  onCampusTap(e) {
    this.setData({ campus: e.currentTarget.dataset.value });
  },

  onReset() {
    this.setData(Object.assign(emptyForm(), { submitting: false }));
    wx.showToast({ title: '已清空', icon: 'none' });
  },

  /* ---------- 提交 ---------- */

  onSubmit() {
    if (this.data.submitting) return;

    const title = this.data.title.trim();
    const price = this.data.price;
    const contact = this.data.contact.trim();

    if (this.data.images.length === 0) {
      wx.showToast({ title: '请至少上传一张商品图片', icon: 'none' });
      return;
    }
    if (!title) {
      wx.showToast({ title: '请填写商品标题', icon: 'none' });
      return;
    }
    if (!price || Number(price) <= 0) {
      wx.showToast({ title: '请填写有效的售价', icon: 'none' });
      return;
    }
    if (!contact) {
      wx.showToast({ title: '留个联系方式，买家才好找你', icon: 'none' });
      return;
    }

    this.setData({ submitting: true });

    this.prepareImages(this.data.images)
      .then((uploadedImages) =>
        cloud.callFunction('createProduct', {
          title: title,
          price: Number(price),
          originalPrice: this.data.originalPrice ? Number(this.data.originalPrice) : undefined,
          category: this.data.category,
          condition: this.data.condition,
          description: this.data.description.trim(),
          images: uploadedImages,
          contact: contact,
          campus: this.data.campus
        })
      )
      .then((res) => {
        console.info('[PublishPage] 发布成功:', res.id);
        wx.showToast({ title: '发布成功', icon: 'success', duration: 1200 });
        this.setData(Object.assign(emptyForm(), { submitting: false }));
        setTimeout(() => {
          wx.switchTab({ url: '/pages/mine/index' });
        }, 900);
      })
      .catch((err) => {
        console.error('[PublishPage] 发布失败:', err);
        this.setData({ submitting: false });
        wx.showToast({ title: '发布失败，请稍后重试', icon: 'none' });
      });
  }
});