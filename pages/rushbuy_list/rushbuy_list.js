// pages/rushbuy_list/rushbuy_list.js
const app = getApp()
const util = require("../../utils/util.js")
const CheckLoginStatus = require("../../utils/CheckLoginStatus.js")
const sharebox = require('../../Component/sharebox/sharebox.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    slide: 0, //当前NAV选中的下标
    iconPosition: 36.5, //选中角标位置
    scrollLeft: 0, //角标左边距
    nowIndex: 1, //当前时间段的下标
    rushBuyNav: [{
        showTime: 18,
        yesterday: true,
        isNowDate: false, //是否是当前时刻
        time: "18:00",
        status: "昨日精选"
      },
      {
        showTime: 21,
        yesterday: true,
        isNowDate: false,
        time: "21:00",
        status: "昨日精选"
      },
      {
        showTime: 9,
        yesterday: false,
        isNowDate: false,
        time: "09:00",
        status: "预热中"
      },
      {
        showTime: 12,
        yesterday: false,
        isNowDate: false,
        time: "12:00",
        status: "预热中"
      },
      {
        showTime: 15,
        yesterday: false,
        isNowDate: false,
        time: "15:00",
        status: "预热中"
      },
      {
        showTime: 18,
        yesterday: false,
        isNowDate: false,
        time: "18:00",
        status: "预热中"
      },
      {
        showTime: 21,
        yesterday: false,
        isNowDate: false,
        time: "21:00",
        status: "预热中"
      },
      {
        showTime: "",
        yesterday: false,
        isNowDate: false,
        time: "09:00",
        status: "明日预告"
      }
    ],
    rushBuyMsg: [
      [],
      [],
      [],
      [],
      [],
      [],
      []
    ],
    isLoaded: false, //是否加载完成
    timer: null, //下个时间段倒计时
    fxshopid: "",
    ruid: "",
    showshare: [false, true], //分享控制
    zuan: "", //分享出去的赚多少钱
    nowShareIdx: "", //当前分享出去商品
    tomorrowMsgArr: [], //临时存储限时抢购明天还进行的已进行订单
  },
  //弹出分享框
  goshare: function(e) {
    this.setData({
      showshare: [true, true],
      zuan: (e.currentTarget.dataset.zuan).toFixed(2),
      nowShareIdx: e.currentTarget.dataset.idx
    })
  },
  //关闭分享框
  closeshare: function(index) {
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
  sharequan: function(that) {
    var that = this
    sharebox.sharequan(that, 2, 5)
  },
  //保存海报
  savehaibao: function(that) {
    var that = this
    sharebox.savehaibao(that)
  },
  usermeng: function(ret) { //用户信息分享需要
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
  changeNav(e) {
    let idx = e.currentTarget.dataset.idx
    wx.createSelectorQuery().select('#scroll_0').boundingClientRect((rect) => {
      console.log(e.currentTarget.offsetLeft)
      this.setData({
        slide: idx,
        iconPosition: e.currentTarget.offsetLeft + Number(rect.width / 2)
      })
    }).exec();
    //this.data.rushBuyMsg[this.data.slide].length < 1 && this.getMsg()
  },
  toProDetail(e) {
    wx.navigateTo({
      url: '/pages/productdetail/productdetail?pid=' + e.currentTarget.dataset.pid,
    })
  },
  getMsg(state) {
    this.setData({
      isLoaded: false
    })
    util.http({
      url: app.globalData.siteUrl + '/marketing/rushbuy/GetRushBuyListJson',
      data: {
        userid: wx.getStorageSync("SessionUserID"),
        fxshopid: wx.getStorageSync("fxshopid"),
        istoday: true
      },
      loading_icon: state,
      successBack: (ret) => {
        console.log(ret)
        let {
          rushBuyMsg,
          rushBuyNav,
          tomorrowMsgArr
        } = this.data
        if (state === 1) {
          rushBuyMsg = [
            [],
            [],
            [],
            [],
            [],
            [],
            []
          ]
        }
        tomorrowMsgArr = []
        if (ret && ret.data.success && ret.data.status == 1 && ret.data.Data !== null && ret.data.Data.length > 0) {
          let data = ret.data.Data
          data.forEach((item, index) => {
            if (item.istoday) {
              for (let i = 0; i < rushBuyNav.length - 1; i++) {
                if (rushBuyNav[i].showTime === item.showtime && i > 1) {
                  rushBuyMsg[i].push(item)

                } else if (rushBuyNav[i].showTime === item.showtime && i < 2 && item.isyesteday) {
                  if (item.showtime === 18) {
                    rushBuyMsg[0].push(item)
                  } else if (item.showtime === 21) {
                    rushBuyMsg[1].push(item)
                  }

                }
              }
            }
            let tomorrowDate = new Date(new Date(new Date().setHours(0, 0, 0, 0)).getTime() + 24 * 60 * 60 * 1000).getTime()
            let nowDate = new Date(item.enddate.replace(/-/g, "/")).getTime()
            if (nowDate >= tomorrowDate) {
              tomorrowMsgArr.push(item)
            }
          })
        } else {
          app.promsg(ret.data.err)
        }
        this.setData({
          isLoaded: true,
          rushBuyMsg,
          tomorrowMsgArr
        })
        this.getTomorrow()
      },
      errorBack(err) {
        this.setData({
          isLoaded: true
        })
        this.getTomorrow()
      }
    })
  },
  getTomorrow() {
    util.http({ //明日预告
      url: app.globalData.siteUrl + '/marketing/rushbuy/GetRushBuyListJson',
      data: {
        userid: wx.getStorageSync("SessionUserID"),
        fxshopid: wx.getStorageSync("fxshopid"),
        istoday: false
      },
      loading_icon: 1,
      successBack: (ret) => {
        let {
          rushBuyMsg
        } = this.data
        rushBuyMsg.push([])
        if (ret && ret.data.success && ret.data.status == 1 && ret.data.Data !== null && ret.data.Data.length > 0) {
          let data = ret.data.Data
          data.forEach((item, index) => {
            var tomorrowDate = new Date(new Date(new Date().setHours(0, 0, 0, 0)).getTime() + 24 * 60 * 60 * 1000).getTime()
            var nowDate = new Date(item.enddate.replace(/-/g, "/")).getTime()
            if (nowDate >= tomorrowDate) {
              rushBuyMsg[rushBuyMsg.length - 1].push(item)
            }
          })
        } else {
          app.promsg(ret.data.err)
        }
        rushBuyMsg[rushBuyMsg.length - 1] = rushBuyMsg[rushBuyMsg.length - 1].concat(this.data.tomorrowMsgArr)
        let newRushBuyMsg = []
        for (var i = 0; i < rushBuyMsg[rushBuyMsg.length - 1].length; i++) {　　
          var flag = true　
          for (var j = 0; j < newRushBuyMsg.length; j++) {　　　　
            if (rushBuyMsg[rushBuyMsg.length - 1][i].rushbuyid === newRushBuyMsg[j].rushbuyid) {
              flag = false　　　
            }　
          }　
          if (flag) {　　　　
            newRushBuyMsg.push(rushBuyMsg[rushBuyMsg.length - 1][i])　
          }
        }
        rushBuyMsg[rushBuyMsg.length - 1] = newRushBuyMsg
        this.setData({
          rushBuyMsg
        })
      },
      errorBack(err) {

      }
    })
  },
  getNowHours() {
    let now = new Date().getHours()
    let nowTime = Date.now()
    let nextTime = 0
    let {
      rushBuyNav,
      slide,
      timer,
      nowIndex
    } = this.data
    for (let i = 0; i < rushBuyNav.length - 1; i++) {
      let newI = parseInt(i) + 1
      if (now >= rushBuyNav[i].showTime && ((rushBuyNav[newI] && now < rushBuyNav[newI].showTime) || !rushBuyNav[newI])) {
        if (now < 9) { //是凌晨
          slide = 1
          nowIndex = 1
        } else {
          slide = parseInt(i)
          nowIndex = parseInt(i)
          nextTime = new Date(new Date().setHours(rushBuyNav[newI].showTime, 0, 0, 0)).getTime()
        }
      }
    }
    let remainingTime = nextTime - nowTime
    timer = setTimeout(() => {
      clearTimeout(this.data.timer)
      this.setData({
        timer: null
      })
      this.getNowHours()
    }, remainingTime)
    wx.createSelectorQuery().select('#scroll_0').boundingClientRect((rect) => {
      console.log(rect.width)
      console.log(Number(rect.width * slide))
      this.setData({
        iconPosition: Number(rect.width * slide) + Number(rect.width / 2)
      })
    }).exec();
    this.setData({
      slide,
      rushBuyNav,
      timer,
      nowIndex
    })
  },
  //上架
  addpro(e) {
    let rushBuyMsg = this.data.rushBuyMsg[this.data.slide]
    let idx = e.currentTarget.dataset.idx
    var pid = rushBuyMsg[idx].pid
    var name = rushBuyMsg[idx].title
    var pic = rushBuyMsg[idx].src
    var salePrice = Number(rushBuyMsg[idx].price).toFixed(2)
    var marketPrice = Number(rushBuyMsg[idx].salePrice).toFixed(2)
    if (!rushBuyMsg[idx].isup) {
      wx.navigateTo({
        url: '/pages/addpro/addpro?pid=' + pid + '&name=' + name + '&pic=' + pic + '&salePrice=' + salePrice + '&marketPrice=' + marketPrice
      })
    } else {
      this.toProDetail(e)
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      isFirstGet: true
    })
    this.getMsg()
    this.getNowHours()
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

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    if (this.data.isFirstGet) {
      this.setData({
        isFirstGet: false
      })
    } else {
      this.getMsg(1)
    }
    this.setData({
      fxshopid: wx.getStorageSync("fxshopid"),
      ruid: wx.getStorageSync("ruid")
    })
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
    clearTimeout(this.data.timer)
    this.setData({
      timer: null
    })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    this.getMsg(1)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function(res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
    }
    var Newruid = wx.getStorageSync("ruid") || wx.getStorageSync('SessionUserID')
    let msg
    if (this.data.nowShareIdx !== "") {
      msg = this.data.rushBuyMsg[this.data.slide][this.data.nowShareIdx]
    } else {
      app.promsg('转发失败')
      return
    }
    return {
      title: msg.title,
      imageUrl: msg.src.replace('http://', 'https://'),
      path: '/pages/productdetail/productdetail?pid=' + msg.pid + '&ruid=' + Newruid,
      success: function(res) {
        // 转发成功
        app.showtips('转发成功')
      },
      fail: function(res) {
        // 转发失败
        app.promsg('转发失败')
      }
    }


  }
})