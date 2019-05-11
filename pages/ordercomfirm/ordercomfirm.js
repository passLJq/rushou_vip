// pages/addpro/ordercomfirm/ordercomfirm.js
const app = getApp()
const util = require("../../utils/util.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    inputValue: "",//输入的留言
    productMsg: "",//直接购买的商品信息
    options: "",//接收到的参数
    newPrice: "",//单价
    proAmount: "",//总价
    addressList: "",//收货地址
    addressId: "",//收货ID
    proNum: "",//商品总数量
    listMsg: "",//购物车进来的数据
    remark: "",//留言
    comfirmdata: "",//提交时的参数
    openshopdata:"",//开店礼包的数据
    isIphoneX: app.globalData.isIphoneX,
    cheshenfen:false,//全球购开启身份证校检
    isRushBuy: false,//限时抢购不能使用优惠券
    idcard:true,//提交时的校检
    userCouponId: "",//优惠券数据
    useCouponPrice: 0,//优惠券面值
    CouponsList: [],//去使用优惠券传过去的数据
    setpassword:'1',//是否设置钱包密码，1是设置了，0是没设置
    paywayclick:[false,true],//支付方式图标,
    payway: ['cashpay','wxpay'],//提交时用的支付方式
    payid: ['20170824112865489534','20180929145421231232'],//提交支付时的id
    howmoney:'0.00',//钱包余额
    fxshop: '',
    idcardnum:'',//身份证号码
    showpaybox:false,//是否展示密码输入框
    passwordright:false,//钱包密码是否正确
    password:'',//钱包密码
    isFocus:false,//输入框聚焦
    showcodes:'',//展示用的邀请码
    codes:'',//开店用的邀请码
    openinvite:false//打开填写邀请码的窗口
  },
  bindKeyInput: function (e) {
    this.setData({
      inputValue: e.detail.value
    })
  },
  toAddress(e) {
    wx.navigateTo({
      url: '/pages/other/address/address?addressId=' + e.currentTarget.dataset.addressId
    })
  },
  toSelectCoupon(e) {
    wx.setStorageSync("isComfirm", this.data.CouponsList)
    let rbid = this.data.productMsg.isrushbuy ? this.data.productMsg.rushbuy.rushbuyid : ''
    wx.navigateTo({
      url: '/pages/other/use_coupon/use_coupon?isComfirm=1',
    })
  },
  inputRemark(e) {
    this.setData({
      remark: e.detail.value
    })
  },
  submitOrders(e) {
    if (!this.data.addressList) return
    var that=this
    //全球购身份证校检
    if (!this.data.idcard) {
      app.promsg('请填写正确的身份证')
      return
    }
    if (!this.data.addressId) return
        //多商品时会拆单留言统一
    let { comfirmdata} = this.data
    comfirmdata.forEach((item)=> {
      item.remark = this.data.remark
    })
    this.setData({
      comfirmdata: comfirmdata
    })
    //支付方式选择
    var pays=''
    var payid=''
    for (var i = 0; i < that.data.paywayclick.length;i++){
      if (that.data.paywayclick[i]){
        pays = that.data.payway[i]
        payid = that.data.payid[i]
      }
    }
    //钱包支付时
    if (pays =='cashpay'){
      //没设置密码
      if (that.data.setpassword == 0) {
        app.alerts("您还没有设置钱包密码，请先去完成密码设置", {
          showCancel: false, confirmText: '去设置', successBack: (ret) => {
            wx.navigateTo({
              url: '/pages/other/password/password?type=0',
            })
          }
        })
        return
      }
      //如果密码错误或者没输入
      if (!that.data.passwordright){
          that.setData({
            showpaybox:true,
            password:''
          })
          return
      }else{
        //进这里代表密码正确重置密码状态
        that.setData({
          passwordright: false
        })
      }
    }
    //第一次购买开店礼包
    if (!wx.getStorageSync("fxshopid") && this.data.options.way == 'jiedong' && !this.data.codes){
      app.promsg('请填写邀请人')
      return
    }
    app.showLoading("请求中")
    if (this.data.options.way == "shoppingcart") {
      util.http({
        method: "POST",
        url: app.globalData.siteUrl + '/Main/ShoppingSinaPay/PayComfirmOrders?devicetype=3&uid=' + wx.getStorageSync("SessionUserID"),
        data: {
          memberid: wx.getStorageSync("SessionUserID"),//用户ID
          sourcetype: 0,
          addressid: this.data.addressId,//收货地址ID
          timeid: "",
          payid: payid,//支付ID
          paycode: pays,//支付标示标识
          data: this.data.comfirmdata,//购买参数
          usercoupons: this.data.userCouponId,
          devicemac: wx.getStorageSync("SessionUserID"),
          totalamount: this.data.proAmount, //总金额
          wxapplet: 1,//小程序标识
          ruid: wx.getStorageSync("ruid") || wx.getStorageSync("SessionUserID"), //当前目标店铺的UID
          formid: e ? e.detail.formId : ""
        },
        header: 1,
        successBack: this.submitBack,
        errorBack: (err)=> {
          app.promsg(err.msg)
        }
      })
      //解冻专区进来的也就是创业礼包
    } else if (this.data.options.way == "jiedong") {
      util.http({
        method: "POST",
        url: app.globalData.siteUrl + '/Main/ShoppingSinaPay/PayComfirmPackage?devicetype=3&uid=' + wx.getStorageSync("SessionUserID"),
        data: {
          memberid: wx.getStorageSync("SessionUserID"),
          isupgrade: "false",
          sourcetype: 0,
          addressid: that.data.addressId,
          timeid: "",
          payid: payid,//支付ID
          paycode: pays,//支付标示标识
          remark: that.data.remark,
          data: that.data.comfirmdata,
          devicemac: wx.getStorageSync("SessionUserID"),
          invitationcode: that.data.codes
        },
        header: 1,
        successBack: this.submitBack,
        errorBack: (err) => {
          app.promsg(err.msg)
        }
      })
      }else {
      util.http({
        method: "POST",
        url: app.globalData.siteUrl + '/Main/ShoppingSinaPay/PayComfirmOrdersNow?devicetype=3&uid=' + wx.getStorageSync("SessionUserID"),
        data: {
          memberid: wx.getStorageSync("SessionUserID"),//用户ID
          sourcetype: 0,
          addressid: this.data.addressId,//收货地址ID
          timeid: "",
          payid: payid,//支付ID
          paycode: pays,//支付标示标识
          gbid: "",
          opengroupid: "",
          data: this.data.comfirmdata,//购买参数
          usercoupons: this.data.userCouponId,
          rushbuyid: this.data.productMsg.isrushbuy && this.data.productMsg.rushbuy ? this.data.productMsg.rushbuy.rushbuyid : "",
          wxapplet: 1,//小程序标识
          ruid: wx.getStorageSync("ruid") || wx.getStorageSync("SessionUserID"),//当前目标店铺的UID
          devicemac: wx.getStorageSync("SessionUserID"),
          formid: e ? e.detail.formId : ""
        },
        header: 1,
        successBack: this.submitBack,
        errorBack: (err) => {
          app.promsg(err.msg)
        }
      })
    }

  },
  submitBack(ret) {
    console.log(ret)
    var that=this
    if (ret && ret.data.success && ret.data.status == 1 && ret.data.Data.paycode == 'wxpay' && ret.data.Data.payorderinfo != null && ret.data.Data.payorderinfo != "") {
      let payorderinfo = JSON.parse(ret.data.Data.payorderinfo)
      console.log(payorderinfo)
      //调用小程序支付
      wx.requestPayment({
        'timeStamp': payorderinfo.TimeStamp,
        'nonceStr': payorderinfo.NonceStr,
        'package': payorderinfo.Package,
        'signType': payorderinfo.SignType == '' ? 'MD5' : payorderinfo.SignType,
        'paySign': payorderinfo.Sign,
        'success': function (res) {
          console.log(res)
          if (that.data.options.way == "jiedong"){
            if (wx.getStorageSync("fxshopid")==''){
              that.data.xinxi.code=that.data.codes
              util.openshop()
              return
            }
          }
          wx.redirectTo({
            url: '/pages/other/success_page/success_page',
          })
        },
        'fail': function (err) {
          let errMsg = ""
          if (err.errMsg.indexOf("cancel") != -1) {
            errMsg = "中途取消支付操作，请到订单列表支付"
          }else {
            errMsg = "支付失败: " + err.errMsg+"! 请到订单列表支付"
          }
          wx.showModal({
            title: '支付提示',
            content: errMsg,
            showCancel: false,
            success: function (res) {
              if (res.confirm) {
                wx.navigateBack({
                  delta: 1
                })
              }
            }
          })
        }
      })
      //钱包支付返回
    } else if (ret && ret.data.success && ret.data.status == 1 && ret.data.Data.paycode == "cashpay" ){
      wx.redirectTo({
        url: '/pages/other/success_page/success_page',
      })
    }else {
      wx.showModal({
        title: '支付提示',
        content: ret.data.err,
        showCancel: false,
        success: function (res) {
          if (res.confirm) {
          }
        }
      })
    }
  },
  getMsg(ret) {
    if(ret) {
      var that=this
      console.log(ret)
      if(ret.data.success && ret.data.status == 1) {
        let comfirmdata = []//购物车提交的数据
        if (this.data.options.way == "shoppingcart") {
          if (ret.data.Data) {
            let arr = []
            this.setData({
              proAmount: parseFloat(ret.data.Data.proAmount).toFixed(2),
              proNum: ret.data.Data.proNum
            })
            for (let i in ret.data.Data.json) {
              arr.push({ title: "", content: [] })
              for (let r in ret.data.Data.json[i]) {
                //全球购商品判断
                if (ret.data.Data.json[i][r].iscross){
                  that.data.idcard = false
                  that.setData({
                    cheshenfen: true
                  })
                }
                //限时抢购商品判断不能使用优惠券
                if (ret.data.Data.json[i][r].isrushbuy) {
                  that.setData({
                    isRushBuy: true
                  })
                }
                arr[i].title = ret.data.Data.json[i][r].shopname
                arr[i].content.push(ret.data.Data.json[i][r])
                let isSame = false
                comfirmdata.forEach((item, index)=> {
                  if (item.companyId === ret.data.Data.json[i][r].shopid) {
                    item.cartItemsId += "," + ret.data.Data.json[i][r].id
                    isSame = true
                  }
                })
                let CouponsList = this.data.CouponsList
                CouponsList.push({
                  shopid: ret.data.Data.json[i][r].shopid,
                  productID: ret.data.Data.json[i][r].isrushbuy ? '' : ret.data.Data.json[i][r].proid,
                  proskuid: ret.data.Data.json[i][r].skuid,
                  buycount: ret.data.Data.json[i][r].qty,
                  RushBuyID: ret.data.Data.json[i][r].isrushbuy ? ret.data.Data.json[i][r].prorushbuy.rushbuyid : ''
                })
                this.setData({
                  CouponsList
                })
                if(!isSame) {
                  comfirmdata.push({
                    companyId: ret.data.Data.json[i][r].shopid,
                    companyName: ret.data.Data.json[i][r].shopname,
                    remark: this.data.remark,
                    delcode: "1",
                    freeFreight: 0,
                    cartItemsId: ret.data.Data.json[i][r].id,
                    proid: ret.data.Data.json[i][r].proid,
                    buynum: ret.data.Data.json[i][r].qty,
                    skuId: ret.data.Data.json[i][r].skuid
                  })
                }
              }
              console.log(comfirmdata)
            }
            this.setData({
              listMsg: arr,
              comfirmdata: comfirmdata
            })
          }
          //解冻专区进来的也就是创业礼包
        } else if (that.data.options.way == "jiedong") {
         comfirmdata.push({
           PackageID: that.data.options.packageid,
           BuyCount: that.data.options.buyCounts,
           SkuID: that.data.options.skuid,
           CompanyID: that.data.options.companyid
          })
          console.log(comfirmdata)
          let aloo = parseFloat((Number(that.data.options.skuprice) || Number(ret.data.Data[0][0].packageitems[0].propackageprice)) * Number(that.data.options.buyCounts)).toFixed(2)
          console.log(that.data.options.skutext)
          that.setData({
            openshopdata: ret.data.Data,
            comfirmdata: comfirmdata,
            proAmount: aloo
          })
        //立即购买的
        }else {
          if (ret.data.Data.iscross){
            that.data.idcard=false
          }else{
            that.data.idcard = true
          }
          //限时抢购商品判断不能使用优惠券
          if (ret.data.Data.isrushbuy) {
            that.setData({
              isRushBuy: true
            })
          }
          comfirmdata.push({
            companyId: ret.data.Data.companyid,
            companyName: ret.data.Data.shopname,
            remark: this.data.remark,
            delcode: "1",
            freeFreight: 0,
            cartItemsId: "",
            proid: ret.data.Data.productid,
            buynum: this.data.options.buyCounts,
            skuId: this.data.options.skuid
          })
          console.log(ret.data.Data)
          let CouponsList = this.data.CouponsList
          CouponsList.push({
            shopid: ret.data.Data.companyid,
            productID: ret.data.Data.isrushbuy ? '' : ret.data.Data.productid,
            proskuid: this.data.options.skuid,
            buycount: this.data.options.buyCounts,
            RushBuyID: ret.data.Data.isrushbuy ? ret.data.Data.rushbuy.rushbuyid : ''
          })
          let newPrices = 0
          if (ret.data.Data.rushbuy && ret.data.Data.rushbuy.specjson) {
            let newSku = JSON.parse(ret.data.Data.rushbuy.specjson)
            newPrices = this.data.options.skuid ? this.data.options.skuprice : Number(newSku[0].Price).toFixed(2)
          }
          console.log(newPrices)
          this.setData({
            productMsg: ret.data.Data,
            newPrice: newPrices || parseFloat(this.data.options.skuid ? this.data.options.skuprice : ret.data.Data.saleprice).toFixed(2),
            comfirmdata: comfirmdata,
            cheshenfen:ret.data.Data.iscross,
            CouponsList
          })
          this.setData({
            proAmount: (this.data.newPrice * this.data.options.buyCounts).toFixed(2)
          })
        }

      }else {
        app.promsg(ret.data.err)
      }
    }else {
      app.promsg(err.msg)
    }
  }, 
  BindAdress(ret) {
    if (ret) {
      if (ret.data.success && ret.data.status == 1 && ret.data.Data.length > 0) {
        this.setData({
          addressList: ret.data.Data[0],
          addressId: ret.data.Data[0].id
        })
      } else {
        this.setData({
          addressList: "",
          addressId: ""
        })
        app.promsg(ret.data.err)
      }
    } else {
      app.promsg(err.msg)
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      options: options,
      fxshop: wx.getStorageSync("fxshopid")
    })
    wx.setStorageSync("userCouponId", "")
    wx.setStorageSync("useCouponPrice", "")
    var that = this
    if (this.data.options.way == "buynow") {
      util.http({
        url: app.globalData.siteUrl + '/Main/Main/GetProductDetailJson', data: {
          productId: this.options.pid,
          yshopid: wx.getStorageSync('ruid') || wx.getStorageSync('fxshopid'),//目标分享ID
        }, successBack: this.getMsg
      })
    } else if (this.data.options.way == "shoppingcart") {
      util.http({
        url: app.globalData.siteUrl + '/Main/Shopping/GetCartJson?devicetype=3&uid=' + wx.getStorageSync("SessionUserID"),
        method: "POST",
        data: {
          uid: wx.getStorageSync("SessionUserID"),
          ids: this.data.options.ids,
          ruid: wx.getStorageSync("ruid") || wx.getStorageSync("SessionUserID")
        },
        header: 1,
        successBack: this.getMsg
      })
      //读取开店礼包的
    } else if (this.data.options.way == "jiedong") {
      //    
      if (wx.getStorageSync('ruid') != '' && wx.getStorageSync('fxshopid')==''){
      util.http({
        url: app.globalData.siteUrl + '/Main/Member/GetRecommendInvitationCode',
        data: { uid: wx.getStorageSync('ruid') },
        header: 1, 
        successBack:(ret)=>{
            if(ret.data.status==1&&ret.data.success){
              let showcodes = ret.data.reobj.name + '(' + ret.data.reobj.code+')'
              that.setData({
                showcodes: showcodes,
                codes: ret.data.reobj.code
                })
            }else{
              app.promsg(ret.err)
            }
        }
      })
    }
      util.http({
        url: app.globalData.siteUrl + '/Main/PackageShopping/GetPackageProJson?devicetype=3&uid=' + wx.getStorageSync("SessionUserID"),
        method: "POST",
        data: {
          packageids: that.options.packageid,
          type: 1
        },
        header: 1,
        successBack: this.getMsg
      })
    }
    this.getAddressMsg()
  },
  getAddressMsg() {
    util.http({
      url: app.globalData.siteUrl + '/Main/Shopping/GetAddressJson?devicetype=3', data: {
        uid: wx.getStorageSync('SessionUserID'),
      }, successBack: this.BindAdress, header: 1
    })
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
    var that=this
    this.getAddressMsg()
    //优惠券回来的数据
    let useCouponPrice = wx.getStorageSync("useCouponPrice")
    let userCouponId = wx.getStorageSync("userCouponId")
    if (userCouponId && userCouponId.length > 0) {
      userCouponId = userCouponId
    } else {
      userCouponId = ""
    }
    if (useCouponPrice) {
      useCouponPrice = useCouponPrice.toFixed(2)
    } else {
      useCouponPrice = 0
    }
    this.setData({
      userCouponId,
      useCouponPrice,
    })
    //获取会员信息
    util.http({
      url: app.globalData.siteUrl + '/Main/Member/GetMemberJson',
      method: "get",
      data: {
        uid: wx.getStorageSync("SessionUserID"),
        devicetype: 3
      },
      header: 1,
      successBack: (ret) => {
        console.log(ret)
        ret = ret.data
        if (ret.success && ret.status == 1) {
          that.setData({
            setpassword: ret.Data.paypwdisnull,
            howmoney: ret.Data.blance.toFixed(2),
            idcardnum: ret.Data.idcard,
            xinxi:{
              shopname:ret.Data.name,
              txtwx: ret.Data.phone
            }
          })
          if(ret.Data.idcard!=null){
            if (ret.Data.idcard.length == 18 && that.data.cheshenfen) {
              that.gocheackid()
            }
          }
        } else {
          app.promsg(ret.err)
        }
      }
    })
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
    wx.setStorageSync("userCouponId", "")
    wx.setStorageSync("useCouponPrice", "")
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
  
  },
  setidcard:function(e){
    this.setData({
      idcardnum: e.detail.value
    })
  },
  gocheackid:function(e){
    var that=this
    if (that.data.idcardnum.length==0){
      app.promsg('请填写身份证号')
      return
    }
    util.http({
      method: "POST",
      url: app.globalData.siteUrl + '/Main/Member/UserEdit?devicetype=3&uid=' + wx.getStorageSync("SessionUserID"),
      data: {
        uid: wx.getStorageSync("SessionUserID"),//用户ID
        idcard: that.data.idcardnum
      },
      header: 1,
      successBack: this.idcheck,
      errorBack: (err) => {
        app.promsg(err.msg)
      }
    })
  },
  idcheck:function(ret){
    var that=this
    ret=ret.data
    if(ret.status==1&&ret.success){
      app.promsg("身份证号校检成功");
      that.data.idcard=true
    }else{
      that.data.idcard = false
      app.promsg(ret.err);
    }
  },
  //选择支付方式
  xuanwho:function(e){
      var index=e.currentTarget.dataset.index
      let ase=[]
      for(var i=0;i<2;i++){
        ase.push(false)
      }
      ase[index]=true
      this.setData({
        paywayclick:ase
      })
  },
  //退出输入框
  hidepassword:function(){
    this.setData({
      showpaybox:false,
      password:''
    })
  },
  //输入框聚焦
  Tap:function(){
    this.setData({
      isFocus: true
    })
  },
  //输入框事件
  Focus:function(e){
    var that=this
    if (e.detail.value.length==6){
      util.http({
        url: app.globalData.siteUrl + '/Main/Member/UpdatePayPwd?devicetype=3&uid=' + wx.getStorageSync('SessionUserID'),
        method: 'post',
        data: {
          uid: wx.getStorageSync('SessionUserID'),
          paypwd: e.detail.value,
          type: 0 //1是设置密码，0是校检密码
        },
        header: 1,
        successBack: (ret) => {
          console.log(ret)
          if (ret.data.success && ret.data.status == 1) {
            that.setData({
              passwordright:true
            })
            //关闭输入框
            that.hidepassword()
            that.submitOrders()
          } else {
            app.promsg('密码错误')
            that.hidepassword()
          }
        }
      })
    }else{
        that.setData({
          password: e.detail.value
        })
    }
  },
  //组件内调用的方法
  showcode(e){
    console.log(e)
    this.setData({
      showcodes: e.detail.showcodes,
      codes: e.detail.codes
    })
    this.tianxieyaoqing()
  },
  tianxieyaoqing(){
    this.setData({
      openinvite: !this.data.openinvite
    })
  }
})