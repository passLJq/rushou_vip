// Component/foot-nav/foot-nav.js
const app = getApp()
const util = require("../../utils/util.js")
const CheckLoginStatus = require("../../utils/CheckLoginStatus.js")
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    clickindex: { 
      type: null,
      value: 0,
      observer: function (newVal, oldVal) { } 
    }
  },
  pageLifetimes: {
    show() {
      console.log(1)
      this.carnum()
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    cartCounts:''
  },

  /**
   * 组件的方法列表
   */
  methods: {
      gowhere(e){
        var url = e.currentTarget.dataset.url
        var index = e.currentTarget.dataset.index
				if (index == 1) {
					CheckLoginStatus.checksession(() => {
						wx.reLaunch({
							url: url
						})
					})
					return
				}
        wx.reLaunch({
          url: url
        })
      },
      carnum(){
        var that=this
        util.cartCounts({
          callBack: (ret) => {
            console.log(ret)
            if (ret && ret.data.success && ret.data.status == 1 && ret.data.Data != null) {
              if (ret.data.Data > 0) {
                console.log(ret.data.Data)
                that.setData({
                  cartCounts: ret.data.Data
                })
              } else {
                that.setData({
                  cartCounts: 0
                })
              }
            }
          }
        })
      }
  }
})
