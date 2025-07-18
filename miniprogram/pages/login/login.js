// pages/login/login.js
Page({
  data: {
    isLogin: false,
    userInfo: null
  },

  onLoad() {
    // 检查是否已登录
    this.checkLoginStatus();
  },

  // 检查登录状态
  checkLoginStatus() {
    const userInfo = wx.getStorageSync('userInfo');
    const openid = wx.getStorageSync('openid');
    
    if (userInfo && openid) {
      this.setData({
        isLogin: true,
        userInfo: userInfo
      });
      // 已登录直接跳转
      wx.reLaunch({
        url: '/pages/home/home'
      });
    }
  },

  // 获取用户信息
  handleGetUserInfo(e) {
    if (e.detail.userInfo) {
      // 用户点击了允许授权
      this.setData({
        userInfo: e.detail.userInfo
      });
      this.cloudLogin(e.detail.userInfo);
    } else {
      // 用户点击了拒绝授权
      wx.showToast({
        title: '登录失败，请授权',
        icon: 'none'
      });
    }
  },

  // 调用云函数登录
  cloudLogin(userInfo) {
    wx.showLoading({
      title: '登录中...',
    });

    wx.cloud.callFunction({
      name: 'login',
      data: {
        userInfo: userInfo
      },
      success: res => {
        wx.hideLoading(); 
        // 存储用户信息
        wx.setStorageSync('userInfo', userInfo);
        wx.setStorageSync('openid', res.result.openid);
        
        // 跳转到首页
        wx.reLaunch({
          url: '/pages/home/home'
        });
      },
      fail: err => {
        wx.hideLoading();
        console.error('登录失败', err);
        wx.showToast({
          title: '登录失败',
          icon: 'none'
        });
      }
    });
  }
});