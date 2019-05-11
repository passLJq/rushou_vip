// pages/myteam/myteam.js
const app = getApp()
import util from "../../utils/util.js"
Page({

  /**
   * 页面的初始数据
   */
  data: {
    content: "",//搜索内容
    page: [1, 1],//第几页
    pagesize: [10, 10],//每页显示多少
    listMsg: [[], []],//数据
    noMore: [false, false],//没有更多数据了
    noMsg: [false, false],//没有数据
    navList: ["一级团队", "二级团队"],//NAV数组
    slide: 0,//对应navList下标 //1=一级团队,2=二级团队
    scrollTop: 0,//NAV滚动固定
    teamTotal: [0, 0],//我的团队人数
  },
  toTeamDetail(e) {
    wx.navigateTo({
      url: '/pages/team_detail/team_detail?teamMsg=' + JSON.stringify(this.data.listMsg[this.data.slide][e.currentTarget.dataset.idx])
    })
  },
  changeSlide(e) {
    this.setData({
      slide: parseInt(e.currentTarget.dataset.idx)
    })
    if (this.data.content.length > 0) {
      this.refreshMsg()
    } else {
      this.data.listMsg[this.data.slide].length < 1 && this.getMsg()
    }

  },
  getSearchMsg(e) {
    this.setData({
      content: e.detail
    })
    this.refreshMsg()
  },
  refreshMsg() {
    this.setData({
      listMsg: [[], []],
      noMsg: [false, false],
      noMore: [false, false]
    })
    this.getMsg()
  },
  onPageScroll(e) {
    this.setData({
      scrollTop: e.scrollTop
    })
  },
  getMsg(state) {
    util.http({
      url: app.globalData.siteUrl + '/Main/Member/GetMyTeam?devicetype=3',
      data: {
        currentPage: this.data.page[this.data.slide],
        pageSize: this.data.pagesize[this.data.slide],
        uid: wx.getStorageSync('SessionUserID'),
        type: this.data.slide + 1,
        search: this.data.content ? this.data.content : ""
      },
      loading_icon: state,
      header: 1,
      successBack: (ret) => {
        console.log(ret)
        let { listMsg, noMsg, noMore, teamTotal } = this.data
        teamTotal[this.data.slide] = ret.data.total
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
          teamTotal
        })
      }
    })
    let timer = setTimeout(() => {
      wx.stopPullDownRefresh()
      clearTimeout(timer)
      timer = null
    }, 1500)
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      slide: 0//(parseInt(options.listType) - 1)
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
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    let page = this.data.page
    if (!this.data.noMore[this.data.slide] || (!this.data.page[this.data.slide] === 1 && !this.data.noMsg[this.data.slide])) {
      page[this.data.slide] += 1
      this.setData({
        page: page
      })
      this.getMsg("isPullUp")
    }
  }
})