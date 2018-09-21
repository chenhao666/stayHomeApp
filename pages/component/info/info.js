Component({
  properties: {
    // 这里定义了innerText属性，属性值可以在组件使用时指定
    programmeIndex: {
      type: String,
      value: '0',
    }
  },
  data: {
    "programme":[],
    "programmeList": [],
    "url":'',
    "pic":'',
    'comboName':'',//套餐名
    'brandName':'',
    'styleName':''
  },
  attached: function () {
    //console.log(this.data.programmeIndex)
    var that=this;
    //获取默认展示数据
    getApp().ajax("queryBrandDesignInfo", { id: that.data.programmeIndex }, 'POST', function (res) {
      //console.log(that.data.programmeIndex)
      //console.log(res)
      that.setData({
        programme: res.data.styleInfos[0],
        programmeList: res.data.styleInfos[0].templateList,
        comboName: res.data.styleInfos[0].comboName,
        url: res.data.styleInfos[0].designInfo.threeDurl,
        pic: res.data.styleInfos[0].designInfo.coverPic,
        brandName: res.data.styleInfos[0].designInfo.brandName,
        styleName: res.data.styleInfos[0].designInfo.styleName
      })
      that.onChange();
    })
  },
  methods: {
    onChange: function () {
      var myEventDetail = {} // detail对象，提供给事件监听函数
      var myEventOption = {} // 触发事件的选项
      this.triggerEvent('changeHeight', myEventDetail, myEventOption)
    }
  }
})