import * as echarts from '../../ec-canvas/echarts';
import geoJson from './mapData.js';
import coorGeoJson from './mapcoordinateSystemData.js';
import url from '../../utils/url.js'


const app = getApp();

function initChart(canvas, width, height, mapName, inputValue, geoCoordMap, BJData, wishDetail, myLocation, isShareClick) {
  // console.log('isShareClick',isShareClick);
  // console.log('mapName', mapName)
  const chart = echarts.init(canvas, null, {
    width: width,
    height: height
  });
  canvas.setChart(chart);

  if (mapName == 'world'){
    echarts.registerMap('world', geoJson);
  } else {
    echarts.registerMap('china', coorGeoJson);
  }


  // console.log('geoCoordMap', geoCoordMap);
  // console.log('BJData', BJData);
  // 将BJData中的起点和终点转成对应的
  var convertData = function (data) {
    var res = [];
    for (var i = 0; i < data.length; i++) {
      var dataItem = data[i];
      var fromCoord = geoCoordMap[dataItem[0].name];
      var toCoord = geoCoordMap[dataItem[1].name];
      if (fromCoord && toCoord) {
        res.push([{
          coord: fromCoord,
          value: dataItem[0].value
        },
        {
          coord: toCoord
        }
        ]);
      }
    }
    return res;
  };


  var convertScatterData = function (data) {
    var res = [];
    for (var i = 0; i < data.length; i++) {
      var geoCoord = geoCoordMap[data[i].name];
      // console.log('data[i]', data[i]);
      // var content = data[i].content;
      // var wishContent = '';
      // console.log('content', content);
      // if (content) {
      //   for(let i=0;i<content.length;i++){
      //     wishContent += 'a|'+content[i].nickName + ':' + content[i].wishCode+','+'\n';
      //   }
      // }
      // console.log('wishContent', wishContent);
      if (geoCoord && geoCoord.concat(data[i].value) !== undefined) {
        res.push({
          name: data[i].name,
          value: geoCoord.concat(data[i].value).concat([100])
        });
      }
    }
    return res;
  };

  //分享时点亮的省份或者国家
  var shareRegionsArea = function (wishDetail, mapName) {
    const length = wishDetail.length;
    let shareRegionsArea = [];
    let temp = {};
    if (mapName === 'world') {
      for (let i = 0; i < length; i++) {
        shareRegionsArea.push({
          name: wishDetail[i].country,
          selected: true
        })
      }
    } else {
      for (let i = 0; i < length; i++) {
        shareRegionsArea.push({
          name: wishDetail[i].province,
          selected: true
        })
      }
    }
    // console.log('shareRegionsArea', shareRegionsArea)
    return shareRegionsArea;
  }


  var planePath = 'arrow';  // 好友攻击线形状
  // console.log('myLocation', myLocation);
  var series = [];
  [
    [myLocation.city, BJData]
  ].forEach(function (item, i) {
    // console.log('item', item);
    // console.log('i',i);
    if(BJData.length != 0) {
      series.push({
        name: item[0] + ' Top10',
        type: 'lines',
        symbol: ['none','none'],
        symbolSize: 10,
        effect: {
          // show: !isShareClick,  // 是否显示攻击线
          show: false,  // 是否显示攻击线
          period: 2,
          trailLength: 0.2,
          symbol: planePath, 
          symbolSize: 8,
          loop: false  //是否动态显示循环效果
        },
        lineStyle: {
          normal: {
            color: "#FFA800",
            width: 1,
            opacity: 0.6,
            curveness: 0.3
          }
        },
        data: convertData(item[1])
      },{
          type: "scatter",  //散点图
          coordinateSystem: "geo", // 地理坐标系
          color: 'yellow',
          label: {
            show: false,
            position: "right",
            color: "#fff",
            formatter: "{b}",
            textStyle: {
              color: "#EEAD0E",
            },
            emphasis: {
              show: true,  //点击时显示
              formatter: "{b}"  //圆环显示文字
            }
          },
          symbol: "diamond",  // 标记的图形。
          symbolSize: 6,  //标记大小
          // large: true,  // 
          data: convertScatterData(wishDetail),      
          itemStyle: {  //单个数据点的样式设置
            // show: true,
            // color: 'orange',
            emphasis: {
              borderColor: '#fff',
              borderWidth: 1
            }
          },
        },
      //被攻击点
      {
        type: "scatter",
        coordinateSystem: "geo",
        rippleEffect: {
          period: 4,
          brushType: "stroke",
          scale: 4
        },
        label: {
          normal: {
            show: true,
            position: "right",
            color:"#EEAD0E",
            formatter: "{b}",
            textStyle: {
              color: "#EEAD0E",
            }
          },
          emphasis: {
            show: true
          }
        },
        symbol: "diamond",
        symbolSize: 12,
        itemStyle: {
          normal: {
            show: true,
            color: "#EEAD0E",
          }
        },
        data: [{
          name: BJData[0][1].name,
          value: geoCoordMap[BJData[0][1].name] === 'undefined' ? null : geoCoordMap[BJData[0][1].name].concat([100])
        }]
      })
    };
    
      // 自己定位位置
    series.push({
          type: "scatter",  //散点图
          coordinateSystem: "geo", // 地理坐标系
          color: '#B70013',
          label: {
            show: true,  // 散点上文字的控制
            position: "top",
            color: '#B70013',
            formatter: "{b}", //圆环显示文字
            emphasis: {
              show: true,  //点击时显示
            }
          },
          symbolSize: 20,  //标记大小
          symbol: "pin",
          data: [{
            name: '我',
            value: [myLocation.longitude, myLocation.latitude, 100],
          }],      
          itemStyle: {  //单个数据点的样式设置
            emphasis: {
              borderColor: '#fff',
              borderWidth: 1
            }
          },
        },
     );
    // 点击分享则显示带阴影图
    if (isShareClick) {
      // console.log('isShareClick123', isShareClick);
      series.push(
        {
          type: 'map',
          map: mapName,
          // geoIndex: 1,
          layoutCenter: ["50%", "50%"],
          layoutSize: inputValue + "%",
          // aspectScale: 0.75, //长宽比
          showLegendSymbol: false, // 存在legend时显示
          label: {
            normal: {
              show: false,
            },
            emphasis: {
              show: false,
              textStyle: {
                color: '#fff'
              }
            }
          },
          roam: false,
          itemStyle: {
            normal: {
              areaColor: '#FFFFFF',
              borderColor: '#FFD39B',
              borderWidth: 1
            },
            emphasis: {
              areaColor: '#FF6347'
            }
          },
          data: shareRegionsArea(wishDetail, mapName)
        }
      )
    }
    
  });

// 选中省份或者国家获取
  var regionsArea = function (wishDetail, mapName) {
    const length = wishDetail.length;
    let regionsData = [];
    let temp = {};
    if(mapName === 'world'){
      for (let i = 0; i < length; i++) {
        regionsData.push({
          name: wishDetail[i].country,
          itemStyle: {
            areaColor: '#FF6347',
            color: 'red'
          }
        })
      }
    }else {
      for(let i=0;i<length;i++){
        regionsData.push({
          name: wishDetail[i].province,
          itemStyle: {
            // areaColor:"#D48688",
            areaColor: '#FF6347',
            color: 'red'
          }
        })
      }
    }
    // console.log('regionsData', regionsData)
    return regionsData;
  }

  var option = {};
  if (isShareClick) {
    option = {
      backgroundColor: '#fff',
      visualMap: {
        min: 150,
        max: 200,
        calculable: false,
        color: ["#fff"],
        textStyle: {
          color: '#fff'
        }
      },
      geo: {
        map: mapName,
        label: {
          emphasis: {
            show: true,
            color: '#fff',
            fontSize: 10,
            align: 'center',
            fontWeight: 'lighter',
            // backgroundColor: 'red' //点击省份名显示的背景色
          }
        },
        selectedMode: true,   //开启多选
        roam: true, //是否允许缩放
        layoutCenter: ["50%", "50%"], //地图位置
        layoutSize: inputValue + "%",

        itemStyle: {
          normal: {
            // 分享按钮点击的地图色
            areaColor: '#FFD39B',
            borderWidth: 3,
            shadowColor: '#FA8072',
            shadowBlur: 8,
            borderColor: '#C79E5F'

          },
          emphasis: {
            // color: "rgba(37, 43, 61, .5)" //悬浮背景
            color: "#DA70D6", //点击省份时的背景色

          }
        },
        regions: regionsArea(wishDetail, mapName)
      },
      series: series
    };
  }else{
    option = {
      backgroundColor: '#fff',
      visualMap: {
        min: 150,
        max: 200,
        calculable: false,
        color: ["#fff"],
        textStyle: {
          color: '#fff'
        }
      },
      geo: {
        map: mapName,
        label: {
          emphasis: {
            show: true,
            color: '#fff',
            fontSize: 10,
            align: 'center',
            fontWeight: 'lighter',
            // backgroundColor: 'red' //点击省份名显示的背景色
          }
        },
        selectedMode: true,   //开启多选
        roam: true, //是否允许缩放
        layoutCenter: ["50%", "50%"], //地图位置
        layoutSize: inputValue + "%",

        itemStyle: {
          normal: {
            // 正常查看的背景色
            color: "#fff", //地图背景色
            borderColor: "#c79e5f", //省市边界线
            borderwidth: 2,
            shadowColor: '#FA8072',
          },
          emphasis: {
            // color: "rgba(37, 43, 61, .5)" //悬浮背景
            color: "#DA70D6", //点击省份时的背景色

          }
        },
        regions: regionsArea(wishDetail, mapName)
      },
      series: series
    };
  }
  
  // console.log('option',option);
  chart.setOption(option);
  return chart;
}

Page({
  data: {
    items: [
      { name: 'china', value: '中国', checked: app.country === '中国' },
      { name: 'world', value: '世界', checked: app.country !== '中国' }
    ],
    nickName: '',
    cityNumber: app.cityNumber,
    wishNumber: app.wishNumber,
    charmValue: app.charmValue,
    showWishButton: 'true',
    mapName: app.country === '中国' ? 'china': 'world',  // 地图选择
    inputValue: 100,  // 放大倍数
    geoCoordMap: app.geoCoordMap, // 好友位置
    BJData: app.BJData, // 攻击线数组
    wishDetail: app.wishDetail,
    myLocation: app.myLocation,
    ec: {
      onInit: initChart
    },
    painting: {},  //分享二维码图片数据
    shareImage: '',
    isShare: false,
    url: url,
    scene: app.scene, // 通过二维码扫描进入标记
    isShowPlayButton: false,
    // isExceedTime: false, // 公众号3秒后消失

    // 弹幕
    doommData: [],
    barrageTimer:null,
    barrageTimerList: [],
    showWishNumber: 2,
    wishContents: [],
    startLoc: 0,

    //分享按钮点击
    isShareClick: false
    
  },

  onLoad() {
    // console.log('app.isShowPlayButton',app.isShowPlayButton);
    page = this;
    var that = this;
    clearInterval(this.data.barrageTimer);
    // 送祝福完成，跳回本页面isShowPlayButton为true
    if (app.isShowPlayButton === undefined){
      this.setData({
        isShowPlayButton: false,
        // isExceedTime: false,
        inputValue: 100,
        mapName: 'other',  // 为了让重新进入主页地图重新绘制
        isShare: false,
        showWishButton: true,
        doommData: [],
        barrageTimer: 0,
        barrageTimerList: [],
        showWishNumber: 2,
        wishContents: [],
        startLoc: 0,
        isShareClick: false
      }) 
    } else {
      this.setData({
        isShowPlayButton: app.isShowPlayButton,
        // isExceedTime: false,
        inputValue: 100,
        mapName: 'other',  // 为了让重新进入主页地图重新绘制
        isShare: false,
        showWishButton: true,
        doommData: [],
        barrageTimer: 0,
        barrageTimerList: [],
        showWishNumber: 2,
        wishContents: [],
        startLoc: 0,
        isShareClick: false
      }) 
    }

    that.getForDisplay();
    
    // 3秒后关注公众号消失
    // setTimeout(() => {
    //   this.setData({
    //     isExceedTime: true
    //   })
    // },3000)
  },

  onUnload: function() {
    clearInterval(this.data.barrageTimer);
  },
  // onReady() {
  //   this.setData({
  //     nickName: app.personLocation.nickName,  //这个从personLocation中拿 app.personLocation.nickName
  //     cityNumber: app.cityNumber,
  //     wishNumber: app.wishNumber,
  //     charmValue: app.charmValue,
  //     geoCoordMap: app.geoCoordMap, // 好友位置
  //     BJData: app.BJData, // 攻击线数组
  //     wishDetail: app.wishDetail,
  //     myLocation: app.myLocation,
  //     mapName: app.country === '中国' ? 'china' : 'world',
  //     ec: {
  //       onInit: initChart
  //     }
  //   });


  // },

  // 转发使用
  onShareAppMessage(res) {
    return {
      title: '过年地图',
      path: '/pages/index/index?scene='+app.userId,
      imageUrl: '/image/invite.png' //不设置的话则使用默认截图
    }
  },

  // 中国和世界地图切换
  radioChange(e) {
    // console.log('radio发生change事件，携带value值为：', e.detail.value);
    var items = this.data.items;
    for (var i = 0; i < items.length; ++i) {
      items[i].checked = items[i].name == e.detail.value
    }

    this.setData({
      mapName: e.detail.value,
      items: items,
    });

  },
  
  // 显示祝福语
  showWishButton: function () {
    var that = this;
    
    if (this.data.barrageTimer) {
      clearInterval(this.data.barrageTimer);
    }

    const wishDetail = app.wishDetail;
    let wishContents = [];
    let content = {};
    for (let i = 0; i < wishDetail.length;i++){
      let city = wishDetail[i].name;
      for (let j = 0; j < wishDetail[i].content.length;j++){
        // content.city = city;
        // content.wishCode = wishDetail[i].content[j].wishCode;
        // content.nickName = wishDetail[i].content[j].nickName;

        content.text = wishDetail[i].content[j].nickName + '在' + city + '祝您' + wishDetail[i].content[j].wishCode
        content.avatarUrl = wishDetail[i].content[j].avatarUrl;
        wishContents.push(content);
        content = {};
      }
    }
    // console.log('wishContents', wishContents);
    // 祝福语超超过某一个值，则在第10条插入公众号广告
    let adContent = {
      text: '更多好友报告，关注公众号: 嘻乐生活圈',
      avatarUrl: ''
    }

    let userIdContent = {
      text: '您的公众号好友报告查询ID为' + app.userId,
      avatarUrl: ''
    }
    if (wishContents.length > 10){
      wishContents.splice(9, 0, adContent);
      wishContents.splice(10, 0, userIdContent);
    }
    if (wishContents.length > 0) {
      wishContents.push(adContent);
      wishContents.push(userIdContent);
    }

    this.setData({
      showWishButton: false,
      wishContents: wishContents
    });
    that.getWishContent();
    let barrageTimer = setInterval(that.getWishContent, 5000);
    this.setData({
      barrageTimer: barrageTimer,
    });
    
  },

  getWishContent: function() {
    let contentLoc = 0;
    const showNum = 2;  //每次显示的数量
    const tops = [5,35]; // 距离顶端位置
    const colors = ['#C392FF', '#FF7373', '#819FFF','red'];  //颜色
    const wishContents = this.data.wishContents;
    const contentsNum = wishContents.length;
    let j = 0;
    for (var i = this.data.startLoc; i < contentsNum && j < showNum;i++){
      j++;
      // let wishContet = wishContents[i].nickName + '在' + wishContents[i].city + '祝您' + wishContents[i].wishCode;
      let wishContet = wishContents[i].text;
      let avatarUrl = wishContents[i].avatarUrl;
      let time = 5;
      let top = tops[i%2];
      let color = colors[i % 4];
      if (i === 9 || i === 10 || i === contentsNum - 2 || i === contentsNum-1){
        color = 'blue';
      }
      // console.log('color',color);
      let doommContent = new Doomm(wishContet, top, time, color, avatarUrl);
      doommList.push(doommContent);
    }
    if (i === contentsNum) {
      i = 0;
    }
    this.setData({
      doommData: doommList,
      startLoc: i
    })
  },



  hiddenWishButton: function () {
    clearInterval(this.data.barrageTimer);
    this.setData({ 
      showWishButton: true, 
      barrageTimer: 0
    });
  },

  // 跳到送祝福页面
  toSendWishPage() {
    wx.navigateTo({
      url: '/otherPages/sendWish/sendWish',
    })
  },

  // 跳到首页
  toIndexPage() {
    app.scence = 'undefined'; // 清除好友分享的id
    wx.reLaunch({
      url: '/pages/index/index',
    })
  },

  slider2change(e) {
    // console.log('slider2change',e.detail.value);
    this.setData({
      inputValue: e.detail.value,
      ec: {
        onInit: initChart
      }
    });
    
  },

  // 分享二维码图片
  sharePhoto() {
    var that = this;
    wx.showLoading({
      title: '绘制分享图片中',
      mask: true
    });

    this.setData({
      isShareClick: true,
      inputValue: 100,  //回到初始状态
      ec: {
        onInit: initChart
      }
    });

    setTimeout(() => that.getTempPicture(),5000);
    
  },

  getTempPicture() {
    var that = this;
    const ecComponent = this.selectComponent('#mychart-dom-area1');
    app.codePg = '';
    setTimeout(() => {
      ecComponent.canvasToTempFilePath({
        success: res => {
          wx.hideLoading();
          app.codePg = res.tempFilePath;
          that.getCodePage(app.codePg);
          // console.log('mychart-area', res.tempFilePath)
        },
        fail: res => {
          wx.hideLoading();
        }
      }, 2000);
    });
  },

  getCodePage(codePg) {
    var that = this;
    var newYearWishs = ['新年大吉大利','新年快乐','春节快乐'];
    // console.log(Math.floor(Math.random() * (newYearWishs.length-1)));
    const wish = newYearWishs[Math.floor(Math.random() * (newYearWishs.length - 1))];
    // 调后端获取二维码url,成功之后在setData
    wx.request({
      url: that.data.url.QRCode,
      method: 'get',
      data: {
        userId: app.userId
      },
      header: {
        'Content-Type': 'application/json' 
      },
      success: function(res){
        // console.log('res',res);
        if(res.data.code == 200) {
          that.setData({
            isShare: true,
            isShareClick: false, //地图回到第一层
            painting: {
              width: 375,
              height: 550,
              clear: true,
              views: [
                {
                  type: 'rect',
                  background: '#fff',
                  top: 0,
                  left: 0,
                  width: 375,
                  height: 550
                },
                {
                  type: 'image',
                  url: codePg,
                  top: 160,
                  left: 20,
                  width: 345,
                  height: 300
                },
                {
                  type: 'image',
                  url: that.data.mapName === 'china' ? that.data.url.topChinaBg : that.data.url.topWorldBg,
                  top: 0,
                  left: 0,
                  width: 400,
                  height: 155,
                },{
                  type: 'text',
                  content: '我在' + that.data.myLocation.city,
                  fontSize: 18,
                  color: '#FFA800',
                  textAlign: 'center',
                  top: 30,
                  left: 180
                },

                {
                  type: 'text',
                  content: wish + '，朋友们你们在哪?',
                  fontSize: 18,
                  color: '#000',
                  textAlign: 'center',
                  top: 60,
                  left: 190
                }, 
                 {
                  type: 'image',
                  url: res.data.data.url,  // 二维码base64地址
                  top: 460,
                  left: 20,
                  width: 80,
                  height: 75
                },
                {
                  type: 'text',
                  content: '长按扫描二维码进入小程序',
                  fontSize: 16,
                  color: '#000',
                  textAlign: 'left',
                  top: 490,
                  left: 140,
                  breakWord: true,
                  width: 200
                }
              ]
            }
          });

        }

      },
      fail: function(){

      }
    });
  },
  

  eventGetImage(event) {
    var that = this;
    // console.log('event',event)
    wx.hideLoading();
    const { tempFilePath, errMsg } = event.detail;
    // console.log('that.data.painting.views[2].url', that.data.painting.views[2].url);
    if (errMsg === 'canvasdrawer:ok') {
      that.setData({
        shareImage: tempFilePath,
      });
    
      // wx.getSetting({
      //   success(res) {
      //     if (!res.authSetting['scope.writePhotosAlbum']) {
      //       console.log('开始授权保存图片');
      //       wx.authorize({
      //         scope: 'scope.writePhotosAlbum',
      //         success: (res) => {
      //           // 用户已经同意小程序使用定位功能
      //           console.log('同意授权');
      //           //
      //           that.saveImage();
      //         },
      //         fail: (res) => {
      //           console.log('failure');
      //           that.openConfirmSaveImage();
      //         }
      //       })
      //     } else {
      //       console.log('已经授权保存图片');
      //       that.saveImage();
      //     }
      //   }
      // });
    } else {
      that.getCodePage(app.codePg);
    } 
  },

  openConfirmSaveImage: function () {
    var that = this;
    wx.showModal({
      content: '检测到您没打开保存图片权限，是否去设置打开？',
      confirmText: "确认",
      cancelText: "取消",
      success: function (res) {
        // console.log(res);
        // 点击“确认”时打开设置页面
        if (res.confirm) {
          // console.log('用户点击确认')
          wx.openSetting({
            success: (res) => {
              if (res.authSetting["scope.writePhotosAlbum"] === true) {
                wx.showToast({
                  title: '授权成功',
                  icon: 'success',
                  duration: 1000
                })
            
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

  saveToAblum: function() {
    var that = this;
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.writePhotosAlbum']) {
          // console.log('开始授权保存图片');
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success: (res) => {
              
              // console.log('同意授权');
              //
              that.saveImage();
            },
            fail: (res) => {
              // console.log('failure');
              that.openConfirmSaveImage();
            }
          })
        } else {
          // console.log('已经授权保存图片');
          that.saveImage();
        }
      }
    });
  },


  saveImage() {
    var that = this;
    wx.saveImageToPhotosAlbum({
      filePath: that.data.shareImage,
      success(res) {
        wx.showModal({
          // content: '已保存到相册，可以分享到朋友圈',
          content: '已保存到相册',
          confirmText: "确认",
          showCancel: false,
          success: function (res) {
            // console.log(res);
            //点击“确认”时打开设置页面
            if (res.confirm) {
              // console.log('用户点击确认');
              that.setData({
                isShare: false
              });
              that.deleteQRCode();
            }
          }
        })
      }
    })
  },

  deleteQRCode() {
    var that = this;
    // 调后端获取二维码url,成功之后在setData
    wx.request({
      url: that.data.url.DeleteQRCode,
      method: 'get',
      data: {
        userId: app.userId
      },
      header: {
        'Content-Type': 'application/json'
      },
      success: function (res) {
        // console.log('res', res);
      }
    })
  },

  getForDisplay: function () {
    var that = this;
    let sendUserId = app.userId;
    // console.log('app.userId', app.userId);
    // console.log('app.scene', app.scene);
    // 如果点开是自己分享则进入开始玩的界面
    if (app.userId === app.scene) {
      app.scene = 'undefined';
    }
    // 通过扫码进入
    if (app.scene !== 'undefined') {
      sendUserId = app.scene;
    }
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    wx.request({
      url: this.data.url.getForDisplay,
      method: 'post',
      data: {
        sendUserId: sendUserId
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        // console.log('getForDisplay', res);
        if (res.data.code == 200) {
          // console.log('拿好友信息成功location');
          // console.log(res);
          wx.hideLoading();
          app.personLocation = res.data.data.personLocation; // 被攻击点信息
          app.myLocation = {
            city: app.city,
            country: app.country,
            latitude: app.latitude,
            longitude: app.longitude
          }

          app.geoCoordMap = res.data.data.geoCoordMap;  //位置映射
          app.BJData = res.data.data.BJData;  // 好友和被攻击点数组
          app.cityNumber = res.data.data.cityNumber === 'undefined' ? 0 : res.data.data.cityNumber;  // 好友城市数量
          app.wishNumber = res.data.data.wishNumber === 'undefined' ? 0 : res.data.data.wishNumber;  // 好友祝福数
          app.wishDetail = res.data.data.wishDetail;  // 祝福内容
          app.charmValue = res.data.data.charmValue;  //魅力值

          that.setData({
            nickName: app.personLocation.nickName,  //这个从personLocation中拿 app.personLocation.nickName
            cityNumber: app.cityNumber,
            wishNumber: app.wishNumber,
            charmValue: app.charmValue,
            geoCoordMap: app.geoCoordMap, // 好友位置
            BJData: app.BJData, // 攻击线数组
            wishDetail: app.wishDetail,
            myLocation: app.myLocation,
            mapName: app.country === '中国' ? 'china' : 'world',
            scene: app.scene,
            ec: {
              onInit: initChart
            }
          });
        }
      },
      fail: function () {

      }
    });
  },
});

var page = undefined;
var doommList = [];
var i = 0;
class Doomm {
  constructor(text, top, time, color, avatarUrl) {
    // this.text = text + i;
    this.avatarUrl = avatarUrl;
    this.text = text;
    this.top = top;
    this.time = time;
    this.color = color;
    this.display = true;
    let that = this;
    this.id = i++;
    // 一段时间后关闭
    setTimeout(function () {
      doommList.splice(doommList.indexOf(that), 1);
      // console.log('doommList', doommList);
      page.setData({
        doommData: doommList
      })
    }, this.time * 1000);
  }
}