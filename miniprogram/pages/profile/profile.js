// pages/profile/profile.js
Page({
  data: {
    userInfo: {},
    joinDays: 146,
    stats: {
      exerciseCount: 36,
      currentWeight: 62.5,
      targetWeight: 60,
      burnHours: 12
    }
  },

  onShow() {
    // 获取用户信息
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        userInfo
      });
    }
  },

  onLoad() {
    // 从服务器获取统计数据
    this.fetchUserStats();
  },

  // 跳转到体重详情页面
  goToWeightDetail() {
    wx.navigateTo({
      url: '/pages/weightDetail/weightDetail',
    })
  },

  //编辑资料
  editUserInfo() {
    wx.navigateTo({
      url: '/pages/profileDetail/profileDetail',
    })
  },

  fetchUserStats() {
    // 这里应该是从服务器获取实际数据的API调用
    // 示例中使用静态数据
    wx.showLoading({
      title: '加载中...'
    });
    setTimeout(() => {
      this.setData({
        stats: {
          exerciseCount: 36,
          currentWeight: 62.5,
          targetWeight: 60,
          burnHours: 12
        }
      });
      wx.hideLoading();
    }, 500);
  },

  navigateTo(e) {
    const url = e.currentTarget.dataset.url;
    wx.navigateTo({
      url
    });
  }
});