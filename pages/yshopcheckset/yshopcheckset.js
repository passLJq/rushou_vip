// pages/yshopcheckset/yshopcheckset.js
const utils = require('../../utils/util.js')
const app=getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tishi:'',
    num:13,
    text:'',
    index:'',
    focus: false,//获取焦点
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options.title)
    var that=this
    console.log(options)
    if (options.index==1){
      that.setData({
        tishi: '请填写店铺名称',
        num: 13,
        text:options.title,
        index: options.index
      })
    } else if (options.index == 2){
      that.setData({
        tishi: '请填写个性签名',
        num: 20,
        text: options.title,
        index: options.index
      })
    } else if (options.index == 3){
      that.setData({
        tishi: '请填写店铺分享语',
        num: 18,
        text: options.title,
        index: options.index
      })
    }
  },
  bind1:function(e){
    this.setData({
      text: e.detail.value.replace(/\s+/g, '')
    })
  },
  save:function(){
    var that=this
    var sharelanguage
    var shopname
    var notice
    if (that.data.text==''){
      app.promsg('输入不能为空')
      this.setData({
        focus: true
      })
      return
    }
    if (that.data.index == 1) {
      shopname=that.data.text
    } else if (that.data.index == 2) {
      notice = that.data.text
    } else if (that.data.index == 3) {
      sharelanguage = that.data.text
    }
    utils.http({
      method: 'POST',
      url: app.globalData.siteUrl + '/Main/Member/ShopEdit?uid=' + wx.getStorageSync('SessionUserID') + '&devicetype=3',
      data: {
        uid: wx.getStorageSync('SessionUserID'),
        yshopid: wx.getStorageSync('fxshopid'),
        sharelanguage: sharelanguage,
        shopname: shopname,
        notice: notice,
      },
      header: 1,
      successBack: that.shangchuan
    })
  },
  shangchuan:function(ret){
    ret=ret.data
    console.log(ret)
    if (ret.status == 1 && ret.success) {
      app.promsg('保存成功')
      setTimeout(function(){
        wx.navigateBack({
          delta: 1
        })
      },1500)
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
  
  }
})