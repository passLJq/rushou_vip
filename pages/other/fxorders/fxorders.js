// pages/other/fxorders/fxorders.js
const app = getApp()
const util = require("../../../utils/util.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navList: ["全部", "已结算", "未结算", "已退款"],//slide名字
    slide: 0,//对应navList下标
    page: [1, 1, 1, 1],//第几页
    pagesize: [10, 10, 10, 10],//每一页的数量
    monthdata: "2018年7月",//年月
    content: "",//搜索内容
    listMsg: [[], [], [], []],//数据
    noMore: [false, false, false, false],//没有更多数据
    noMsg: [false, false, false, false],//首次没有数据
  },
  changeSlide(e) {
    this.setData({
      slide: parseInt(e.currentTarget.dataset.idx)
    })
    if(this.data.content.length > 0) {
      this.refreshMsg()
    }else {
      this.data.listMsg[this.data.slide].length < 1 && this.getMsg()
    }

  },
  toDetail(e) {
    wx.navigateTo({
      url: '/pages/other/fxordersdetail/fxordersdetail?orderid=' + e.currentTarget.dataset.orderid,
    })
  },
  getSearchMsg(e) {
    this.setData({
      content: e.detail
    })
    this.refreshMsg()
  },
  getMsg(state) {
      util.http({
        url: app.globalData.siteUrl + '/Main/Member/GetUserSalesDetail?devicetype=3',
        data: {
          currentPage: this.data.page[this.data.slide],
          pageSize: this.data.pagesize[this.data.slide],
          uid: wx.getStorageSync('SessionUserID'),
          type: this.data.slide,
          orderid: this.data.content ? this.data.content : "",
          yearandmonth: this.data.monthdata
        },
        loading_icon: state,
        header: 1,
        successBack: (ret) => {
          console.log(ret)
          let noMsg = this.data.noMsg
          let noMore = this.data.noMore
          let listMsg = this.data.listMsg
          if (ret && ret.data.success && ret.data.status == 1 && ret.data.Data.length > 0) {
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
            listMsg: listMsg,
            noMsg: noMsg,
            noMore: noMore,
            isLoadMsg: false
          })
        }
      })
    let timer = setTimeout(() => {
      wx.stopPullDownRefresh()
      clearTimeout(timer)
      timer = null
    }, 1500)


  },
  refreshMsg() {
    let { page, noMore, noMsg, listMsg } = this.data
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
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      monthdata: options.monthdata
    })
    this.getMsg()
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
    this.refreshMsg()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    let { page, isLoadMsg } = this.data
    if (isLoadMsg) return
    if (!this.data.noMore[this.data.slide] || (!this.data.page[this.data.slide] === 1 && !this.data.noMsg[this.data.slide])) {
      isLoadMsg = true
      page[this.data.slide] += 1
      this.setData({
        page,
        isLoadMsg
      })
      this.getMsg("isPullUp")
    }
  }

})