// pages/class/class.js
const app = getApp()
const sharebox = require('../../Component/sharebox/sharebox.js')
const util = require("../../utils/util.js")
const CheckLoginStatus = require("../../utils/CheckLoginStatus.js")
const WxParse = require('../../wxParse/wxParse.js');
var erweima=''//二维码地址
Page({

  /**
   * 页面的初始数据
   */
  data: {
    shareName: "商品详情",
    imgUrls: ['/image/bkg_cover.jpg'],
    indicatorDots: true,
    autoplay: true, //自动轮播
    interval: 3000, //轮播间隔
    duration: 500, //轮播动画时间
    circular: true, //轮播圆点
    skuBoxBottom: false, //规格弹窗
    ensureBoxBottom: false, //保障弹窗
    billBoxBottom: false,//清单弹窗
    custom:false,//全球购弹窗
    showshare: [false, true], //分享控制
    msg: { propackageprice: 0 }, //商品数据 //防止出现NAN
    spec: [],
    sku: [],
    proPrice: "", //商品的初始单价
    zuan: "", //赚多少
    marketingprice: "", //市场价
    skutext: "", //当前选中的规格文本
    specval: "", //当前选中的规格子类别ID
    skuid: "", //当前选中的规格提交时的id
    saleprice: "", //规格价格
    pid: "", //商品ID
    buyCounts: 1, //购买数量
    buyPrice: 0.00, //单价
    minCounts: 0,//最小购买数量 0=无限制
    maxCounts: 0, //最大购买数量0=无限制
    nowStock: 0,//当前规格库存
    isup: false,
    fxshopid: wx.getStorageSync('fxshopid'), //自己的店铺ID
    ruid: wx.getStorageSync('ruid'), //当前进来的店铺ID
    cartCounts: "", //购物车角标数量
    uid: wx.getStorageSync('SessionUserID'),
    animationData: {},
    scrollTop: 0,//之前保存的溢出高度
    isScrollAfter: false,//是否滚动完触发动画了
    isIphoneX: app.globalData.isIphoneX,
    isopenshop:true,//判断当前页面时创业礼包还是普通礼包,false代表创业礼包
    billList: "",//清单数据
    rushBuyMsg: "",//限时抢购数据
    countDownTime: {//剩余时间倒计时
      day: "00", 
      hour: "00", 
      minute: "00", 
      second: "00"
    }, 
    timeFree:{
      DY:"00",
      DD:"00",
      DM:"00",
      TH:"00",
      TM:"00",
      TS: "00"
    },
    canShowRushBuy: 0,//是否显示抢购0=不显示, 1=正在进行中, 2=预告
    timer: null,//限时抢购倒计时
    rushbuyid: "",//显示抢购ID
    firstLoad: false,//第一次加载完成?
    shrespro:false,//分享活动是否开启
    dayses: '',//双十二抢购价
    monthses:'',//双十二抢购价
    showCoupon: false, //显示优惠券
    hasGet: '',     // 已领优惠券数据
    unGet: '',     // 未领优惠券数据
  },
  showSku(e) {
    if (e.currentTarget.dataset.id == "box_container") {
      return
    }
    if (e.currentTarget.dataset.type == "ensure" || this.data.ensureBoxBottom) {
      this.setData({
        ensureBoxBottom: !this.data.ensureBoxBottom
      })
    } else if (e.currentTarget.dataset.type == "sku" || this.data.skuBoxBottom) {
      if (this.data.msg.stock < 1) {
        app.promsg("商品库存不足, 请选购其他商品!")
        return
      }
      this.setData({
        skuBoxBottom: !this.data.skuBoxBottom
      })
    } else if (e.currentTarget.dataset.type == "customtext" || this.data.custom){
      this.setData({
        custom: !this.data.custom
      })
    } else if (e.currentTarget.dataset.type == "billList" || this.data.billBoxBottom) {
      if (!wx.getStorageSync('SessionUserID')) {
        app.showLoading("登录中")
        CheckLoginStatus.checksession(() => {
          this.getBillMsg(1)
          this.setData({
            billBoxBottom: !this.data.billBoxBottom
          })
          wx.hideLoading()
        })
      } else if (!wx.getStorageSync('fxshopid')) {
        wx.navigateTo({
          url: '/pages/yshopset/yshopset'
        })
      } else {
        this.getBillMsg(1)
        this.setData({
          billBoxBottom: !this.data.billBoxBottom
        })
      }

    }

  },
  toAddBill() {
    wx.navigateTo({
      url: '/pages/creat_inventory/creat_inventory'
    })
  },
  //弹出分享框
  goshare: function() {
    if (this.data.msg.stock < 1) {
      app.promsg("商品库存不足, 请选购其他商品!")
      return
    }
    this.setData({
      showshare: [true, true]
    })
  },
  //关闭分享框
  closeshare: function(index) {
    //1是生成海报时观点弹出框但保留遮罩层
    if (index == 1) {
      this.setData({
        showshare: [true, false]
      })
    } else {
      sharebox.closeshare(this)
    }
  },
  //分享到朋友圈生成图片
  sharequan: function (that) {
    var that = this
    sharebox.sharequan(that, 2, 4)
  },
  //保存海报
  savehaibao: function (that) {
    var that = this
    sharebox.savehaibao(that)
  },
  //上下架
  addpro: function() {
    if (!this.data.isup) {
      if (this.data.msg.stock < 1) {
        app.promsg("商品库存不足, 请选择其它商品!")
        return
      }
      var pid = this.data.pid
      var name = this.data.msg.name
      var pic = this.data.msg.pic
      var salePrice = this.data.canShowRushBuy ? this.data.buyPrice : this.data.proPrice
      var marketPrice = this.data.msg.marketingprice
      wx.navigateTo({
        url: '/pages/addpro/addpro?pid=' + pid + '&name=' + name + '&pic=' + pic + '&salePrice=' + salePrice + '&marketPrice=' + marketPrice + '&indexIdx=' + this.data.indexIdx
      })
    } else {
      wx.showModal({
        title: '友情提示',
        content: "是否下架该商品?",
        success: (res) => {
          if (res.confirm) {
            util.http({
              url: app.globalData.siteUrl + '/Main/Member/UpProduct',
              data: {
                proid: this.data.pid,
                uid: wx.getStorageSync("SessionUserID"),
                state: 1
              },
              header: 1,
              successBack: (ret) => {
                if (ret && ret.data.status == 1) {
                  this.setData({
                    isup: false
                  })
                  wx.setStorageSync("indexIdx", [this.data.indexIdx, 0])
                  app.showtips("下架成功")
                }
              }
            })
          } else if (res.cancel) { }
        }
      })

    }

  },
  getMsg({ loading_icon = "1"}) {
    let msg = {
      productId: this.data.pid, //"170823132016269127",
      ruid: wx.getStorageSync('ruid') || wx.getStorageSync('SessionUserID'), //目标分享ID
      userid: wx.getStorageSync('SessionUserID'),
      fxshopid: wx.getStorageSync('fxshopid')
    }
    console.log(msg)
    util.http({
      url: app.globalData.siteUrl + '/Main/Main/GetProductDetailJson',
      data: msg,
      loading_icon: loading_icon,
      successBack: this.msgCallBack
    })
    this.getBillMsg(loading_icon)
  },
  getBillMsg(loading_icon) {
    util.http({//清单
      url: app.globalData.siteUrl + '/Main/Member/GetProList?devicetype=3',
      data: {
        currentPage: 1,
        pageSize: 100,
        uid: wx.getStorageSync('SessionUserID')
      },
      header: 1,
      loading_icon: loading_icon,
      successBack: (ret) => {
        if (ret && ret.data.success && ret.data.status == 1 && ret.data.Data.length > 0) {
          this.setData({
            billList: ret.data.Data
          })
        } else {
          app.alerts(ret.data.err, {showCancel: true})
        }

      }
    })
  },
  addBillList(e) {
    let prolistid = e.currentTarget.dataset.prolistid
    util.http({//清单
      url: app.globalData.siteUrl + '/Main/Member/InserProListItem?devicetype=3&uid=' + wx.getStorageSync('SessionUserID'),
      data: {
        prolistid: prolistid, 
        proid: this.data.msg.productid
      },
      method: "POST",
      header: 1,
      successBack: (ret) => {
        if (ret && ret.data.success && ret.data.status == 1) {
          app.showtips("添加清单成功")
          this.getBillMsg(1)
        } else {
          app.alerts(ret.data.err, {showCancel: true})
        }
        this.setData({
          billBoxBottom: false
        })
      }
    })
  },
  msgCallBack(ret) {
    console.log(ret)
    let propce = ''
    //创业礼包价格
    if (ret.data.Data.propackageprice!=0){
      propce=(ret.data.Data.propackageprice).toFixed(2)
    }else{
      propce = (ret.data.Data.saleprice).toFixed(2)
    }
    if (ret.data && ret.data.success && ret.data.status == 1) {
      this.setData({
        msg: ret.data.Data,
        proPrice: propce,
        zuan: (ret.data.Data.commPrice).toFixed(2),
        marketingprice: (ret.data.Data.marketingprice).toFixed(2),
        buyPrice: propce,
        isup: ret.data.Data.isup,
        maxCounts: ret.data.Data.maxbuycount,
        minCounts: ret.data.Data.minbuycount,
        nowStock: ret.data.Data.stock,
        buyCounts: ret.data.Data.minbuycount !== 0 ? ret.data.Data.minbuycount: 1
      })
      var album = JSON.parse(ret.data.Data.album)
      if (parseInt(album.hasPic) > 0) {
        this.setData({
          imgUrls: album.piclist
        })
      }
        WxParse.wxParse('exptaxation', 'html', ret.data.Data.exptaxation, this, 0);
      WxParse.wxParse('description', 'html', ret.data.Data.description, this, 0);
      this.getCouponMsg()   // 获取优惠券数据
    }
    //创业礼包赚
    if (ret.data.Data.propackageprice != 0 && wx.getStorageSync('fxshopid') != '' && wx.getStorageSync('SessionUserID') != ''){
    util.http({
      url: app.globalData.siteUrl + '/Main/Member/GetShopTitleComm?devicetype=3&uid=' + wx.getStorageSync('SessionUserID'),
      data: {
        yshopid: wx.getStorageSync('fxshopid')
      },
      header: 1,
      successBack: (ret) => {
        if(ret.data.success&&ret.data.status==1){
          this.setData({
            zuan: ret.data.Data
          })
        }
      }
    })
    }
    var skuMsg = {
      productId: this.data.pid
    }
    console.log(this.data.buyPrice)
    util.http({
      url: app.globalData.siteUrl + '/Main/Main/GetProductSkuJson',
      data: skuMsg,
      loading_icon: 1,
      successBack: this.skuMsgCallBack
    })

  },
  skuMsgCallBack(ret) {
    console.log(ret)
    var that=this
    if (ret.data.status == 1 && ret.data.Data != null) {
      let bus=''
      //创业礼包读另一个规格
      if (!that.data.isopenshop){
        bus = (ret.data.Data.sku[0].packageprice).toFixed(2)
      }else{
        bus= (ret.data.Data.sku[0].saleprice).toFixed(2)
      }
      this.setData({
        spec: ret.data.Data.spec,
        sku: ret.data.Data.sku,
        skutext: ret.data.Data.sku[0].skutext,
        specval: ret.data.Data.sku[0].specval,
        skuid: ret.data.Data.sku[0].skuid,
        buyPrice: bus,
        nowStock: ret.data.Data.sku[0].stock
      })
    }
    if (this.data.msg.rushbuy && this.data.msg.rushbuy.specjson) {
      let newSku = JSON.parse(this.data.msg.rushbuy.specjson)
      let { sku } = this.data
      if (sku.length) {
        for (let i in newSku) {
          sku[i].saleprice = newSku[i].Price
        }
      }
      this.setData({
        sku,
        buyPrice: Number(newSku[0].Price).toFixed(2)
      })
      let rushbuy = this.data.msg.rushbuy
      this.setData({
        rushbuyid: rushbuy.rushbuyid
      })
      let nowTime = Date.now()//1535767257000//new Date(new Date().setHours(11, 59, 50, 0)).getTime()//
      let startDate = Number(rushbuy.begintimeticks)
      let endDate = Number(rushbuy.endtimeticks)
      let surplusEndTime = (endDate - nowTime) /1000
      let surplusStartTime = (startDate - nowTime) / 1000
      if (!isNaN(startDate) && !isNaN(endDate) && startDate < nowTime && nowTime < endDate) {//进行中
        this.countDown(surplusEndTime, 1)
      } else if (nowTime < startDate) {//预告
        let a = startDate
        var timestamp_free = new Date(a)
        //that.getdate(timestamp_free)//处理ios和and转换不兼容问题
        var Date_time1 = (that.getdate(timestamp_free).replace(/\//g, '-') + ' ' + timestamp_free.toTimeString().substr(0, 8)).split(' ')[0].split('-')
        var Date_time2 = (that.getdate(timestamp_free).replace(/\//g, '-') + ' ' + timestamp_free.toTimeString().substr(0, 8)).split(' ')[1].split(':')
        let timeFree = this.data.timeFree
        timeFree.DY=Date_time1[0]
        timeFree.DM=Date_time1[1]
        timeFree.DD=Date_time1[2]
        timeFree.TH=Date_time2[0]
        timeFree.TM=Date_time2[1]
        timeFree.TS=Date_time2[2]
        this.setData({
          timeFree
        })
        this.countDown(surplusStartTime, 2)
        
      }else {
        this.setData({
          canShowRushBuy: 0,
          firstLoad: true
        })
      }
    }else {
      this.setData({
        firstLoad: true
      })
    }
  },
  //时间戳转换问题
 getdate(value) {
   var now = value,
     y = now.getFullYear(),
     m = ("0" + (now.getMonth() + 1)).slice(-2),
     d = ("0" + now.getDate()).slice(-2);
   return y + "-" + m + "-" + d + " " + now.toTimeString().substr(0, 8);
  },
  countDown(surplusTime, idx) {
    let { countDownTime, canShowRushBuy, timer} = this.data
    console.log(countDownTime)
    console.log(canShowRushBuy)
    console.log(timer)
    let times = surplusTime
    console.log(times)
    timer = setInterval(() => {
      times -= 1
      if (times > 0) {
        countDownTime.day = Math.floor(times / (60 * 60 * 24))
        countDownTime.hour = Math.floor(times / (60 * 60)) - (countDownTime.day * 24)
        countDownTime.minute = Math.floor(times / 60) - (countDownTime.day * 24 * 60) - (countDownTime.hour * 60)
        countDownTime.second = Math.floor(times) - (countDownTime.day * 24 * 60 * 60) - (countDownTime.hour * 60 * 60) - (countDownTime.minute * 60)
        canShowRushBuy = idx
        if(idx === 1) {
          countDownTime.hour += (countDownTime.day * 24) 
        }
      }else {
        clearInterval(timer)
        timer = null
        canShowRushBuy = 0
        countDownTime.day = 0
        countDownTime.hour = 0
        countDownTime.minute = 0
        countDownTime.second = 0
      }
      if (countDownTime.day < 10) { countDownTime.day = ("0" + parseInt(countDownTime.day))}
      if (countDownTime.hour < 10) { countDownTime.hour = ("0" + parseInt(countDownTime.hour)) }
      if (countDownTime.minute < 10) { countDownTime.minute = ("0" + parseInt(countDownTime.minute)) }
      if (countDownTime.second < 10) { countDownTime.second = ("0" + parseInt(countDownTime.second)) }
      this.setData({
        canShowRushBuy,
        countDownTime,
        timer,
        firstLoad: true
      })
      if(times <= 0) {
        this.getMsg({})
      }
    }, 1000)
  },
  changSku(e) {
    var that=this
    var oldspecval = this.data.specval.split(",")
    oldspecval[e.currentTarget.dataset.len] = e.currentTarget.dataset.valueid
    console.log(oldspecval)
    this.setData({
      specval: oldspecval.toString()
    })
    this.data.sku.forEach((item, idx) => {
      let bus = ''
      //创业礼包读另一个规格
      if (!that.data.isopenshop) {
        bus = Number(this.data.sku[idx].packageprice).toFixed(2)
      } else {
        bus = Number(this.data.sku[idx].saleprice).toFixed(2)
      }
      item.specval == this.data.specval && this.setData({
        skuid: this.data.sku[idx].skuid,
        specval: this.data.sku[idx].specval,
        skutext: this.data.sku[idx].skutext,
        buyPrice: bus,
        nowStock: this.data.sku[idx].stock
      })
      
    })
    console.log(this.data.buyPrice)
  },
  changeCounts(e) {
    var type = parseInt(e.currentTarget.dataset.counts)
    let maxCounts = this.data.maxCounts
    let minCounts = this.data.minCounts
    let nowStock = this.data.nowStock
    let buyCounts = this.data.buyCounts
    var timebuy=0//限时抢购限购
    if (this.data.msg.rushbuy){
      if (this.data.msg.rushbuy.buylimit){
        timebuy = this.data.msg.rushbuy.buylimit
      }
    }
    if (type == -1) {
      if ((minCounts === 0 || buyCounts > minCounts) && buyCounts > 1) {

      }else {
        return
      }
    }
    if(type == 1) {
      if ((maxCounts === 0 && buyCounts < nowStock) || (buyCounts < maxCounts && buyCounts < nowStock)) {
        //限时抢购判断
        if (timebuy != 0 && buyCounts >=timebuy){
          return
        }
      }else {
        return
      }
    }
    this.setData({
      buyCounts: this.data.buyCounts + type
    })
  },
  downloadImg(e) {
    //this.data.imgUrls
    let _this = this
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.writePhotosAlbum']) {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success() {
              _this.downLoadImgCall()
            },
            fail() {
              wx.openSetting({
                success: (ret) => {
                }
              })
            }
          })
        }else {
          _this.downLoadImgCall()
        }
      }
    })

  },
  downLoadImgCall() {
    wx.showLoading({
      title: '正在下载中',
    })
    let _this = this
    this.data.imgUrls.forEach((item, idx) => {
      wx.downloadFile({
        url: item,
        success: function (ret) {
          wx.saveImageToPhotosAlbum({
            filePath: ret.tempFilePath,
            success: function () {
              if (idx >= (_this.data.imgUrls.length - 1)) {
                wx.hideLoading()
                app.showtips("已保存到手机相册")
              }
            },
            fail: function (err) {
              wx.hideLoading()
            }
          })
        },
        fail: function (err) {
          wx.hideLoading()
        }
      })
    })
  },
  toCart(e) {
    var that=this
    if (!wx.getStorageSync('SessionUserID')) {
      app.showLoading("登录中")
      CheckLoginStatus.checksession(() => {
        wx.reLaunch({
          url: '/pages/shoppingcar/shoppingcar'
        })
        wx.hideLoading()
      })
    } else {
      wx.reLaunch({
        url: '/pages/shoppingcar/shoppingcar'
      })
    }
  },
  toIndex(e) {
    if (!wx.getStorageSync('SessionUserID') || !wx.getStorageSync('ruid')) {
      CheckLoginStatus.checksession(() => {
        wx.reLaunch({
          url: '/pages/index/index'
        })
        wx.hideLoading()
      })
    }else {
      wx.reLaunch({
        url: '/pages/index/index'
      })
    }
  },
  addCart(e) {
    //创业礼包不允许添加到购物车
    if(!this.data.isopenshop){
      app.promsg('此商品暂不支持加入购物车')
      return
    }
    if (!wx.getStorageSync('SessionUserID')) {
      app.showLoading("登录中")
      CheckLoginStatus.checksession(() => {
        this.addCartFunc()
        wx.hideLoading()
      })
    } else {
      this.addCartFunc()
    }


  },
  addCartFunc() {
    util.http({
      url: app.globalData.siteUrl + '/Main/Shopping/AddCart?devicetype=3&uid=' + wx.getStorageSync('SessionUserID'),
      method: "POST",
      data: {
        pId: this.data.pid,
        qty: this.data.buyCounts,
        uid: wx.getStorageSync('SessionUserID'),
        valids: this.data.specval,
        ruid: wx.getStorageSync('ruid') || wx.getStorageSync('SessionUserID'),
        rushbuyid: this.data.canShowRushBuy === 0 ? "" : this.data.rushbuyid
      },
      header: 1,
      successBack: (ret) => {
        if (ret && ret.data.Data && ret.data.status == 1) {
          app.showtips("添加购物车成功")
          this.setData({
            skuBoxBottom: false
          })
          this.getCartCounts()
        } else {
          app.alerts(ret.data.err, {showCancel: true})
        }
      }
    })
  },
  getCartCounts() {
    util.cartCounts({
      callBack: (ret) => {
        if (ret && ret.data.success && ret.data.status == 1 && ret.data.Data != null) {
          if (ret.data.Data > 0) {
            this.setData({
              cartCounts: ret.data.Data
            })
          } else {
            this.setData({
              cartCounts: 0
            })
          }
        }
      }
    })
  },
  buyNow(e) {
    var that = this
    if (!wx.getStorageSync('SessionUserID')) {
      app.showLoading("登录中")
      CheckLoginStatus.checksession(() => {
        this.buyNowFunc()
        wx.hideLoading()
      })
    } else {
      if (wx.getStorageSync('fxshopid')==''){
        that.jiaojian()
      }else{
        that.buyNowFunc()
      }
    }
  },
      //判断有没有购买过开店礼包
  jiaojian:function(){
    var that=this
    util.http({
      url: app.globalData.siteUrl + '/Main/Member/CheckFxShop',
      data: {
        uid: wx.getStorageSync('SessionUserID'),
        devicetype: 3
      },
      header: 1,
      successBack: (ret) => {
        console.log(ret)
        ret = ret.data
        if (ret.success) {
          if (ret.status == 1 && ret.fxshopId == '') {
            wx.navigateTo({
              url: '/pages/yshopset/yshopset',
            })
          }else{
            that.buyNowFunc()
          }
        } else {
          app.promsg(ret.err)
        }
      }
    })
  },
  buyNowFunc() {
    this.setData({
      skuBoxBottom: false
    })
    var that = this
    //创业礼包校检
    if (!that.data.isopenshop) {
      let data = {
        uid: wx.getStorageSync('SessionUserID'),
        packageid: that.data.dataoptions.packageid,
        buycount: that.data.buyCounts,
        skuid: that.data.skuid
      }
      util.http({
        url: app.globalData.siteUrl + '/Main/PackageShopping/CheckPackageBuyStatus?devicetype=3',
        data: data,
        header: 1,
        successBack: that.CheckProductBuyStatus
      })
    }else{
    //普通商品校检
    let data = {
      uid: wx.getStorageSync('SessionUserID'),
      pid: that.data.pid,
      buycount: that.data.buyCounts,
      skuid: that.data.skuid,
      rushbuyid: that.data.canShowRushBuy === 0 ? "" : that.data.rushbuyid
    }
    util.http({
      url: app.globalData.siteUrl + '/Main/Shopping/CheckProductBuyStatus?devicetype=3',
      data: data,
      header: 1,
      successBack: that.CheckProductBuyStatus
    })
    }
  },
  CheckProductBuyStatus(ret) {
    console.log(this.data.buyPrice)
    if (ret) {
      if (ret.data.status == 1) {
        //创业礼包校检
        var that=this
        let packid=''
        let way ='buynow'
         //创业礼包校检
        if (!that.data.isopenshop) {
          packid = that.data.dataoptions.packageid
          way ='jiedong'//创业礼包改变关键词
        }
        wx.navigateTo({
          url: '/pages/ordercomfirm/ordercomfirm?way=' + way + '&buyCounts=' + this.data.buyCounts + '&skutext=' + this.data.skutext + '&skuid=' + this.data.skuid + '&skuprice=' + this.data.buyPrice + '&pid=' + this.data.pid + '&packageid=' + packid + '&companyid=' + this.data.msg.companyid
        })
      } else {
        app.alerts(ret.data.err, {showCancel: true});
      }
    } else {
      app.promsg(err.msg);
    }
    wx.hideLoading()
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options)
    var that=this
    let isIphoneX = app.globalData.isIphoneX;
    this.setData({
      isIphoneX: isIphoneX,
      firstLoad: false,
      indexIdx: options.indexIdx
    })
    try {
      var res = wx.getSystemInfoSync()
      this.setData({
        windowHeight: res.windowHeight
      })
    } catch (e) {
      // Do something when catch error
    }
    let animation = wx.createAnimation({
      transformOrigin: "50% 50% 50%",
      duration: 800,
      timingFunction: "ease",
      delay: 500
    })
    this.animation = animation
    this.setData({
      isFirstGet: true
    })
    //一个二维码进来一个链接进来的,组成是ruid,压缩后的pid(2,52)
    //scene是二维码进来的
    if (options.scene) {
      var scene = decodeURIComponent(options.scene)
      util.diz(scene, 76, 11, that.secneset)
    }else{
      if (options.ruid) {
        if (options.ruid != wx.getStorageSync('SessionUserID')){
          wx.setStorageSync('ruid', options.ruid)
        }
      }
      //解冻专区进来的或者开店礼包app打开过来的
      if (options.type == "jiedong" || options.packageid){
        //隐藏转发按钮
        that.setData({
          isopenshop:false,
          dataoptions: options
        })
      }
      this.setData({
        pid: options.pid
      }) 
      this.getMsg({ loading_icon: 1 })
    }
    //查看分享活动是否开启
    util.http({
      url: app.globalData.siteUrl + '/marketing/redpackage/GetActivityStatus?devicetype=3',
      loading_icon:1,
      successBack: (ret) => {
        if (ret.data.success&&ret.data.status==1) {
          that.setData({
            shrespro: ret.data.Data.activitiesswitch
          })
        }
      }
    })
    //双十一日期
    this.setData({
      dayses: new Date().getDate(),
      monthses: new Date().getMonth() + 1
    })
  },
  secneset:function(ret){
    console.log(ret)
    let aall = []
    aall = ret.data.nValue.split("A")
    console.log(aall)
    if (aall[0] != wx.getStorageSync('SessionUserID')) {
      wx.setStorageSync('ruid', aall[0])
    }
    //aall[2]是创业礼包id
    if (aall[2]){
      this.setData({
        pid: aall[1],
        isopenshop: false,
        dataoptions: {
          packageid: aall[2]
        }
      }) 
    }else{
      this.setData({
        pid: aall[1]
      }) 
    }
    this.getMsg({})
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
      fxshopid: wx.getStorageSync('fxshopid'),
      ruid: wx.getStorageSync('ruid'), 
      uid: wx.getStorageSync('SessionUserID')
    })
    if (wx.getStorageSync('ruid') || wx.getStorageSync('fxshopid')) {
      this.getCartCounts()
    }
    if (this.data.isFirstGet) {
      this.setData({
        isFirstGet: false
      })
    }else {
      this.getMsg({ loading_icon: 1 })
    }
    this.animation.translateX(60).step()
    this.setData({
      animationData: this.animation.export()
    })
    //自己店铺信息
    if (wx.getStorageSync('SessionUserID') != '' || wx.getStorageSync('ruid') != '') {
      util.http({
        url: app.globalData.siteUrl + '/Main/Member/GetUserShopJson',
        data: {
          uid: wx.getStorageSync('SessionUserID'),
          ruid: wx.getStorageSync('ruid')
        },
        header: 1,
        loading_icon: 1,
        successBack: (ret) => {
          var that = this
          var ret = ret.data
          if (ret.status == 1 && ret.success) {
            that.setData({
              userinfo: ret.Data,
            })
          } else {
            app.promsg(ret.err)
          }
        }
      })
    }
  },
  handlerMove(e) {
    let animation = wx.createAnimation({
      transformOrigin: "50% 50% 50%",
      duration: 300,
      timingFunction: "ease",
      delay: 0
    })
    this.animation = animation
    this.animation.translateX(0).step()
    this.setData({
      animationData: this.animation.export()
    })
  },
  handlerEnd(e) {
    if (!this.data.isScrollAfter) {
      var timer = setTimeout(()=> {
        clearTimeout(timer)
        timer = null
        let animation = wx.createAnimation({
          transformOrigin: "50% 50% 50%",
          duration: 800,
          timingFunction: "ease",
          delay: 500
        })
        this.animation = animation
        this.animation.translateX(60).step()
        this.setData({
          animationData: this.animation.export()
        })
      }, 1000)
    }
  },
  onPageScroll(e) {
    this.setData({
      isScrollAfter: false
    })
    let animation = wx.createAnimation({
      transformOrigin: "50% 50% 50%",
      duration: 800,
      timingFunction: "ease",
      delay: 500
    })
    let bottom;
    wx.createSelectorQuery().select("#box_container").boundingClientRect((rect)=> {
      bottom = rect.bottom
      if (e.scrollTop === 0 || (bottom + 50) < this.data.windowHeight) {
        this.animation = animation
        this.animation.translateX(60).step()
        this.setData({
          animationData: this.animation.export(),
          scrollTop: e.scrollTop,
          isScrollAfter: true
        })
        return
      }
      // if (e.scrollTop !== this.data.scrollTop) {
        if ((e.scrollTop > this.data.scrollTop && this.data.scrollTop < (e.scrollTop - 1)) || e.scrollTop < this.data.scrollTop && this.data.scrollTop > (e.scrollTop + 1)) {
          this.setData({
            scrollTop: e.scrollTop
          })
        } else {
          this.animation = animation
          this.animation.translateX(60).step()
          this.setData({
            animationData: this.animation.export(),
            isScrollAfter: true
          })
        }

      // } else {

      // }
    }).exec()

  },
  gofukuang:function(){
    var that=this
    wx.navigateTo({
      url: '../ordercomfirm/ordercomfirm?way=jiedong&packageid=' + that.data.dataoptions.packageid + '&buynum=' + that.data.dataoptions.buynum
    })
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    this.clearTime()
    this.setData({
      firstLoad: false
    })
  },
  clearTime() {
    let timer = this.data.timer
    clearInterval(timer)
    timer = null
    this.setData({
      timer,
      canShowRushBuy: 0,
      countDownTime: {//剩余时间倒计时
        day: "00",
        hour: "00",
        minute: "00",
        second: "00"
      }
    })
  },
  // 
  showcoupon() {
    // 父调用子组件方法
    // this.selectComponent('#coupon').close()
    CheckLoginStatus.checksession(() => {
      console.log(111)
      this.setData({
        showCoupon: !this.data.showCoupon
      })
      wx.hideLoading()
      if (!this.data.hasGet && !this.data.unGet) {
        this.getCouponMsg()
      }
    })
    
  },
  gogongshang() {
    wx.navigateTo({
      url: '../other/gongshang/gongshang?img=' + this.data.msg.blurl
    })
  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    this.clearTime()
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function(e) {
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function(res) {
    console.log(this.data.msg.pic)
    if (res.from === 'button') {
      // 来自页面内转发按钮
    }
    var that=this
    var packid=''
    //如果是创业礼包
    if (!this.data.isopenshop) {
      packid=that.data.dataoptions.packageid
    }
    var Newruid = wx.getStorageSync("ruid") || wx.getStorageSync('SessionUserID')
    return {
      title: this.data.msg.name,
      imageUrl: this.data.msg.pic.replace('http://', 'https://'),
      path: '/pages/productdetail/productdetail?pid=' + this.data.msg.productid + '&ruid=' + Newruid + '&packageid=' + packid,
      success: function(res) {
        // 转发成功
        app.showtips('转发成功')
      },
      fail: function(res) {
        // 转发失败
        app.promsg('转发失败')
      }
    }

  },
  // 获取优惠券数据
  getCouponMsg() {
    var that = this
    if (!this.data.uid) return
    let data = {}
    let url = ''
    console.log('aa')
    console.log(this.data.msg.isrushbuy)
    if (this.data.msg.isrushbuy) {
      data = {
        uid: that.data.uid,
        ispaltform: 3,
        activityid: that.data.msg.rushbuy.rushbuyid
      }
      url = app.globalData.siteUrl + '/Marketing/Coupon/GetCouponListJson?devicetype=3'
    } else {
      data = {
        CompanyID: that.data.msg.companyid,
        uid: that.data.uid,
        proId: that.data.pid
      }
      url = app.globalData.siteUrl + '/Marketing/Coupon/GetCompanyPlatformCoupon'
    }
    
    util.http({
      url,
      data,
      loading_icon: 1,
      successBack: ret => {
        if (ret.data.success && ret.data.status == 1) {
          let arr = []
          // 接口不同 获取数据不同
          if (this.data.msg.isrushbuy) {
            arr = ret.data.Data
          } else {
            let CompanyData = ret.data.CompanyData
            let Platform = ret.data.Platform
            if (CompanyData.length) {
              CompanyData.forEach(item => {
                if (item.prolimit == 1) {
                  arr.push(item)
                }
              })
            }
            if (Platform.length) {
              Platform.forEach(item => {
                if (item.prolimit == 1) {
                  arr.push(item)
                }
              })
            }
          }
          if (arr.length) {
            var hasGet = []
            var unGet = []
            arr.forEach(item => {
              // isover 表示总数领取完了 或领取次数剩余0了 就加入已领取列表
              if (!item.isover && (item.eachamount - item.getnum) > 0 && item.couponType != 2) {
                unGet.push(item)
              } else {
                hasGet.push(item)
              }
            })
            if (!hasGet.length) hasGet = ''
            if (!unGet.length) unGet = ''
            this.setData({
              hasGet,
              unGet
            })
          }
        }
      }
    })
  },
})