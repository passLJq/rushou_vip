Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isfreeze: { // 属性名
      type: null, // 类型（必填），目前接受的类型包括：String, Number, Boolean, Object, Array, null（表示任意类型）
      value: '', // 属性初始值（可选），如果未指定则会根据类型选择一个
      observer: function (newVal, oldVal) { } // 属性被改变时执行的函数（可选），也可以写成在methods段中定义的方法名字符串, 如：'_propertyChange'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //前往解冻专区
    gobuy_openshop: function () {
      wx.navigateTo({
        url: '/pages/jiedong_pro/jiedong_pro'
      })
    }
  },
  //阻止滑动
  nogun:function(){

  }
})