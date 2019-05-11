const app = getApp()
const util = require("../../utils/util.js")
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    openshop: { // 属性名
      type: null, // 类型（必填），目前接受的类型包括：String, Number, Boolean, Object, Array, null（表示任意类型）
      value: '', // 属性初始值（可选），如果未指定则会根据类型选择一个
      observer: function (newVal, oldVal) { 
        //初始化
        console.log(this.properties.openshop)
        if (this.properties.openshop){
          this.setData({
            btnmsg: '下一步',
            bu2: false,
            status: 1,
            code: '',
            invetsrc: '',
            invetname: ''
          })
        }
      } // 属性被改变时执行的函数（可选），也可以写成在methods段中定义的方法名字符串, 如：'_propertyChange'
    },
    typestatus: { // 属性名
      type: null, // 类型（必填），目前接受的类型包括：String, Number, Boolean, Object, Array, null（表示任意类型）
      value: '', // 属性初始值（可选），如果未指定则会根据类型选择一个
      observer: function (newVal, oldVal) { } // 属性被改变时执行的函数（可选），也可以写成在methods段中定义的方法名字符串, 如：'_propertyChange'
    },
    waicondes: { // 属性名
      type: null, // 类型（必填），目前接受的类型包括：String, Number, Boolean, Object, Array, null（表示任意类型）
      value: '', // 属性初始值（可选），如果未指定则会根据类型选择一个
      observer: function (newVal, oldVal) { } // 属性被改变时执行的函数（可选），也可以写成在methods段中定义的方法名字符串, 如：'_propertyChange'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    btnmsg:'下一步',
    bu2:false,
    status:1,
    code:'',
    invetsrc:'',
    invetname:''
  },

  /**
   * 组件的方法列表
   */
  methods: {
      next(){
        var that=this
        var condes=''
        if (this.properties.typestatus){
          condes = this.properties.waicondes
        }else{
          condes=that.data.code
        }
        if (this.data.status==1){
          util.http({
            url: app.globalData.siteUrl + '/Main/Member/GetCodeUser?devicetype=3&uid=' + wx.getStorageSync('SessionUserID'),
            data: {
              code: condes
            },
            header: 1,
            successBack: (ret) => {
              if(ret.data.success&&ret.data.status==1){
                that.setData({
                  btnmsg: '确定',
                  bu2:true,
                  status:2,
                  invetsrc: ret.data.reobj.refereeimg,
                  invetname: ret.data.reobj.referee
                })
              }else{
                app.promsg(ret.data.err)
              }
            }
          })
        }else if(this.data.status==2){
          console.log(1)
          this.triggerEvent('showcode', { showcodes: (that.data.invetname + '(' + that.data.code + ')'), codes: that.data.code});
        }
      },
      inputcode(e){
        this.setData({
          code: e.detail.value
        })
      },
    colse(){
      this.triggerEvent('tianxieyaoqing', {});
    }
  }
})
