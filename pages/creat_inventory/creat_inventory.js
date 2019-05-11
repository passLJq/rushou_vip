// pages/creat_inventory/creat_inventory.js
var interval;
var varName;
var ctx = wx.createCanvasContext('canvasArcCir');
const utils = require('../../utils/util.js')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    texts: '',//文本框
    lettercount: 50,//文本框总字数
    nowcount: 0,//实时文本框总字数
    qingdantexts :'',//清单字数
    qinnowcount: 0,//情单长度
    video: 1,//1是还没开始录音，2是录音中，3是停止
    src: '',//录音存放
    openvideo: false,
    videosaid: true,//播放时状态 true是没播放，false是播放中
    bosrc: '../../image/CombinedShape.png',
    videotime: '',
    datas: '',
    status: 1//1是授权了，2是没授权录音
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    //检查录音授权
    that.checkluying()
    //录音
    this.recorderManager = wx.getRecorderManager();
    this.recorderManager.onError(function (res) {
      console.log(res)
      that.tip("录音失败！")
    });
    this.recorderManager.onStop(function (res) {
      var time = (res.duration / 1000).toFixed(0)
      that.setData({
        video: 3,
        src: res.tempFilePath,
        videotime: time
      })
      console.log(res.tempFilePath)
    });

    this.innerAudioContext = wx.createInnerAudioContext();
    this.innerAudioContext.onError((res) => {
      that.tip("播放录音失败！")
    })
    this.innerAudioContext.onEnded((res) => {
      //自然结束播放事件
      that.setData({
        bosrc: '../../image/CombinedShape.png',
        videosaid: true
      })
    })

    //创建并返回绘图上下文context对象。
    var cxt_arc = wx.createCanvasContext('canvasCircle');
    cxt_arc.setLineWidth(4);
    cxt_arc.setStrokeStyle('#e8e8e8');
    cxt_arc.setLineCap('round');
    cxt_arc.beginPath();
    cxt_arc.arc(35, 35, 30, 0, 2 * Math.PI, false);
    cxt_arc.stroke();
    cxt_arc.draw();
  },
  //检查录音授权
  checkluying: function () {
    var that = this;
    wx.getSetting({
      success(res) {
        console.log(res)
        if (!res.authSetting['scope.record']) {
          console.log(1)
          wx.authorize({
            scope: 'scope.record',
            success(ret) {
              that.setData({
                status: 1
              })
            },
            fail(ret) {
              that.setData({
                status: 2
              })
            }
          })
        } else {
          that.setData({
            status: 1
          })
        }
      }
    })
  },
  drawCircle: function () {
    //检查授权
    var that = this
    wx.getSetting({
      success(res) {
        console.log(res)
        if (!res.authSetting['scope.record']) {
          wx.authorize({
            scope: 'scope.record',
            success(ret) {
              console.log(ret)
              that.opense()
            },
            fail(ret) {
              wx.openSetting({
                success: (res) => {
                }
              })
            }
          })
        } else {
          that.opense()
        }
      },
      fail(res) {
        app.promsg('授权失败，无法使用')
      }
    })
  },
  //画圈
  opense: function () {
    var that = this
    clearInterval(varName);
    function drawArc(s, e) {
      ctx.setFillStyle('white');
      ctx.clearRect(0, 0, 100, 100);
      ctx.draw();
      var x = 35, y = 35, radius = 30;
      ctx.setLineWidth(4);
      ctx.setStrokeStyle('#CDA86E');
      ctx.setLineCap('round');
      ctx.beginPath();
      ctx.arc(x, y, radius, s, e, false);
      ctx.stroke()
      ctx.draw()
    }
    var step = 1, startAngle = 1.5 * Math.PI, endAngle = 0;
    var animation_interval = 10, n = 5800;
    var animation = function () {
      if (step <= n) {
        endAngle = step * 2 * Math.PI / n + 1.5 * Math.PI;
        drawArc(startAngle, endAngle);
        step++;
      } else {
        clearInterval(varName);
      }
    };
    varName = setInterval(animation, animation_interval);
    that.startRecordMp3()
    that.setData({
      video: 2
    })
  },
  // 暂停画圈
  stopcircle: function () {
    clearInterval(varName);
    this.stopRecord()
  },
  /*** 提示*/
  tip: function (msg) {
    wx.showModal({
      title: '提示',
      content: msg,
      showCancel: false
    })
  },
  //弹出
  ales: function (e) {
    var that = this
    wx.showModal({
      title: '友情提示',
      content: '您确认删除这段语言吗？',
      confirmColor: '#FF422C',
      success: function (res) {
        if (res.confirm) {
          that.delevied(e)
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  }
  /*** 录制mp3音频*/
  , startRecordMp3: function () {
    this.recorderManager.start({
      format: 'mp3'
    });
  }

  /*** 停止录音*/
  , stopRecord: function () {
    this.recorderManager.stop()
  }

  /**
   * 播放录音
   */
  , playRecord: function () {
    var that = this;
    var as = this.data.videosaid
    if (as) {
      var src = this.data.src;
      if (src == '') {
        this.tip("请先录音！")
        return;
      }
      this.innerAudioContext.src = this.data.src;
      this.innerAudioContext.play()
      this.setData({
        bosrc: '../../image/CombinedShape1.gif',
        videosaid: false
      })
    } else if (!as) {
      this.setData({
        bosrc: '../../image/CombinedShape.png',
        videosaid: true
      })
    }
  },
  //打开录音
  openvied: function (e) {
    //dataset.que=1表示确认按钮关闭录音盒子
    if (this.data.video == 1 || e.currentTarget.dataset.que == 1) {
      var a = !this.data.openvideo
      this.setData({
        openvideo: a
      })
    }
  },
  //删除录音
  delevied: function (e) {
    var that = this;
    that.setData({
      src: '',
      video: 1,
      videosaid: true
    })
    //1表示重新录制按钮
    if (e.currentTarget.dataset.del == 1) {
      this.openvied()
    }
    //重新画第二圆 让进度条恢复原来
    ctx.setFillStyle('white');
    ctx.clearRect(0, 0, 100, 100);
    ctx.draw();
    ctx.setLineWidth(4);
    ctx.setStrokeStyle('#eaeaea');
    ctx.setLineCap('round');
    ctx.beginPath();
    ctx.arc(35, 35, 30, 0, 2 * Math.PI, false);
    ctx.stroke()
    ctx.draw()
  },
  bind2:function(e){
    this.setData({
      qingdantexts: e.detail.value,
      qinnowcount: e.detail.value.length
    })
  },
  bind3:function(e){
    this.setData({
      texts: e.detail.value,
      nowcount: e.detail.value.length
    })
  },
  okup:function(){
  var that=this
    wx.showLoading({
      title: '创建中..',
      icon: 'loading',
      mask: true
    });
    if (that.data.qingdantexts.length==0){
      app.promsg('标题不能为空')
      return
    }
    if (that.data.texts.length == 0) {
      app.promsg('简介不能为空')
      return
    }
    if (that.data.src==''){
      utils.http({
        method:'post',
        url: app.globalData.siteUrl + '/Main/Member/InsertorUpdateProList?uid=' + wx.getStorageSync('SessionUserID') +'&devicetype=3',
        data: {
          uid: wx.getStorageSync('SessionUserID'),
          name: that.data.qingdantexts,
          sign: that.data.texts,
          record: that.data.src,
          recordtime: that.data.videotime,
        },
        header: 1,
        successBack: this.updata
      })
    }else{
      //新录音上传
      wx.uploadFile({
        url: app.globalData.memberSiteUrl + '/Ajax/FileUpload.ashx', //仅为示例，非真实的接口地址
        filePath: that.data.src,
        name: 'file',
        header: {
          "Content-Type": "application/json; charset=utf-8"
        },
        success: function (ret) {
          var data = ret.data
          //不支持单引号转换为双引号
          data = JSON.parse(data.replace(/\'/ig, "\""));
          if (data.success == 1) {
            var locsrc = data.fullurl
          utils.http({
            method: 'post',
            url: app.globalData.siteUrl + '/Main/Member/InsertorUpdateProList?uid=' + wx.getStorageSync('SessionUserID') + '&devicetype=3',
            data: {
              uid: wx.getStorageSync('SessionUserID'),
              name: that.data.qingdantexts,
              sign: that.data.texts,
              record: unescape(locsrc),
              recordtime: Number(that.data.videotime),
            },
            header: 1,
            successBack: that.updata
          })
          }else{
            app.promsg(data.error)
          }
        }
      })
    }
  },
  updata:function(ret){
    wx.hideLoading()
    if (ret.data.status==1&&ret.data.success){
      app.promsg('创建成功')
      setTimeout(function () {
        wx.navigateBack({
          delta: 1
        })
      }, 1000)
    }else{
      app.promsg(ret.data.err)
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  }
})