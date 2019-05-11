// Component/back-my-shop/back-my-shop.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    ruid: { // 属性名
      type: null, // 类型（必填），目前接受的类型包括：String, Number, Boolean, Object, Array, null（表示任意类型）
      value: '', // 属性初始值（可选），如果未指定则会根据类型选择一个
      observer: function (newVal, oldVal) { } // 属性被改变时执行的函数（可选），也可以写成在methods段中定义的方法名字符串, 如：'_propertyChange'
    },
    uid: { // 属性名
      type: null, // 类型（必填），目前接受的类型包括：String, Number, Boolean, Object, Array, null（表示任意类型）
      value: '', // 属性初始值（可选），如果未指定则会根据类型选择一个
      observer: function (newVal, oldVal) { } // 属性被改变时执行的函数（可选），也可以写成在methods段中定义的方法名字符串, 如：'_propertyChange'
    },
    fxshopid: { // 属性名
      type: null, // 类型（必填），目前接受的类型包括：String, Number, Boolean, Object, Array, null（表示任意类型）
      value: '', // 属性初始值（可选），如果未指定则会根据类型选择一个
      observer: function (newVal, oldVal) { } // 属性被改变时执行的函数（可选），也可以写成在methods段中定义的方法名字符串, 如：'_propertyChange'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    ruid: wx.getStorageSync('ruid'),//当前进来的店铺ID
    uid: wx.getStorageSync('SessionUserID'),
    fxshopid: wx.getStorageSync('fxshopid')
  },

  /**
   * 组件的方法列表
   */
  methods: {
    backMyshop(e) {
      if (!wx.getStorageSync('SessionUserID')) {
        wx.navigateTo({
          url: '/pages/yshopapply/yshopapply',
        })
      } else if (!wx.getStorageSync('fxshopid')){
        wx.navigateTo({
          url: '/pages/yshopapply/yshopapply',
        })
      } else{
        wx.setStorageSync('ruid', "")
        wx.reLaunch({
          url: '/pages/index/index'
        })
      }
    }
  }
})
