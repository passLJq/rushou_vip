// pages/visitor/visitor.js
const utils = require('../../utils/util.js')
const app = getApp()
var status=1//2时就是查看店铺记录
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userinfo:'',
    stasu:false//true 则为店铺访问记录
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that=this
    if (options.shop){
      that.openshopvist()
      that.setData({
        stasu:true
      })
    }else{
      utils.http({
        url: app.globalData.siteUrl + '/Main/Member/ShopPageViewList',
        data: {
          fxshopid: wx.getStorageSync('fxshopid'),
          uid: wx.getStorageSync('SessionUserID'),
          devicetype:3
        },
        header: 1,
        successBack: this.usermeng
      })
    }
  },
  usermeng:function (ret) {
    var that = this
    console.log(ret)
    var ret = ret.data
    if (ret.status == 1 && ret.success) {
      that.setData({
        userinfo: {
          visitorlist: ret.Data
        }
      })
      console.log(that.data)
    } else {
      app.promsg(ret.err)
    }
  },
  openshopvist:function(){
    utils.http({
      url: app.globalData.siteUrl + '/Main/Member/GetMyVisitList',
      data: {
        uid: wx.getStorageSync('SessionUserID'),
        currentPage:1,
        pageSize:100,
        devicetype:3
      },
      header: 1,
      successBack: this.shopvist
    })
    status=2
  },
  shopvist:function(ret){
    var that = this
    console.log(ret)
    var ret = ret.data
    if (ret.status == 1 && ret.success) {
      that.setData({
        userinfo :{
          visitorlist: ret.Data
        }
      })
      console.log(that.data)
    } else {
      app.promsg(ret.err)
    }
  },
  goindex:function(e){
    if (status==2){
    var that=this
      console.log(e)
    var index = e.currentTarget.dataset.index
      if (that.data.userinfo.visitorlist[index].uid!=''){
      try {
        wx.setStorageSync('ruid',that.data.userinfo.visitorlist[index].uid)
      } catch (e) {

      }
      wx.reLaunch({
        url: '../index/index'
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
  
  }
})