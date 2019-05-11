// pages/shoppingcar/shoppingcar.js
const util = require("../../utils/util.js")
const app = getApp()
const CheckLoginStatus = require("../../utils/CheckLoginStatus.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    fxlogo: "", //正在查看店铺的logo
    fxname: "", //正在查看店铺的名字
    listMsg: "", //数据
    proAmount: "", //商品总价格
    proNum: "", //商品总数量
    selectArr: "", //是否选中的数组
    allSelect: true, //全选
    selectPrice: "", //选中的数据的价格和数量
    isEdit: false, //是否正在编辑
    time: 0, //滑动次数
    touchDot: 0, //触摸时的原点
    interval: "", //滑动定时器
    flag_hd: [], //重新进入页面之后，可以再次执行滑动切换页面代码
    uid: wx.getStorageSync("SessionUserID"),
    noMsg: false,//没有数据
    showCoupon:false,
    CouponCompanyid:''//传入优惠券组件的参数
  },
  absPrice() {
    let oldVal = this.data.selectArr
    let selectPrice = this.data.selectPrice
    let price = 0
    let counts = 0
    for (let r in selectPrice) {
      for (let i in selectPrice[r]) {
        if (oldVal[r][i] == 1) {
          price += selectPrice[r][i].price * selectPrice[r][i].counts
          counts += selectPrice[r][i].counts
        }
      }
    }
    this.setData({
      proAmount: parseFloat(price).toFixed(2),
      proNum: counts
    })
  },
  toIndex() {
    wx.reLaunch({
      url: '/pages/index/index'
    })
  },
  toProDetail(e) {
    let idx = e.currentTarget.dataset.idx
    if (!e.currentTarget.dataset.can && !this.data.selectPrice[idx[0]][idx[1]].isMove) {
      wx.navigateTo({
        url: "/pages/productdetail/productdetail?pid=" + e.currentTarget.dataset.pid,
      })
    }
  },
  isNoStocks(oldVal, idx) {
    let newOldVal = oldVal
    for (let r in oldVal) {
      let nowTime = Date.now()
      for (let i in oldVal[r]) {
        let rushBuyObj = this.data.selectPrice[r][i].rushBuyObj
        if (this.data.selectPrice[r][i].stocks < 1) {
          oldVal[r][i] = 0
          if (idx[0] === r && idx[1] === i) {
            app.promsg("该商品库存不足, 请重新选购")
          }
        }
        if ((this.data.selectPrice[r][i].rushbuy.isrushbuy && rushBuyObj && rushBuyObj.startDate > nowTime) || this.data.listMsg[r].content[i].rushbuystatus) {
          console.log(rushBuyObj)
          oldVal[r][i] = 0
          if (idx[0] === r && idx[1] === i) {
            app.promsg("该商品活动未开始或者失效, 请重新选购")
          }
        } else if (!isNaN(rushBuyObj.startDate) && !isNaN(rushBuyObj.endDate) && rushBuyObj.startDate < nowTime && nowTime < rushBuyObj.endDate && !this.data.listMsg[r].content[i].rushbuystatus){
          rushBuyObj.isCanBuy = true
          let selectPrice = this.data.selectPrice
          selectPrice[r][i].rushBuyObj = rushBuyObj
          this.setData({
            selectPrice
          })
        }
      }
    }
    return newOldVal
  },
  selectItem(e) {
    let idx = e.currentTarget.dataset.idx.toString().split("")
    let oldVal = this.data.selectArr
    let oldPrice = this.data.selectPrice
    if (idx.length == 1) {
      let allPrice = 0.00
      if (idx[0] == "a") { //全选
        for (let i in oldVal) {
          if (this.data.allSelect) {
              oldVal[i].fill(0)
          } else {
            oldVal[i].fill(1)
            allPrice = 0.00
          }
        }
        this.setData({
          allSelect: !this.data.allSelect
        })
      } else { //单个商家选中
        if (oldVal[idx].findIndex((n) => n < 1) == -1) {
          oldVal[idx].fill(0)
        } else {
          oldVal[idx].fill(1)
        }
      }
    } else if (idx.length == 2) { //单个商品
      if (oldVal[idx[0]][idx[1]] == 0) {
        oldVal[idx[0]][idx[1]] = 1
      } else {
        oldVal[idx[0]][idx[1]] = 0
      }
    }
    if (idx[0] != "a") {
      let isCheck = true
      for (let b in oldVal) {
        for (let a in oldVal[b]) {
          if (oldVal[b][a] < 1 && (!oldPrice[b][a].rushBuyObj || (oldPrice[b][a].rushBuyObj && oldPrice[b][a].rushBuyObj.isCanBuy === false)) && oldPrice[b][a].stocks > 0) {
            isCheck = false
          }
          
        }
      }
      this.setData({
        allSelect: isCheck,
      })
    }
    let newValue = this.isNoStocks(oldVal, idx)
    newValue && this.setData({
      selectArr: newValue
    })
    this.absPrice()


  },
  editPro(e) {
    this.setData({
      isEdit: !this.data.isEdit
    })
    this.absPrice()
    this.getCartCounts()
  },
  changeCounts(e) {
    var that=this
    let selectPrice = this.data.selectPrice
    let idx = e.currentTarget.dataset.idx.toString().split("")
    var type = parseInt(e.currentTarget.dataset.counts)
    if (type == -1 && selectPrice[idx[0]][idx[1]].counts < 2) return
    console.log(selectPrice[idx[0]][idx[1]].rushbuy.buylimit)
    if (type == 1) {
      if (selectPrice[idx[0]][idx[1]].maxbuy != 0 && selectPrice[idx[0]][idx[1]].counts >= selectPrice[idx[0]][idx[1]].maxbuy) {
        return
      }
      //限时抢购限购
      if (selectPrice[idx[0]][idx[1]].rushbuy.buylimit != 0 && selectPrice[idx[0]][idx[1]].counts >= selectPrice[idx[0]][idx[1]].rushbuy.buylimit ){
        app.promsg('最大购买' + selectPrice[idx[0]][idx[1]].rushbuy.buylimit+'件')
        selectPrice[idx[0]][idx[1]].counts = selectPrice[idx[0]][idx[1]].rushbuy.buylimit
        that.setData({
          selectPrice: selectPrice
        })   
        return
      }
    }
    selectPrice[idx[0]][idx[1]].counts += type
    this.setData({
      selectPrice: selectPrice
    })
    util.http({
      url: app.globalData.siteUrl + '/Main/Shopping/ModifyCartItem?devicetype=3',
      data: {
        uid: wx.getStorageSync("SessionUserID"),
        itemid: this.data.selectPrice[idx[0]][idx[1]].itemId,
        qty: this.data.selectPrice[idx[0]][idx[1]].counts,
        optype: (type == 1 ? "add" : "min")
      },
      header: 1,
      successBack: (ret) => {
        this.absPrice()
      },
      loading_icon: 1
    })

  },
  toPay() {
    if (!this.data.proNum) {
      return
    }
    let selectArr = this.data.selectArr
    let selectPrice = this.data.selectPrice
    let payIdList = []
    for (let r in selectArr) {
      for (let i in selectArr[r]) {
        if (selectArr[r][i] == 1) {
          payIdList.push(selectPrice[r][i].itemId)
        }
      }
    }
    wx.navigateTo({
      url: '/pages/ordercomfirm/ordercomfirm?way=shoppingcart&ids=' + payIdList.join(","),
    })
  },
  getCartCounts() {
    util.cartCounts({
      callBack: (ret) => {
        if (ret && ret.data.success && ret.data.status == 1 && ret.data.Data != null) {
          if (ret.data.Data > 0) {
            wx.setTabBarBadge({
              index: 2,
              text: ret.data.Data.toString()
            })
          }else {
            wx.removeTabBarBadge({
              index: 2
            })
          }
        }
      }
    })
  },
  deleteItem(e) {
    let that = this
    let id = e.currentTarget.dataset.id
    wx.showModal({
      title: '友情提示',
      content: "确认删除该商品?",
      success: (res) => {
        if (res.confirm) {
          util.http({
            url: app.globalData.siteUrl + '/Main/Shopping/ModifyCartItem?devicetype=3',
            data: {
              itemid: id,
              qty: 0,
              optype: "delete",
              uid: wx.getStorageSync("SessionUserID")
            },
            header: 1,
            successBack: (ret) => {
              if (ret && ret.data.success && ret.data.status == 1) {
                app.showtips("删除成功")
                this.getCartCounts()
                setTimeout(()=> {
                  this.getMsg()
                }, 1000)
              }
            }
          })
        } else if (res.cancel) {}
      }
    })
  },
  touchStart(e) {
    var that = this
    // 使用js计时器记录时间
    let interval = setInterval(function() {
      that.setData({
        time: that.data.time + 1
      })
    }, 100);
    this.setData({
      touchDot: e.touches[0].pageX, // 获取触摸时的原点
      interval: interval
    })
  },
  touchEnd(e) {
    var touchMove = e.changedTouches[0].pageX;
    let selectPrice = this.data.selectPrice
    let idx = e.currentTarget.dataset.idx.toString().split("")
    // 向左滑动   
    if (touchMove - this.data.touchDot <= -40 && this.data.time < 10) {
      //执行切换页面的方法
      selectPrice[idx[0]][idx[1]].isMove = true
    }
    // 向右滑动   
    if (touchMove - this.data.touchDot >= 40 && this.data.time < 10) {
      //执行切换页面的方法
      selectPrice[idx[0]][idx[1]].isMove = false
    }
    if (JSON.stringify(idx) !== JSON.stringify(this.data.flag_hd)) {
      if (selectPrice[idx[0]][idx[1]].isMove && this.data.flag_hd.length > 0) {
         selectPrice[this.data.flag_hd[0]][this.data.flag_hd[1]].isMove = false
      }
    }
    this.setData({
      selectPrice: selectPrice,
      flag_hd: idx
    })
    clearInterval(this.data.interval); // 清除setInterval
    this.setData({
      time: 0
    })
  },
  getMsg() {
    util.http({
      url: app.globalData.siteUrl + '/Main/Shopping/GetCartJson?devicetype=3&uid=' + wx.getStorageSync("SessionUserID"),
      method: "POST",
      data: {
        uid: wx.getStorageSync("SessionUserID"),
        ruid: wx.getStorageSync("ruid") || wx.getStorageSync("SessionUserID")
      },
      header: 1,
      successBack: (ret) => {
        console.log(ret)
        if (ret && ret.data.status == 1) {
          this.setData({
            fxname: ret.data.fxname,
            fxlogo: ret.data.fxlogo
          })
          if (ret.data.Data) {
            let arr = []
            let selectArr = []
            let selectPrice = []
            let proAmount = parseFloat(ret.data.Data.proAmount)
            let proNum = ret.data.Data.proNum
            for (let i in ret.data.Data.json) {
              arr.push({
                title: "",
                content: []
              })
              selectArr.push([])
              selectPrice.push([])
              for (let r in ret.data.Data.json[i]) {
                arr[i].title = ret.data.Data.json[i][r].shopname
                arr[i].content.push(ret.data.Data.json[i][r])
                let rushBuyObj = ""
                if (ret.data.Data.json[i][r].stocks < 1 || ret.data.Data.json[i][r].isrushbuy) {
                  let rushbuy = ret.data.Data.json[i][r].prorushbuy
                  let nowTime = Date.now()
                  let startDate = rushbuy? Number(rushbuy.begintimeticks) : 0
                  let endDate = rushbuy ? Number(rushbuy.endtimeticks) : 0
                  let surplusEndTime = (endDate - nowTime) / 1000
                  let surplusStartTime = (startDate - nowTime) / 1000
                  if (!isNaN(startDate) && !isNaN(endDate) && startDate < nowTime && nowTime < endDate && !ret.data.Data.json[i][r].rushbuystatus) {//进行中
                    selectArr[i].push(1)
                    rushBuyObj = {}
                    rushBuyObj.isCanBuy = true
                    rushBuyObj.startDate = startDate
                    rushBuyObj.endDate = endDate
                  } else if (nowTime < startDate || ret.data.Data.json[i][r].rushbuystatus) {//预告或者失效
                    selectArr[i].push(0)
                    proAmount -= (ret.data.Data.json[i][r].qty * ret.data.Data.json[i][r].price)
                    proNum -= parseInt(ret.data.Data.json[i][r].qty)
                    rushBuyObj = {}
                    rushBuyObj.isCanBuy = false
                    rushBuyObj.startDate = startDate
                    rushBuyObj.endDate = endDate
                  } else {
                    selectArr[i].push(0)
                    proAmount -= (ret.data.Data.json[i][r].qty * ret.data.Data.json[i][r].price)
                    proNum -= parseInt(ret.data.Data.json[i][r].qty)
                  }
                  
                } else {
                  selectArr[i].push(1)
                }
                //限时抢购的限购数量
                let buylimit=0
                if (ret.data.Data.json[i][r].prorushbuy){
                  if (ret.data.Data.json[i][r].prorushbuy.buylimit){
                    buylimit = ret.data.Data.json[i][r].prorushbuy.buylimit
                  }
                }
                selectPrice[i].push({
                  price: ret.data.Data.json[i][r].price,
                  counts: ret.data.Data.json[i][r].qty,
                  maxbuy: ret.data.Data.json[i][r].maxbuy,
                  itemId: ret.data.Data.json[i][r].id,
                  isMove: false,
                  stocks: ret.data.Data.json[i][r].stocks,
                  rushbuy: {
                    isrushbuy: ret.data.Data.json[i][r].isrushbuy,
                    rushbuystatus: ret.data.Data.json[i][r].rushbuystatus,
                    buylimit: buylimit
                  },
                  rushBuyObj: rushBuyObj//限时抢购数据
                })
              }
            }
            this.setData({
              listMsg: arr,
              selectArr: selectArr,
              selectPrice: selectPrice,
              proAmount: proAmount.toFixed(2),
              proNum: proNum,
              flag_hd: [],
              noMsg: false
            })
            console.log(this.data.selectArr)
            console.log(this.data.selectPrice)
          }else {
            this.setData({
              listMsg: "",
              selectArr: "",
              selectPrice: "",
              proAmount: "",
              proNum: "",
              flag_hd: [],
              noMsg: true
            })
          }
        }
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    CheckLoginStatus.checksession(() => {
      this.getMsg()
      this.getCartCounts()
    })
    this.setData({
      isFirstGet: true
    })
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
    let ruid = wx.getStorageSync("ruid")
    let uid = wx.getStorageSync("SessionUserID")
    this.setData({
      uid: wx.getStorageSync("SessionUserID")
    })
    if (this.data.isFirstGet) {
      this.setData({
        isFirstGet: false
      })
    } else {
      CheckLoginStatus.checksession(() => {
        this.getMsg()
        this.getCartCounts()
      })
    }
    //店铺信息分享使用
    util.http({
      url: app.globalData.siteUrl + '/Main/Member/GetUserShopJson',
      data: {
        uid: wx.getStorageSync('SessionUserID'),
        ruid: wx.getStorageSync('ruid')
      },
      header: 1,
      successBack: this.usermeng
    })
  },
  usermeng: function (ret) {
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

  },
  //前往解冻专区
  gobuy_openshop: function () {
    util.goopen_pro()
  },
  //弹出优惠券框
  showcoupon(e){
    console.log(e)
    var comid=''
    if(e){
      if (e.currentTarget.dataset.comid){
        comid = e.currentTarget.dataset.comid
      }else{
        comid = ''
      }
      }
    this.setData({
      showCoupon: !this.data.showCoupon,
      CouponCompanyid:comid
    })
  }
})