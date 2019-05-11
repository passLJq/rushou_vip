// pages/class/class.js
const app = getApp()
const sharebox = require('../../Component/sharebox/sharebox.js')
const utils = require('../../utils/util.js')
const goTop = require('../../Component/goTop/goTop.js')
var currpage = 1
var  pagesize = 8
var stops = true
var pageType = 3//3是优选推荐，1是佣金，2是全球购
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgurl: '',
    scrollindex: 0,
    listdata: [],
    xuanzhong: [true, false, false],
    showshare: [false, true], //分享控制
    userinfo: '',
    zuan: '', //分享中要传的赚多少
    dianstatus: 1, //首页状态1是看自己的，2是看其他人的但自己开店了，3事看其他人但自己没开店的状态
    classdata: '',
    topok: false, //false时选项不是fixed
    swiperMsg: "", //轮播图
    martop :'719', //选项距离头部的距离
    sharpindex: '',//点击打开的商品序号分享用
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.hideShareMenu()
    utils.http({
      url: app.globalData.siteUrl + '/Main/Main/GetAdsJson',
      successBack: this.uiscroll
    })
    utils.http({
      url: app.globalData.siteUrl + '/Main/Main/GetAllClassJson',
      successBack: this.classjson
    })
    this.setData({
      isFirstGet: true
    })
    this.getSwiperMsg()
  },
  getSwiperMsg(state) {
    utils.http({ //轮播图
      url: app.globalData.siteUrl + '/Main/Main/GetMaterialJson',
      data: {
        adstype: "VIP-flash"
      },
      loading_icon: state,
      successBack: (ret) => {
        console.log(ret)
        if (ret && ret.data.success && ret.data.status === 1) {
          let data = JSON.parse(ret.data.Data).AdsList;
          console.log(data)
          if (data && data != '[]' && data.length > 0) {
            this.setData({
              swiperMsg: data
            })
          }
        }
      }
    })
  },
  //分类
  classjson: function(ret) {
    var that = this
    console.log(ret.data.Data)
    ret = ret.data
    if (ret.status == 1 && ret.success) {
      that.setData({
        classdata: ret.Data
      })
    } else {
      app.promsg(ret.err)
    }
  },
  goprodeco: function(e) {
    var pic = e.currentTarget.dataset.pic
    wx.navigateTo({
      url: '../productdetail/productdetail?pid=' + pic
    })
  },
  //列表
  listdata: function(ret) {
    var that = this
    var ret = ret.data
    console.log(ret)
    if (ret.status == 1 && ret.success && ret.Data.length > 0) {
      var lidata = ret.Data
      if (currpage == 1) {
        that.data.listdata = []
      }
      that.setData({
        listdata: that.data.listdata.concat(lidata)
      })
      currpage++
    } else if (ret.status == 1 && ret.success) {
      if (currpage == 1) {
        that.setData({
          listdata: []
        })
      }
      currpage++
      stops = false
    } else {
      app.promsg(ret.err)
    }
  },
  //切换
  checulis: function(e) {
    var that = this
    console.log(e)
    currpage = 1
    stops = true
    var index = e.currentTarget.dataset.index
    var ars
    if (index == 0) {
      ars = [true, false, false]
      pageType = 3
    } else if (index == 1) {
      ars = [false, true, false]
      pageType = 1
    } else if (index == 2) {
      ars = [false, false, true]
      pageType = 2
    }
    that.setData({
      xuanzhong: ars
    })
    if (index == 1){
      that.bingaoyongdata()
    }else{
      that.binddata()
    }
  },
  uiscroll: function(ret) {
    var that = this
    ret = ret.data
    console.log(ret)
    if (ret.status == 1 && ret.Data != null && ret.success) {
      var data = JSON.parse(ret.Data)
      that.setData({
        imgurl: data
      })
    } else {
      app.promsg(ret.err)
    }
  },
  chang: function(e) {
    this.setData({
      scrollindex: e.detail.current
    })
  },
  gosearch: function() {
    wx.navigateTo({
      url: '../search/search'
    })
  },
  goadd: function(e) {
    var index = e.target.dataset.index
    var pid = e.target.dataset.pid
    var name = e.target.dataset.name
    var pic = e.target.dataset.pic
    let newListdata = this.data.listdata[index]
    var salePrice = newListdata.isrushbuy && newListdata.rushbuy ? Number(JSON.parse(newListdata.rushbuy.specjson)[0].Price).toFixed(2) : e.target.dataset.saleprice
    var marketPrice = e.target.dataset.marketprice
    wx.navigateTo({
      url: '../addpro/addpro?pid=' + pid + '&name=' + name + '&pic=' + pic + '&salePrice=' + salePrice + '&marketPrice=' + marketPrice + '&index=' + index
    })
  },
  //弹出分享框
  goshare: function(e) {
    wx.hideTabBar()
    var that = this
    console.log(e)
    var index = e.currentTarget.dataset.index
    that.data.sharpindex = index
    this.setData({
      showshare: [true, true],
      zuan: that.data.listdata[index].commPrice.toFixed(2)
    })
  },
  //关闭分享框
  closeshare: function (index) {
    //1是生成海报时观点弹出框但保留遮罩层
    if (index == 1) {
      this.setData({
        showshare: [true, false]
      })
    } else {
      sharebox.closeshare(this)
      wx.showTabBar()
    }
  },
  //分享到朋友圈生成图片
  sharequan: function (that) {
    var that = this
    sharebox.sharequan(that, 2, 2)
  },
  //保存海报
  savehaibao: function (that) {
    var that = this
    sharebox.savehaibao(that)
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
      this.getRect()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    var that = this
    if (this.data.isFirstGet) {
      this.setData({
        isFirstGet: false
      })
    } else {
      this.getSwiperMsg(1)
    }
    
    if (wx.getStorageSync('ruid') != '') {
      if (wx.getStorageSync('fxshopid') != '') {
        that.setData({
          dianstatus: 2,
        })
      } else {
        that.setData({
          dianstatus: 3,
        })
      }
    } else {
      that.setData({
        dianstatus: 1,
      })
    }
    utils.cartCounts({
      callBack: (ret) => {
        if (ret && ret.data.success && ret.data.status == 1 && ret.data.Data != null) {
          if (ret.data.Data > 0) {
            wx.setTabBarBadge({
              index: 2,
              text: ret.data.Data.toString()
            })
          } else {
            wx.removeTabBarBadge({
              index: 2
            })
          }
        }
      }
    })
    if(pageType==1){
      that.bingaoyongdata()
    }else{
      this.binddata()
    }
    var shopids
    //店铺信息分享使用
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
  usermeng: function(ret) {
    var that = this
    var ret = ret.data
    if (ret.status == 1 && ret.success) {
      var isfreeze = '13456'
      //只有自己看的时候才弹出冻结
      if (wx.getStorageSync('ruid') == '') {
        isfreeze = ret.Data.isfreeze
      }
      that.setData({
        userinfo: ret.Data,
        isfreeze: isfreeze
      })
    } else {
      app.promsg(ret.err)
    }
  },
  binddata: function() {
    var that = this
    //推荐列表
    utils.http({
      url: app.globalData.siteUrl + '/Main/Main/GetRecommendProductListJson',
      data: {
        currpage: currpage,
        pageSize: pagesize,
        uid: wx.getStorageSync('SessionUserID'),
        ruid: wx.getStorageSync('ruid'),
        pageType: pageType,
        getVisitorRecord:true
      },
      successBack: that.listdata
    })
  },
  bingaoyongdata: function () {
    var that = this
    //推荐列表
    utils.http({
      url: app.globalData.siteUrl + '/Main/Main/GetProductListJson',
      data: {
        currpage: currpage,
        pageSize: pagesize,
        uid: wx.getStorageSync('SessionUserID'),
        ruid: wx.getStorageSync('ruid'),
        isuserpre:'true',
        act: "search",
        getVisitorRecord: true
      },
      successBack: that.listdata
    })
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    currpage = 1

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    currpage = 1
    stops = true
    this.onShow()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    var that = this
    if (stops) {
      if (pageType==1){
        that.bingaoyongdata()
      }else{
        that.binddata()
      }
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    var that = this
    var ruid
    if (wx.getStorageSync('ruid') != '') {
      ruid = wx.getStorageSync('ruid')
    } else {
      ruid = wx.getStorageSync('SessionUserID')
    }
    return {
      title: that.data.listdata[that.data.sharpindex].name,
      path: 'pages/productdetail/productdetail?pid=' + that.data.listdata[that.data.sharpindex].pid + '&ruid=' + ruid,
      imageUrl: that.data.listdata[that.data.sharpindex].pic
    }
  },
  toSecondClass(e) {
    wx.navigateTo({
      url: '/pages/second_class/second_class?classId=' + e.currentTarget.dataset.classid,
    })
  },
  golist: function(e) {
    var clasid = e.currentTarget.dataset.classid
    if (clasid == "more") {
      wx.navigateTo({
        url: '../zongclass/zongclass'
      })
    } else {
      wx.navigateTo({
        url: '../prolist/prolist?clasid=' + clasid
      })
    }
  },
  //品牌跳转
  golists: function(e) {
    var bid = e.currentTarget.dataset.bid || ''
    var value = e.currentTarget.dataset.value
    var clasid = e.currentTarget.dataset.classid||''
    wx.navigateTo({
      url: '../prolist/prolist?bid=' + bid + '&title=' + value + '&clasid=' + clasid
    })
  },
  onPageScroll: function(e) { // 获取滚动条当前位置
    var that = this
    goTop.onPageScrolls(e, that)
    if (e.scrollTop > (that.data.martop - 40)) {
      if (!that.data.topok) {
        that.setData({
          topok: true
        })
      }
    } else {
      if (that.data.topok) {
        that.setData({
          topok: false
        })
      }
    }
  },
  goTops: function() {
    goTop.goTops()
  },
  //上架成功改变数据
  addsuccess: function(index) {
    var that = this
    console.log(index)
    var a = "listdata[" + index + "].isup"
    that.setData({
      [a]: 1
    })
  },
  //三个选项距离头部的距离
  getRect: function() {
    var that=this
    wx.createSelectorQuery().select('#hengbiao').boundingClientRect(function(rect) {
      var martop = rect.top
      console.log(martop)
      if (martop<700){
        martop=700
      }
          that.setData({
            martop: martop
          })
    }).exec()
  },
  //前往解冻专区
  gobuy_openshop: function() {
    utils.goopen_pro()
  },
  //轮播跳转
  golink:function(e){
    if (e.currentTarget.dataset.link=='tiao'){
      utils.and.clickAds('0', "https://i.rushouvip.cn/activity.html", "https://i.rushouvip.cn/activity.html")
      return
    }else{
      var types = JSON.parse(e.currentTarget.dataset.link)
    }
    console.log(types)
    utils.and.clickAds(types.type, types.title, types.ref)
  }
})