// pages/weight/weight.js
const utils = require('../../utils/dateFormat');
Page({
  data: {
    currentDate: '',
    selectedTime: '',
    inputWeight: '',
    showModal: false,
    todayData: {
      morning: null,
      evening: null,
      difference: null
    },
    historyData: [],
    monthStats: {
      average: null,
      fluctuation: null,
      max: null,
      min: null
    },
    userHeight: 175,
  },

  onShow() {
    const userInfo = wx.getStorageSync('userInfo');
    console.log(userInfo, 'userInfo');
    this.setData({
      currentDate: utils.formatDate(),
      selectedTime: utils.getTimePeriod(),
      userHeight: userInfo.height,
    })
  },

  onLoad() {
    this.setCurrentDate();
    this.getTodayData();
    this.getHistoryData();
    this.getMonthStats();
  },

  // 获取今日数据
  getTodayData() {
    wx.cloud.callFunction({
      name: 'weight',
      data: {
        type: 'getWeightRecords',
        date: this.data.currentDate
      },
      success: res => {
        if (res.result.code === 200 && res.result.data.length > 0) {
          const record = res.result.data[0]
          const difference = record.morning && record.evening ?
            (record.evening - record.morning).toFixed(1) : null
          this.setData({
            todayData: {
              morning: record.morning,
              evening: record.evening,
              difference: difference
            }
          })
        } else {
          this.setData({
            todayData: {
              morning: 0,
              evening: 0,
              difference: 0
            }
          })
        }
      }
    })
  },

  // 获取最近7天体重数据
  getHistoryData() {
    wx.cloud.callFunction({
      name: 'weight',
      data: {
        type: 'getWeightRecords',
        limit: 7 // 获取最近7条记录
      },
      success: res => {
        if (res.result.code === 200) {
          const historyData = res.result.data.map(item => {
            const dateParts = item.date.split('-')
            const displayDate = `${dateParts[1]}-${dateParts[2]}`

            const difference = item.morning && item.evening ?
              (item.evening - item.morning).toFixed(1) : null

            // 计算BMI
            const bmi = item.evening ?
              (item.evening / Math.pow(this.data.userHeight / 100, 2)).toFixed(1) : null

            return {
              date: displayDate,
              morning: item.morning,
              evening: item.evening,
              difference: difference,
              bmi: bmi
            }
          })

          this.setData({
            historyData
          })
        }
      }
    })
  },

  // 获取月度统计
  getMonthStats() {
    wx.cloud.callFunction({
      name: 'weight',
      data: {
        type: 'getMonthStats',
        date: this.data.currentDate
      },
      success: res => {
        if (res.result.code === 200 && res.result.data) {
          this.setData({
            monthStats: res.result.data
          })
        }
      }
    })
  },

  //保存用户当前体重
  saveUserInfo(weight) {
    const userInfo = wx.getStorageSync('userInfo');
    wx.cloud.callFunction({
      name: 'userInfo',
      data: {
        type: 'updateUserInfo',
        userInfo: {
          ...userInfo,
          weight,
        },
      },

    }).then(res => {
      if (res.result.code === 200) {
        wx.setStorageSync('userInfo', res.result.data)
      } else {
        wx.showToast({
          title: res.result.message || '保存失败',
          icon: 'none'
        })
      }
    }).catch(err => {
      wx.hideLoading()
      wx.showToast({
        title: '保存失败',
        icon: 'none'
      })
    })
  },

  // 添加/更新体重记录
  addWeightRecord() {
    const {
      selectedTime,
      inputWeight,
      currentDate
    } = this.data
    if (!inputWeight) {
      wx.showToast({
        title: '请输入体重',
        icon: 'none'
      })
      return
    }

    wx.cloud.callFunction({
      name: 'weight',
      data: {
        type: 'addWeightRecord',
        date: currentDate,
        time: selectedTime === '早上' ? 'morning' : 'evening',
        weight: parseFloat(inputWeight)
      },
      success: res => {
        if (res.result.code === 200) {
          wx.showToast({
            title: '记录成功',
            icon: 'success'
          });
          //更新最新体重数据
          this.saveUserInfo(inputWeight);
          this.hideAddModal();

          // 刷新数据
          this.getTodayData()
          this.getHistoryData()
          this.getMonthStats()
        } else {
          wx.showToast({
            title: '记录失败',
            icon: 'none'
          })
        }
      },
      fail: err => {
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        })
      }
    })
  },



  // 选择某个日期
  handleDateChange(e) {
    this.setData({
      currentDate: e.detail.value
    });
    this.getTodayData();
    // 这里可以添加获取该日期数据的逻辑
  },

  setCurrentDate() {
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    this.setData({
      currentDate: `${year}-${month}-${day}`
    });
  },

  prevDay() {
    const date = new Date(this.data.currentDate);
    date.setDate(date.getDate() - 1);
    this.updateDate(date);
  },

  nextDay() {
    const date = new Date(this.data.currentDate);
    date.setDate(date.getDate() + 1);
    this.updateDate(date);
  },

  updateDate(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    this.setData({
      currentDate: `${year}-${month}-${day}`
    });
    this.getTodayData();
    // 这里可以添加获取该日期数据的逻辑
  },

  showDatePicker() {
    wx.showDatePicker({
      currentDate: this.data.currentDate,
      success: (res) => {
        const date = new Date(res.date);
        this.updateDate(date);
      }
    });
  },

  showAddModal() {
    this.setData({
      showModal: true,
      inputWeight: ''
    });
  },

  hideAddModal() {
    this.setData({
      showModal: false
    });
  },

  handleTimeChange(e) {
    this.setData({
      selectedTime: e.detail.value === '0' ? '早上' : '晚上'
    });
  },

  handleWeightInput(e) {
    this.setData({
      inputWeight: e.detail.value
    });
  },



  // 计算BMI的函数（示例）
  calculateBMI(weight, height) {
    // height应为用户设置的身高（米）
    // 这里只是一个示例，实际应用中需要获取用户身高
    const {
      userHeight
    } = this.data; // 假设用户身高1.75米
    return (weight / (userHeight * userHeight)).toFixed(1);
  }
});