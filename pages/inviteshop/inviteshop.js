// pages/inviteshop/inviteshop.js
const sharebox = require('../../Component/sharebox/sharebox.js')
const utils = require('../../utils/util.js')
const app=getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showshare: [false, true],
    haibao: '',
    userinfo: '',
    fenxianghaibao:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let isIphoneX = app.globalData.isIphoneX;
    this.setData({
      isIphoneX: isIphoneX
    })
  },
  tupian:function(){
    var that=this
    const ctx = wx.createCanvasContext('shenqin')
    //获取头像
    // wx.getImageInfo({
    //   //src: String("https://images.rushouvip.cn/W/201807/vvv.png"),
    //   src: String(that.data.userinfo.shoplogo.replace('http://', 'https://')),
    //   success: function (res) {
    //     //获取图片完成 开始画画
    //     ctx.drawImage('../../image/vv14.jpg', 0, 0, 750, 600)
    //     //画头像 商品头像
    //     ctx.drawImage(res.path, 293, 48, 144, 144)
    //     //最后绘画
    //     ctx.draw(false, function (e) {
    //       wx.canvasToTempFilePath({
    //         x: 0,
    //         y: 0,
    //         width: 750,
    //         height: 600,
    //         destWidth: 1500,
    //         destHeight: 1200,
    //         canvasId: 'shenqin',
    //         success: function (ret) {
    //           wx.hideLoading()
    //           that.setData({
    //             fenxianghaibao: ret.tempFilePath
    //           })
    //         }
    //       })
    //     })
    //   }
    // })
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
    //店铺信息分享使用
    utils.http({
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
      that.setData({
        userinfo: ret.Data
      })
    } else {
      app.promsg(ret.err)
    }
    this.tupian()
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
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    var that = this
    var ruid
    if (wx.getStorageSync('ruid') != '') {
      ruid = wx.getStorageSync('ruid')
    } else {
      ruid = wx.getStorageSync('SessionUserID')
    }
    return {
      title: '卖货神器 天天卖爆货 速来！！',
      path: 'pages/yshopapply/yshopapply?ruid=' + ruid,
      imageUrl: 'https://images.rushouvip.cn/IMG/csa1.jpg'
    }
  },
  //弹出分享框
  goshare: function () {
    wx.hideTabBar()
    this.setData({
      showshare: [true, true]
    })
  },
  //关闭分享框
  closeshare: function (index) {
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
  //画布文字解析
  textfen: function (vaule, ctx, index) {
    if (vaule.length > 26) {
      if (index == 1) {
        ctx.fillText(vaule.substring(0, 12), 150, 255);
        ctx.fillText(vaule.substring(12, 25) + "...", 150, 278);
      } else {
        ctx.fillText(vaule.substring(0, 12), 150, 360);
        ctx.fillText(vaule.substring(12, 25) + "...", 150, 380);
      }
    } else if (vaule.length <= 13) {
      if (index == 1) {
        ctx.fillText(vaule.substring(0, 12), 150, 255);
      } else {
        ctx.fillText(vaule.substring(0, 12), 150, 360);
      }
    } else if (vaule.length <= 26) {
      if (index == 1) {
        ctx.fillText(vaule.substring(0, 12), 150, 255);
        ctx.fillText(vaule.substring(12, vaule.length - 1), 150, 278);
      } else {
        ctx.fillText(vaule.substring(0, 12), 150, 360);
        ctx.fillText(vaule.substring(12, vaule.length - 1), 150, 380);
      }
    }
  },
  circleImg(ctx, img, x, y, r) {
    ctx.save();
    var d = 2 * r;
    var cx = x + r;
    var cy = y + r;
    ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    ctx.clip();
    ctx.drawImage(img, x, y, d, d);
    ctx.restore();
  },
  //分享到朋友圈生成图片
  sharequan: function () {
    var that = this
    var ruid
    if (wx.getStorageSync('ruid') != '') {
      ruid = wx.getStorageSync('ruid')
    } else {
      ruid = wx.getStorageSync('SessionUserID')
    }
    //二维码地址
    var erweima = app.globalData.siteUrl + '/Main/WechatApi/GetWxacodeun?scene=' + ruid +'&page=pages/yshopapply/yshopapply&width=430&devicetype=3'
    wx.showLoading({
      title: '生成海报中...',
    })
    //清空海报
    that.setData({
      haibao: ''
    })
    //关闭分享框
    this.closeshare(1)
    var fenxiangimgdata = [] //商品图片的网络路径
    var saveimg = [] //下载下来的本地路径
    var that = this
    const ctx = wx.createCanvasContext('canvasCircle1')
    //获取头像
    wx.getImageInfo({
      //src: String("https://images.rushouvip.cn/W/201807/vvv.png"),
      src: String(that.data.userinfo.shoplogo.replace('http://', 'https://')),
      success: function (res) {
        saveimg.push(res.path)
                //获取二维码
                wx.getImageInfo({
                  //src: String("https://images.rushouvip.cn/W/201807/vvv.png"),
                  src: String(erweima),
                  success: function (eweima) {
                    //获取图片完成 开始画画
                    ctx.drawImage('../../image/vv13.jpg', 0, 0, 375, 650)
                    //画头像 商品头像
                    that.circleImg(ctx, saveimg[0],148,60,45)
                    ctx.setFontSize(18)
                    ctx.setTextAlign('center')
                    ctx.fillText(that.data.userinfo.shopname, 191, 180)
                    //小程序二维码
                    ctx.drawImage(eweima.path, 118, 322, 140,140)
                    //最后绘画
                    ctx.draw(false, function (e) {
                      wx.canvasToTempFilePath({
                        x: 0,
                        y: 0,
                        width: 375,
                        height: 667,
                        destWidth: 750,
                        destHeight: 1334,
                        canvasId: 'canvasCircle1',
                        success: function (ret) {
                          wx.hideLoading()
                          that.setData({
                            haibao: ret.tempFilePath
                          })
                        }
                      })
                    })
                  },
                  //二维码图片
                  fail: function (res) {
                    wx.hideLoading()
                    app.alerts('二维码获取失败')
                  }
                })
      },
      //头像
      fail: function (res) {
        wx.hideLoading()
        console.log("0" + res)
        app.alerts('头像获取失败')
      }
    })

  },
  //保存海报
  savehaibao: function () {
    var that = this
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.writePhotosAlbum']) {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success() {
              //授权完成
              wx.saveImageToPhotosAlbum({
                filePath: that.data.haibao,
                success(res) {
                  app.promsg('保存成功')
                }
              })
            }
          })
        } else {
          wx.saveImageToPhotosAlbum({
            filePath: that.data.haibao,
            success(res) {
              app.promsg('保存成功')
            }
          })
        }
      }
    })
  },
})