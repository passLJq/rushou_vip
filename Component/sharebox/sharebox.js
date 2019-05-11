const app = getApp()
const utils = require('../../utils/util.js')

function noscoll() {
  //禁止遮罩层滑动
}

function closeshare(that) {
  that.setData({
    showshare: [false, true]
  })
}
//画布文字解析
function textfen(vaule, ctxs, index) {
  if (vaule.length > 20) {
    if (index == 1) {
      ctxs.fillText(vaule.substring(0, 10), 150, 255);
      ctxs.fillText(vaule.substring(10, 18) + "...", 155, 278);
    } else {
      ctxs.fillText(vaule.substring(0, 10), 150, 380);
      ctxs.fillText(vaule.substring(10, 18) + "...", 155, 400);
    }
  } else if (vaule.length <= 13) {
    if (index == 1) {
      ctxs.fillText(vaule.substring(0, 12), 150, 255);
    } else {
      ctxs.fillText(vaule.substring(0, 12), 150, 380);
    }
  } else if (vaule.length <= 20) {
    if (index == 1) {
      ctxs.fillText(vaule.substring(0, 10), 150, 255);
      ctxs.fillText(vaule.substring(12, vaule.length - 1), 155, 278);
    } else {
      ctxs.fillText(vaule.substring(0, 10), 150, 380);
      ctxs.fillText(vaule.substring(10, vaule.length - 1), 155, 400);
    }
  }
}
//分享到朋友圈生成图片
//sharptye 1是首页店铺海报 2是商品分享海报 
//wheretype 1是index分享海报的  2是class分享海报的 3是prolist分享海报的
function sharequan(that, sharptye, wheretype) {
  var sharethis = this
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
  //参数的2没有用，只是为了分享好解析
  //生成店铺海报
  if (sharptye == 1) {
    //二维码地址
    var erweima = app.globalData.siteUrl + '/Main/WechatApi/GetWxacodeun?scene=' + ruid + ',2&page=pages/index/index&width=430&devicetype=3'
    console.log(erweima)
    //关闭分享框
    that.setData({
      showshare: [true, false]
    })
    var fenxiangimgdata = [] //商品图片的网络路径
    var saveimg = [] //下载下来的本地路径
    var protext = [] //商品文字
    var proice = [] //商品价格和成本价
    //不同情况下拿的数据
    console.log(that.data.yshopdata.length)
    if (that.data.yshopdata.length >= 2) {
      fenxiangimgdata.push(that.data.yshopdata[0].pic, that.data.yshopdata[1].pic)
      protext.push(that.data.yshopdata[0].name, that.data.yshopdata[1].name)
      proice.push(that.data.yshopdata[0].salePrice.toFixed(2), that.data.yshopdata[0].marketPrice.toFixed(2),
        that.data.yshopdata[1].salePrice.toFixed(2), that.data.yshopdata[1].marketPrice.toFixed(2))
    } else if (that.data.yshopdata.length == 1) {
      fenxiangimgdata.push(that.data.yshopdata[0].pic, that.data.listdata[0][0].pic)
      protext.push(that.data.yshopdata[0].name, that.data.listdata[0][0].name)
      proice.push(that.data.yshopdata[0].salePrice.toFixed(2), that.data.yshopdata[0].marketPrice.toFixed(2),
        that.data.listdata[0][1].salePrice.toFixed(2), that.data.listdata[0][1].marketPrice.toFixed(2))
    } else if (that.data.yshopdata.length == 0) {
      console.log(that.data.listdata[0][0].pic)
      console.log(that.data.listdata[0][1].pic)
      fenxiangimgdata.push(that.data.listdata[0][0].pic, that.data.listdata[0][1].pic)
      protext.push(that.data.listdata[0][0].name, that.data.listdata[0][1].name)
      proice.push(that.data.listdata[0][0].salePrice.toFixed(2), that.data.listdata[0][0].marketPrice.toFixed(2),
        that.data.listdata[0][1].salePrice.toFixed(2), that.data.listdata[0][1].marketPrice.toFixed(2))
    }
    const ctxs = wx.createCanvasContext('canvasCircle1')
    console.log(fenxiangimgdata)
    //获取头像
    wx.getImageInfo({
      //src: String("https://images.rushouvip.cn/W/201807/vvv.png"),
      src: String(that.data.userinfo.shoplogo.replace('http://', 'https://')),
      success: function(res) {
        saveimg.push(res.path)
        //获取第一个商品图
        wx.getImageInfo({
          //src: String("https://images.rushouvip.cn/W/201807/vvv.png"),
          src: String(fenxiangimgdata[0].replace('http://', 'https://')),
          success: function(ress) {
            saveimg.push(ress.path)
            //获取第二个商品图
            wx.getImageInfo({
              //src: String("https://images.rushouvip.cn/W/201807/vvv.png"),
              src: String(fenxiangimgdata[1].replace('http://', 'https://')),
              success: function(resss) {
                saveimg.push(resss.path)
                //获取二维码
                wx.getImageInfo({
                  //src: String("https://images.rushouvip.cn/W/201807/vvv.png"),
                  src: String(erweima),
                  success: function(eweima) {
                    //获取图片完成 开始画画
                    ctxs.drawImage('../../image/shoreimg.jpg', 0, 0, 375, 650)
                    //画头像 商品头像
                    ctxs.drawImage(saveimg[0], 155, 30, 72, 72)
                    ctxs.drawImage(saveimg[1], 30, 230, 96, 96)
                    ctxs.drawImage(saveimg[2], 30, 356, 96, 96)
                    //头像框
                    ctxs.drawImage('../../image/headportrait.png', 155, 30, 72, 72)
                    //写名字
                    ctxs.setFontSize(18)
                    ctxs.setTextAlign('center')
                    ctxs.fillText(that.data.userinfo.shopname, 191, 140)
                    //第一个商品的信息
                    ctxs.setFontSize(16)
                    ctxs.setTextAlign('left')
                    sharethis.textfen(protext[0], ctxs, 1)
                    ctxs.setFontSize(18)
                    ctxs.setTextAlign('left')
                    ctxs.fillText('¥' + proice[0], 150, 315)
                    ctxs.setFontSize(14)
                    ctxs.setTextAlign('left')
                    ctxs.setFillStyle('#999')
                    ctxs.moveTo(290, 310)
                    var width = 292 + ctxs.measureText('¥' + proice[1]).width
                    ctxs.lineTo(width, 310)
                    ctxs.stroke()
                    ctxs.fillText('¥' + proice[1], 290, 315)
                    //第二个商品的信息
                    ctxs.setFillStyle('#000')
                    ctxs.setFontSize(16)
                    ctxs.setTextAlign('left')
                    sharethis.textfen(protext[1], ctxs, 2)
                    ctxs.setFontSize(18)
                    ctxs.setTextAlign('left')
                    ctxs.fillText('¥' + proice[2], 150, 440)
                    ctxs.setFontSize(14)
                    ctxs.setTextAlign('left')
                    ctxs.setFillStyle('#999')
                    ctxs.moveTo(290, 435)
                    ctxs.setFillStyle('#999')
                    var width = 292 + ctxs.measureText('¥' + proice[3]).width
                    ctxs.lineTo(width, 435)
                    ctxs.stroke()
                    ctxs.fillText('¥' + proice[3], 290, 440)
                    //小程序二维码
                    ctxs.drawImage(eweima.path, 155, 480, 72, 72)
                    ctxs.setFillStyle('#000')
                    ctxs.setFontSize(12)
                    ctxs.setTextAlign('center')
                    ctxs.fillText("长按识别即可看到商品", 190, 580)
                    //最后绘画
                    ctxs.draw(false, function(e) {
                      wx.canvasToTempFilePath({
                        x: 0,
                        y: 0,
                        width: 375,
                        height: 600,
                        destWidth: 1125,
                        destHeight: 1800,
                        quality: 1,
                        canvasId: 'canvasCircle1',
                        success: function(ret) {
                          wx.hideLoading()
                          that.setData({
                            haibao: ret.tempFilePath
                          })
                        }
                      })
                    })
                  },
                  //二维码图片
                  fail: function(res) {
                    wx.hideLoading()
                    app.alerts('二维码获取失败')
                  }
                })
              },
              //第二个商品图片
              fail: function(res) {
                wx.hideLoading()
                console.log('2' + res)
                app.alerts('商品二图片获取失败')
              }
            })
          },
          //第一个商品图片
          fail: function(res) {
            wx.hideLoading()
            console.log("1" + res)
            app.alerts('商品一图片获取失败')
          }
        })
      },
      //头像
      fail: function(res) {
        wx.hideLoading()
        console.log("0" + res)
        app.alerts('头像获取失败')
      }
    })
  } else if (sharptye == 2) {
    let pids = ''
    //wheretype 1是index分享海报的  2是class分享海报的 3是prolist分享海报的,4是商品详情页，5是限时抢购页
    if (wheretype == 1) {
      pids = wx.getStorageSync('SessionUserID')+'A'+that.data.yshopdata[that.data.sharpindex].pid
    } else if (wheretype == 2) {
      pids = wx.getStorageSync('SessionUserID') + 'A' +that.data.listdata[that.data.sharpindex].pid
    } else if (wheretype == 3) {
      pids = wx.getStorageSync('SessionUserID') + 'A' +that.data.lisdata[that.data.sharpindex].pid
    } else if (wheretype == 4) {
      let packid=''
      //创业礼包带参数
      if (!that.data.isopenshop){
        packid = 'A' + that.data.dataoptions.packageid
      }
      pids = wx.getStorageSync('SessionUserID') + 'A' + that.data.pid + packid
    } else if (wheretype == 5) {
      pids = wx.getStorageSync('SessionUserID') + 'A' +that.data.rushBuyMsg[that.data.slide][that.data.nowShareIdx].pid
    } else if (wheretype === 6) {
      pids = that.data.prolistid
      //压缩商品id
      utils.diz(pids, 10, 32, function (ret) {
        sharethis.erweimaon(ret, that, wheretype)
      })
      return
    }
    //压缩商品id
    utils.diz(pids, 11, 76, function (ret) {
      sharethis.erweimaon(ret, that, wheretype)
    })
  }
}
//商品海报画布文字解析
function profen(vaule, ctxs, index) {
  if (vaule.length > 20) {
    ctxs.fillText(vaule.substring(0, 19), 184, 405);
    ctxs.fillText(vaule.substring(19, 39) + '...', 184, 435);
  } else if (vaule.length <= 20) {
    ctxs.fillText(vaule.substring(0, 19), 184, 405);
  }
}
//清单商品海报画布文字解析
function newProfen({ text, ctxs, x, y, maxWidth, nextY, size}) {
  if (text.length > size) {
    ctxs.fillText(text.substring(0, size), x, y);
    ctxs.fillText(text.substring(size, size*2) + '...', x, Number(y) + nextY, maxWidth);
  } else if (text.length <= size) {
    ctxs.fillText(text.substring(0, size), x, y, maxWidth);
  }
}
//生成商品海报
function erweimaon(num, that, wheretype) {
  var sharethis = this
  let id = num.data.nValue
  let pics = ''
  let names = ''
  let saleprices = ''
  let marketprices = ''
  //wheretype 1是index分享海报的  2是class分享海报的 3是prolist分享海报的
  if (wheretype == 1) {
    pics = that.data.yshopdata[that.data.sharpindex].pic
    names = that.data.yshopdata[that.data.sharpindex].name
    saleprices = that.data.yshopdata[that.data.sharpindex].salePrice.toFixed(2)
    marketprices = that.data.yshopdata[that.data.sharpindex].marketPrice.toFixed(2)
  } else if (wheretype == 2) {
    pics = that.data.listdata[that.data.sharpindex].pic
    names = that.data.listdata[that.data.sharpindex].name
    saleprices = that.data.listdata[that.data.sharpindex].salePrice.toFixed(2)
    marketprices = that.data.listdata[that.data.sharpindex].marketPrice.toFixed(2)
  } else if (wheretype == 3) {
    pics = that.data.lisdata[that.data.sharpindex].pic
    names = that.data.lisdata[that.data.sharpindex].name
    saleprices = that.data.lisdata[that.data.sharpindex].salePrice.toFixed(2)
    marketprices = that.data.lisdata[that.data.sharpindex].marketPrice.toFixed(2)
  } else if (wheretype == 4) {
    let pages = getCurrentPages()
    let currentPage = pages[pages.length - 1]
    pics = that.data.imgUrls[0]
    names = that.data.msg.name
    if (currentPage.route.indexOf("productdetail/productdetail") !== -1) {
      saleprices = Number(that.data.buyPrice).toFixed(2)
      let newMarketPrices = that.data.marketingprice
      if (that.data.canShowRushBuy) {
        newMarketPrices = that.data.proPrice
      }
      marketprices = Number(newMarketPrices).toFixed(2)
    }else {
      saleprices = Number(that.data.proPrice).toFixed(2)
      marketprices = Number(that.data.marketingprice).toFixed(2)
    } 
    
  } else if (wheretype == 5) {
    let msg = that.data.rushBuyMsg[that.data.slide][that.data.nowShareIdx]
    pics = msg.src
    names = msg.title
    saleprices = Number(msg.price).toFixed(2)
    marketprices = Number(msg.salePrice).toFixed(2)
  } else if (wheretype === 6) {
    let billShareMsg = that.data.billList[0].itemlist
    pics = [billShareMsg[0].proimg, billShareMsg[1] && billShareMsg[1].proimg]
    names = [billShareMsg[0].proname, billShareMsg[1] && billShareMsg[1].proname]
    saleprices = [Number(billShareMsg[0].proprice).toFixed(2), billShareMsg[1] && Number(billShareMsg[1].proprice).toFixed(2)]
    marketprices = [Number(billShareMsg[0].proprice).toFixed(2), billShareMsg[1] && Number(billShareMsg[1].proprice).toFixed(2)] //市场价格
  }
  var erweima = app.globalData.siteUrl + '/Main/WechatApi/GetWxacodeun?scene=' +id + '&page=pages/productdetail/productdetail&width=430&devicetype=3'
  if (wheretype === 6) { //清单分享
    erweima = app.globalData.siteUrl + '/Main/WechatApi/GetWxacodeun?scene=' + (wx.getStorageSync('ruid') || wx.getStorageSync('SessionUserID')) + ',' + id + '&page=pages/product_bill_edit/product_bill_edit&width=430&devicetype=3'
  }
  console.log(erweima)
  var saveimg = [] //下载下来的本地路径
  var protext = [] //商品文字
  protext.push(names)
  //关闭分享框
  that.setData({
    showshare: [true, false]
  })
  const ctxs = wx.createCanvasContext('canvasCircle1')
  if(wheretype === 6) {//清单分享
    //获取头像
    wx.getImageInfo({
      src: String(that.data.userinfo.shoplogo.replace('http://', 'https://')),
      //src: String("https://images.rushouvip.cn/W/201807/vvv.png"),
      success: function (res) {
        console.log(res)
        saveimg.push(res.path)
        if (pics[0]) {
          //获取商品图1
          wx.getImageInfo({
            src: String(pics[0].replace('http://', 'https://')),
            success: function (resss) {
              console.log(resss)
              saveimg.push(resss.path)
              if(pics[1]) {
                //获取商品图2
                wx.getImageInfo({
                  src: String(pics[1].replace('http://', 'https://')),
                  success: (billshareRet) => {
                    saveimg.push(billshareRet.path)
                    billShareDraw(that, saveimg, erweima, ctxs, names)
                  },
                  fail: (res) => {
                    wx.hideLoading()
                    app.alerts('商品图片获取失败')
                  }
                })
              }else {
                billShareDraw(that, saveimg, erweima, ctxs, names)
              }
            },
            //商品图片
            fail: function (res) {
              wx.hideLoading()
              app.alerts('商品图片获取失败')
            }
          })
        }
      },
      //头像
      fail: function (res) {
        wx.hideLoading()
        app.alerts('头像获取失败')
      }
    })
  }else {
    //获取头像
    wx.getImageInfo({
      src: String(that.data.userinfo.shoplogo.replace('http://', 'https://')),
      //src: String("https://images.rushouvip.cn/W/201807/vvv.png"),
      success: function (res) {
        console.log(res)
        saveimg.push(res.path)
        //获取商品图
        wx.getImageInfo({
          src: String(pics.replace('http://', 'https://')),
          //src: String("https://images.rushouvip.cn/W/201807/vvv.png"),
          success: function (resss) {
            console.log(resss)
            saveimg.push(resss.path)
            //获取二维码
            wx.getImageInfo({
              src: String(erweima),
              success: function (eweima) {
                console.log(wheretype)
                //获取图片完成 开始画画
                ctxs.drawImage('../../image/shoreimg.jpg', 0, 0, 375, 650)
                //画头像 商品头像
                ctxs.drawImage(saveimg[0], 155, 30, 72, 72)
                ctxs.drawImage(saveimg[1], 115, 240, 150, 150)
                //头像框
                ctxs.drawImage('../../image/headportrait.png', 155, 30, 72, 72)
                //写名字
                ctxs.setFontSize(18)
                ctxs.setTextAlign('center')
                ctxs.fillText(that.data.userinfo.shopname, 191, 140)
                //第一个商品的信息
                ctxs.setFontSize(16)
                ctxs.setTextAlign('center')
                sharethis.profen(names, ctxs);
                //价格
                ctxs.setFontSize(18)
                ctxs.setTextAlign('left')
                ctxs.setFillStyle('#CDA86E')
                ctxs.fillText('¥' + saleprices, 125, 470)
                ctxs.setFontSize(14)
                ctxs.setTextAlign('left')
                ctxs.setFillStyle('#999')
                ctxs.moveTo(215, 465)
                var width = 215 + ctxs.measureText('¥' + marketprices).width
                ctxs.lineTo(width, 465)
                ctxs.stroke()
                ctxs.fillText('¥' + marketprices, 215, 470)
                //小程序二维码
                ctxs.drawImage(eweima.path, 155, 480, 72, 72)
                ctxs.setFillStyle('#000')
                ctxs.setFontSize(12)
                ctxs.setTextAlign('center')
                ctxs.fillText("长按识别即可看到商品", 190, 580)
                //最后绘画
                ctxs.draw(false, function (e) {
                  wx.canvasToTempFilePath({
                    x: 0,
                    y: 0,
                    width: 375,
                    height: 600,
                    destWidth: 1125,
                    destHeight: 1800,
                    canvasId: 'canvasCircle1',
                    success: function (ret) {
                      console.log(ret)
                      console.log(that.data)
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
                console.log(res)
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
  }

}
function billShareDraw(that, saveimg, erweima, ctxs, names) {
  //获取二维码
  wx.getImageInfo({
    src: String(erweima),
    success: function (eweima) {
      let billShareMsg = that.data.billList[0]
      //获取图片完成 开始画画
      ctxs.setFillStyle('#fff')
      ctxs.fillRect(0, 0, 375, 667)
      //画头像 商品头像
      ctxs.drawImage(saveimg[0], 143, 25, 90, 90)
      if (billShareMsg.itemlist.length && billShareMsg.itemlist.length > 1) {
        ctxs.drawImage(saveimg[1], 61, 260, 110, 120)
        ctxs.drawImage(saveimg[2], 193, 260, 110, 120)
      } else {
        ctxs.drawImage(saveimg[1], 125, 265, 130, 130)
      }
      //头像框
      ctxs.drawImage('../../image/headportrait.png', 143, 25, 90, 90)
      //写名字
      ctxs.setFontSize(18)
      ctxs.setFillStyle('#333')
      ctxs.setTextAlign('center')
      ctxs.fillText(that.data.userinfo.shopname + "的清单", 375 / 2, 140)
      if (billShareMsg.itemlist.length && billShareMsg.itemlist.length > 1) {
        //第一个商品的信息
        ctxs.setFontSize(16)
        ctxs.setTextAlign('center')
        newProfen({ text: names[0], ctxs: ctxs, x: 121, y: 400, maxWidth: 112, nextY: 20, size: 6 });
        //第二个商品的信息
        ctxs.setFontSize(16)
        ctxs.setTextAlign('center')
        newProfen({ text: names[1], ctxs: ctxs, x: 253, y: 400, maxWidth: 112, nextY: 20, size: 6 });
      } else {
        ctxs.setFontSize(16)
        ctxs.setTextAlign('center')
        newProfen({ text: names[0], ctxs: ctxs, x: 375 / 2, y: 420, maxWidth: 160, nextY: 20, size: 12 });
      }


      //清单简介
      ctxs.setFontSize(18)
      ctxs.setTextAlign('center')
      ctxs.setFillStyle('#333')
      newProfen({ text: String(billShareMsg.name), ctxs: ctxs, x: 375 / 2, y: 185, maxWidth: 260, nextY: 20, size: 18 })
      ctxs.setFontSize(14)
      ctxs.setFillStyle('#999')
      newProfen({ text: String(billShareMsg.sign), ctxs: ctxs, x: 375 / 2, y: 230, maxWidth: 260, nextY: 20, size: 18 })
      //共多少清单
      ctxs.setFontSize(12)
      ctxs.setFillStyle('#999')
      ctxs.fillText("此清单共" + billShareMsg.count + "件商品", 375 / 2, 460)
      //小程序二维码
      ctxs.drawImage(eweima.path, 155, 480, 72, 72)
      ctxs.setFillStyle('#000')
      ctxs.setFontSize(12)
      ctxs.setTextAlign('center')
      ctxs.fillText("长按识别即可看到商品", 190, 580)
      //最后绘画
      ctxs.draw(false, function (e) {
        wx.canvasToTempFilePath({
          x: 0,
          y: 0,
          width: 375,
          height: 600,
          destWidth: 1125,
          destHeight: 1800,
          canvasId: 'canvasCircle1',
          success: function (ret) {
            console.log(ret)
            console.log(that.data)
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
      console.log(res)
      wx.hideLoading()
      app.alerts('二维码图片获取失败')
    }
  })

}
//保存海报
function savehaibao(that) {
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
}




module.exports = {
  noscoll: noscoll,
  closeshare: closeshare,
  sharequan: sharequan,
  textfen: textfen,
  profen: profen,
  erweimaon: erweimaon,
  savehaibao: savehaibao
}