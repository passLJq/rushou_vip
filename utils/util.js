const app_utils = getApp()
const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}
const http = ({method = "GET", url, data, header, successBack, errorBack, loading_icon = "default"}) => {
  if (loading_icon == "default") {
    app_utils.showLoading("正在加载中...")
  }
  let newHeader = ""
  if(header) {
    newHeader = {
      "Authorization": wx.getStorageSync("sessionkey"),
      "Content-Type": 'application/json; charset=utf-8'
    }
  }
  wx.request({
    url: url,
    method: method,
    data: data,
    header: newHeader,
    success(ret) {
      if (ret.statusCode == 403 ){
        if (wx.getStorageSync('statusCode')) {
          return
        }
        wx.setStorage({
          key: 'statusCode',
          data: '403',
          success: ()=> {
            app_utils.promsg('登录过期，请刷新页面或切换页面')
            app_utils.loginwx(1)
          }
        })
      }else{
        wx.setStorage({
          key: 'statusCode',
          data: '',
          success: () => {
            if (successBack) {
              successBack(ret)
            }
          }
        })

      }
      var timer = setTimeout(function(){
        clearTimeout(timer)
        timer = null
        wx.hideLoading()
        wx.stopPullDownRefresh()
      },500)
      
    },
    fail(err) {
      console.log(err)
      wx.hideLoading()
      if (errorBack) {
        errorBack(err)
      }else {
        if (err.errMsg =='request:fail '){
          app_utils.promsg('出错了，请检查网络~')
        }else{
          app_utils.promsg(err.errMsg)
        }
      }
      wx.stopPullDownRefresh()
    }
  })
}
// 购物车数量角标
const cartCounts = ({ callBack = ""})=> {
  http({
    url: app_utils.globalData.siteUrl + '/Main/Shopping/GetCartProCount',
    data: {
      uid: wx.getStorageSync("SessionUserID"),
      ruid: wx.getStorageSync("ruid") || wx.getStorageSync("SessionUserID")
    },
    header: 1,
    loading_icon: 1,
    successBack: (ret) => {
      callBack && callBack(ret)
    },
    fail(err) {
      app_utils.promsg(err)
    }
  })
}
//压缩参数
function diz(pid, formbase, tobase, callBack){
  wx.request({
    url: app_utils.globalData.siteUrl + '/main/WechatApi/BinaryConversionJson',
    data: {
      number: pid,
      frombase: formbase,
      tobase: tobase
    },
    success: function (ret) {
      if (ret.data.Data == '-1') {
        app_utils.alerts('商品id获取失败01')
        wx.hideLoading()
        return
      }else{
        callBack && callBack(ret)
      }
    },
    fail: function (err) {
      app_utils.promsg(err)
    }
  })
}
//前往解冻专区
function goopen_pro(){
  wx.navigateTo({
    url: '/pages/jiedong_pro/jiedong_pro'
  })
}
/************************
 * 描述：解析广告图片URL
 * 作者：DFM
 * 时间：2018-01-09
************************/
var AnalysisAdsUrl = {
  clickAds: function (type, title, ref) {
    console.log(type)
    console.log(ref)
    switch (type) {
      case '0': //外部链接
        wx.navigateTo({
          url: '/pages/websouer/websouer?url=' +escape(ref)
        })
        break;
      case '1': //商品分类
        wx.navigateTo({
          url: '/pages/prolist/prolist?clasid=' + ref
        })
        break;
      case '2': //商品品牌
        wx.navigateTo({
          url: '/pages/prolist/prolist?bid=' + ref
        })
        break;
      case '3': //商品详情
        wx.navigateTo({
          url: '/pages/productdetail/productdetail?pid='+ref
        })
        break;
      case '4': //栏目

        break;
      case '9': //一些特殊链接

        break;
      case '17': //产品品牌
        break;
      case '18': //产品详情
        break;
      case '19': //微官网栏目
        break;
      case '1005': //微拼购

        break;
      default: break;
    }
  },
  OpenSpecialLink: function (ref, title) {
    switch (ref) {
      case "user-index":  //用户中心

        break;
      case "shop-aboutus":    //关于我们
        break;
      case "shop-service":    //在线客服
        break;
      case "fxuser-index":     //分销用户中心
        break;
      case "shop-index":  //商城首页

        break;
      case "shop-prolist":  //商品列表

        break;
      case "shop-prolist-new":  //新品

        break;
      case "shop-prolist-promo":  //特价

        break;
      case "shop-prolist-hot":  //热卖

        break;
      case "shop-subscribe":  //加关注链接
        break;
      case "coupon-index":  //用户中心
        break;
      case "shop-cart":    //用户购物车
        break;
      case "user-order":    //订单中心
        break;
      case "user-collection":    //用户收藏夹
        break;
      case "shop-share":    //店铺分享
        break;
      case "shop-map":    //店铺地图
        break;
      case "groupbuy-list":  //微拼购列表
        break;
      case "shop-membercard": //会员卡
        break;
      case "fx_shop-index": //分销微店首页
        break;
      case "fx_shop-prolist": //分销微店商品列表
        break;
      case "fx_shop-prolist-new":  //分销微店新品
        break;
      case "fx_shop-prolist-promo":  //分销微店特价
        break;
      case "fx_shop-prolist-hot":  //分销微店热卖
        break;
      case "fxshop-cart":    //用户购物车
        break;
      case "fxshop-mycommission":    //我的返利
        break;
      case "fxshop-makecommission":    //分销赚返利(我要开店)
        break;
      case "coupon-list":             //领取优惠券
        break;
      case "fxshop-index"://分销店首页2016-8-16新增
        break;
      case "duobao"://分享夺宝列表
        break;
      case "groupbuylist"://拼团列表

        break;
      case "coupon_center"://领劵中心

        break;
      case "packageselect"://高佣专区

        break;
      case "our_buy"://官方自营

        break;
      case "openkaidian"://开店礼包

        break;
      default: break;
    }
  }

}
//直接开店
function openshop(){
 http({
   url: app_utils.globalData.siteUrl +'/Main/Member/CheckFxShop?devicetype=3',
   data: {
     uid: wx.getStorageSync("SessionUserID"),
   },
   header: 1,
   successBack: (ret) => {
     ret=ret.data
      console.log(ret)
     if (ret.status == 1 && ret.fxshopId != '') {
       wx.setStorageSync('fxshopid', ret.fxshopId)
       setTimeout(function () {
         wx.reLaunch({
           url: '/pages/index/index'
         })
       }, 500)
     } else {
       openshop()
     }
   }
 })
}
function kai(userimage){
  http({
    url: app_utils.globalData.siteUrl + '/Main/Member/FreeOpenShop?uid=' + wx.getStorageSync("SessionUserID") +'&devicetype=3',
    method: 'post',
    data: {
      uid: wx.getStorageSync("SessionUserID"),
      shopname: userimage.shopname,
      notice: '入手全球尖货，优选品质生活',
      code: userimage.code,
      txtwx: userimage.txtwx
    },
    header: 1,
    successBack: (ret) => {
      ret=ret.data
      console.log(ret)
      if (ret.status == 1 && ret.status==1){
        app_utils.promsg('开店成功')
        wx.setStorageSync('fxshopid', ret.Data.yshopid)
        setTimeout(function(){
          wx.reLaunch({
            url: '/pages/index/index'
          })
        },1000)
      }else{
        app_utils.promsg(ret.err)
      }
    }
  })
}
module.exports = {
  formatTime: formatTime,
  http,
  cartCounts,
  diz,
  goopen_pro,
  and: AnalysisAdsUrl,
  openshop
}
