import url from '../../utils/url.js';
const app = getApp();
Page({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    url: url,
    wishItems: [
      { name: '1', value: '福气多点', checked: 'true' },
      { name: '2', value: '颜值高点' },
      { name: '3', value: '钱包鼓点' },
      { name: '4', value: '身材瘦点' },
      { name: '5', value: '爱情美点' },
      { name: '6', value: '官运鸿点' },
      { name: '7', value: '工作顺点' },
      { name: '8', value: '成绩好点' }
    ],
    lastItems:[
      { name: '1', value: '最近', checked: 'true' },
      { name: '2', value: '一年' },
      { name: '3', value: '两年' },
      { name: '4', value: '三年' },
      { name: '5', value: '>三年' }
    ],
    wishCode: 1,
    lastTimeCode: 1
  },

  wishChange(e) {
    this.setData({
      wishCode: e.detail.value
    })
  },

  lastChange(e) {
    this.setData({
      lastTimeCode: e.detail.value
    })
  },

  sendWish() {
    // console.log('lastChange2', this.data);
    // 调后端接口，成功后跳转页面


    wx.request({
      url: this.data.url.sendWish,
      method: 'post',
      data: {
        sendUserId: app.scene,
        receiveUserId: app.userId,
        wishCode: this.data.wishCode,
        lastTimeCode: this.data.lastTimeCode,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        wx.showToast({
          title: '送祝福成功',
          icon: 'succes',
          duration: 1500,
          mask: true
        });
        app.isShowPlayButton = true;
        setTimeout(() => {
          wx.navigateTo({
            url: '/otherPages/location/location',
          })
        },1500)
        
        // setTimeout(function () {
        //   wx.navigateBack({
        //     delta: 1
        //   })
        // }, 1000)
      },
      fail: function () {

      }
    })
  },

  /**
   * 组件的方法列表
   */
  methods: {

  }
})
