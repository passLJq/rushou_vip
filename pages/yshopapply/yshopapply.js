// pages/yshopapply/yshopapply.js
const app=getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isIphoneX:'',
    showShopCoupon: false,//是否显示新实习店主送优惠券弹窗
  },
  changeShopCoupon(e) {
    console.log(e)
    this.setData({
      showShopCoupon: e.detail
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that=this
    if (wx.getStorageSync("showShopCoupon") || !wx.getStorageSync("SessionUserID")) {
      wx.setStorageSync("showShopCoupon", "")
      this.setData({
        showShopCoupon: true
      })
    }
    let isIphoneX = app.globalData.isIphoneX;
    this.setData({
      isIphoneX: isIphoneX
    })
    //scene是二维码进来的
    var scene = decodeURIComponent(options.scene)
    console.log(scene)
    //这里拿到ruid证明是从别人的开店申请跳转进来的
    if (options.ruid){
    if (options.ruid == wx.getStorageSync('SessionUserID')) {

    }else{
      wx.setStorageSync('ruid', options.ruid)
    }
    }
    if (options.scene) {
    if (options.scene == wx.getStorageSync('SessionUserID')) {

    } else {
      wx.setStorageSync('ruid', options.scene)
    }  
  }
    //签到活动额标识
    console.log(options)
    if (options.type) {
      if (options.type == 'qiandao') {
        that.setData({
          qiandao: options.type
        })
      }
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
  
  },
  onyshopset:function(){
    
    wx.reLaunch({
      url: '../index/index'
    })
  },
  bindgetuserinfo:function(e){
    var that = this;
    if (e.detail.userInfo) {
      wx.showLoading({
        title: '加载中',
        icon: 'loading',
        mask: true
      });
      // 发送 res.code 到后台换取 openId, sessionKey, unionId
      wx.login({
        success: function (res) {
          if (res.code) {
            //发起网络请求
            wx.request({
              url: app.globalData.siteUrl + '/main/Login/LoginInWeChat',
              data: {
                code: res.code,
                devicetype: 3
              },
              success: function (loginres) {
                console.log(loginres)
                wx.hideLoading()
                wx.setStorageSync('wxsessionkey', loginres.data.data.wxsessionkey)
                if (loginres && loginres.data.status == 1) {
                  wx.setStorageSync('sessionkey', loginres.data.data.sessionkey)
                  wx.setStorageSync('SessionUserID', loginres.data.data.userid)
                  wx.setStorageSync('fxshopid', loginres.data.data.fxshopid)
                  //是用户倒是没开店
                  if (loginres.data.data.fxshopid==''){
                    //签到活动带标识
                    if(that.data.qiandao=="qiandao"){
                      wx.navigateTo({
                        url: '../yshopset/yshopset?type='+that.data.qiandao
                      })
                    }else{
                      wx.navigateTo({
                        url: '../yshopset/yshopset'
                      })
                    }
                  }else{
                    wx.reLaunch({
                      url: '../index/index'
                    })
                  }
                } else if (loginres.data.status == 100) {
                    //100已经在这个页面到开店设置
                  //签到活动带标识
                  if (that.data.qiandao == "qiandao") {
                    wx.navigateTo({
                      url: '../login/login?type=' + that.data.qiandao
                    })
                  } else {
                    wx.navigateTo({
                      url: '../login/login'
                    })
                  }
                } else {
                  app.alerts(loginres.data.err)
                  app.alerts('出错了')
                }
              },
              fail: function (e) {
                wx.hideLoading()
                app.alerts(e.errMsg)
              }
            })
          } else {
            wx.hideLoading()
            app.alerts('获取用户登录态失败！' + res.errMsg)
          }
        },
        fail:function(e){
          wx.hideLoading()
          app.alerts(e.errMsg)
        }
      })
    } else {
      wx.showToast({
        title: "为了您更好的体验,请先同意授权",
        icon: 'none',
        duration: 2000
      });
    }
  }
})