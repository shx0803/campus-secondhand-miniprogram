const cloud = require('./utils/cloud');

App({
  globalData: {
    openid: '',
    user: null
  },

  onLaunch() {
    if (cloud.isCloudEnabled()) {
      if (!wx.cloud) {
        console.error('[App] 请使用 2.2.3 或以上的基础库以使用云能力');
      } else {
        try {
          wx.cloud.init({ env: cloud.CLOUD_ENV, traceUser: true });
        } catch (err) {
          console.error('[App] 云开发初始化失败:', err);
        }
      }
    }
    this.loginTask = this.doLogin();
  },

  /** 获取当前用户身份，写入 globalData */
  doLogin() {
    return cloud
      .callFunction('login')
      .then((res) => {
        this.globalData.openid = res.openid;
        this.globalData.user = res.user;
        console.info('[App] 用户身份就绪:', res.openid);
        return res;
      })
      .catch((err) => {
        console.error('[App] 获取用户身份失败:', err);
        return null;
      });
  },

  /** 页面调用：保证登录完成后返回 globalData */
  ensureLogin() {
    if (this.globalData.openid) {
      return Promise.resolve(this.globalData);
    }
    if (!this.loginTask) {
      this.loginTask = this.doLogin();
    }
    return this.loginTask.then(() => this.globalData);
  }
});