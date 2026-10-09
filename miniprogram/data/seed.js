/**
 * 静态数据：分类 / 成色 / 校区 / 种子商品
 */

/** 分类配置 */
const categories = [
  { key: 'digital', label: '数码电子', emoji: '📱', color: '#eaf1ff' },
  { key: 'book', label: '图书教材', emoji: '📚', color: '#fff4e8' },
  { key: 'daily', label: '生活用品', emoji: '🧴', color: '#e8f7f5' },
  { key: 'clothing', label: '服饰鞋包', emoji: '👕', color: '#ffeef2' },
  { key: 'sports', label: '运动户外', emoji: '🏀', color: '#eefbe8' },
  { key: 'music', label: '乐器影音', emoji: '🎸', color: '#f3eeff' },
  { key: 'beauty', label: '美妆个护', emoji: '💄', color: '#ffeef6' },
  { key: 'other', label: '其他闲置', emoji: '📦', color: '#f0f2f5' }
];

/** 成色选项 */
const conditions = ['全新', '九成新', '八成新', '七成新及以下'];

/** 校区选项 */
const campuses = ['东校区', '西校区', '南校区', '北校区', '校外自取'];

/** 当前登录用户（本地模式下的模拟身份，与云函数 login 返回结构一致） */
const MOCK_OPENID = 'local-openid-me';

const mockUser = {
  openid: MOCK_OPENID,
  nickname: '邵鹤轩',
  avatar: 'https://picsum.photos/id/64/200/200',
  campus: '东校区',
  creditScore: 96
};

const HOUR = 60 * 60 * 1000;
const now = Date.now();

function img(id) {
  return 'https://picsum.photos/id/' + id + '/400/400';
}

/** 种子商品（首次启动时写入本地缓存，之后以缓存为准） */
const seedProducts = [
  {
    _id: 'p001',
    _openid: 'mock-openid-a',
    title: 'iPad Air 4 64G 深空灰 含原装充电器',
    price: 1899,
    originalPrice: 3999,
    category: 'digital',
    condition: '九成新',
    description:
      '去年买的 iPad Air 4，平时主要用来看网课和记笔记，屏幕无划痕，功能一切正常。附赠原装充电器和保护壳，笔不单出。有意者可以约在图书馆门口当面验机。',
    images: [img(6), img(8), img(9)],
    contact: '微信：xiaoman_pad',
    campus: '东校区',
    sellerName: '林小满',
    sellerAvatar: 'https://picsum.photos/id/64/200/200',
    status: 'on_sale',
    views: 326,
    createTime: now - 3 * HOUR
  },
  {
    _id: 'p002',
    _openid: 'mock-openid-b',
    title: '《数据结构与算法分析》C语言版 第二版',
    price: 25,
    originalPrice: 59,
    category: 'book',
    condition: '八成新',
    description: '考研 408 指定参考书之一，书内有少量铅笔笔记，可以擦掉。适合备考或者课程复习，比新书便宜很多。',
    images: [img(582), img(598)],
    contact: 'QQ：8823321',
    campus: '南校区',
    sellerName: '陈知远',
    sellerAvatar: 'https://picsum.photos/id/91/200/200',
    status: 'on_sale',
    views: 158,
    createTime: now - 7 * HOUR
  },
  {
    _id: 'p003',
    _openid: 'mock-openid-c',
    title: '罗技 G304 无线游戏鼠标 未拆封',
    price: 99,
    originalPrice: 199,
    category: 'digital',
    condition: '全新',
    description: '618 多买了一个，包装完好没有拆过封，发票还在。手感很好，续航也不错，适合打游戏或者日常办公。',
    images: [img(2), img(1)],
    contact: '微信：logic_g304',
    campus: '西校区',
    sellerName: '周迟',
    sellerAvatar: 'https://picsum.photos/id/177/200/200',
    status: 'on_sale',
    views: 402,
    createTime: now - 12 * HOUR
  },
  {
    _id: 'p004',
    _openid: 'mock-openid-d',
    title: '小米蓝牙音箱 便携款 音质不错',
    price: 69,
    originalPrice: 149,
    category: 'music',
    condition: '九成新',
    description: '宿舍听歌用的，声音够大也不破音，电池能撑一整天。因为换了大音箱所以出掉，配件齐全。',
    images: [img(119), img(160)],
    contact: '电话：13800001234',
    campus: '东校区',
    sellerName: '苏禾',
    sellerAvatar: 'https://picsum.photos/id/338/200/200',
    status: 'on_sale',
    views: 96,
    createTime: now - 20 * HOUR
  },
  {
    _id: 'p005',
    _openid: 'mock-openid-e',
    title: 'Nike Air Force 1 白色 42码 穿过两次',
    price: 260,
    originalPrice: 799,
    category: 'clothing',
    condition: '九成新',
    description: '尺码买大了，只穿过两次，鞋底几乎没有磨损。已经清洗干净，鞋盒还在，介意勿拍。',
    images: [img(103), img(220)],
    contact: '微信：af1_size42',
    campus: '北校区',
    sellerName: '何一鸣',
    sellerAvatar: 'https://picsum.photos/id/1027/200/200',
    status: 'on_sale',
    views: 517,
    createTime: now - 26 * HOUR
  },
  {
    _id: 'p006',
    _openid: 'mock-openid-f',
    title: '斯伯丁篮球 7号 室内外通用',
    price: 45,
    originalPrice: 128,
    category: 'sports',
    condition: '八成新',
    description: '打了一学期，皮面有正常磨损但弹性很好，气密性没问题。附送打气筒一个。',
    images: [img(787), img(1082)],
    contact: 'QQ：3301276',
    campus: '南校区',
    sellerName: '赵岩',
    sellerAvatar: 'https://picsum.photos/id/237/200/200',
    status: 'on_sale',
    views: 88,
    createTime: now - 30 * HOUR
  },
  {
    _id: 'p007',
    _openid: 'mock-openid-g',
    title: '雅马哈 F310 民谣吉他 入门首选',
    price: 480,
    originalPrice: 899,
    category: 'music',
    condition: '八成新',
    description: '大一买的入门琴，声音很稳，适合初学。附琴包、背带、拨片和一本书。琴颈没有变形，弦距正常。',
    images: [img(160), img(119)],
    contact: '微信：guitar_f310',
    campus: '西校区',
    sellerName: '顾青',
    sellerAvatar: 'https://picsum.photos/id/659/200/200',
    status: 'on_sale',
    views: 231,
    createTime: now - 2 * 24 * HOUR
  },
  {
    _id: 'p008',
    _openid: 'mock-openid-h',
    title: '客制化机械键盘 68键 茶轴',
    price: 320,
    originalPrice: 560,
    category: 'digital',
    condition: '九成新',
    description: '自组的 68 键键盘，茶轴手感顺滑，键帽是 PBT 材质不打油。带 Type-C 线，支持有线和蓝牙双模。',
    images: [img(1), img(3)],
    contact: '微信：kb_68tea',
    campus: '东校区',
    sellerName: '许行',
    sellerAvatar: 'https://picsum.photos/id/718/200/200',
    status: 'on_sale',
    views: 349,
    createTime: now - 2 * 24 * HOUR - 5 * HOUR
  },
  {
    _id: 'p009',
    _openid: 'mock-openid-i',
    title: '《人类简史》精装版 几乎全新',
    price: 30,
    originalPrice: 68,
    category: 'book',
    condition: '九成新',
    description: '只翻过一遍，书脊没有任何折痕，内页干净。这一版纸质很好，适合收藏。',
    images: [img(598), img(582)],
    contact: 'QQ：5512048',
    campus: '北校区',
    sellerName: '沈砚',
    sellerAvatar: 'https://picsum.photos/id/783/200/200',
    status: 'on_sale',
    views: 143,
    createTime: now - 3 * 24 * HOUR
  },
  {
    _id: 'p010',
    _openid: 'mock-openid-j',
    title: '雅诗兰黛 持妆粉底液 1W1 全新未拆',
    price: 180,
    originalPrice: 320,
    category: 'beauty',
    condition: '全新',
    description: '专柜购入，色号买错了不能退。包装塑封完整没有拆过，正品可查。可当面验货再付款。',
    images: [img(230), img(225)],
    contact: '微信：dw_1w1',
    campus: '西校区',
    sellerName: '温然',
    sellerAvatar: 'https://picsum.photos/id/1025/200/200',
    status: 'on_sale',
    views: 276,
    createTime: now - 3 * 24 * HOUR - 8 * HOUR
  },
  {
    _id: 'p011',
    _openid: 'mock-openid-k',
    title: '护眼台灯 三档调光 USB 供电',
    price: 35,
    originalPrice: 89,
    category: 'daily',
    condition: '九成新',
    description: '宿舍熬夜赶作业必备，三档亮度可调，光线柔和不刺眼。USB 接口，接充电宝也能用。',
    images: [img(225), img(582)],
    contact: '电话：13900005678',
    campus: '东校区',
    sellerName: '罗一',
    sellerAvatar: 'https://picsum.photos/id/1015/200/200',
    status: 'on_sale',
    views: 64,
    createTime: now - 4 * 24 * HOUR
  },
  {
    _id: 'p012',
    _openid: 'mock-openid-l',
    title: '捷安特 山地自行车 21速 代步神器',
    price: 620,
    originalPrice: 1580,
    category: 'sports',
    condition: '八成新',
    description: '骑了两年，刚保养过换了新刹车皮和链条，车况很好。毕业了带不走所以出，附车锁和车灯。',
    images: [img(1082), img(787)],
    contact: '微信：giant_21s',
    campus: '北校区',
    sellerName: '孟川',
    sellerAvatar: 'https://picsum.photos/id/1036/200/200',
    status: 'on_sale',
    views: 388,
    createTime: now - 5 * 24 * HOUR
  },
  {
    _id: 'p013',
    _openid: 'mock-openid-m',
    title: 'AirPods 2代 有线充电盒 成色很好',
    price: 260,
    originalPrice: 999,
    category: 'digital',
    condition: '九成新',
    description: '用了一年多，两只耳机都正常，电池健康度还剩八成左右。已用酒精棉片清洁消毒，附赠保护套。',
    images: [img(3), img(2), img(1)],
    contact: '微信：airpods_2nd',
    campus: '南校区',
    sellerName: '江晚',
    sellerAvatar: 'https://picsum.photos/id/1039/200/200',
    status: 'on_sale',
    views: 611,
    createTime: now - 5 * 24 * HOUR - 6 * HOUR
  },
  {
    _id: 'p014',
    _openid: 'mock-openid-n',
    title: '长款羽绒服 女 M码 冬天必备',
    price: 150,
    originalPrice: 499,
    category: 'clothing',
    condition: '八成新',
    description: '长款过膝，非常保暖，去年冬天买的。因为我今年买新的了所以出，没有污渍和破损。',
    images: [img(250), img(103)],
    contact: 'QQ：7781234',
    campus: '西校区',
    sellerName: '半夏',
    sellerAvatar: 'https://picsum.photos/id/1018/200/200',
    status: 'on_sale',
    views: 129,
    createTime: now - 6 * 24 * HOUR
  }
];

/** 按 key 获取分类展示信息 */
function findCategory(key) {
  for (let i = 0; i < categories.length; i++) {
    if (categories[i].key === key) return categories[i];
  }
  return categories[categories.length - 1];
}

module.exports = {
  categories: categories,
  conditions: conditions,
  campuses: campuses,
  MOCK_OPENID: MOCK_OPENID,
  mockUser: mockUser,
  seedProducts: seedProducts,
  findCategory: findCategory
};