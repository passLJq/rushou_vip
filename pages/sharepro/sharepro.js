// pages/sharepro/sharepro.js
const utils = require('../../utils/util.js')
const sharebox = require('../../Component/sharebox/sharebox.js')
const app = getApp()
var erweima
Page({

  /**
   * 页面的初始数据
   */
  data: {
      listdata:[],
    showshare: [false, true], //分享控制
    haibao:'',
    clcikindex:''//选择弹出的序号
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.hideShareMenu()
    var that = this
    utils.http({
      url: app.globalData.siteUrl + '/marketing/redpackage/GetActivitiesSharePro?devicetype=3',
      successBack: (ret) => {
        console.log(ret)
        if (ret.data.success && ret.data.status == 1&&ret.data.Data) {
          var data=JSON.parse(ret.data.Data)
          that.setData({
            listdata: data
          })
        } else {
          app.promsg(ret.data.err)
        }
      }
    })
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
  },
  goductdetail:function(e){
    var pid = e.currentTarget.dataset.pid
    wx.navigateTo({
      url: '../productdetail/productdetail?pid='+pid
    })

  },
  //弹出分享框
  goshare: function (e) {
    var indexse=e.currentTarget.dataset.index
    this.setData({
      showshare: [true, true],
      clcikindex: indexse
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
    }
  },
  //画布文字解析
  textfen: function (vaule, ctx, index) {
    if (vaule.length > 20) {
      ctx.fillText(vaule.substring(0, 19), 184, 405);
      ctx.fillText(vaule.substring(19, 39) + '...', 184, 435);
    } else if (vaule.length <= 20) {
      ctx.fillText(vaule.substring(0, 19), 184, 405);
    }
  },
  //通过接口压缩参数生成二维码
  sharequan: function () {
    var that = this
    wx.showLoading({
      title: '生成海报中...',
    })
    //清空海报
    that.setData({
      haibao: ''
    })
    var sece  = wx.getStorageSync('SessionUserID') + 'A' + that.data.listdata[that.data.clcikindex].pid
    console.log(sece)
    utils.diz(sece, 11, 76, function (ret) {
      that.erweimaimg(ret)
    })
  },
  erweimaimg: function (ret) {
    var that = this
    let id = ret.data.nValue
    erweima = app.globalData.siteUrl + '/Main/WechatApi/GetWxacodeun?scene='+ id + '&page=pages/productdetail/productdetail&width=430&devicetype=3'
    that.erweimaon()
  },
  erweimaon: function () {
    var that = this
    var ruid
    if (wx.getStorageSync('ruid') != '') {
      ruid = wx.getStorageSync('ruid')
    } else {
      ruid = wx.getStorageSync('SessionUserID')
    }
    var saveimg = [] //下载下来的本地路径
    //关闭分享框
    that.closeshare(1)
    const ctx = wx.createCanvasContext('canvasCircle1')
    //获取头像
    wx.getImageInfo({
      src: String(that.data.userinfo.shoplogo.replace('http://', 'https://')),
      //src: String("https://images.rushouvip.cn/W/201807/vvv.png"),
      success: function (res) {
        saveimg.push(res.path)
        //获取商品图
        wx.getImageInfo({
          //src: String("https://images.rushouvip.cn/W/201807/vvv.png"),
          src: String(that.data.listdata[that.data.clcikindex].src.replace('http://', 'https://')),
          success: function (resss) {
            saveimg.push(resss.path)
            //获取二维码
            wx.getImageInfo({
              //src: String("https://images.rushouvip.cn/W/201807/vvv.png"),
              src: String(erweima),
              success: function (eweima) {
                //获取图片完成 开始画画
                ctx.drawImage('../../image/shoreimg.jpg', 0, 0, 375, 650)
                //画头像 商品头像
                ctx.drawImage(saveimg[0], 155, 30, 72, 72)
                ctx.drawImage(saveimg[1], 115, 220, 150, 150)
                //头像框
                ctx.drawImage('../../image/headportrait.png', 155, 30, 72, 72)
                //写名字
                ctx.setFontSize(18)
                ctx.setTextAlign('center')
                ctx.fillText(that.data.userinfo.shopname, 191, 140)
                //第一个商品的信息
                ctx.setFontSize(16)
                ctx.setTextAlign('center')
                that.textfen(that.data.listdata[that.data.clcikindex].title, ctx);
                //价格
                ctx.setFontSize(18)
                ctx.setTextAlign('left')
                ctx.setFillStyle('#CDA86E')
                ctx.fillText('¥' + that.data.listdata[that.data.clcikindex].salePrice, 125, 470)
                ctx.setFontSize(14)
                ctx.setTextAlign('left')
                ctx.setFillStyle('#999')
                ctx.moveTo(215, 465)
                var width = 215 + ctx.measureText('¥' + that.data.listdata[that.data.clcikindex].marketPrice).width
                ctx.lineTo(width, 465)
                ctx.stroke()
                ctx.fillText('¥' + that.data.listdata[that.data.clcikindex].marketPrice, 215, 470)
                //小程序二维码
                ctx.drawImage(eweima.path, 155, 480, 72, 72)
                ctx.setFillStyle('#000')
                ctx.setFontSize(12)
                ctx.setTextAlign('center')
                ctx.fillText("长按识别即可看到商品", 190, 580)
                //最后绘画
                ctx.draw(false, function (e) {
                  wx.canvasToTempFilePath({
                    x: 0,
                    y: 0,
                    width: 375,
                    height: 600,
                    destWidth: 1125,
                    destHeight: 1800,
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
              //二维码
              fail: function (res) {
                wx.hideLoading()
                app.alerts('二维码图片获取失败')
              }
            })
          },
          //商品图片
          fail: function (res) {
            wx.hideLoading()
            app.alerts('商品图片获取失败')
          }
        })
      },
      //头像
      fail: function (res) {
        wx.hideLoading()
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
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    var that=this
    return {
      title: that.data.listdata[that.data.clcikindex].title,
      path: '/pages/productdetail/productdetail?pid=' + that.data.listdata[that.data.clcikindex].pid + '&ruid=' + wx.getStorageSync('SessionUserID'),
      imageUrl: that.data.listdata[that.data.clcikindex].src
    }
  
  }
})