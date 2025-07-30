// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
}) // 使用当前云环境

const db = cloud.database();

// 获取用户三围记录
const getMeasurementsRecords = async (event) => {
  const wxContext = cloud.getWXContext();
  try {
    const res = await db.collection('measurements_records').where({
        _openid: wxContext.OPENID,
        date: event.date // 可选，不传则获取所有记录
      })
      .orderBy('date', 'desc')
      .get()
    return {
      code: 200,
      data: res.data,
      message: '获取成功'
    }
  } catch (err) {
    return {
      code: 500,
      message: '获取失败',
      error: err
    }
  }
}

// 新增或更新三围记录
const addMeasurementsRecords = async (event) => {
  const wxContext = cloud.getWXContext();
  try {
    const checkRes = await db.collection('measurements_records').where({
        _openid: wxContext.OPENID,
        date: event.date
      })
      .get()

    if (checkRes.data.length > 0) {
      //更新现有数据
      await db.collection('measurements_records').doc(checkRes.data[0]._id).update({
        data: {
          bust: event.bust,
          waist: event.waist,
          hips: event.hips,
          updatedAt: db.serverDate()
        }
      })
    } else {
      await db.collection('measurements_records').add({
        data: {
          _openid: wxContext.OPENID,
          date: event.date,
          bust: event.bust,
          waist: event.waist,
          hips: event.hips,
          createdAt: db.serverDate(),
          updatedAt: db.serverDate()
        }
      })
    }

    return {
      code: 200,
      message: '操作成功'
    }

  } catch (err) {
    return {
      code: 500,
      message: '操作失败',
      error: err
    }
  }
}

// 云函数入口函数
exports.main = async (event, context) => {
  switch (event.type) {
    case 'getMeasurementsRecords':
      return await getMeasurementsRecords(event);
    case 'addMeasurementsRecords':
      return await addMeasurementsRecords(event);
    default:
      break;
  }


}