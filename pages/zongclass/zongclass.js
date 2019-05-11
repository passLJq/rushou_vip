// pages/class/class.js
var app = getApp()
const utils = require('../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    phoneheigh:'',
    left_height:'',
    classdata:'',
    classact:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that=this
    utils.http({
      url: app.globalData.siteUrl + '/Main/Main/GetAllClassJson',
      successBack: that.Databind
    })
    wx.getSystemInfo({
      success: function (res) {
        console.log(res.windowHeight)
        var sheight = Number(res.windowHeight)+'px'
        console.log(sheight)
        var left_height=res.windowHeight/9+'px'
        that.setData({
          phoneheigh: sheight,
          left_height: left_height
        })
      }
    })
  },
Databind:function(ret){
  var that = this
  ret = ret.data
  if (ret.status == 1 && ret.success) {
    let  active= []
    for (let i = 0; i < ret.Data.length; i++) { 
            if(i==0){
              active.push(true);
            }else{
              active.push(false);  
            } 
   }
    that.setData({
      classdata: ret.Data,
      classact: active
    })
    console.log(that.data)
  } else {
    app.promsg(ret.err)
  }
  // checklogin.checksession(app.companyId, app.appId)
  // var sessionkey = wx.getStorageSync('sessionkey')
  // var sessionid = wx.getStorageSync('sessionID')
  // if (sessionkey == null || sessionkey == '') {
  //   checklogin.autologinin()
  //   return
  // }
  // wx.request({
  //   url: app.apiurl + 'main/main/GetAllClassJson?CompanyID=' + app.companyId,
  //   data: {
  //   },
  //   header: {
  //     'Authorization': sessionkey,
  //     'Cookie': 'ASP.NET_SessionId=' + sessionid
  //   },
  //   success: function (res) {
  //       if(res.data.success&&res.data.status==1){
  //         var data = res.data.Data
  //         let  active= []
  //         for (let i = 0; i < data.length; i++) { 
  //           if(i==0){
  //             active.push(true);
  //           }else{
  //             active.push(false);  
  //           } 
  //         }
  //         that.setData({
  //           classdata: data,
  //           classact: active
  //         })
  //         console.log(that.data.classdata)
  //       }else{
  //         app.alerts(res.err)
  //       }
  //       wx.stopPullDownRefresh()
  //   }
  // })
},
onchangacr:function(e){
    var that=this
    var changact=[]
    var index = e.currentTarget.dataset.index;
    var act = that.data.classact
    var classid = e.currentTarget.dataset.classid;
    if(act[index]){
      if (that.data.classdata[index].node.length == 0) {
        wx.navigateTo({
          url: '../prolist/prolist?clasid=' + classid
        })
      }
    }else{
      if (that.data.classdata[index].node.length==0){
        wx.navigateTo({
          url: '../prolist/prolist?clasid=' + classid
        })
      }else{
        for (let i = 0; i < act.length; i++) {
          changact.push(false);
        }
        changact.splice(index, 1, true)
        that.setData({
          classact: changact
        }) 
      }
    }
},
  goproductlist:function(e){
    var classid = e.currentTarget.dataset.classid;
    console.log(classid)
    wx.navigateTo({
      url: '../prolist/prolist?clasid='+classid
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
    var that=this
    that.Databind()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },
})