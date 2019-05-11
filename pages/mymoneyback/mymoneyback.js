// pages/mymoneyback/mymoneyback.js
const app = getApp()
const util = require("../../utils/util.js")
const goapp = require('../../Component/goapp/goapp.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
      money:'0.00',
    passwordtype: ''//点击钱包密码状态 0=>设置 1=>修改 
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
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
    var that=this
    util.http({
      url: app.globalData.siteUrl + '/Main/Member/GetMyIncome',
      data: {
        uid: wx.getStorageSync('SessionUserID'),
        devicetype:3
      },
      header: 1,
      successBack: (ret) => {
        console.log(ret)
        ret=ret.data
        if(ret.status==1&&ret.success){
          that.setData({
            money: ret.Data.availableBlance,
            passwordtype: ret.Data.paypwdisnull
          })
        }else{
          app.promsg(ret.err)
        }
      }
    })
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
  //钱包详情
  gomoneydetail:function(){
    wx.navigateTo({
      url: '../mymoney/mymoney',
    })
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
  gosetpassword:function(){
    wx.navigateTo({
      url: '/pages/other/password/password?type='+this.data.passwordtype,
    })
  }
})