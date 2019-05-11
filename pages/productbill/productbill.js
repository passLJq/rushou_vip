// pages/productbill/productbill.js
const app = getApp()
const util = require("../../utils/util.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    slide: 0, //0=店铺商品, 1=清单数据
    page: [1, 1], //第几页
    pagesize: [10, 10], //每一页的数量
    shopList: "", //店铺商品数据
    billList: "", //清单数据
    selectArr: [
      [],
      []
    ], //是否选中的数组
    allSelect: true, //全选
    isreachBottom: false,//是否正在执行上拉
    noMore: false,//没有更多数据了
    billMaxCounts: 0,//总数量
    ishomepageshow: [],//是否推荐到首页
    isIphoneX: app.globalData.isIphoneX,
  },
  changeSlide(e) {
    this.setData({
      slide: parseInt(e.currentTarget.dataset.idx)
    })
    if (this.data.slide === 0 && !this.data.shopList) {
      this.getMsg()
    } else if (this.data.slide === 1 && !this.data.billList) {
      this.getMsg()
    }

  },
  showIndex(e) {
    let idx = e.currentTarget.dataset.idx
    let ishomepageshow = this.data.ishomepageshow
    let billList = this.data.billList
    if (billList[idx].itemlist.length <= 0 && !ishomepageshow[idx]) {
      app.promsg("请先在清单内添加商品")
      return
    }
    util.http({
      url: app.globalData.siteUrl + '/Main/Member/UpdateProListItem?devicetype=3&uid=' + wx.getStorageSync('SessionUserID'),
      data: { 
        prolistid: e.currentTarget.dataset.prolistid 
      },
      method: "POST",
      successBack: (ret) => {
        if (ret.data.status == 1 && ret.data.success) {
          
          app.showtips(ishomepageshow[idx] ? "下架成功" : "上架成功")
          ishomepageshow[idx] = ishomepageshow[idx]? 0 : 1
          this.setData({
            ishomepageshow
          })
        } else {
          app.promsg(ret.data.err)
        }
      }
    })
  },
  toAddBill() {
    wx.navigateTo({
      url: '/pages/creat_inventory/creat_inventory'
    })
  },
  toAddMsg() {
    if(this.data.slide === 0) {
      wx.reLaunch({
        url: '/pages/index/index'
      })
    }else {
      this.toAddBill()
    }
  },
  toClass() {
    wx.reLaunch({
      url: "/pages/class/class"
    })
  },
  toBillEdit(e) {
    wx.navigateTo({
      url: "/pages/product_bill_edit/product_bill_edit?prolistid=" + e.currentTarget.dataset.prolistid
    })
  },
  movePro(e) {
    this.getMsg(1)
  },
  deleteList(e) {
    this.setData(e.detail)
    this.getMsg()
  },
  deleteBill(e) {
    wx.showModal({
      title: '温馨提示',
      content: "是否下架该清单?",
      success: (res) => {
        if (res.confirm) {
          util.http({
            url: app.globalData.siteUrl + '/Main/Member/DeleteProList?devicetype=3',
            data: { prolistid: e.currentTarget.dataset.prolistid },
            method: "POST",
            successBack: (ret) => {
              if (ret.data.status == 1 && ret.data.success) {
                app.showtips("成功下架清单")
                let timer = setTimeout(() => {
                  clearTimeout(timer)
                  timer = null
                  this.setData({
                    shopList: "",
                    billList: "",
                    noMore: false,
                    isreachBottom: false,
                    page: [1, 1]
                  })
                  this.getMsg()
                }, 1500)
              } else {
                app.promsg(ret.data.err)
              }
            }
          })
        } else if (res.cancel) { }
      }
    })
  },
  getMsg(loading_icon) {
    let {
      shopList,
      billList,
      isreachBottom,
      noMore,
      page,
      ishomepageshow
    } = this.data
    if (loading_icon) {
      shopList = ""
      billList = ""
      noMore = false
      isreachBottom = false
      page = [1, 1],
      ishomepageshow = []
    }
    new Promise((resolve, reject) => {
      if (this.data.slide === 0) {
        util.http({
          url: app.globalData.siteUrl + '/Main/Main/GetYShopProductListJson?devicetype=3',
          data: {
            currpage: page[this.data.slide],
            pageSize: this.data.pagesize[this.data.slide],
            uid: wx.getStorageSync('SessionUserID'),
            ruid: wx.getStorageSync('ruid')
          },
          loading_icon: isreachBottom || loading_icon,
          successBack: (ret) => {
            console.log(ret)
            if (ret.data.status == 1 && ret.data.success && ret.data.Data != null) {
              shopList = [...shopList, ...ret.data.Data]
              this.setData({
                billMaxCounts: ret.data.iCnt
              })
              resolve(ret.data.Data)
            } else {
              app.promsg(ret.data.err)
            }
          }
        })
      } else {
        util.http({
          url: app.globalData.siteUrl + '/Main/Member/GetProList?devicetype=3',
          data: {
            //currPage: page[this.data.slide],
            //pageSize: this.data.pagesize[this.data.slide],
            uid: wx.getStorageSync('SessionUserID'),
            prolistid: "" //详情需要的
          },
          header: 1,
          loading_icon: isreachBottom || loading_icon,
          successBack: (ret) => {
            console.log(ret)
            if (ret && ret.data.success && ret.data.status == 1 && ret.data.Data.length > 0) {
              billList = [...billList, ...ret.data.Data]
              resolve(ret.data.Data)
            } else {
              app.promsg(ret.data.err)
            }

          }
        })
      }
    }).then((ret) => {
      if (this.data.slide === 1) {
        for (let i in ret) {
          ishomepageshow.push(parseInt(ret[i].ishomepageshow))
        }
      }
      if (this.data.slide === 0) {
        if (isreachBottom && ret.length < 1) {
          noMore = true
        } else {
          noMore = false
        }
      }
      this.setData({
        shopList,
        billList,
        isreachBottom: false,
        noMore,
        page,
        ishomepageshow
      })
      let timer = setTimeout(() => {
        wx.stopPullDownRefresh()
        clearTimeout(timer)
        timer = null
      }, 1500)
    })

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      isFirstGet: true
    })
    this.getMsg()
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
    if (this.data.isFirstGet) {
      this.setData({
        isFirstGet: false
      })
    } else {
      this.getMsg(1)
    }
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

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    if (this.data.slide === 0 && !this.data.noMore) {
      let page = this.data.page
      page[this.data.slide] += 1
      this.setData({
        isreachBottom: true,
        page: page
      })
      this.getMsg()
    }
  }
})