// let serverUrl = "http://120.79.210.156:8080";  //服务端url
let serverUrl = "https://dasense.cn";


let url = {
  "addUser": serverUrl+"/userInfo/add",   // 用户登录数据插入
  "sendWish": serverUrl+"/shareInfo/add",   // 用户发送祝福
  "getForDisplay": serverUrl +"/shareInfo/getForDisplay",   // 获取好友位置祝福等信息
  "qqGetLocUrl": "https://apis.map.qq.com/ws/geocoder/v1/?location=", //腾讯服务根据经纬度解析位置url
  // "qqGetLocKey": "E3KBZ-QUALJ-GDIFR-FL7GM-ENQO6-FPBIA", //腾讯服务根据经纬度解析位置key 
  // "qqGetLocKey": "H5ZBZ-KY5WI-6WUGY-54LZ4-ZYYDQ-5BBDR", // 王靠
  "qqGetLocKey": "JMDBZ-FA5CX-PXH4O-ZLPDW-APC27-AXFRX",  // 东宁

  "addLocationInfo": serverUrl + "/locationInfo/add",  //插入用户定位信息
  "QRCode": serverUrl + "/QRCode", //二维码获取
  "DeleteQRCode": serverUrl + "/DeleteQRCode", // 删除二维码图片
  // "topBg": serverUrl + "/image/topBg.png", //分享时顶部背景图
  "topChinaBg": serverUrl+ "/image/codeChinaBg.png", //分享时中国地图
  "topWorldBg": serverUrl + "/image/codeWorldBg.png", //分享时中国地图
}
module.exports = url;