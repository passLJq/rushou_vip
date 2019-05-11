// pages/prolist_class/prolist_class.js
const app = getApp()
const util = require('../../utils/util.js')
const goTop = require('../../Component/goTop/goTop.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    classId: '', //进来的一级分类ID
    itemClassId: '',//进来的二级分类ID
    searchMsg: "", //搜索内容
    page: 1, //第几页
    pageSize: 10, //一页显示多少
    classMsg: "", //NAV数据
    listMsg: "", //商品数据
    slide: 0, //当前NAV选中的下标
    page: "", //第几页
    pagesize: "", //每一页的数量
    noMore: "", //没有更多数据
    noMsg: "", //首次没有数据
    uid: "",//用户ID
    fxshopid: "",//店铺ID
  },
  goTops: function () {
    goTop.goTops()
  },
  onPageScroll: function (e) { // 获取滚动条当前位置
    var that = this
    goTop.onPageScrolls(e, that)
  },
  toProDetail(e) {
    wx.navigateTo({
      url: '/pages/productdetail/productdetail?pid=' + e.currentTarget.dataset.pid,
    })
  },
  changeNav(e) {
    this.setData({
      slide: e.currentTarget.dataset.idx,
      itemClassId: e.currentTarget.dataset.itemclassid
    })
    this.data.listMsg[this.data.slide].length < 1 && this.getProlistMsg()
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options)
    this.setData({
      classId: options.classId, //"170815193933744353"
      itemClassId: options.itemClassId,//"170815194018744448"
    })
    this.getMsg()
  },
  getMsg(state) {
    let listMsg = [],
      page = [],
      pagesize = [],
      noMore = [],
      noMsg = [],
      slide = this.data.slide
    util.http({ //分类数据
      url: app.globalData.siteUrl + '/Main/Main/GetAllClassJson',
      loading_icon: state,
      successBack: (ret) => {
        if (ret && ret.data.success && ret.data.status === 1) {
          ret.data.Data.forEach((item, index) => {
            if (item.cla.classid === this.data.classId) {
              item.node.forEach((nodes, idx) => {
                if (nodes.cla.classid === this.data.itemClassId) {
                  slide = idx
                }
                listMsg.push([])
                page.push(1)
                pagesize.push(10)
                noMore.push(false)
                noMsg.push(false)
              })
              this.setData({
                classMsg: item,
                listMsg,
                page,
                pagesize,
                noMore,
                noMsg,
                slide
              })
              console.log(this.data.classMsg)
              wx.setNavigationBarTitle({
                title: item.cla.name
              })
              this.getProlistMsg()
            }
          })
        }
      }
    })
    
  },
  getProlistMsg(state) {
    util.http({ //分类数据
      url: app.globalData.siteUrl + '/Main/Main/GetProductListJson',
      loading_icon: state,
      data: {
        currpage: this.data.page[this.data.slide],
        pageSize: this.data.pagesize[this.data.slide],
        clsid: this.data.itemClassId,
        fxshopid: wx.getStorageSync("fxshopid"),
        act: 'search',
        skey: this.data.searchMsg,
        userid: wx.getStorageSync("SessionUserID")
      },
      successBack: (ret) => {
        console.log(ret)
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
  refreshMsg() {
    let {
      page,
      noMore,
      noMsg,
      listMsg
    } = this.data
    page.fill(1)
    noMore.fill(false)
    noMsg.fill(false)
    listMsg.fill([])
    this.setData({
      page,
      noMore,
      noMsg,
      listMsg
    })
    this.getProlistMsg()
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
    this.refreshMsg()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    let { page, isLoadMsg } = this.data
    if (isLoadMsg) return
    if (!this.data.noMore[this.data.slide] || (!this.data.page[this.data.slide] === 1 && !this.data.noMsg[this.data.slide])) {
      isLoadMsg = true
      page[this.data.slide] += 1
      this.setData({
        page,
        isLoadMsg
      })
      this.getProlistMsg("isPullUp")
    }
  }
})