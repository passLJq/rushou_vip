// pages/product_bill_edit/product_bill_edit.js
var interval;
var varName;
var ctx = wx.createCanvasContext('canvasArcCir');
const app = getApp()
const util = require("../../utils/util.js")
const sharebox = require('../../Component/sharebox/sharebox.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    prolistid: "", //清单ID
    slide: 0, //0=店铺商品, 1=清单数据
    page: [1, 1], //第几页
    pagesize: [10, 10], //每一页的数量
    billList: "", //清单数据
    selectArr: [
      [],
      []
    ], //是否选中的数组
    allSelect: true, //全选
    isreachBottom: false, //是否正在执行上拉
    noMore: false, //没有更多数据了
    billTitle: "", //清单标题
    billContent: "", //清单简介
    billMaxCounts: 0, //总数量
    statusType: 0, //0=在自己的店铺下, 1=在别人的店铺下
    video: 1, //1是还没开始录音，2是录音中，3是停止
    src: '', //录音存放
    openvideo: false,
    videosaid: true, //播放时状态 true是没播放，false是播放中
    bosrc: '/image/CombinedShape.png',
    videotime: '',//录音时间
    status: 1, //1是授权了，2是没授权录音
    ruid: wx.getStorageSync("ruid"),
    showshare: [false, true], //分享控制
  },
  //弹出分享框
  goshare: function () {
    this.setData({
      showshare: [true, true]
    })
  },
  //关闭分享框
  closeshare: function (index) {
    //1是生成海报时观点弹出框但保留遮罩层
    if (index == 1) {
      this.setData({
        showshare: [true, false]
      })
    } else {
      sharebox.closeshare(this)
    }
  },
  //分享到朋友圈生成图片
  sharequan: function (that) {
    var that = this
    sharebox.sharequan(that, 2, 6)
  },
  //保存海报
  savehaibao: function (that) {
    var that = this
    sharebox.savehaibao(that)
  },
  usermeng: function (ret) {//用户信息分享需要
    var that = this
    var ret = ret.data
    if (ret.status == 1 && ret.success) {
      that.setData({
        userinfo: ret.Data
      })
    } else {
      app.promsg(ret.err)
    }
  },
  billTitleInput(e) {
    this.setData({
      billTitle: e.detail.value
    })
  },
  billContentInput(e) {
    this.setData({
      billContent: e.detail.value
    })
  },
  deleteBillSome(e) {
    let proIdArr = []
    this.setData(e.detail)
    for (let i in e.detail.shopList) {
      if (e.detail.selectArr[this.data.slide][i] === 1) {
        proIdArr.push(e.detail.shopList[i].proid)
      }
    }
    if (proIdArr.length < 1) {
      app.promsg("请先选中清单商品")
      return
    }
    wx.showModal({
      title: '温馨提示',
      content: "是否下架该清单商品?",
      success: (res) => {
        if (res.confirm) {
          this.setData({
            shopList: "",
            billList: "",
            noMore: false,
            isreachBottom: false,
            page: [1, 1]
          })
          util.http({
            url: app.globalData.siteUrl + '/Main/Member/DeleteProListItem?devicetype=3&uid=' + wx.getStorageSync('SessionUserID'),
            method: "POST",
            data: {
              prolistid: this.properties.prolistid,
              proid: proIdArr.join(",")
            },
            header: 1,
            successBack: (ret) => {
              if (ret && ret.data.success && ret.data.status == 1) {
                app.showtips("删除成功")
                setTimeout(() => {
                  this.getMsg()
                }, 1000)
              } else {
                app.promsg(ret.data.err)
              }

            }
          })
        } else if (res.cancel) {}
      }
    })

  },
  saveBill() {
    if (this.data.billContent.length < 1 || this.data.billTitle.length < 1) {
      app.alerts("清单标题和简介不能为空", {
        showCancel: true
      })
      return
    }
    this.upLoadMp3(() => {
      util.http({
        url: app.globalData.siteUrl + '/Main/Member/InsertorUpdateProList?devicetype=3&uid=' + wx.getStorageSync('SessionUserID'),
        method: "POST",
        data: {
          uid: wx.getStorageSync('SessionUserID'),
          name: this.data.billTitle,
          sign: this.data.billContent,
          record: this.data.src,
          recordtime: this.data.videotime,
          prolistid: this.data.prolistid
        },
        header: 1,
        successBack: (ret) => {
          if (ret && ret.data.success && ret.data.status == 1) {
            app.showtips("保存成功")
            setTimeout(() => {
              wx.navigateBack({
                delta: 1
              })
            }, 1000)
          } else {
            app.promsg(ret.data.err)
          }

        }
      })
    })
  },
  getMsg(loading_icon) {
    let {
      billList,
      isreachBottom,
      noMore,
      page
    } = this.data
    if (loading_icon) {
      billList = ""
      noMore = false
      isreachBottom = false
      page = [1, 1]
    }
    new Promise((resolve, reject) => {
      util.http({
        url: app.globalData.siteUrl + '/Main/Member/GetProList?devicetype=3',
        data: {
          currentPage: page[this.data.slide],
          pageSize: this.data.pagesize[this.data.slide],
          uid: wx.getStorageSync('ruid') || wx.getStorageSync('SessionUserID'),
          prolistid: this.data.prolistid //详情需要的
        },
        header: 1,
        loading_icon: isreachBottom || loading_icon,
        successBack: (ret) => {
          if (ret && ret.data.success && ret.data.status == 1 && ret.data.Data.length > 0) {
            if (billList && billList[0] && billList[0].itemlist) {
              billList[0].itemlist = [...billList[0].itemlist, ...ret.data.Data[0].itemlist]
            } else {
              billList = [...billList, ...ret.data.Data]
            }
            resolve(ret.data.Data)
          } else {
            app.promsg(ret.data.err)
          }

        }
      })
    }).then((ret) => {
      if (isreachBottom && ret[0].itemlist.length < 1) {
        noMore = true
      } else {
        noMore = false
      }

      this.setData({
        billList,
        isreachBottom: false,
        noMore,
        page,
        billTitle: this.data.billTitle || ret[0].name,
        billContent: this.data.billContent || ret[0].sign,
        billMaxCounts: ret[0].count,
        src: ret[0].record,
        videotime: ret[0].recordcount
      })
      let timer = setTimeout(() => {
        wx.stopPullDownRefresh()
        clearTimeout(timer)
        timer = null
      }, 1500)
    })

  },
  movePro(e) {
    this.getMsg(1)
  },
  deleteList(e) {
    this.setData(e.detail)
    this.getMsg()
  },
  toAddMsg() {
    if (this.data.slide === 0) {
      wx.reLaunch({
        url: '/pages/class/class'
      })
    } else {
      wx.reLaunch({
        url: '/pages/index/index'
      })
    }

  },
  //检查录音授权
  checkluying: function() {
    var that = this;
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.record']) {
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
  drawCircle: function() {
    //检查授权
    var that = this
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.record']) {
          wx.authorize({
            scope: 'scope.record',
            success(ret) {
              that.opense()
            },
            fail(ret) {
              wx.openSetting({
                success: (res) => {}
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
  opense: function() {
    var that = this
    clearInterval(varName);

    function drawArc(s, e) {
      ctx.setFillStyle('white');
      ctx.clearRect(0, 0, 100, 100);
      ctx.draw();
      var x = 35,
        y = 35,
        radius = 30;
      ctx.setLineWidth(4);
      ctx.setStrokeStyle('#CDA86E');
      ctx.setLineCap('round');
      ctx.beginPath();
      ctx.arc(x, y, radius, s, e, false);
      ctx.stroke()
      ctx.draw()
    }
    var step = 1,
      startAngle = 1.5 * Math.PI,
      endAngle = 0;
    var animation_interval = 10,
      n = 5800;
    var animation = function() {
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
  upLoadMp3(CallBack) {
    wx.showLoading({
      title: '保存中..',
      icon: 'loading',
      mask: true
    });
    var that = this
    if (that.data.src == '') {
      CallBack()
    } else {
      //如果没有修改录音，已经上传了就不上传
      if (that.data.src.substr(0, 24) == 'https://images.rushouvip') {
        CallBack()
        return
      }
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
            that.setData({
              src: unescape(locsrc),
              videotime: Number(that.data.videotime)
            })
            CallBack()
          } else {
            app.promsg(data.error)
          }
          wx.hideLoading()
        }
      })
    }
  },
  // 暂停画圈
  stopcircle: function() {
    clearInterval(varName);
    this.stopRecord()
  },
  /*** 提示*/
  tip: function(msg) {
    wx.showModal({
      title: '提示',
      content: msg,
      showCancel: false
    })
  },
  //弹出
  ales: function(e) {
      var that = this
      wx.showModal({
        title: '友情提示',
        content: '您确认删除这段语言吗？',
        confirmColor: '#FF422C',
        success: function(res) {
          if (res.confirm) {
            that.delevied(e)
          } else if (res.cancel) {
          }
        }
      })
    }
    /*** 录制mp3音频*/
    ,
  startRecordMp3: function() {
      this.recorderManager.start({
        format: 'mp3'
      });
    }

    /*** 停止录音*/
    ,
  stopRecord: function() {
      this.recorderManager.stop()
    }

    /**
     * 播放录音
     */
    ,
  playRecord: function() {
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
  openvied: function(e) {
    //dataset.que=1表示确认按钮关闭录音盒子
    if (this.data.video == 1 || e.currentTarget.dataset.que == 1) {
      var a = !this.data.openvideo
      this.setData({
        openvideo: a
      })
    }
  },
  //删除录音
  delevied: function(e) {
    var that = this;
    that.setData({
      src: '',
      video: 1,
      videosaid: true,
      videotime: 0
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

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

    //语音
    if (11) {
      var that = this;
      //检查录音授权
      that.checkluying()
      //录音
      this.recorderManager = wx.getRecorderManager();
      this.recorderManager.onError(function(res) {
        that.tip("录音失败！")
      });
      this.recorderManager.onStop(function(res) {
        var time = (res.duration / 1000).toFixed(0)
        that.setData({
          video: 3,
          src: res.tempFilePath,
          videotime: time
        })
      });

      this.innerAudioContext = wx.createInnerAudioContext();
      this.innerAudioContext.onError((res) => {
        that.tip("播放录音失败！")
      })
      this.innerAudioContext.onEnded((res) => {
        //自然结束播放事件
        that.setData({
          bosrc: '/image/CombinedShape.png',
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
    }
    //一个二维码进来一个链接进来的,组成是ruid,压缩后的pid(2,52)
    //scene是二维码进来的
    let scene = decodeURIComponent(options.scene)
    console.log(scene)
    if (options.scene) {
      let aall = []
      aall = scene.split(",")
      if (aall[0] != wx.getStorageSync('SessionUserID')) {
        wx.setStorageSync('ruid', aall[0])
      } else {
        wx.setStorageSync("ruid", '')
      }
      util.diz(aall[1], 32, 10, (ret)=> {
        this.setData({
          prolistid: ret.data.nValue,
          statusType: 1
        })
        wx.setNavigationBarTitle({
          title: '查看清单'
        })
        this.getMsg() 
      })
    }else {
      let statusType = 0
      let prolistid = ""
      prolistid = options.prolistid
      if (options.statusType) {
        statusType = parseInt(options.statusType)
      }
      if (options.ruid) {
        if (options.ruid !== wx.getStorageSync("SessionUserID")) {
          wx.setStorageSync("ruid", options.ruid)
        } else {
          wx.setStorageSync("ruid", '')
        }
      }
      this.setData({
        prolistid,
        isFirstGet: true,
        statusType
      })
      this.getMsg()
    }
    util.http({
      url: app.globalData.siteUrl + '/Main/Member/GetUserShopJson',
      data: {
        uid: wx.getStorageSync('SessionUserID'),
        ruid: wx.getStorageSync('ruid')
      },
      header: 1,
      successBack: this.usermeng
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    if (this.data.statusType === 1) {
      wx.setNavigationBarTitle({
        title: '查看清单'
      })
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.setData({
      ruid: wx.getStorageSync("ruid")
    })
    if (this.data.isFirstGet) {
      this.setData({
        isFirstGet: false
      })
    } else {
      this.getMsg(1)
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    if (this.data.slide === 0 && !this.data.noMore) {
      let page = this.data.page
      page[this.data.slide] += 1
      this.setData({
        isreachBottom: true,
        page: page
      })
      this.getMsg()
    }
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    if (this.data.billList[0].itemlist.length > 0) {
      return {
        title: this.data.billTitle,
        path: 'pages/product_bill_edit/product_bill_edit?ruid=' + (wx.getStorageSync("ruid") || wx.getStorageSync("SessionUserID")) + "&statusType=1&prolistid=" + this.data.prolistid,
        imageUrl: this.data.billList[0].itemlist[0].proimg
      }
    }

  }
})