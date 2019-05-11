// pages/jiedong_pro/jiedong_pro.js
const utils = require('../../utils/util.js')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    listdata:[],
    currpage:1,
    stops:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      this.databind()
  },
  databind:function(){
    utils.http({
      method: 'post',
      url: app.globalData.siteUrl + '/Main/PackageShopping/GetPackageProJson?uid=' + wx.getStorageSync('SessionUserID') + '&devicetype=3',
      data: {
        currpage: this.data.currpage,
        pagesize: 8,
        type: 1
      },
      header: 1,
      successBack: this.getdata
    })
  },
  getdata:function(ret){
    console.log(ret)
    var that=this
    ret=ret.data
    if (ret.status == 1 && ret.success && ret.Data != null){
      if (that.data.currpage==1){
        that.setData({
          listdata:ret.Data
        })
      }else{
        that.setData({
          listdata: that.data.listdata.concat(ret.Data)
        })
      }
    } else if (ret.success&&ret.Data == null) {
      that.data.stops = true
    }else{
      app.promsg(ret.err)
    }
  },
  goductdetail:function(e){
    console.log(e)
    var pids=e.currentTarget.dataset.pid
    var buynum = e.currentTarget.dataset.buynum
    var packageid = e.currentTarget.dataset.packageid
    wx.navigateTo({
      url: '../productdetail/productdetail?pid=' + pids + '&type=jiedong&packageid=' + packageid + '&buynum=' + buynum
    })
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
    var that=this
    if (!that.data.stops){
      that.data.currpage++
      that.databind()
    }
  }
})