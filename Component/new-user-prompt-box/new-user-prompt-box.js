// Component/new-user-prompt-box/new-user-prompt-box.js
const app = getApp()
const util = require("../../utils/util.js")
const CheckLoginStatus = require("../../utils/CheckLoginStatus.js")
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    showShopCoupon: { // 是否展示
      type: null,
      value: '',
      observer: function(newVal, oldVal) {
        if (newVal) {
          this.getCouponMsg()
          this.setData({
            NewshowShopCoupon: newVal
          })
        }

      }
    },
    uid: { // 用户ID
      type: null,
      value: '',
      observer: function(newVal, oldVal) {

      }
    },
    fxshopid: { // 开店ID
      type: null,
      value: '',
      observer: function(newVal, oldVal) {

      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    NewshowShopCoupon: false,//是否显示新实习店主送优惠券弹窗
    couponMsg: "",//优惠券数据
    animationData: {},//动画
    isLoading: false,//是否加载完
  },

  /**
   * 组件的方法列表
   */
  methods: {
    getCouponMsg() {
      this.setData({
        NewshowShopCoupon: false,
        isLoading: false
      })
      let data = wx.getStorageSync('fxshopid') ? { isfxshop: wx.getStorageSync('fxshopid')} : { isnewuser: 1}
      wx.request({
        url: app.globalData.siteUrl + '/Marketing/Coupon/GetCouponListJson?devicetype=3',
        method: "GET",
        data: data,
        success: (ret)=> {
          console.log(ret)
          if (ret && ret.data && ret.data.success && ret.data.status === 1 && ret.data.Data.length > 0) {
            let couponMsg = ""
            let data = []
            if (wx.getStorageSync('fxshopid')) {
              ret.data.Data.map(item => {
                if (item.couponType == 3) data.push(item)
              })
            } else {
              ret.data.Data.map(item => {
                if (item.couponType == 2) data.push(item)
              })
            }
            this.setData({
              NewshowShopCoupon: true,
              isLoading: true,
              couponMsg: data
            })
            this.triggerEvent("changeShopCoupon", this.data.NewshowShopCoupon)
          }else {
            this.setData({
              NewshowShopCoupon: false,
              isLoading: false
            })
            this.triggerEvent("changeShopCoupon", this.data.NewshowShopCoupon)
          }
          var timer = setTimeout(function () {
            clearTimeout(timer)
            timer = null
            wx.hideLoading()
          }, 500)
          wx.stopPullDownRefresh()
        },
        fail(err) {
          console.log(err)
          wx.hideLoading()
          wx.stopPullDownRefresh()
        }
      })

    },
    closeShopCoupon(e) {
      let type = e.currentTarget.dataset.type
      let btnName = e.currentTarget.dataset.name
      if (type !== "close") {
        return
      }
      let animation = wx.createAnimation({
        transformOrigin: "50% 50% 50%",
        duration: 300,
        timingFunction: "ease",
        delay: 0
      })
      this.animation = animation
      this.animation.translateY(500).step()
      this.setData({
        animationData: this.animation.export()
      })
      let timer = setTimeout(() => {
        clearTimeout(timer)
        timer = null
        this.setData({
          NewshowShopCoupon: false
        })
        this.triggerEvent("changeShopCoupon", this.data.NewshowShopCoupon)
      }, 300)
      if (btnName === "btnName") {
        let pages = getCurrentPages()
        let currentPage = pages[pages.length - 1]
        console.log(pages)
        if (!wx.getStorageSync('SessionUserID')) {
          app.showLoading("登录中")
          CheckLoginStatus.checksession("prompt_box")
        } else if (!wx.getStorageSync('fxshopid')) {
          if (currentPage.route.indexOf("yshopapply") !== -1) {
            wx.redirectTo({
              url: '/pages/yshopset/yshopset'
            })
          }else {
            wx.navigateTo({
              url: '/pages/yshopset/yshopset'
            })
          }

        }else {
          if (currentPage.route.indexOf("index/index") !== -1) {
            currentPage.onShow()
          }else {
            wx.reLaunch({
              url: '/pages/index/index'
            })
          }
          wx.hideLoading()
        }
      }

    }
  }
})