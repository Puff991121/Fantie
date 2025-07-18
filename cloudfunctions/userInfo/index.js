// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
}) // 使用当前云环境

const db = cloud.database();

// 修改用户信息
const updateUserInfo = async (event) => {
  const wxContext = cloud.getWXContext();
  try {
    // 构造更新数据，只更新允许修改的字段
    const updateData = {
      nickName: event.userInfo.nickName || '微信用户',
      gender: event.userInfo.gender,
      phone: event.userInfo.phone || '',
      email: event.userInfo.email || '',
      weight:event.userInfo.weight || '',
      height:event.userInfo.height || '',
      targetWeight:event.userInfo.targetWeight || '',
      updatedAt: db.serverDate()
    }

    // 如果有上传的头像，则更新
    if (event.userInfo.avatarUrl && event.userInfo.avatarUrl.startsWith('cloud://')) {
      updateData.avatarUrl = event.userInfo.avatarUrl
    }

    // 更新用户信息
    const res = await db.collection('users')
      .where({
        _openid: wxContext.OPENID
      })
      .update({
        data: updateData
      })

    if (res.stats.updated === 0) {
      // 没有找到用户记录，创建新记录
      await db.collection('users').add({
        data: {
          _openid: wxContext.OPENID,
          ...updateData,
          createdAt: db.serverDate(),
          lastLoginTime: db.serverDate()
        }
      })
    }

    return {
      code: 200,
      message: '更新成功',
      data: updateData
    }
  } catch (err) {
    console.error('更新用户信息失败', err)
    return {
      code: 500,
      message: '更新用户信息失败: ' + err.message
    }
  }
};

// 获取用户信息
const getUserInfo = async () => {
  const wxContext = cloud.getWXContext()

  try {
    // 查询用户信息
    const res = await db.collection('users')
      .where({
        _openid: wxContext.OPENID
      })
      .get()

    if (res.data.length > 0) {
      return {
        code: 200,
        message: '获取成功',
        data: res.data[0]
      }
    } else {
      // 用户不存在，创建新记录
      const defaultUser = {
        _openid: wxContext.OPENID,
        nickName: '新用户',
        avatarUrl: '',
        gender: '',
        phone: '',
        email: '',
        createdAt: db.serverDate(),
        updatedAt: db.serverDate()
      }

      await db.collection('users').add({
        data: defaultUser
      })

      return {
        code: 200,
        message: '获取成功',
        data: defaultUser
      }
    }
  } catch (err) {
    console.error('获取用户信息失败', err)
    return {
      code: 500,
      message: '获取用户信息失败'
    }
  }
};

// 云函数入口函数
exports.main = async (event, context) => {
  switch (event.type) {
    case 'getUserInfo':
      return await getUserInfo(event)
    case 'updateUserInfo':
      return await updateUserInfo(event)
    default:
      break;
  }
}