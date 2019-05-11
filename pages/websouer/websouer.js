// pages/websouer/websouer.js
const utils = require('../../utils/util.js')
const app=getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    url:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var url = unescape(options.url)
    //邀请店主页面传入一个页面去对比是不是自己打开的
    if (unescape(options.url).split("?")[0] =='https://i.rushouvip.cn//Fx/new_inve.aspx'){
      url = url + '&wxuid=' + wx.getStorageSync('SessionUserID')
      wx.hideShareMenu()
    }
    if (options.ruid){
      if (options.ruid != wx.getStorageSync('SessionUserID')) {
        wx.setStorageSync('ruid', options.ruid)
      }
    }
    utils.http({
      url: app.globalData.siteUrl + '/Main/Member/GetUserShopJson',
      data: {
        uid: wx.getStorageSync('SessionUserID'),
        ruid: wx.getStorageSync('ruid')
      },
      header: 1,
      successBack: this.usermeng
    })
    console.log(url)
      this.setData({
        url: url
      })
  },
  usermeng: function (ret) {
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (options) {
    console.log(escape(options.webViewUrl))
    var id=''
    if (wx.getStorageSync('ruid')) {
      id= wx.setStorageSync('ruid', options.ruid)
    }else{
      id = wx.getStorageSync('SessionUserID')
    }
    var name=''
    if (this.data.userinfo){
      name = this.data.userinfo.realname
    }else{
        name='入手'
    }
    return {
      title: name+'@你',
      path: 'pages/websouer/websouer?url=' + escape(options.webViewUrl) + '&ruid=' + id,
      imageUrl: 'https://images.rushouvip.cn/IMG/zhongqiu.jpg'
    }
  }
})