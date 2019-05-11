// pages/wode/wode.js
const util = require("../../utils/util.js")
const app = getApp()
const CheckLoginStatus = require("../../utils/CheckLoginStatus.js")
var timer = null //倒计时
const goapp = require('../../Component/goapp/goapp.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userMsg: "", //数据
    orderType: "", //订单角标
    time: { //实习店主升正式剩余时间
      day: 0,
      hour: 0,
      minute: 0,
      second: 0
    },
    orderState: {
      unpay: "", //待付款
      tobesend: "", //待发货
      unreceipt: "", //待收货
      Completed: "", //已完成
    },
    SalesList: "", //销售数据
    teamList: "", //团队数据
    ruid: wx.getStorageSync("ruid"), //有分享时候的uid
    uid: wx.getStorageSync("SessionUserID"), //自己的uid
    fxshopid: wx.getStorageSync("fxshopid"), //自己的分销ID
    goapp: false,
    msgtitlle: "关注公众号,实时接收消息~",
    slide: 0, //0=店主特权, 1=个人中心
    hideCouponPromptMsg: false,//优惠券是否显示小于5天的优惠券
  },
  changeSlide(e) {//NAV切换
    this.setData({
      slide: parseInt(e.currentTarget.dataset.idx)
    })
    if (this.data.slide === 0 && !this.data.shopList) {
      //this.getMsg()
    } else if (this.data.slide === 1 && !this.data.billList) {
      //this.getMsg()
    }

  },
  toAddress() {
    if (!wx.getStorageSync('SessionUserID')) {
      app.showLoading("登录中")
      CheckLoginStatus.checksession(() => {
        this.setData({
          uid: wx.getStorageSync("SessionUserID"),
          ruid: wx.getStorageSync("ruid"),
          fxshopid: wx.getStorageSync("fxshopid")
        })
        wx.navigateTo({
          url: '/pages/other/address/address',
        })
        wx.hideLoading()
      })
    } else {
      wx.navigateTo({
        url: '/pages/other/address/address',
      })
    }
  },
  toAfterSale() {
    if (!wx.getStorageSync('SessionUserID')) {
      app.showLoading("登录中")
      CheckLoginStatus.checksession(() => {
        this.setData({
          uid: wx.getStorageSync("SessionUserID"),
          ruid: wx.getStorageSync("ruid"),
          fxshopid: wx.getStorageSync("fxshopid")
        })
        wx.navigateTo({
          url: '/pages/other/aftersale/aftersale',
        })
        wx.hideLoading()
      })
    } else {
      wx.navigateTo({
        url: '/pages/other/aftersale/aftersale',
      })
    }

  },
  getNewTime(times) {
    timer = null
    clearInterval(timer)
    let _this = this
    timer = setInterval(function() {
      var day = 0,
        hour = 0,
        minute = 0,
        second = 0; //时间默认值
      if (times > 0) {
        day = Math.floor(times / (60 * 60 * 24));
        hour = Math.floor(times / (60 * 60)) - (day * 24);
        minute = Math.floor(times / 60) - (day * 24 * 60) - (hour * 60);
        second = Math.floor(times) - (day * 24 * 60 * 60) - (hour * 60 * 60) - (minute * 60);
      }
      if (day <= 9) day = '0' + day;
      if (hour <= 9) hour = '0' + hour;
      if (minute <= 9) minute = '0' + minute;
      if (second <= 9) second = '0' + second;
      //
      _this.setData({
        time: {
          day: day,
          hour: hour,
          minute: minute,
          second: second
        }
      })
      times--;
      if (times < 0) {
        clearInterval(timer);
      }
    }, 1000);
    this.setData({
      isNewTime: true
    })
  },
  toLogin() {
    if (!wx.getStorageSync('SessionUserID')) {
      app.showLoading("登录中")
      CheckLoginStatus.checksession(() => {
        this.getMsg({})
        this.setData({
          uid: wx.getStorageSync("SessionUserID"),
          ruid: wx.getStorageSync("ruid"),
          fxshopid: wx.getStorageSync("fxshopid")
        })
        wx.hideLoading()
      })
    }

  },
  getMsg({
    loading_icon = "default"
  }) {
    if (wx.getStorageSync("SessionUserID")) {
      new Promise((resolve, reject) => {
        util.http({
          url: app.globalData.siteUrl + '/Main/Member/GetMemberJson?devicetype=3',
          data: {
            uid: wx.getStorageSync("SessionUserID")
          },
          loading_icon: loading_icon,
          header: 1,
          successBack: (ret) => {
            if (ret && ret.data.status == 1) {
              var isfreeze = '13456'
              //只有自己看的时候才弹出冻结
              if (wx.getStorageSync('ruid') == '') {
                isfreeze = ret.data.Data.isfreeze
              }
              this.setData({
                userMsg: ret.data.Data,
                remaintiem: ret.data.Data.remaintiem,
                isfreeze: isfreeze
              })
              if (ret.data.Data.isintern != "0" && !this.data.isNewTime) {
                this.getNewTime(this.data.remaintiem)
              }
            }
            resolve(1)
          }
        })
      }).then((ret) => {
        return new Promise((resolve, reject) => {
          if (ret === 1) {
            util.http({
              url: app.globalData.siteUrl + '/Main/Member/GetOrderCountJson?devicetype=3',
              data: {
                uid: wx.getStorageSync("SessionUserID"),
                wxprogram: 1
              },
              loading_icon: loading_icon,
              header: 1,
              successBack: (ret) => {
                if (ret && ret.data.status == 1) {
                  let data = ret.data.Data
                  let unpay = 0
                  let tobesend = 0
                  let unreceipt = 0
                  let Completed = 0
                  data.forEach((item, idx) => {
                    switch (item.state) {
                      case 10: //待付款
                        unpay = item.count
                        break;
                      case 20: //待发货
                        tobesend = item.count
                        Completed += item.count
                        break;
                      case 30: //待收货
                        unreceipt = item.count
                        Completed += item.count
                        break;
                      case 40: //已完成
                        Completed += item.count
                        break;
                    }
                  })
                  this.setData({
                    orderType: ret.data.Data,
                    orderState: {
                      unpay: unpay, //待付款
                      tobesend: tobesend, //待发货
                      unreceipt: unreceipt, //待收货
                      Completed: Completed, //已完成
                    }
                  })
                }
                resolve(1)
              }
            })
          }
        })


      }).then((ret) => {
        return new Promise((resolve, reject) => {
          if (ret === 1) {
            util.http({
              url: app.globalData.siteUrl + '/Main/Member/GetUserSalesList?devicetype=3',
              data: {
                uid: wx.getStorageSync("SessionUserID")
              },
              loading_icon: loading_icon,
              header: 1,
              successBack: (ret) => {
                if (ret && ret.data.status == 1) {
                  this.setData({
                    SalesList: ret.data
                  })
                }
                resolve(1)
              }
            })
          }
        })


      }).then((ret) => {
        return new Promise((resolve, reject) => {
          if (ret === 1) {
            util.http({
              url: app.globalData.siteUrl + '/Main/Member/GetMyTeam?devicetype=3',
              data: {
                uid: wx.getStorageSync("SessionUserID"),
                currentPage: 1,
                pageSize: 1,
                type: 1,
                search: ""
              },
              loading_icon: loading_icon,
              header: 1,
              successBack: (ret) => {
                if (ret && ret.data) {
                  this.setData({
                    teamList: ret.data
                  })
                }
                resolve(1)
              }
            })
          }
        })


        }).then((ret) => {
          return new Promise((resolve, reject) => {//优惠券
            if (ret === 1) {
              util.http({
                url: app.globalData.siteUrl + '/Marketing/Coupon/GetUserCouponListJson?devicetype=3',
                data: {
                  uid: wx.getStorageSync("SessionUserID"),
                  sta: "1",//状态 0-未激活 1-未使用 2-已使用
                  isexpire: undefined//sta == "1" && isexpire == 1-未激活的卷，sta == "1" && isexpire == 2) 未使用过期的卷，sta == "1"未使用未过期的卷
                },
                loading_icon: loading_icon,
                header: 1,
                successBack: (ret) => {
                  this.setData({
                    hideCouponPromptMsg: false
                  })
                  if (ret && ret.data && ret.data.success && ret.data.status === 1) {
                    let dataTwo = ret.data.Data
                    dataTwo.forEach((item, index)=> {
                      let endTime = item.endtime
                      this.getYouHuiEndTime(endTime)
                    })
                  }
                }
              })
            }
          })


        })
    }
  },
  getYouHuiEndTime(endTime) {
    var newEndTime = endTime.replace(/[ :.]/g, ',').split(",")
    var ey = newEndTime[0], en = newEndTime[1] - 1, ed = newEndTime[2], eh = newEndTime[3], em = newEndTime[4], es = newEndTime[5];
    var endGetTime = new Date(ey, en, ed, eh, em, es).getTime()

    var time = Math.floor((endGetTime - Date.now()) / 1000)
    var minute, hour, day, second;
    day = Math.floor(time / 60 / 60 / 24) < 10 ? '0' + Math.floor(time / 60 / 60 / 24) : Math.floor(time / 60 / 60 / 24);
    if (day < 5) {
      this.setData({
        hideCouponPromptMsg: true
      })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      isFirstGet: true
    })
    this.getMsg({})

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
    timer = null
    clearInterval(timer)
    util.cartCounts({
      callBack: (ret) => {
        if (ret && ret.data.success && ret.data.status == 1 && ret.data.Data != null) {
          if (ret.data.Data > 0) {
            wx.setTabBarBadge({
              index: 2,
              text: ret.data.Data.toString()
            })
          } else {
            wx.removeTabBarBadge({
              index: 2
            })
          }
        }
      }
    })
    this.setData({
      uid: wx.getStorageSync("SessionUserID"),
      ruid: wx.getStorageSync("ruid"),
      fxshopid: wx.getStorageSync("fxshopid")
    })
    if (this.data.isFirstGet) {
      this.setData({
        isFirstGet: false
      })
    } else {
      this.getMsg({
        loading_icon: 1
      })
    }
    //判断百万签到活动入口是否开启
    var that=this
    util.http({
      url: app.globalData.siteUrl + '/marketing/redpackage/GetActivityStatus?devicetype=3',
      successBack: (ret) => {
        
        if (ret.data.success) {
          that.setData({
            showqiandao: ret.data.Data.activitiesswitch,
          })
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    timer = null
    clearInterval(timer)
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    timer = null
    clearInterval(timer)
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

  },
  phoneCall(e) {
    let tel = e.currentTarget.dataset.replyPhone
    app.alerts("400-6906-206", {
      confirmColor: "#FE4833",
      confirmText: "呼叫",
      successBack: () => {
        wx.makePhoneCall({
          phoneNumber: tel
        })
      },
      title: "需要拨打这个号码吗？"
    })

  },
  toShopGroup() {
    wx.navigateTo({
      url: '/pages/other/shopgroup/shopgroup',
    })
  },
  toPages(e) {
    let PageName = e.currentTarget.dataset.name
    wx.navigateTo({
      url: "/pages/other/" + PageName + "/" + PageName,
    })
  },
  toOrder(e) {
    let type = parseInt(e.currentTarget.dataset.type)
    if (!wx.getStorageSync('SessionUserID')) {
      app.showLoading("登录中")
      CheckLoginStatus.checksession(() => {
        this.setData({
          uid: wx.getStorageSync("SessionUserID"),
          ruid: wx.getStorageSync("ruid"),
          fxshopid: wx.getStorageSync("fxshopid")
        })
        wx.navigateTo({
          url: type ? '../order/order?type=' + type : '../order/order',
        })
        wx.hideLoading()
      })
    } else {
      wx.navigateTo({
        url: type ? '../order/order?type=' + type : '../order/order',
      })
    }

  },
  goinvite: function() {
    wx.navigateTo({
      url: '../inviteshop/inviteshop'
    })
  },
  gofxorder: function() {
    wx.navigateTo({
      url: '../fxordermanage/fxordermanage'
    })
  },
  goincome: function() {
    wx.navigateTo({
      url: '../myincome/myincome'
    })
  },
  gomoney: function() {
    wx.navigateTo({
      url: '../mymoney/mymoney'
    })
  },
  gogoods: function () {
    wx.navigateTo({
      url: '../productbill/productbill'
    })
  },
  clearup: function() {
    try {
      wx.clearStorageSync()
    } catch (e) {
      app.alerts('清理失败')
      return
    }
    wx.reLaunch({
      url: '../yshopapply/yshopapply'
    })
  },
  govisirtor: function() {
    wx.navigateTo({
      url: '../visitor/visitor?shop=1'
    })
  },
  gomyteam: function(e) {
    wx.navigateTo({
      url: '../myteam/myteam?listType=' + e.currentTarget.dataset.type
    })
  },
  //前往解冻专区
  gobuy_openshop: function () {
    util.goopen_pro()
  },
  opengoapp: function () {
    this.setData({
      goapp: true
    })
  },
  saverushou: function () {
    goapp.saverushou()
  },
  closegoapp: function () {
    this.setData({
      goapp: false
    })
  },
  gohuodong:function(){
    wx.navigateTo({
      url: '../signin/signin'
    })
  },
  gomypack:function(){
    wx.navigateTo({
      url: '../mymoneyback/mymoneyback'
    })
  },
  gowechat:function(){
    wx.navigateTo({
      url: '../wechatclear/wechatclear'
    })
  },
  gomessagelist:function(){
    wx.navigateTo({
      url: '../messagelist/messagelist'
    })
  }
})