// pages/mymoney/mymoney.js
const app = getApp()
const utils = require('../../utils/util.js')
const goapp = require('../../Component/goapp/goapp.js')
var stop=false
Page({

  /**
   * 页面的初始数据
   */
  data: {
    mengdata:[],
    currentPage:1,
    noMore: false, //没有更多数据
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.databind()
  },
  databind: function () {
    var that = this
    utils.http({
      url: app.globalData.siteUrl + '/Main/Member/CashConsumer',
      data: {
        uid: wx.getStorageSync('SessionUserID'),
        currentPage: that.data.currentPage,
        pageSize: 8,
        devicetype: 3
      },
      header: 1,
      successBack:(ret)=> {
        console.log(ret)
        ret = ret.data
        if (ret.status == 1 && ret.success) {
          if (that.data.currentPage==1){
            that.setData({
              mengdata: []
            })
          }
          that.setData({
            mengdata: that.data.mengdata.concat(ret.Data)
          })
        } else if (ret.status == 2 && ret.success){
          stop = true
        }else {
          app.promsg(ret.err)
        }
        let noMore = false
        if (ret.Data.length < 8 && this.data.currentPage !== 1) {
          noMore = true
        }
        this.setData({
          noMore
        })
      }
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
    stop=false
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
    let currentPage = this.data.currentPage
    if (!stop){
      currentPage++
      that.databind()
    }
    this.setData({
      currentPage
    })
  }
})