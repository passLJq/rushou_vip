// pages/fxordermanage/fxordermanage.js
const app = getApp()
const utils = require('../../utils/util.js')
const goapp = require('../../Component/goapp/goapp.js')
var Charts = require('../../utils/wxcharts.js');
var columnChart = null;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    mengdata:'',
    goapp:false,
    msgtitlle:"查看销售明细功能请移步至APP喔~"
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    utils.http({
      url: app.globalData.siteUrl + '/Main/Member/GetUserSalesList',
      data: {
        uid: wx.getStorageSync('SessionUserID'),
        devicetype :3 
      },
      header: 1,
      successBack: this.databind
    })
    utils.http({
      url: app.globalData.siteUrl + '/Main/Member/GetUserSevenDaysSale',
      data: {
        uid: wx.getStorageSync('SessionUserID'),
        devicetype: 3
      },
      header: 1,
      successBack: this.zhu
    })
  },
  databind:function(ret){
    var that=this
  console.log(ret)
  ret=ret.data
  if(ret.status==1&&ret.success){
    that.setData({
      mengdata: ret
    })
  }else{
    app.promsg(ret.err)
  }
  },
  zhu:function(ret){
    var xzhu = []
    var yzhu = []
    var windowWidth = 320;
    try {
      var res = wx.getSystemInfoSync();
      windowWidth = res.windowWidth;
    } catch (e) {
      console.error('getSystemInfoSync failed!');
    }
    var that=this
    ret=ret.data
    if(ret.status==1&&ret.success&&ret.Data!=null){
      ret.Data.forEach(function(item,index){
        xzhu.push((item.time).substring(5, 10))
        yzhu.push(parseFloat(Number(item.sale).toFixed(2)))
      })
      columnChart= new Charts({
        canvasId: 'mychart-bar',
        type: 'column',
        legend: false,                
        categories: xzhu,
        series: [{
          name: '销售额',
          data: yzhu,
          format: function (val, name) {
            return val.toFixed(2);
          }
        }],
        yAxis: {
          format: function (val) {
            return val;
          }
        },
        width: windowWidth,
        height: 190,
        dataLabel: true
      });
    }else{
      app.promsg(ret.err)
    }
  },
  opengoapp(e){
    wx.navigateTo({
      url: '/pages/other/fxorders/fxorders?monthdata=' + e.currentTarget.dataset.name,
    })
  },
  saverushou:function(){
    var that = this
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.writePhotosAlbum']) {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success() {
              //授权完成
              goapp.saverushou()
            }
          })
        } else {
          goapp.saverushou()
        }
      }
    })
  },
  closegoapp:function(){
 this.setData({
   goapp: false
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
  
  }
})