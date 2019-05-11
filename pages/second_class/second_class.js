// pages/second_class/second_class.js
const app = getApp()
const util = require('../../utils/util.js')
const goTop = require('../../Component/goTop/goTop.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    classId: "", //进来的一级分类ID
    classMsg: [], //二级分类数据
    scrollindex: 0, //轮播图下标
    navTitle: ["综合", "销量", "价格", "人气"], //当前类别下的商品筛选标题
    slide: 0, //对应navList下标
    page: [1, 1, 1, 1], //第几页
    pagesize: [10, 10, 10, 10], //每一页的数量
    listMsg: [
      [],
      [],
      [],
      []
    ], //数据
    sortType: "", //当前筛选高或低
    noMore: [false, false, false, false],//没有更多数据
    noMsg: [false, false, false, false],//首次没有数据
    martop: 0,//NAV距离顶部的距离
    topok: false,//false时选项不是fixed
    swiperMsg: "",//轮播图
    uid: "",//用户ID
    fxshopid: "",//店铺ID
  },
  chang: function(e) {
    this.setData({
      scrollindex: e.detail.current
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getRect()
    console.log(options)
    this.setData({
      classId: options.classId
    })
    this.getMsg()
  },
  getMsg(state) {
    this.getListMsg()
    util.http({ //轮播图
      url: app.globalData.siteUrl + '/Main/Main/GetMaterialJson',
      loading_icon: state,
      data: {
        adstype: "class-flash",
        classid: this.data.classId
      },
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
    util.http({ //分类数据
      url: app.globalData.siteUrl + '/Main/Main/GetAllClassJson',
      loading_icon: state,
      successBack: (ret) => {
        if (ret && ret.data.success && ret.data.status === 1) {
          ret.data.Data.forEach((item, index) => {
            if (item.cla.classid === this.data.classId) {
              this.setData({
                classMsg: item
              })
              wx.setNavigationBarTitle({
                title: item.cla.name
              })
            }
          })
        }
      }
    })
  },
  getListMsg(state) {
    util.http({ //商品列表数据
      url: app.globalData.siteUrl + '/Main/Main/GetProductListJson',
      loading_icon: state,
      data: {
        currpage: this.data.page[this.data.slide],
        pageSize: this.data.pagesize[this.data.slide],
        clsid: this.data.classId,
        fxshopid: wx.getStorageSync("fxshopid"),
        userid: wx.getStorageSync("SessionUserID"),
        sort: this.data.sortType
      },
      successBack: (ret) => {
        let { listMsg, noMsg, noMore} = this.data
        if (ret && ret.data.success && ret.data.status === 1 && ret.data.Data.length > 0) {
          listMsg[this.data.slide] = [...listMsg[this.data.slide], ...ret.data.Data]
        } else {
          app.promsg(ret.err)
        }
        if (this.data.page[this.data.slide] === 1 && ret.data.Data.length < 1) {
          noMsg[this.data.slide] = true
        } else if (ret.data.Data.length < this.data.pagesize[this.data.slide] && this.data.page[this.data.slide] !== 1) {
          noMore[this.data.slide] = true
        }
        this.setData({
          listMsg,
          noMsg,
          noMore,
          isLoadMsg: false
        })
        console.log(this.data.listMsg)
      }
    })
  },
  changeList(e) {
    let idx = e.currentTarget.dataset.idx
    let {
      sortType
    } = this.data
    console.log(idx)
    console.log(typeof idx)
    switch (idx) {
      case 0: //综合
        sortType = ""
        break
      case 1: //销量
        if (sortType == 'sale_asc') {
          sortType = 'sale_desc'
        } else {
          sortType = 'sale_asc'
        }
        break
      case 2: //价格
        if (sortType == 'price_asc') {
          sortType = 'price_desc'
        } else {
          sortType = 'price_asc'
        }
        break
      case 3: //人气
        if (sortType == 'collect_asc') {
          sortType = 'collect_desc'
        } else {
          sortType = 'collect_asc'
        }
        break
    }
    this.setData({
      sortType,
      page: [1, 1, 1, 1],
      listMsg: [
        [],
        [],
        [],
        []
      ],
      slide: idx
    })
    console.log(this.data.sortType)
    this.getListMsg()
  },

  reFreshMsg() {
    let { page, noMore, noMsg, listMsg, sortType } = this.data
    page = [1, 1, 1, 1]
    noMore = [false, false, false, false]
    noMsg = [false, false, false, false]
    listMsg = [[], [], [], []]
    this.setData({
      page,
      noMore,
      noMsg,
      listMsg
    })
    this.getMsg()
  },
  toProList(e) {
    wx.navigateTo({
      url: '/pages/prolist_class/prolist_class?classId=' + this.data.classMsg.cla.classid + '&itemClassId=' + e.currentTarget.dataset.itemclassid
    })
  },
  toProDetail(e) {
    wx.navigateTo({
      url: '/pages/productdetail/productdetail?pid=' + e.currentTarget.dataset.pid,
    })
  },
  //三个选项距离头部的距离
  getRect: function () {
    wx.createSelectorQuery().select('#hengbiao').boundingClientRect((rect)=> {
      console.log(rect)
      this.setData({
        martop: rect.top + 208
      })
    }).exec()
  },
  onPageScroll: function (e) { // 获取滚动条当前位置
    var that = this
    goTop.onPageScrolls(e, that)
    if (e.scrollTop > this.data.martop) {
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
  goTops: function () {
    goTop.goTops()
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.setData({
      uid: wx.getStorageSync("SessionUserID"),
      fxshopid: wx.getStorageSync("fxshopid")
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

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    this.reFreshMsg()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    let { page, isLoadMsg} = this.data
    if (isLoadMsg) return
    if (!this.data.noMore[this.data.slide] || (!this.data.page[this.data.slide] === 1 && !this.data.noMsg[this.data.slide])) {
      isLoadMsg = true
      page[this.data.slide] += 1
      this.setData({
        page,
        isLoadMsg
      })
      this.getListMsg("isPullUp")
    }
  }
})