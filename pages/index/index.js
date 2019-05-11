// pages/class/class.js
const sharebox = require('../../Component/sharebox/sharebox.js')
const utils = require('../../utils/util.js')
const goTop = require('../../Component/goTop/goTop.js')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    banimgheight: '', //优选图片高度
    showshare: [false, true],
    yshopdata: [],
    listdata: [
      [],
      []
    ],
    page: [1, 1], //第几页
    pagesize: [10, 10], //每一页的数量
    noMore: [false, false], //没有更多数据
    noMsg: [false, false], //首次没有数据
    userinfo: '',
    dianstatus: 1, //首页状态1是看自己的，2是看其他人的但自己开店了，3事看其他人但自己没开店的状态
    btntext: '',
    imgecheck: [], //列表的录音图片
    haibao: '',
    qingdanlist: '', //清单id
    qindanimg: [], //清单的录音图片
    showShopCoupon: false, //是否显示新实习店主送优惠券弹窗
    fxshopid: "", //店铺ID
    uid: "", //用户ID
    showqiandao: false, //签到按钮
    hideqian: false, //前往签到隐藏
    navList: ["热销爆品", "大牌美妆"], //推荐列表
    slide: 0, //NAV下标
    martop: 0, //NAV距离顶部的距离
    canFixedTop: false, //是否固定顶部
    sharptye: 1 ,//哪只方式弹出分享的 1是分享店铺海报，2是分享店铺商品的海报
    sharpindex: '',//点击商品分享时的用的序号,
    rushBuyMsg: [//限时抢购数据
      [],
      [],
      [],
      [],
      [],
      [],
      []
    ],
    canShowMidAutumnFestival: false,//是否展示中秋节弹窗
    rushBuySlide: 0, //当前限时抢购NAV选中的下标
    iconPosition: 36.5, //限时抢购选中角标位置
    rushBuyNav: [{
        showTime: 18,
        yesterday: true,
        isNowDate: false, //是否是当前时刻
        time: "18:00",
        status: "昨日精选"
      },
      {
        showTime: 21,
        yesterday: true,
        isNowDate: false,
        time: "21:00",
        status: "昨日精选"
      },
      {
        showTime: 9,
        yesterday: false,
        isNowDate: false,
        time: "09:00",
        status: "预热中"
      },
      {
        showTime: 12,
        yesterday: false,
        isNowDate: false,
        time: "12:00",
        status: "预热中"
      },
      {
        showTime: 15,
        yesterday: false,
        isNowDate: false,
        time: "15:00",
        status: "预热中"
      },
      {
        showTime: 18,
        yesterday: false,
        isNowDate: false,
        time: "18:00",
        status: "预热中"
      },
      {
        showTime: 21,
        yesterday: false,
        isNowDate: false,
        time: "21:00",
        status: "预热中"
      },
      {
        showTime: "",
        yesterday: false,
        isNowDate: false,
        time: "09:00",
        status: "明日预告"
      }
    ],
    isLoaded: false, //限时抢购是否加载完成
    timer: null,//下个时间段倒计时
    tomorrowMsgArr: [],//临时存储限时抢购明天还进行的已进行订单
    nowIndex:0,//默认的下标
    daysnow:'',
    monthsnow: ''
  },
  // 限时抢购开始
  changeNav(e) {
    let idx = e.currentTarget.dataset.idx
    wx.createSelectorQuery().select('#scroll_0').boundingClientRect((rect) => {
      this.setData({
        rushBuySlide: idx,
        iconPosition: e.currentTarget.offsetLeft + Number(rect.width / 2)
      })
    }).exec();
    //this.data.rushBuyMsg[this.data.rushBuySlide].length < 1 && this.getMsg()
  },
  getRushBuyMsg({ progress }) {
    this.setData({
      isLoaded: false
    })
    utils.http({
      url: app.globalData.siteUrl + '/marketing/rushbuy/GetRushBuyListJson',
      data: {
        userid: wx.getStorageSync("SessionUserID"),
        fxshopid: wx.getStorageSync("fxshopid"),
        istoday: true
      },
      loading_icon: 1,
      successBack: (ret) => {
        let {
          rushBuyMsg,
          rushBuyNav,
          tomorrowMsgArr
        } = this.data
        rushBuyMsg = [
          [],
          [],
          [],
          [],
          [],
          [],
          []
        ]
        tomorrowMsgArr = []
        if (ret && ret.data.success && ret.data.status == 1 && ret.data.Data !== null && ret.data.Data.length > 0) {
          let data = ret.data.Data
          data.forEach((item, index) => {
            if (item.istoday) {
              for (let i = 0; i < rushBuyNav.length - 1; i++) {
                if (rushBuyNav[i].showTime === item.showtime && i > 1) {
                  rushBuyMsg[i].push(item)

                } else if (rushBuyNav[i].showTime === item.showtime && i < 2 && item.isyesteday) {
                  if (item.showtime === 18) {
                    rushBuyMsg[0].push(item)
                  } else if (item.showtime === 21) {
                    rushBuyMsg[1].push(item)
                  }

                }
              }
            }
            let tomorrowDate = new Date(new Date(new Date().setHours(0, 0, 0, 0)).getTime() + 24 * 60 * 60 * 1000).getTime()
            let nowDate = new Date(item.enddate.replace(/-/g, "/")).getTime()
            if (nowDate >= tomorrowDate) {
              tomorrowMsgArr.push(item)
            }
          })
        } else {
          app.promsg(ret.data.err)
        }
        this.setData({
          isLoaded: true,
          rushBuyMsg,
          tomorrowMsgArr
        })
        this.getTomorrow()
        progress()
      },
      errorBack(err) {
        this.setData({
          isLoaded: true
        })
        this.getTomorrow()
        progress()
      }
    })
  },
  getTomorrow() {
    utils.http({//明日预告
      url: app.globalData.siteUrl + '/marketing/rushbuy/GetRushBuyListJson',
      data: {
        userid: wx.getStorageSync("SessionUserID"),
        fxshopid: wx.getStorageSync("fxshopid"),
        istoday: false
      },
      loading_icon: 1,
      successBack: (ret) => {
        let {
          rushBuyMsg
        } = this.data
        rushBuyMsg.push([])
        if (ret && ret.data.success && ret.data.status == 1 && ret.data.Data !== null && ret.data.Data.length > 0) {
          let data = ret.data.Data
          data.forEach((item, index) => {
            var tomorrowDate = new Date(new Date(new Date().setHours(0, 0, 0, 0)).getTime() + 24 * 60 * 60 * 1000).getTime()
            var nowDate = new Date(item.enddate.replace(/-/g, "/")).getTime()
            if (nowDate >= tomorrowDate) {
              rushBuyMsg[rushBuyMsg.length - 1].push(item)
            }
          })
        } else {
          app.promsg(ret.data.err)
        }
        rushBuyMsg[rushBuyMsg.length - 1] = rushBuyMsg[rushBuyMsg.length - 1].concat(this.data.tomorrowMsgArr)
        let newRushBuyMsg = []
        for (var i = 0; i < rushBuyMsg[rushBuyMsg.length - 1].length; i++) {
          var flag = true
          for (var j = 0; j < newRushBuyMsg.length; j++) {
            if (rushBuyMsg[rushBuyMsg.length - 1][i].rushbuyid === newRushBuyMsg[j].rushbuyid) {
              flag = false
            }
          }
          if (flag) {
            newRushBuyMsg.push(rushBuyMsg[rushBuyMsg.length - 1][i])
          }
        }
        rushBuyMsg[rushBuyMsg.length - 1] = newRushBuyMsg
        this.setData({
          rushBuyMsg
        })
      },
      errorBack(err) {

      }
    })
  },
  getNowHours() {
    let now = new Date().getHours()
    let nowTime = Date.now()
    let nextTime = 0
    console.log(nowTime)
    let {
      rushBuyNav,
      rushBuySlide,
      timer,
      nowIndex
    } = this.data
    console.log(rushBuyNav.length)
    for (let i = 0; i < rushBuyNav.length - 1; i++) {
      let newI = parseInt(i) + 1
      if (now >= rushBuyNav[i].showTime && ((rushBuyNav[newI] && now < rushBuyNav[newI].showTime) || !rushBuyNav[newI])) {
        if (now < 9) { //是凌晨
          rushBuySlide = 1
          nowIndex = 1
        } else {
          rushBuySlide = parseInt(i)
          nowIndex = parseInt(i)
          nextTime = new Date(new Date().setHours(rushBuyNav[newI].showTime, 0, 0, 0)).getTime()
        }
      }
    }

    let remainingTime = nextTime - nowTime
    if (remainingTime>0){
      timer = setTimeout(() => {
        clearTimeout(this.data.timer)
        this.setData({
          timer: null
        })
        this.getNowHours()
      }, remainingTime) 
    }
    wx.createSelectorQuery().select('#scroll_0').boundingClientRect((rect) => {
      this.setData({
        iconPosition: Number(rect.width * rushBuySlide) + Number(rect.width / 2)
      })
    }).exec();
    this.setData({
      rushBuySlide,
      rushBuyNav,
      timer,
      nowIndex
    })
  },
  // 限时抢购结束
  toMidAutumnFestival(e) {
    wx.navigateTo({
      url: '/pages/websouer/websouer?url=https://i.rushouvip.cn/wtwo.html?a=1'
    })
  },
  closeMidAutumnFestival(e) {
    this.setData({
      canShowMidAutumnFestival: false
    })
  },
  changeShopCoupon(e) {
    this.setData({
      showShopCoupon: e.detail
    })
  },
  changeSlide(e) {
    this.setData({
      slide: parseInt(e.currentTarget.dataset.idx)
    })
    this.data.listdata[this.data.slide].length < 1 && this.getRecommend()

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let overTime = new Date('2018-12-20 00:00:00').getTime()
    let nowTime = new Date().getTime()
    if (nowTime <= overTime) {
      if (!wx.getStorageSync("canShowMidAutumnFestival")) {
        wx.setStorageSync("canShowMidAutumnFestival", nowTime)
        this.setData({
          canShowMidAutumnFestival: true
        })
      }
      if (((Date.now() - wx.getStorageSync("canShowMidAutumnFestival")) / 1000 / 86400) >= 1) {
        wx.setStorageSync("canShowMidAutumnFestival", nowTime)
        this.setData({
          canShowMidAutumnFestival: true
        })
      }
    }
    wx.setStorageSync("indexIdx", "")
    this.getRecommend()
    if (wx.getStorageSync("showShopCoupon") || !wx.getStorageSync("SessionUserID")) {
      wx.setStorageSync("showShopCoupon", "")
      this.setData({
        showShopCoupon: true
      })
    }
    //scene是二维码进来的
    var scene = decodeURIComponent(options.scene)
    var that = this
    //分享进来判断
    if (options.ruid || options.scene) {
      let aall = []
      aall = scene.split(",")
      //如果分享id等于自己的证明看自己的店
      if (options.ruid == wx.getStorageSync('SessionUserID') || aall[0] == wx.getStorageSync('SessionUserID')) {
        that.setData({
          dianstatus: 1,
          btntext: ''
        })
      } else {
        if (options.ruid) {
          wx.setStorageSync('ruid', options.ruid)
        }
        if (options.scene) {
          wx.setStorageSync('ruid', aall[0])
          //签到进来的
          if (aall[1] == "qiandao") {
            if (wx.getStorageSync('SessionUserID') && wx.getStorageSync('fxshopid')) {
              wx.navigateTo({
                url: '../signin/signin'
              })
            }
          }
        }
        if (wx.getStorageSync('fxshopid') != '') {
          that.setData({
            dianstatus: 2,
            btntext: '回自己店铺'
          })
        } else {
          that.setData({
            dianstatus: 3,
            btntext: '我也去开店'
          })
        }
      }
    }
    //签到进来的
    if (options.type == "qiandao") {
      if (wx.getStorageSync('SessionUserID') && wx.getStorageSync('fxshopid')) {
        wx.navigateTo({
          url: '../signin/signin'
        })
      }
    }
    //推荐列表的高度
    try {
      var res = wx.getSystemInfoSync()
      var height = (res.windowWidth / 2 - 20)
      height = height + 'px'
      that.setData({
        banimgheight: height
      })
    } catch (e) {
      // Do something when catch error
    }

    this.innerAudioContext = wx.createInnerAudioContext();
    this.innerAudioContext.onError((res) => {
      that.tip("播放录音失败！")
    })
    this.innerAudioContext.onEnded((res) => {
      //自然结束播放事件
      var imgs = []
      let qining = []
      for (var i = 0; i < that.data.yshopdata.length; i++) {
        imgs.push('../../image/CombinedShape.png')

      }
      for (var i = 0; i < that.data.qindanimg.length; i++) {
        qining.push('../../image/CombinedShape.png')
      }
      that.setData({
        imgecheck: imgs,
        qindanimg: qining
      })
    })
    //双十一日期
    this.setData({
      daysnow: new Date().getDate(),
      monthsnow:new Date().getMonth() + 1
    })
    
  },
  //头部回到自己店铺
  btngo: function(e) {
    var that = this
    if (that.data.dianstatus == 2) {
      if (wx.getStorageSync('fxshopid') != ''){
        wx.setStorageSync('ruid', "")
        that.onShow()
      }else{
        wx.setStorageSync('ruid', "")
        wx.reLaunch({
          url: '/pages/tz/tz',
        })
      }
    } else if (that.data.dianstatus == 3) {
      var types = e.currentTarget.dataset.type
      //签到活动有分享人红包带参数标识
      if (types == 'qiandao') {
      if (wx.getStorageSync('fxshopid') != '') {
          wx.navigateTo({
            url: '../signin/signin'
          })
        }else if (wx.getStorageSync('SessionUserID') != '') {
          wx.navigateTo({
            url: '../yshopset/yshopset?type=qiandao'
          })
        } else {
          wx.navigateTo({
            url: '../login/login?type=qiandao'
          })
        }
      }else {
        wx.navigateTo({
          url: '../yshopapply/yshopapply'
        })
      }
    }
  },
  //店铺数据
  yshopdata: function(ret) {
    var that = this
    var ret = ret.data
    if (ret.status == 1 && ret.success && ret.Data != null) {
      var ydata = ret.Data
      if (ydata == that.data.yshopdata) {
        return
      } else {
        var imgs = []
        for (var i = 0; i < ret.Data.length; i++) {
          imgs.push('../../image/CombinedShape.png')
        }
        that.setData({
          yshopdata: ydata,
          imgecheck: imgs
        })
      }
    } else if (ret.status == 1 && ret.success) {
      that.setData({
        yshopdata: []
      })
    }
  },
  listdata: function(ret) {
    let {
      listdata,
      noMore,
      noMsg
    } = this.data
    var that = this
    var ret = ret.data
    if (ret.status == 1 && ret.success && ret.Data.length > 0) {
      var lidata = ret.Data
      if (this.data.page[this.data.slide] === 1) {
        listdata[this.data.slide] = []
      }
      listdata[this.data.slide] = [...listdata[this.data.slide], ...lidata]
    } else {
      app.promsg(ret.err)
    }
    if (this.data.page[this.data.slide] === 1 && ret.Data.length < 1) {
      noMsg[this.data.slide] = true
    } else if (ret.Data.length < this.data.pagesize[this.data.slide] && this.data.page[this.data.slide] !== 1) {
      noMore[this.data.slide] = true
    }
    that.setData({
      listdata,
      noMore,
      noMsg,
      isLoadMsg: false
    })
  },
  //弹出分享框
  goshare: function(e) {
    var that=this
    let typeop = e.currentTarget.dataset.type
    let zuan=''
    if (typeop == 'pro') {
      that.data.sharpindex = e.currentTarget.dataset.index
      that.data.sharptye = 2
      zuan = that.data.yshopdata[that.data.sharpindex].commPrice.toFixed(2)
    } else if (typeop == "dianpu") {
      that.data.sharptye = 1
      zuan=''
    }
    wx.hideTabBar()
    this.setData({
      showshare: [true, true],
      zuan: zuan
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
      wx.showTabBar()
    }
  },
  //分享到朋友圈生成图片
  sharequan: function(that) {
    var that=this
    sharebox.sharequan(that, that.data.sharptye,1)
  },
  //保存海报
  savehaibao: function(that) {
    var that = this
    sharebox.savehaibao(that)
  },
  toProdetail(e) {
    wx.navigateTo({
      url: '/pages/productdetail/productdetail?pid=' + e.currentTarget.dataset.pid,
    })
  },
  //上架
  addpro: function(e) {
    var index = e.target.dataset.index
    var pid = e.target.dataset.pid
    var name = e.target.dataset.name
    var pic = e.target.dataset.pic
    let nowListdata = this.data.listdata[this.data.slide][index]
    var salePrice = nowListdata.isrushbuy && nowListdata.rushbuy ? Number(JSON.parse(nowListdata.rushbuy.specjson)[0].Price).toFixed(2) : e.target.dataset.saleprice
    var marketPrice = e.target.dataset.marketprice
    wx.navigateTo({
      url: '../addpro/addpro?pid=' + pid + '&name=' + name + '&pic=' + pic + '&salePrice=' + salePrice + '&marketPrice=' + marketPrice + '&index=' + index
    })
  },
  //打开访客记录
  openvisitor: function() {
    var that = this
    if (that.data.dianstatus == 1) {
      wx.navigateTo({
        url: '../visitor/visitor'
      })
    }
  },
  //打开店铺设置
  openyshopsetting: function() {
    var that = this
    if (that.data.dianstatus == 1) {
      wx.navigateTo({
        url: '../yshopsetting/yshopsetting'
      })
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function(state) {
    //判断是否开店了，没开店给一个默认的店铺
    if (wx.getStorageSync('fxshopid') == '' && wx.getStorageSync('ruid') == ''){
      wx.setStorageSync('ruid', '180201193348295937')
    }
    let indexIdx = wx.getStorageSync("indexIdx")
    if (indexIdx[0] !== "undefined" && indexIdx[0]) {
      let listdata = this.data.listdata
      if(indexIdx[0] instanceof Array) {
        listdata[this.data.slide].forEach((item, idx) => {
          indexIdx[0].forEach((idxArr, len) => {
            if (item.pid === idxArr) {
              listdata[this.data.slide][idx].isup = indexIdx[1]
            }
          })
        })
      }else {
        listdata[this.data.slide][indexIdx[0]].isup = indexIdx[1]
      }
      this.setData({
        listdata
      })
      wx.setStorageSync("indexIdx", "")
    }
    //其他页面进入时如果有录音就停止
    this.innerAudioContext.stop()
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
    this.setData({
      fxshopid: wx.getStorageSync('fxshopid'),
      uid: wx.getStorageSync('SessionUserID')
    })
    var that = this
    //再次校检进来判断
    if (wx.getStorageSync('ruid') != '') {
      if (wx.getStorageSync('fxshopid') != '') {
        that.setData({
          yshopdata: [],
          dianstatus: 2,
          btntext: '回自己店铺'
        })
      } else {
        that.setData({
          yshopdata: [],
          dianstatus: 3,
          btntext: '我也去开店'
        })
      }
    } else {
      that.setData({
        dianstatus: 1,
        btntext: ''
      })
    }
    var datas = {
      currpage: 1,
      pageSize: 200,
      uid: wx.getStorageSync('SessionUserID'),
      ruid: wx.getStorageSync('ruid') //这个没有就读自己店铺信息
    } //店铺用的参数
    //自己店铺信息
    utils.http({
      url: app.globalData.siteUrl + '/Main/Member/GetUserShopJson',
      data: {
        uid: wx.getStorageSync('SessionUserID'),
        ruid: wx.getStorageSync('ruid')
      },
      header: 1,
      successBack: this.usermeng
    })

    new Promise((resolve, reject) => {
      //上架的商品
      utils.http({
        url: app.globalData.siteUrl + '/Main/Main/GetYShopProductListJson',
        data: datas,
        successBack: (ret) => {
          this.yshopdata(ret)
          resolve()
        }
      })
    }).then(() => {
      return new Promise((resolve, reject) => {
        let progress = 0
        this.getRushBuyMsg({ progress: ()=> {
          progress ++
          } 
        })
        this.getNowHours()
        utils.http({
          url: app.globalData.siteUrl + '/Main/Member/GetProList?devicetype=3',
          data: {
            uid: lisuid,
            prolistid: "", //详情需要的
            ishomepage: 1
          },
          loading_icon: 1,
          successBack: (ret) => {
            if (ret && ret.data.success && ret.data.status == 1 && ret.data.Data.length > 0) {
              // billList = [...billList, ...ret.data.Data]
              // resolve(ret.data.Data)
              var imgs = []
              for (var i = 0; i < ret.data.Data.length; i++) {
                imgs.push('../../image/CombinedShape.png')
              }
              if (ret.data.Data == that.data.qingdanlist){
                that.setData({
                  qindanimg: imgs
                })
              }else{
                that.setData({
                  qingdanlist: ret.data.Data,
                  qindanimg: imgs
                })
              }
            } else {
              //清单列表
              that.setData({
                qingdanlist: [],
                qindanimg: []
              })
              app.promsg(ret.data.err)
            }
            progress++
          }, errorBack(err) {
            progress++
          }
        })
        let timer = setInterval(()=> {
          if (progress >= 2) {
            clearInterval(timer)
            timer = null
            resolve()
          }
        }, 100)
      })
    }).then((state) => {
      this.getRect()
    })

    //推荐列表
    if (state) {
      this.getRecommend()
    }
    var lisuid = wx.getStorageSync('SessionUserID')
    if (wx.getStorageSync('ruid') != '') {
      lisuid = wx.getStorageSync('ruid')
    }

    //判断百万签到活动入口是否开启
    this.getActivity()

  },
  getActivity() {
    utils.http({
      url: app.globalData.siteUrl + '/marketing/redpackage/GetActivityStatus?devicetype=3',
      successBack: (ret) => {
        if (ret.data.success) {
          this.setData({
            showqiandao: ret.data.Data.activitiesswitch,
          })
        }
        if (wx.getStorageSync("showShopCoupon") || !wx.getStorageSync("SessionUserID")) {
          wx.setStorageSync("showShopCoupon", "")
          this.setData({
            showShopCoupon: true
          })
        }
      },
      errorBack: (err) => {
        if (wx.getStorageSync("showShopCoupon") || !wx.getStorageSync("SessionUserID")) {
          wx.setStorageSync("showShopCoupon", "")
          this.setData({
            showShopCoupon: true
          })
        }
      }
    })
  },
  getRecommend(state) {
    utils.http({
      url: app.globalData.siteUrl + '/Main/Main/GetRecommendProductListJson',
      data: {
        currpage: this.data.page[this.data.slide],
        pageSize: this.data.pagesize[this.data.slide],
        ruid: wx.getStorageSync('ruid'),
        uid: wx.getStorageSync('SessionUserID'),
        pageType: this.data.slide === 0 ? 0 : 4
      },
      loading_icon: state,
      successBack: this.listdata
    })
  },
  usermeng: function(ret) {
    var that = this
    var ret = ret.data
    console.log(ret)
    if (ret.status == 1 && ret.success) {
      var isfreeze = '13456'
      //开放接口，不要把别人的fxshopid弄上去了
      if (ret.Data.yshopid && wx.getStorageSync('ruid')==''){
        wx.setStorageSync('fxshopid', ret.Data.yshopid)
      }
      //只有自己看的时候才弹出冻结
      if (wx.getStorageSync('ruid') == '') {
        isfreeze = ret.Data.isfreeze
      }
      that.setData({
        userinfo: ret.Data,
        isfreeze: isfreeze
      })
      wx.setNavigationBarTitle({
        title: that.data.userinfo.shopname
      })
    } else {
      app.promsg(ret.err)
    }
  },
  //播放
  pofan: function(e) {
    var that = this
    var viosrc = e.target.dataset.record
    var index = e.target.dataset.index
    var types = e.target.dataset.type
    var whodata
    //有两种播放 一种店铺列表商品一种清单列表商品
    if (types == 'qingdan') {
      whodata = that.data.qindanimg[index]
    } else {
      whodata = that.data.imgecheck[index]
    }
    let seimgs = [] //舒适化商品列表
    let qining = [] //初始化清单录音图片
    if (whodata == '../../image/CombinedShape1.gif') {
      that.innerAudioContext.stop()
      for (var i = 0; i < that.data.imgecheck.length; i++) {
        seimgs.push('../../image/CombinedShape.png')
      }
      for (var i = 0; i < that.data.qindanimg.length; i++) {
        qining.push('../../image/CombinedShape.png')
      }
      that.setData({
        imgecheck: seimgs,
        qindanimg: qining
      })
    } else {
      that.innerAudioContext.src = viosrc;
      that.innerAudioContext.play()
      for (var i = 0; i < that.data.imgecheck.length; i++) {
        seimgs.push('../../image/CombinedShape.png')
      }
      for (var i = 0; i < that.data.qindanimg.length; i++) {
        qining.push('../../image/CombinedShape.png')
      }
      if (types == 'qingdan') {
        qining[index] = '../../image/CombinedShape1.gif'
        that.setData({
          imgecheck: seimgs,
          qindanimg: qining
        })
      } else {
        seimgs[index] = '../../image/CombinedShape1.gif'
        that.setData({
          imgecheck: seimgs,
          qindanimg: qining
        })
      }
    }
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    this.innerAudioContext.stop()
    this.setData({
      showShopCoupon: false
    })
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
    var that = this
    that.setData({
      listdata: [
        [],
        []
      ],
      page: [1, 1],
      noMsg: [false, false],
      noMore: [false, false]
    })
    this.onShow(1)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    let {
      page,
      isLoadMsg
    } = this.data
    if (isLoadMsg) return
    if (!this.data.noMore[this.data.slide] || (!this.data.page[this.data.slide] === 1 && !this.data.noMsg[this.data.slide])) {
      isLoadMsg = true
      page[this.data.slide] += 1
      this.setData({
        page,
        isLoadMsg
      })
      this.getRecommend("isPullUp")
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function(res) {
    var that = this
    var ruid
    if (wx.getStorageSync('ruid') != '') {
      ruid = wx.getStorageSync('ruid')
    } else {
      ruid = wx.getStorageSync('SessionUserID')
    }
    if (res.from === 'button') {
      //1是分享店铺的，2是分享商品的
      if (that.data.sharptye == 1) {
        return {
          title: that.data.userinfo.shopname,
          path: 'pages/index/index?ruid=' + ruid,
          imageUrl: 'https://images.rushouvip.cn/IMG/sae.jpg'
        }
      } else if (that.data.sharptye == 2) {
        return {
          title: that.data.yshopdata[that.data.sharpindex].name,
          path: '/pages/productdetail/productdetail?pid=' + that.data.yshopdata[that.data.sharpindex].pid + '&ruid=' + ruid,
          imageUrl: that.data.yshopdata[that.data.sharpindex].pic
        }
      }
    }
    if (res.from === "menu") {
      return {
        title: that.data.userinfo.shopname,
        path: 'pages/index/index?ruid=' + ruid,
        imageUrl: 'https://images.rushouvip.cn/IMG/sae.jpg'
      }
    }
  },
  okshop: function() {
    var that = this
    var a = that.data.userinfo
    a.isshowtip = false
    that.setData({
      userinfo: a
    })
  },
  //NAV距离头部的距离
  getRect: function () {
    try {
      wx.createSelectorQuery().select('#NAV').boundingClientRect((rect) => {
        rect && this.setData({
          martop: rect.height
        })
      }).exec()
    } catch (err) {

    }
  },
  onPageScroll: function(e) { // 获取滚动条当前位置
    var that = this
    goTop.onPageScrolls(e, that)
    if (e.scrollTop > this.data.martop) {
      that.setData({
        canFixedTop: true
      })
    } else {
      that.setData({
        canFixedTop: false
      })
    }
  },
  goTops: function() {
    goTop.goTops()
  },
  //上架成功改变数据
  addsuccess: function(index) {
    var that = this
    let listdata = this.data.listdata
    listdata[this.data.slide][index].isup = 1
    that.setData({
      listdata
    })
  },
  //下架商品
  downpro: function(e) {
    var datas = {
      currpage: 1,
      pageSize: 200,
      uid: wx.getStorageSync('SessionUserID'),
      ruid: wx.getStorageSync('ruid') //这个没有就读自己店铺信息
    } //店铺用的参数
    var that = this
    let indexse = e.currentTarget.dataset.index
    wx.showModal({
      title: '友情提示',
      content: "是否下架该商品?",
      success: (res) => {
        if (res.confirm) {
          utils.http({
            url: app.globalData.siteUrl + '/Main/Member/UpProduct',
            data: {
              proid: this.data.yshopdata[indexse].pid,
              uid: wx.getStorageSync("SessionUserID"),
              state: 1
            },
            header: 1,
            successBack: (ret) => {
              if (ret && ret.data.status == 1) {
                app.showtips("下架成功")
                utils.http({
                  url: app.globalData.siteUrl + '/Main/Main/GetYShopProductListJson',
                  data: datas,
                  successBack: that.yshopdata
                })
              }
            }
          })
        } else if (res.cancel) {}
      }
    })
  },
  //商品管理
  gocreadorder: function() {
    wx.navigateTo({
      url: '/pages/productbill/productbill'
    })
  },
  //修改商品设置
  goxiugai: function(e) {
    var that = this
    let indexs = e.currentTarget.dataset.index
    let yshop = that.data.yshopdata[indexs]
    wx.navigateTo({
      url: '../addpro/addpro?pid=' + yshop.pid + '&name=' + yshop.name + '&pic=' + yshop.pic + '&salePrice=' + yshop.salePrice + '&marketPrice=' + yshop.marketPrice + '&index=' + indexs + '&type=xiugai' + '&record=' + yshop.record + '&recordtime=' + yshop.recordtime + '&share=' + yshop.share + '&relid=' + yshop.relid
    })
  },
  //前往解冻专区
  gobuy_openshop: function() {
    utils.goopen_pro()
  },
  //前往签到
  goqiandao: function() {
    wx.navigateTo({
      url: '../signin/signin'
    })
  },
  hideyemian: function() {
    this.setData({
      hideqian: true
    })
  },
  toRushBuy(e) {
    wx.navigateTo({
      url: '/pages/rushbuy_list/rushbuy_list'
    })
  }
})