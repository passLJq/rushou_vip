// Component/search/search.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    msg: { // 属性名
      type: null,
      value: '',
      observer: function(newVal, oldVal) {}
    },
    searchplaceholder: {
      type: String,
      value: '',
      observer: function(newVal, oldVal) {}
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    content: "",
    searchFocus: false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    bindKeyInput(e) {
      this.setData({
        content: e.detail.value
      })
    },
    cancelMsg() {
      this.setData({
        content: ""
      })
      this.searchMsg()
    },
    searchMsg() {
      this.triggerEvent("searchmsg", this.data.content)
    },
    searchFocus() {
      this.setData({
        searchFocus: true
      })
    }
  }
})