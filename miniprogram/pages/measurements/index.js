// pages/weight/weight.js
const utils = require('../../utils/dateFormat');
Page({
  data: {
    currentDate: '',
    selectedTime: '',
    inputWeight: '',
    showModal: false,
    todayData: {
      bust: null,
      waist: null,
      hips: null
    },
    historyData: [],
    monthStats: {
      average: null,
      fluctuation: null,
      max: null,
      min: null
    },
    userHeight: 175,
    bust: null,
    waist: null,
    hips: null,
  },

  onShow() {
    const userInfo = wx.getStorageSync('userInfo');
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
      name: 'measurements',
      data: {
        type: 'getMeasurementsRecords',
        date: this.data.currentDate
      },
      success: res => {
        console.log(res, 'res');
        if (res.result.code === 200 && res.result.data.length > 0) {
          const record = res.result.data[0]
          console.log(record, 'record');
          const {
            bust,
            waist,
            hips
          } = record;
          this.setData({
            todayData: {
              bust,
              waist,
              hips
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

  // 获取最近14天体重数据
  getHistoryData() {
    wx.cloud.callFunction({
      name: 'measurements',
      data: {
        type: 'getMeasurementsRecords',
        limit: 14 // 获取最近7条记录
      },
      success: res => {
        if (res.result.code === 200) {
          const historyData = res.result.data.map(item => {
            const dateParts = item.date.split('-')
            const displayDate = `${dateParts[1]}-${dateParts[2]}`
            const {
              bust,
              waist,
              hips
            } = item;



            return {
              date: displayDate,
              bust,
              waist,
              hips
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



  // 添加/更新三围记录
  addMeasurementsRecord() {
    const {
      bust,
      waist,
      hips,
      currentDate
    } = this.data
    if (!bust) {
      wx.showToast({
        title: '请输入胸围',
        icon: 'none'
      })
      return
    }
    if (!waist) {
      wx.showToast({
        title: '请输入腰围',
        icon: 'none'
      })
      return
    }
    if (!hips) {
      wx.showToast({
        title: '请输入臀围',
        icon: 'none'
      })
      return
    }

    wx.cloud.callFunction({
      name: 'measurements',
      data: {
        type: 'addMeasurementsRecords',
        date: currentDate,
        bust,
        waist,
        hips,
      },
      success: res => {
        if (res.result.code === 200) {
          wx.showToast({
            title: '记录成功',
            icon: 'success'
          });
          //更新最新体重数据
          // this.saveUserInfo(inputWeight);
          this.hideAddModal();

          // 刷新数据
          this.getTodayData()
          this.getHistoryData()
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

  handleBustInput(e) {
    this.setData({
      bust: e.detail.value
    });
  },
  handleWaistInput(e) {
    this.setData({
      waist: e.detail.value
    });
  },
  handleHipsInput(e) {
    this.setData({
      hips: e.detail.value
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