const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

const USERS = 'users';

/**
 * 登录：获取用户 openid，若首次进入则初始化用户档案
 * 返回：{ code, message, data: { openid, user } }
 */
exports.main = async (event, context) => {
  try {
    const { OPENID } = cloud.getWXContext();
    if (!OPENID) {
      throw new Error('未获取到用户身份');
    }

    const exist = await db.collection(USERS).where({ _openid: OPENID }).limit(1).get();
    let user = exist.data[0];

    if (!user) {
      const newUser = {
        _openid: OPENID,
        nickname: `同学${OPENID.slice(-4)}`,
        avatar: '',
        campus: '东校区',
        creditScore: 80,
        createTime: db.serverDate()
      };
      const addRes = await db.collection(USERS).add({ data: newUser });
      user = { _id: addRes._id, ...newUser };
      console.info('[login] 初始化新用户:', OPENID);
    }

    return {
      code: 0,
      message: 'success',
      data: {
        openid: OPENID,
        user: {
          openid: OPENID,
          nickname: user.nickname,
          avatar: user.avatar,
          campus: user.campus,
          creditScore: user.creditScore
        }
      }
    };
  } catch (err) {
    console.error('[login] error:', err);
    return { code: -1, message: err.message || '服务异常', data: null };
  }
};