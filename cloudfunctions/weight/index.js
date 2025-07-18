// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

const db = cloud.database();

//获取用户体重记录
const getWeightRecords = async (event) =>{
  const wxContext = cloud.getWXContext();
  try {
    // 获取用户记录
    const res = await db.collection('weight_records')
      .where({
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

// 添加/更新体重记录

const addWeightRecord = async (event)=>{
  const wxContext = cloud.getWXContext();
  try {
    // 检查记录是否已存在
    const checkRes = await db.collection('weight_records')
      .where({
        _openid: wxContext.OPENID,
        date: event.date
      })
      .get()
    
    if (checkRes.data.length > 0) {
      // 更新现有记录
      await db.collection('weight_records')
        .doc(checkRes.data[0]._id)
        .update({
          data: {
            [event.time]: event.weight,
            updatedAt: db.serverDate()
          }
        })
    } else {
      // 添加新记录
      await db.collection('weight_records')
        .add({
          data: {
            _openid: wxContext.OPENID,
            date: event.date,
            [event.time]: event.weight,
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

// 获取月度统计数据

const getMonthStats = async (event)=>{
  const wxContext = cloud.getWXContext();
  try {
    // 获取当月所有记录
    const yearMonth = event.date.substring(0, 7);
    const res = await db.collection('weight_records')
      .where({
        _openid: wxContext.OPENID,
        date: db.RegExp({
          regexp: `^${yearMonth}`,
          options: 'i'
        })
      })
      .get()
    
    // 计算统计数据
    const records = res.data
    if (records.length === 0) {
      return {
        code: 200,
        data: null,
        message: '无当月数据'
      }
    }
    
    // 提取所有早晚体重值
    const allWeights = []
    records.forEach(record => {
      if (record.morning) allWeights.push(record.morning)
      if (record.evening) allWeights.push(record.evening)
    })
    
    // 计算统计值
    const stats = {
      average: (allWeights.reduce((a, b) => a + b, 0) / allWeights.length).toFixed(1),
      max: Math.max(...allWeights).toFixed(1),
      min: Math.min(...allWeights).toFixed(1),
      fluctuation: (Math.max(...allWeights) - Math.min(...allWeights)).toFixed(1)
    }
    
    return {
      code: 200,
      data: stats,
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

// 云函数入口函数
exports.main = async (event, context) => {
  switch (event.type) {
    case 'getWeightRecords':
      return await getWeightRecords(event);
    case 'addWeightRecord':
      return await addWeightRecord(event);
    case 'getMonthStats':
      return await getMonthStats(event);
    default:
      break;
  }
}