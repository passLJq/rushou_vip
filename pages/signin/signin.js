// pages/signin/signin.js
const utils = require('../../utils/util.js')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    shownow:false,
    qiandaodata:[],
    clickwho: [true, false, false, false, false, false, false],
    showmoney:'',
    clickindex:0,
    nowsignin:false,//判断今天是否签到
    activitiesswitch:true,//判断提示弹窗开启还是关闭
    showPopup: false
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
    that.getdata()
  },
  closePopup() {
    this.setData({
      showPopup: false
    })
  },
  getdata:function(state){
    var that = this
    utils.http({
      url: app.globalData.siteUrl + '/marketing/redpackage/GetSignData?devicetype=3',
      data: {
        uid: wx.getStorageSync('SessionUserID')
      },
      header: 1,
      successBack: (ret) => {
        console.log(ret)
        if (ret.data.success && ret.data.status == 1) {
          let nowsignin=false
          let imdata = []
          let date = new Date
          let day = date.getDate()
          if(day<10){
            day='0'+day
          }
          if (ret.data.Data != null) {
            for (var i in ret.data.Data.signin) {
              if (i.substr(3, 4)==day){
                if (ret.data.Data.signin[i] != 0){
                  nowsignin=true
                }
              }
              if (ret.data.Data.signin[i] != 0) {
                imdata.push(ret.data.Data.signin[i])
              }
            }
            //定位到最新的一天
            let ims = []
            for (var i; i < 7; i++) {
              ims.push(false)
            }
            //判断签到的定位赛，没签到数组会少一位
            var today
            if (nowsignin){
              today = imdata.length-1
            }else{
              today = imdata.length
            }
            ims[today] = true
            this.setData({
              clickindex: today,
              clickwho: ims
            })
          }
          let showPopup = false
          if(state) {
            showPopup = true
          }
          that.setData({
            showmoney: ret.data.Data.showbonuspool,
            qiandaodata: imdata,
            nowsignin: nowsignin,
            activitiesswitch: ret.data.Data.activitiesswitch,
            showPopup
          })
          console.log(that.data)
        } else {
          app.promsg(ret.data.err)
        }
      }
    })
  },
  bian:function(e){
    var that=this
    var index = e.currentTarget.dataset.index
    let ims=[]
    for(var i;i<7;i++){
      ims.push(false)
    }
    ims[index]=true
    this.setData({
      clickindex: index,
      clickwho:ims
    })
  },
  qiandao:function(){
    var that = this
    utils.http({
      url: app.globalData.siteUrl + '/marketing/redpackage/SignIn?devicetype=3',
      data: {
        uid: wx.getStorageSync('SessionUserID')
      },
      header: 1,
      successBack: (ret) => {
        console.log(ret)
        if(ret.data.success&&ret.data.status==1){
          that.getdata(1)
        }else{
          app.promsg(ret.data.err)
        }
        // if (ret && ret.data && ret.data.success && ret.data.status === 1 && ret.data.Data.length > 0) {
        //   let couponMsg = ""
        //   this.setData({
        //     showShopCoupon: true,
        //     couponMsg: ret.data.Data
        //   })
        // }
      }
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
  gofenxiang:function(){
    wx.navigateTo({
      url: '../frinedsharp/frinedsharp'
    })
  },
  gofenpro:function(){
    wx.navigateTo({
      url: '../sharepro/sharepro'
    })
  },
  huodong:function(){
    this.setData({
      shownow: !this.data.shownow
    })
  },
  okle:function(){
    this.setData({
      activitiesswitch: true
    })
  }
})