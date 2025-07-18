// pages/profile-detail/profile-detail.js
const app = getApp()

Page({
  data: {
    userInfo: {},
    genderOptions: [
      { value: '男', text: '男' },
      { value: '女', text: '女' }
    ],
    genderIndex: 0
  },

  onLoad() {
    this.fetchUserInfo()
  },

  // 获取用户信息
  fetchUserInfo() {
    wx.showLoading({ title: '加载中...' })
    // 从本地缓存获取
    const localUserInfo = wx.getStorageSync('userInfo')
    if (localUserInfo) {
      this.setData({
        userInfo: localUserInfo,
        genderIndex: this.getGenderIndex(localUserInfo.gender)
      })
    }
    // 从云数据库获取最新数据
    wx.cloud.callFunction({
      name: 'userInfo',
      data: {
        type: "getUserInfo",
      },
      
    }).then(res =>{
      wx.hideLoading()
        if (res.result.code === 200) {
          const userInfo = res.result.data
          this.setData({
            userInfo: userInfo,
            genderIndex: this.getGenderIndex(userInfo.gender)
          })
          wx.setStorageSync('userInfo', userInfo)
        }
    }).catch(err =>{
      wx.hideLoading()
      console.error('获取用户信息失败', err)
    })
  },

  // 获取性别索引
  getGenderIndex(gender) {
    return this.data.genderOptions.findIndex(item => item.value === gender)
  },

  // 选择头像
  chooseAvatar() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: res => {
        const tempFilePath = res.tempFiles[0].tempFilePath
        this.uploadAvatar(tempFilePath)
      }
    })
  },

  // 上传头像到云存储
  uploadAvatar(tempFilePath) {
    wx.showLoading({ title: '上传中...' })
    
    const cloudPath = `avatars/${Date.now()}-${Math.floor(Math.random() * 1000)}.jpg`
    
    wx.cloud.uploadFile({
      cloudPath,
      filePath: tempFilePath,
      success: res => {
        this.setData({
          'userInfo.avatarUrl': res.fileID
        })
        wx.hideLoading()
      },
      fail: err => {
        wx.hideLoading()
        wx.showToast({
          title: '头像上传失败',
          icon: 'none'
        })
      }
    })
  },

  // 表单字段变更处理
  onNickNameChange(e) {
    this.setData({
      'userInfo.nickName': e.detail.value
    })
  },

  onGenderChange(e) {
    const index = e.detail.value;
    console.log(e,'eeee');
    this.setData({
      genderIndex: index,
      'userInfo.gender': this.data.genderOptions[index].value
    })
  },

  onPhoneChange(e) {
    this.setData({
      'userInfo.phone': e.detail.value
    })
  },

  onEmailChange(e) {
    this.setData({
      'userInfo.email': e.detail.value
    })
  },
  onTargetWeightChange(e) {
    this.setData({
      'userInfo.targetWeight': e.detail.value
    })
  },
  // 保存用户信息
  saveUserInfo() {
    wx.showLoading({ title: '保存中...' });
    wx.cloud.callFunction({
      name: 'userInfo',
      data: {
        type:'updateUserInfo',
        userInfo: this.data.userInfo,
      },
     
    }).then(res =>{
      wx.hideLoading()
        if (res.result.code === 200) {
          wx.showToast({
            title: '保存成功',
            icon: 'success'
          });
          wx.setStorageSync('userInfo', this.data.userInfo)
          setTimeout(() => {
            wx.switchTab({
              url: '/pages/profile/profile',
            });
          }, 1500)
        } else {
          wx.showToast({
            title: res.result.message || '保存失败',
            icon: 'none'
          })
        }
    }).catch(err =>{
      wx.hideLoading()
      wx.showToast({
        title: '保存失败',
        icon: 'none'
      })
    })
  },

  // 退出登录
  logout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: res => {
        if (res.confirm) {
          wx.clearStorageSync()
          wx.reLaunch({
            url: '/pages/login/login'
          })
        }
      }
    })
  },

  navigateBack() {
    wx.navigateBack()
  }
})