// Component/goTop/goTop.js
    var showtop=false
  function onPageScrolls(e,that) { // 获取滚动条当前位置
  if (e.scrollTop>500){
    if (!that.data.showtop){
      that.setData({
        showtop:true
      })
    }
    }else{
    if (that.data.showtop) {
      that.setData({
        showtop:false
      })
    }
    }
  }
  function goTops(e) {  // 一键回到顶部
    if (wx.pageScrollTo) {
      wx.pageScrollTo({
        scrollTop: 0
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
    }
  }
  module.exports = {
    onPageScrolls: onPageScrolls,
    goTops: goTops
  }