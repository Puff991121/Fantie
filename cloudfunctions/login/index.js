// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
}) // 使用当前云环境

const db = cloud.database();
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  try {
    // 检查用户是否已存在
    const user = await db.collection('users').where({
      _openid: wxContext.OPENID
    }).get()

    const userData = {
      _openid: wxContext.OPENID,
      userInfo: event.userInfo || null,
      lastLoginTime: db.serverDate(),
      appid: wxContext.APPID,
      unionid: wxContext.UNIONID || null
    }

    if (user.data.length === 0) {
      // 新用户 - 创建记录
      userData.createdAt = db.serverDate()
      await db.collection('users').add({
        data: userData
      })
    } else {
      // 老用户 - 更新记录
      await db.collection('users').where({
        _openid: wxContext.OPENID
      }).update({
        data: userData
      })
    }

    return {
      code: 200,
      message: '登录成功',
      openid: wxContext.OPENID,
      appid: wxContext.APPID,
      unionid: wxContext.UNIONID
    }
  } catch (err) {
    console.error('登录出错', err)
    return {
      code: 500,
      message: '登录失败',
      error: err
    }
  }
}