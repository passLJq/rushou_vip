// pages/frinedsharp/frinedsharp.js
const sharebox = require('../../Component/sharebox/sharebox.js')
const utils = require('../../utils/util.js')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showshare: [false, true],
    haibao: '',
    userinfo:'',
    c_width:'1242',
    c_height:'2208'
  },
  //圆形头像
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
  //弹出分享框
  goshare: function (e) {
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
  },//分享到朋友圈生成图片
  sharequan: function () {
    var that = this
    var ruid
    wx.showLoading({
      title: '生成海报中...',
    })
    //清空海报
    that.setData({
      haibao: ''
    })
    if (wx.getStorageSync('ruid') != '') {
      ruid = wx.getStorageSync('ruid')
    } else {
      ruid = wx.getStorageSync('SessionUserID')
    }
      //二维码地址
    var erweima = app.globalData.siteUrl + '/Main/WechatApi/GetWxacodeun?scene=' + ruid + ',qiandao'+'&page=pages/index/index&width=430&is_hyaline=true&devicetype=3'
      console.log(erweima)
      //关闭分享框
      this.closeshare(1)
      var that = this
    const ctx = wx.createCanvasContext('canvasCircle1')
    wx.getImageInfo({
      src: String(that.data.userinfo.shoplogo.replace('http://', 'https://')),
      success: function (res) {
        //获取二维码
        wx.getImageInfo({
          //src: String("https://images.rushouvip.cn/W/201807/vvv.png"),
          src: String(erweima),
          success: function (eweima) {
            //获取背景图
            wx.getImageInfo({
              //src: String("https://images.rushouvip.cn/W/201807/vvv.png"),
              src: String("https://images.rushouvip.cn/IMG/qiandaohaobao.png"),
              success: function (backres) {
                //获取图片完成 开始画画
                ctx.drawImage(backres.path, 0, 0, 1242, 2208)
                //画头像
                that.circleImg(ctx, res.path, 515, 180, 120)
                ctx.drawImage(eweima.path, 455, 1280, 350, 350)
                //最后绘画
                ctx.draw(false, function (e) {
                  wx.canvasToTempFilePath({
                    x: 0,
                    y: 0,
                    width: 1242,
                    height: 2208,
                    destWidth: 2484,
                    destHeight: 4416,
                    quality: 1,
                    canvasId: 'canvasCircle1',
                    success: function (ret) {
                      wx.hideLoading()
                      that.setData({
                        haibao: ret.tempFilePath
                      })
                    },
                    fail: function () {
                      app.alerts('海报生成失败')
                      wx.hideLoading()
                    }
                  })
                })
              },
              fail: function () {
                wx.hideLoading()
                app.alerts('获取图片失败')
              }
            })
          },
          fail: function (rer) {
            wx.hideLoading()
            app.alerts('获取二维码失败')
          }
        })
      },
      fail:function(rer){
        wx.hideLoading()
        app.alerts('获取头像失败')
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
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
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
    return {
      title: '天天签到 天天领红包',
      path: '/pages/index/index?ruid=' + wx.getStorageSync('SessionUserID')+'&type=qiandao',
      imageUrl: 'https://images.rushouvip.cn/IMG/ai1.jpg'
    }
  }
})