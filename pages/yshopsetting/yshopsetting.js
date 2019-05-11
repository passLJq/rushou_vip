// pages/yshopsetting/yshopsetting.js
const utils = require('../../utils/util.js')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userinfo:''
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
    utils.http({
      url: app.globalData.siteUrl + '/Main/Member/GetUserShopJson',
      data: {
        uid: wx.getStorageSync('SessionUserID'),
        ruid: wx.getStorageSync('ruid')
      },
      header: 1,
      successBack: this.usermeng
    })
  },
  usermeng:function(ret){
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
  //打开照片
  openimg:function(e){
    var that=this
    var index = e.target.dataset.index
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths
        wx.uploadFile({
          url: app.globalData.memberSiteUrl + '/Ajax/FileUpload.ashx', //仅为示例，非真实的接口地址
          filePath: tempFilePaths[0],
          name: 'file',
          header: {
            "Content-Type": "application/json; charset=utf-8"
          },  
          success: function (ret) {
            var data = ret.data
            //不支持单引号转换为双引号
            data = JSON.parse(data.replace(/\'/ig, "\""));
            if(data.success==1){
              var img = data.fullurl
              if (index == 1) {
                that.data.userinfo.adimg = img
              } else if (index == 2) {
                that.data.userinfo.shoplogo = img
              }
          utils.http({
          method:'POST',
          url: app.globalData.siteUrl + '/Main/Member/ShopEdit?uid=' + wx.getStorageSync('SessionUserID') +'&devicetype=3',
          data: {
            uid: wx.getStorageSync('SessionUserID'),
            yshopid: that.data.userinfo.yshopid,
            shoplogo: unescape(that.data.userinfo.shoplogo),
            adimg: unescape(that.data.userinfo.adimg),
          },
          header: 1,
          successBack: that.shangchuan
        })
            }else{
              app.promsg(data.error)
            }
          }
        })
      },
      fail:function(){
        // app.promsg('取消')
      }
    })
  },
  shangchuan:function(ret){
    var that=this
    ret = ret.data
    if(ret.status==1&&ret.success){
      that.onShow()
      app.promsg('上传成功')
    }else{
      app.promsg(ret.err)
    }
  },
  openset:function(e){
    //1是优店名称 2是个性签名 3是店铺分享语
    var index = e.currentTarget.dataset.index
    var title=e.currentTarget.dataset.title
    wx.navigateTo({
      url: '../yshopcheckset/yshopcheckset?index='+index+'&title='+title
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
  
  }
})