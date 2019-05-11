// Component/product-list/product-list.js
const app = getApp()
const util = require("../../utils/util.js")
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    slide: { // 以后扩展使用
      type: null,
      value: '',
      observer: function(newVal, oldVal) {

      }
    },
    prolistid: { // 清单ID
      type: null,
      value: '',
      observer: function(newVal, oldVal) {

      }
    },
    listType: { // 进来类型
      type: String,
      value: '',
      observer: function(newVal, oldVal) {

      }
    },
    statusType: { //0=自己进来的, 1=在别人店铺下进来的  //只限于清单编辑页
      type: Number,
      value: '',
      observer: function(newVal, oldVal) {

      }
    },
    ruid: {
      type: null,
      value: '',
      observer: function(newVal, oldVal) {

      }
    },
    billMaxCounts: { // 列表总数量
      type: Number,
      value: '',
      observer: function(newVal, oldVal) {

      }
    },
    shopList: { // 数据
      type: Array,
      value: '',
      observer: function(newVal, oldVal) {
        let selectArr = this.data.selectArr
        let allSelect = this.data.allSelect
        selectArr = [
          [],
          []
        ]
        allSelect = false
        for (let i in newVal) {
          selectArr[0] = selectArr[0].concat(0)
        }
        this.setData({
          selectArr,
          allSelect
        })
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    selectArr: [
      [],
      []
    ], //是否选中的数组
    allSelect: true, //全选
    isreachBottom: false, //是否正在执行上拉
    noMore: false, //没有更多数据了
    isIphoneX: app.globalData.isIphoneX,
  },
  moved() {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    toProDetail(e) {
      wx.navigateTo({
        url: '/pages/productdetail/productdetail?pid=' + e.currentTarget.dataset.pid,
      })
    },
    deleteBillSome() {
      this.triggerEvent("deleteBillSome", this.data)
    },
    shareBill() {
      console.log(2222222)
      this.triggerEvent("shareBill")
    },
    saveBill() {
      if (this.properties.statusType === 0) {
        this.triggerEvent("saveBill")
      }
    },
    movePro(e) {
      let idx = parseInt(e.currentTarget.dataset.idx)
      if (e.currentTarget.dataset.type) { //下移
        if (idx >= (this.properties.billMaxCounts - 1)) {
          return
        }
      } else { //上移
        if (idx === 0) {
          return
        }
      }
      let url, data
      if (this.properties.listType === "bill") {
        url = "Member/MoveProListItem"
        data = {
          prolistid: this.properties.prolistid,
          proid: e.currentTarget.dataset.relid,
          type: e.currentTarget.dataset.type
        }
      } else {
        url = "Main/MovePro"
        data = {
          relid: e.currentTarget.dataset.relid, //标识ID
          type: e.currentTarget.dataset.type, //0=上移 1=下移
          uid: wx.getStorageSync("SessionUserID")
        }
      }
      console.log(url)
      console.log(data)
      util.http({
        url: app.globalData.siteUrl + '/Main/' + url + '?devicetype=3&uid=' + wx.getStorageSync("SessionUserID"),
        data: data,
        method: "POST",
        header: 1,
        successBack: (ret) => {
          console.log(ret)
          if (ret.data.status == 1 && ret.data.success) {
            this.triggerEvent("movePro", this.data)
          } else {
            app.promsg(ret.data.err)
          }
        }
      })
    },
    deleteList(e) {
      let url = this.properties.listType !== 'bill' ? 'UpProduct' : 'DeleteProListItem'
      let tipsName = this.properties.listType !== 'bill' ? '商品' : '清单'
      let method = this.properties.listType !== 'bill' ? 'GET' : 'POST'
      let data = ""
      let indexIdx = []
      if (e.currentTarget.dataset.type === "all") {
        let {
          shopList,
          selectArr
        } = this.data
        let dataItems = []
        for (let i in shopList) {
          if (selectArr[this.properties.slide][i])
            dataItems.push(shopList[i].pid)
        }
        if (dataItems.length < 1) {
          app.promsg("请先选中" + tipsName)
          return
        }
        data = {
          proid: dataItems.join(","),
          uid: wx.getStorageSync("SessionUserID"),
          state: 1
        }
        indexIdx = dataItems
      } else {
        data = this.properties.listType !== 'bill' ? {
          proid: e.currentTarget.dataset.pid,
          uid: wx.getStorageSync("SessionUserID"),
          state: 1
        } : {
          prolistid: this.properties.prolistid,
          proid: e.currentTarget.dataset.pid
        }
        indexIdx.push(e.currentTarget.dataset.pid)
      }
      wx.showModal({
        title: '温馨提示',
        content: "是否下架该" + tipsName + "?",
        success: (res) => {
          if (res.confirm) {
            util.http({
              url: app.globalData.siteUrl + '/Main/Member/' + url + '?devicetype=3',
              data: data,
              method: method,
              successBack: (ret) => {
                if (ret.data.status == 1 && ret.data.success) {
                  if (this.properties.listType !== 'bill') {
                    wx.setStorageSync("indexIdx", [indexIdx, 0])
                  }
                  app.showtips("成功下架" + tipsName)
                  let timer = setTimeout(() => {
                    clearTimeout(timer)
                    timer = null
                    this.setData({
                      shopList: "",
                      billList: "",
                      noMore: false,
                      isreachBottom: false,
                      page: [1, 1]
                    })
                    this.triggerEvent("deleteList", this.data)

                  }, 1500)
                } else {
                  app.promsg(ret.data.err)
                }
              }
            })
          } else if (res.cancel) {}
        }
      })

    },
    selectItem(e) {
      let idx = e.currentTarget.dataset.idx.toString().split("")
      let oldVal = this.data.selectArr
      if (idx[0] == "a") { //全选
        for (let i in oldVal) {
          if (this.data.allSelect) {
            oldVal[i].fill(0)
          } else {
            oldVal[i].fill(1)
          }
        }
        this.setData({
          allSelect: !this.data.allSelect
        })
      } else { //单个商品选中
        if (oldVal[idx[0]][idx[1]] == 0) {
          oldVal[idx[0]][idx[1]] = 1
        } else {
          oldVal[idx[0]][idx[1]] = 0
        }
      }
      if (idx[0] != "a") {
        let isCheck = true
        for (let b in oldVal) {
          if (oldVal[b].findIndex((n) => n < 1) != -1) {
            isCheck = false
          }
        }
        this.setData({
          allSelect: isCheck,
        })
      }
      this.setData({
        selectArr: oldVal
      })
    },
  }
})