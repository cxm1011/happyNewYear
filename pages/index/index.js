//index.js
//获取应用实例
import url from '../../utils/url.js'
const app = getApp()

Page({
  data: {
    title1: '除岁又念君，不知君何处。',
    title2: '天南地北的你们，都还好吗？',
    url:url
  },

  onLoad: function (options) {
    var that = this;
    // console.log('options1111',options);
    var scene = decodeURIComponent(options.scene);
    app.scene = scene;  // 通过扫码进入
    app.isShowPlayButton = false;  // 重新初始化
    // console.log('scene', scene);
    if (scene !== 'undefined') {
      wx.getSetting({
          success: res => {
            if (res.authSetting['scope.userInfo']) {
              // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
              wx.getUserInfo({
                success: res => {
                  // 可以将 res 发送给后台解码出 unionId
                  app.userInfo = res.userInfo;
                  that.wxLogin();
                }
              })
            } else {
              that.openUserInfoConfirm();
            }
          }
      })
    }
  },

  // 点击开始按钮调用
  onGetUserInfo(e) {
    var that = this;
    app.userInfo = e.detail.userInfo;  //全局变量存储
    that.wxLogin();    
  },

  wxLogin: function() {
    var that = this;
    wx.showLoading({
      title: '信息获取中...',
      mask: true
    })
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        console.log('login res', res);
        // console.log(app.userInfo);

        wx.hideLoading();
        wx.request({
          url: this.data.url.addUser,
          method: 'post',
          data: {
            code: res.code,
            avatarUrl: app.userInfo.avatarUrl,
            city: app.userInfo.city,
            country: app.userInfo.country,
            gender: app.userInfo.gender,
            language: app.userInfo.language,
            nickName: app.userInfo.nickName,
            // nickName: '\xF0\x9F\x8D\x93',
            nickName: app.userInfo.nickName,
            province: app.userInfo.province
          },
          header: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          success: function (res) {
            console.log('res login', res);
            // 昵称，openid使用公共变量存储
            // app.openId = res.data.data.openId;
            if (res.data.data) {
              app.userId = res.data.data.userId;
              that.getUserLocation(); //获取用户定位信息 
            }
            
           
          },
          fail: function () {

          }
        });
      }
    })
    // mock使用
    // app.userId = '1';
    // that.getUserLocation(); //获取用户定位信息 
  },

  // 获取用户定位信息 
  getUserLocation: function() {
    var that = this;
    wx.getSetting({
      success(res) {
        console.log('res.authSetting[scope.userLocation]', res.authSetting['scope.userLocation'])
        if (res.authSetting['scope.userLocation'] === true) {
          // console.log('地理授权成功');
          that.getUserCityInfo();
        } else {
          // console.log('地理授权失败');
          wx.authorize({
            scope: 'scope.userLocation',
            success: (res) => {
              // console.log('地理位置已授权');
              that.getUserCityInfo();
            },
            fail: (res) => {
              // console.log('failure');
              // console.log('地理授权弹出框确认');
              that.openConfirm();
            }
          })
         
        }

        // if (!res.authSetting['scope.userLocation']) {
        //   // console.log('开始授权地理位置',res.authSetting['scope.userLocation']);
        //   wx.authorize({
        //     scope: 'scope.userLocation',
        //     success: (res) => {
        //       // 用户已经同意小程序使用定位功能
        //       // console.log('同意授权');
        //       //
        //       that.getUserCityInfo();
        //     },
        //     fail: (res) => {
        //       // console.log('failure');
        //       that.openConfirm();
        //     }
        //   })
        // } else {
        //   // console.log('已经授权地理位置',res.authSetting['scope.userLocation']);
        //   that.getUserCityInfo();
        // }
      }
    });
    // mock使用
    // that.getUserCityInfo();
  },

  // 打开获取个人信息权限
  openUserInfoConfirm: function () {
    var that = this;
    wx.showModal({
      content: '检测到您没打开获取用户信息权限，是否去设置打开？',
      confirmText: "确认",
      cancelText: "取消",
      success: function (res) {
        // console.log(res);
        //点击“确认”时打开设置页面
        if (res.confirm) {
          // console.log('用户点击确认');
          wx.openSetting({
            success: (data) => { 
              // console.log('openUserInfoConfirm',data);
              if (data.authSetting["scope.userInfo"] === true) {
                wx.showToast({
                  title: '授权成功',
                  icon: 'success',
                  duration: 1000
                })
                //授权成功之后，登录
                that.wxLogin();
              } else {
                wx.showToast({
                  title: '授权失败',
                  icon: 'success',
                  duration: 1000
                })
              }
            }
          })
        } else {
          console.log('用户点击取消')
        }
      }
    })
  },

  // 打开定位权限
  openConfirm: function () {
    var that = this;
    wx.showModal({
      content: '检测到您没打开定位权限，是否去设置打开？',
      confirmText: "确认",
      cancelText: "取消",
      success: function (res) {
        // console.log(res);
        //点击“确认”时打开设置页面
        if (res.confirm) {
          // console.log('用户点击确认')
          wx.openSetting({
            success: (data) => { 
              if (data.authSetting["scope.userLocation"] === true) {
                wx.showToast({
                  title: '授权成功',
                  icon: 'success',
                  duration: 1000
                })
                //授权成功之后，再调用chooseLocation选择地方
                that.getUserLocation();
              } else {
                wx.showToast({
                  title: '授权失败',
                  icon: 'success',
                  duration: 1000
                })
              }
            }
          })
          // that.getUserLocation();
        } else {
          console.log('用户点击取消')
        }
      }
    })
  },

  // 查询用户定位信息
  getUserCityInfo: function(){
    var that = this;
    // 开始时候调用
    wx.showLoading({
      title: '定位信息获取中...',
      mask: true
    });

    var latitude = 39.904989;  //  北京纬度
    var longitude = 116.405285;  //  北京经度
    app.openPosition = false; //是否打开位置信息
    // 3s后没有调用 wx.getLocation则认为用户没有打开位置信息，则给个默认定位信息北京
    setTimeout(() => {
      if(!app.openPosition){
        // console.log('getLocation setTimeout', this);
        this.resolveLoaction(latitude,longitude);
      }
    },3000);
    wx.getLocation({
      type: 'gcj02', //返回可以用于wx.openLocation的经纬度
      success: (res) => {
        // console.log('getLocation', res);
        app.openPosition = true;
        var latitude = res.latitude;  //纬度
        var longitude = res.longitude;  //经度
        that.resolveLoaction(latitude,longitude);
        // var latitude = 53.330872;  //纬度
        // var longitude = -1.757813;  //经度
        // wx.request({
        //   url: this.data.url.qqGetLocUrl + latitude + ',' + longitude + '&key=' + this.data.url.qqGetLocKey,
        //   header: {
        //     'Content-Type': 'application/json'
        //   },
        //   success: function (res) {
        //     wx.hideLoading(); //成功后调用
        //     // console.log(res);
        //     if(res.data.status === 0){
        //       console.log('获取位置成功');
        //       // 国家和城市
        //       app.longitude = longitude;
        //       app.latitude = latitude;
        //       app.city = res.data.result.address_component.city ? res.data.result.address_component.city : res.data.result.address_component.locality;
        //       app.country = res.data.result.address_component.nation;
        //       app.province = res.data.result.address_component.province ? res.data.result.address_component.province : app.country;  //国外没有省份,province不能为空
        //       console.log('app123', app);
        //       console.log('app1234', res.data.result);
        //       that.insertUserLocInfo();

        //     }else {
        //       console.log('解析失败');
        //     }
        //   },
        //   fail: function(){
        //     console.log('调用地址解析服务失败');
        //   }
        // });
      }
    });

    // mock数据
    // that.insertUserLocInfo();
  },

  // 根据经纬度解析位置
  resolveLoaction: function(latitude,longitude) {
    var that = this;
    wx.request({
      url: this.data.url.qqGetLocUrl + latitude + ',' + longitude + '&key=' + this.data.url.qqGetLocKey,
      header: {
        'Content-Type': 'application/json'
      },
      success: function (res) {
        wx.hideLoading(); //成功后调用
        // console.log(res);
        if(res.data.status === 0){
          console.log('获取位置成功');
          // 国家和城市
          app.longitude = longitude;
          app.latitude = latitude;
          app.city = res.data.result.address_component.city ? res.data.result.address_component.city : res.data.result.address_component.locality;
          app.country = res.data.result.address_component.nation;
          app.province = res.data.result.address_component.province ? res.data.result.address_component.province : app.country;  //国外没有省份,province不能为空
          console.log('app123', app);
          // console.log('app1234', res.data.result);
          that.insertUserLocInfo();

        }else {
          console.log('解析失败');
        }
      },
      fail: function(){
        console.log('调用地址解析服务失败');
      }
    });
  },

  // 个人定位信息入库
  insertUserLocInfo: function() {
    var that = this;
    // console.log('insertUserLocInfo',app);
    wx.request({
      url: this.data.url.addLocationInfo,
      method: 'post',
      data: {
        userId: app.userId,
        longitude: app.longitude,
        latitude: app.latitude,
        locationCity: app.city,
        province: app.province,
        locationCountry: app.country,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        // console.log('insertUserLocInfo',res);
        if(res.data.code == 200){
          // console.log('定位信息保存成功');
          // 如果是通过分享进来的话，则调送祝福接口
          // 通过扫码进入
          if (app.scene !== 'undefined' && app.scene != app.userId) {
            that.sendWish();
          }else{
            wx.navigateTo({
              url: '/otherPages/location/location',
            })
          }
          // that.getForDisplay();
        }
      },
      fail: function () {
        
      }
    });

    // mock数据
    // that.getForDisplay();
  },

  sendWish() {

    wx.request({
      url: this.data.url.sendWish,
      method: 'post',
      data: {
        sendUserId: app.scene,
        receiveUserId: app.userId,
        wishCode: '',
        lastTimeCode: '',
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {    
        wx.navigateTo({
          url: '/otherPages/location/location',
        })
      },
      fail: function () {

      }
    })
  }

  // 根据userId拿好友信息
  // getForDisplay: function() {
  //   let sendUserId = app.userId;
  //   console.log('app.scene',app.scene)
  //   // 通过扫码进入
  //   if(app.scene !== 'undefined'){
  //     sendUserId = app.scene;
  //   }
  //   wx.showLoading({
  //     title: '加载中...',
  //   })
  //   wx.request({
  //     url: this.data.url.getForDisplay,
  //     method: 'post',
  //     data: {
  //       sendUserId: sendUserId
  //     },
  //     header: {
  //       'Content-Type': 'application/x-www-form-urlencoded'
  //     },
  //     success: function (res) {
  //       console.log('getForDisplay',res);
  //       if(res.data.code == 200){
  //         console.log('拿好友信息成功');
  //         console.log(res);
  //         wx.hideLoading();
  //         app.personLocation = res.data.data.personLocation; // 被攻击点信息
  //         app.myLocation = {
  //           city: app.city,
  //           country: app.country,
  //           latitude: app.latitude,
  //           longitude: app.longitude
  //         }

  //         app.geoCoordMap = res.data.data.geoCoordMap;  //位置映射
  //         app.BJData = res.data.data.BJData;  // 好友和被攻击点数组
  //         app.cityNumber = res.data.data.cityNumber === 'undefined' ? 0 : res.data.data.cityNumber;  // 好友城市数量
  //         app.wishNumber = res.data.data.wishNumber === 'undefined' ? 0 : res.data.data.wishNumber;  // 好友祝福数
  //         app.wishDetail = res.data.data.wishDetail;  // 祝福内容
  //         app.charmValue = res.data.data.charmValue;  //魅力值
  //         wx.navigateTo({
  //           url: '/otherPages/location/location',
  //         })
  //       }
  //     },
  //     fail: function () {

  //     }
  //   });

  //   // mock使用
  // //   app.wishDetail = [{
  // //     name: "北京",
  // //     province: '北京',
  // //     value: 10,
  // //     content: [
  // //       { nickName: 'a', wish: '新年快乐' },
  // //       { nickName: 'b', wish: '万事如意' },
  // //     ]
  // //   }, {
  // //     name: "重庆",
  // //     province: '重庆',
  // //     value: 10,
  // //     content: [
  // //       { nickName: 'a', wish: '新年快乐' },
  // //       { nickName: 'b', wish: '万事如意' },
  // //     ]
  // //   }, {
  // //     name: "兰州",
  // //     province: '甘肃',
  // //     value: 10,
  // //     content: [
  // //       { nickName: 'a', wish: '新年快乐' }
  // //     ]
  // //   }, {
  // //     name: "拉萨",
  // //     province: '西藏',
  // //     value: 10,
  // //     content: [
  // //       { nickName: 'a', wish: '新年快乐' }
  // //     ]
  // //   }, {
  // //     name: "香港邦泰",
  // //     province: '香港',
  // //     value: 10,
  // //     content: [
  // //       { nickName: 'a', wish: '新年快乐' }
  // //     ]
  // //   }, {
  // //     name: "海口",
  // //     province: '海南',
  // //     value: 10,
  // //     content: [
  // //       { nickName: 'a', wish: '新年快乐' }
  // //     ]
  // //   }];

  // //   var geoCoordMap = {
  // //           "上海": [121.4648, 31.2891],
  // //           "北京": [116.41667, 39.91667],
  // //           "重庆": [106.45000, 29.56667],
  // //           "兰州": [103.73333, 36.03333],
  // //           "拉萨": [91.00000, 29.60000],
  // //           "香港邦泰": [114.195466, 22.282751],
  // //           "海口": [110.35000, 20.01667],
  // //           "合肥": [117.27, 31.86],
  // //         };
  // //         var BJData = [
  // //           [{
  // //             name: "北京",
  // //             value: 1000
  // //           }, {
  // //             name: "上海"
  // //           }],
  // //           [{
  // //             name: "重庆",
  // //             value: 1000
  // //           }, {
  // //             name: "上海"
  // //           }],
  // //           [{
  // //             name: "兰州",
  // //             value: 1000
  // //           }, {
  // //             name: "上海"
  // //           }],
  // //           [{
  // //             name: "拉萨",
  // //             value: 1000
  // //           }, {
  // //             name: "上海"
  // //           }],
  // //           [{
  // //             name: "香港邦泰",
  // //             value: 1000
  // //           }, {
  // //             name: "上海"
  // //           }],

  // //           [{
  // //             name: "海口",
  // //             value: 1000
  // //           }, {
  // //             name: "上海"
  // //           }]
  // //         ];

  // //         var friendsLocAndWish = {
  // //           上海: [121.4648, 31.2891],
  // //           北京: [116.41667, 39.91667],
  // //           重庆: [106.45000, 29.56667],
  // //           兰州: [103.73333, 36.03333],
  // //           拉萨: [91.00000, 29.60000],
  // //           香港邦泰: [114.195466, 22.282751],
  // //           海口: [110.35000, 20.01667]
  // //         };

  // //         app.geoCoordMap = geoCoordMap;
  // //         app.BJData = BJData;
  // //         app.cityNumber = 6;
  // //         app.wishNumber = 10;
  // //         app.personLocation = {
  // //           city: '合肥',
  // //           longitude: 117.27,
  // //           latitude: 31.86
  // //         };
  // //         wx.navigateTo({
  // //           url: '/otherPages/location/location',
  // //         })

  //  },

})
