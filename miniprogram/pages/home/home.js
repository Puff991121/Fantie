// pages/index/index.js
const app = getApp()

Page({
  data: {
    userInfo: {},
    recordDays: 36,
    currentDate: '',
    todayData: {
      steps: 8326,
      expense: 162,
      weight: 62.5
    },
    modules: [
      { id: 'weight', name: '体重管理', icon: '/images/weight.png' },
      { id: 'finance', name: '收支管理', icon: '/images/finance.png' },
      { id: 'sport', name: '运动记录', icon: '/images/sport.png' },
      { id: 'schedule', name: '日程记录', icon: '/images/schedule.png' },
      { id: 'payment', name: '生活缴费', icon: '/images/payment.png' },
      { id: 'clockin', name: '运动打卡', icon: '/images/clockin.png' }
    ],
    recentActivities: [
      { id: 1, name: '体重变化', value: '-0.3kg', time: '昨天21:30' },
      { id: 2, name: '晨跑记录', value: '3.2公里', time: '今天6:30' },
      { id: 3, name: '午餐消费', value: '32元', time: '今天12:15' },
      { id: 4, name: '运动卡路里', value: '625k', time: '今天14:00' }
    ]
  },

  onLoad: function() {
    // 设置当前日期
    this.setCurrentDate();
    const userInfo = wx.getStorageSync('userInfo');
    // 获取用户信息
    if (userInfo) {
      this.setData({
        userInfo,
      })
    } else {
      
    }
  },

  setCurrentDate: function() {
    const now = new Date()
    const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
    const dateStr = `${now.getMonth() + 1}月${now.getDate()}日 ${weekDays[now.getDay()]}`
    this.setData({
      currentDate: dateStr
    })
  },

  fetchDataFromCloud: function() {
    const db = wx.cloud.database()
    const _ = db.command
    
    // 获取用户记录天数
    db.collection('user_records').where({
      _openid: _.exists(true)
    }).count().then(res => {
      this.setData({
        recordDays: res.total
      })
    }).catch(console.error)
    
    // 获取今日数据
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    db.collection('daily_records').where({
      date: _.gte(today),
      _openid: _.exists(true)
    }).get().then(res => {
      if (res.data.length > 0) {
        this.setData({
          todayData: res.data[0]
        })
      }
    }).catch(console.error)
    
    // 获取最近动态
    db.collection('activities').where({
      _openid: _.exists(true)
    }).orderBy('time', 'desc').limit(4).get().then(res => {
      if (res.data.length > 0) {
        const activities = res.data.map(item => {
          return {
            id: item._id,
            name: item.type === 'weight' ? '体重变化' : 
                  item.type === 'exercise' ? '运动记录' : 
                  item.type === 'expense' ? '消费记录' : '活动记录',
            value: item.value,
            time: this.formatTime(item.time)
          }
        })
        this.setData({
          recentActivities: activities
        })
      }
    }).catch(console.error)
  },

  formatTime: function(timestamp) {
    const date = new Date(timestamp)
    const now = new Date()
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) {
      return `今天${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`
    } else if (diffDays === 1) {
      return `昨天${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`
    } else {
      return `${date.getMonth() + 1}月${date.getDate()}日`
    }
  },

  navigateToRecord: function() {
    wx.navigateTo({
      url: '/pages/record/record'
    })
  },

  navigateToModule: function(e) {
    const moduleId = e.currentTarget.dataset.module
    let url = ''
    
    switch(moduleId) {
      case 'weight':
        url = '/pages/weightDetail/weightDetail'
        break
      case 'finance':
        url = '/pages/finance/finance'
        break
      case 'sport':
        url = '/pages/sport/sport'
        break
      case 'schedule':
        url = '/pages/schedule/schedule'
        break
      case 'payment':
        url = '/pages/payment/payment'
        break
      case 'clockin':
        url = '/pages/clockin/clockin'
        break
      default:
        url = '/pages/index/index'
    }
    
    wx.navigateTo({
      url: url
    })
  },

  onPullDownRefresh: function() {
    this.fetchDataFromCloud(() => {
      wx.stopPullDownRefresh()
    })
  }
})