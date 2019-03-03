import WxCanvas from './wx-canvas';
import * as echarts from './echarts';

let ctx;

Component({
  properties: {
    canvasId: {
      type: String,
      value: 'ec-canvas'
    },

    ec: {
      type: Object
    },
    mapName: {
      type: String
    },
    inputValue: {
      type: Number
    },
    geoCoordMap: {
      type: Object
    },
    BJData: {
      type: Object
    },
    wishDetail: {
      type: Object
    },
    myLocation: {
      type: Object
    },
    isShareClick: {
      type: Boolean
    }
  },

  data: {

  },

  ready: function () {
    console.log('456');
    if (!this.data.ec) {
      console.warn('组件需绑定 ec 变量，例：<ec-canvas id="mychart-dom-bar" '
        + 'canvas-id="mychart-bar" ec="{{ ec }}"></ec-canvas>');
      return;
    }

    if (!this.data.ec.lazyLoad) {
      this.init();
    }
  },

  onload: function(){
    console.log('onload');
    this.init();
  },

  methods: {
    init: function (callback) {
      console.log('init');
      const version = wx.version.version.split('.').map(n => parseInt(n, 10));
      const isValid = version[0] > 1 || (version[0] === 1 && version[1] > 9)
        || (version[0] === 1 && version[1] === 9 && version[2] >= 91);
      if (!isValid) {
        console.error('微信基础库版本过低，需大于等于 1.9.91。'
          + '参见：https://github.com/ecomfe/echarts-for-weixin'
          + '#%E5%BE%AE%E4%BF%A1%E7%89%88%E6%9C%AC%E8%A6%81%E6%B1%82');
        return;
      }

      ctx = wx.createCanvasContext(this.data.canvasId, this);

      console.log('1122', this.data);
      const canvas = new WxCanvas(ctx, this.data.canvasId);
      const mapName = this.data.mapName;
      const inputValue = this.data.inputValue;
      const geoCoordMap = this.data.geoCoordMap;
      const BJData = this.data.BJData;
      const wishDetail = this.data.wishDetail;
      const isShareClick = this.data.isShareClick;
      var myLocation = this.data.myLocation;
      console.log('personLocation canvas canvas', this.data.canvasId);
      console.log('personLocation canvas mapName', mapName);
      console.log('personLocation canvas inputValue', inputValue);
      console.log('personLocation canvas geoCoordMap', geoCoordMap);
      console.log('personLocation canvas BJData', BJData);
      console.log('personLocation canvas wishDetail', wishDetail);
      console.log('personLocation canvas ec', this.data.ec);
      console.log('personLocation canvas myLocation', this.data.myLocation);
      console.log('personLocation canvas isShareClick', this.data.isShareClick);

      echarts.setCanvasCreator(() => {
        return canvas;
      });

      var query = wx.createSelectorQuery().in(this);
      query.select('.ec-canvas').boundingClientRect(res => {
        if(res === null) {return};
        if (typeof callback === 'function') {
          console.log('callback');
          this.chart = callback(canvas, res.width, res.height, mapName, inputValue, geoCoordMap, BJData, wishDetail, myLocation, isShareClick);
        }
        else if (this.data.ec && typeof this.data.ec.onInit === 'function') {
          console.log('onInit',res);
          this.chart = this.data.ec.onInit(canvas, res.width, res.height, mapName, inputValue, geoCoordMap, BJData, wishDetail, myLocation, isShareClick);
        }
        else {
          console.log('triggerEvent');
          this.triggerEvent('init', {
            canvas: canvas,
            width: res.width,
            height: res.height,
            mapName: mapName,
            inputValue: inputValue,
            geoCoordMap: geoCoordMap, 
            BJData: BJData,
            wishDetail: wishDetail,
            myLocation: myLocation,
            isShareClick: isShareClick
          });
        }
      }).exec();
    },

    canvasToTempFilePath(opt) {
      if (!opt.canvasId) {
        opt.canvasId = this.data.canvasId;
      }

      ctx.draw(true, () => {
        wx.canvasToTempFilePath(opt, this);
      });
    },

    touchStart(e) {
      if (this.chart && e.touches.length > 0) {
        var touch = e.touches[0];
        this.chart._zr.handler.dispatch('mousedown', {
          zrX: touch.x,
          zrY: touch.y
        });
        this.chart._zr.handler.dispatch('mousemove', {
          zrX: touch.x,
          zrY: touch.y
        });
      }
    },
    update: function (callback) {
      console.log('update');
      const version = wx.version.version.split('.').map(n => parseInt(n, 10));
      const isValid = version[0] > 1 || (version[0] === 1 && version[1] > 9)
        || (version[0] === 1 && version[1] === 9 && version[2] >= 91);
      if (!isValid) {
        console.error('微信基础库版本过低，需大于等于 1.9.91。'
          + '参见：https://github.com/ecomfe/echarts-for-weixin'
          + '#%E5%BE%AE%E4%BF%A1%E7%89%88%E6%9C%AC%E8%A6%81%E6%B1%82');
        return;
      }

      ctx = wx.createCanvasContext(this.data.canvasId, this);

      console.log('213', this.data);

      const canvas = new WxCanvas(ctx, this.data.canvasId);
      const mapName = this.data.mapName;

      echarts.setCanvasCreator(() => {
        return canvas;
      });

      var query = wx.createSelectorQuery().in(this);
      query.select('.ec-canvas').boundingClientRect(res => {
        if (typeof callback === 'function') {
          this.chart = callback(canvas, res.width, res.height, mapName);
        }
        else if (this.data.ec && typeof this.data.ec.onUpdate === 'function') {
          this.chart = this.data.ec.onInit(canvas, res.width, res.height, mapName);
        }
        else {
          this.triggerEvent('update', {
            canvas: canvas,
            width: res.width,
            height: res.height,
            mapName: mapName
          });
        }
      }).exec();
    },

    canvasToTempFilePath(opt) {
      if (!opt.canvasId) {
        opt.canvasId = this.data.canvasId;
      }

      ctx.draw(true, setTimeout(() => {
        wx.canvasToTempFilePath(opt, this);
      },1000));
    },

    touchStart(e) {
      if (this.chart && e.touches.length > 0) {
        var touch = e.touches[0];
        this.chart._zr.handler.dispatch('mousedown', {
          zrX: touch.x,
          zrY: touch.y
        });
        this.chart._zr.handler.dispatch('mousemove', {
          zrX: touch.x,
          zrY: touch.y
        });
      }
    },

    touchMove(e) {
      if (this.chart && e.touches.length > 0) {
        var touch = e.touches[0];
        this.chart._zr.handler.dispatch('mousemove', {
          zrX: touch.x,
          zrY: touch.y
        });
      }
    },

    touchEnd(e) {
      if (this.chart) {
        const touch = e.changedTouches ? e.changedTouches[0] : {};
        this.chart._zr.handler.dispatch('mouseup', {
          zrX: touch.x,
          zrY: touch.y
        });
        this.chart._zr.handler.dispatch('click', {
          zrX: touch.x,
          zrY: touch.y
        });
      }
    }
  }
});
