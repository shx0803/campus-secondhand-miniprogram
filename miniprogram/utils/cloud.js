/**
 * 数据访问层统一入口
 *
 * 两种运行模式：
 *  1) 云函数模式：把下面的 CLOUD_ENV 填成你的云开发环境 ID，所有请求走 wx.cloud.callFunction
 *  2) 本地模式（默认）：CLOUD_ENV 留空，请求走 data/api.js 的本地实现（数据存在本地缓存，
 *     无需任何后端配置即可在开发者工具里完整跑通全部功能）
 */

/** 填入云开发环境 ID 即可切换到云函数模式，例如 'campus-secondhand-1g2h3i4j5' */
const CLOUD_ENV = '';

const localApi = require('../data/api');

function isCloudEnabled() {
  return !!CLOUD_ENV;
}

/**
 * 调用云端/本地接口，成功后直接返回业务 data
 * @param {string} name 接口名（与 cloudfunctions 目录下的云函数同名）
 * @param {object} [data] 入参
 * @returns {Promise<any>}
 */
function callFunction(name, data) {
  if (isCloudEnabled()) {
    return wx.cloud
      .callFunction({ name: name, data: data || {} })
      .then(function (res) {
        const result = res && res.result;
        if (!result || result.code !== 0) {
          const message = (result && result.message) || '请求失败';
          console.error('[Cloud] ' + name + ' failed: ' + message);
          throw new Error(message);
        }
        return result.data;
      });
  }

  return new Promise(function (resolve, reject) {
    try {
      const handler = localApi[name];
      if (typeof handler !== 'function') {
        throw new Error('未实现的接口：' + name);
      }
      resolve(handler(data || {}));
    } catch (err) {
      console.error('[Local] ' + name + ' failed:', err);
      reject(err);
    }
  });
}

module.exports = {
  CLOUD_ENV: CLOUD_ENV,
  isCloudEnabled: isCloudEnabled,
  callFunction: callFunction
};