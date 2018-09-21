Component({
  properties: {
    // 这里定义了innerText属性，属性值可以在组件使用时指定
    programmeIndex: {
      type: String,
      value: '0',
    }
  },
  data: {
    "programmeList":[],//方案列表
  },
  attached:function(){
    var that = this;
    //console.log(this.data.programmeIndex)
    //获取风格列表
    var data = {
      "styleId": this.data.programmeIndex,
      "conditions": "brandId"
    }
    if (wx.getStorageSync('programmeList_' + that.data.programmeIndex)){
      that.setData({
        programmeList: wx.getStorageSync('programmeList_' + that.data.programmeIndex)
      })
    }
    
    getApp().ajax("queryDesignProgram", data, 'POST', function (res) {
      //console.log(res.data.designInfos)
      that.setData({
        programmeList: res.data.designInfos
      })
      wx.setStorageSync('programmeList_' + that.data.programmeIndex, that.data.programmeList)

      that.onChange();
      //console.log(that.data.programmeList)
    })
  },
  ready:function(){

  },
  pageLifetimes: {
    // 组件所在页面的生命周期函数
    show: function () {
      var that = this;
      //console.log(this.data.programmeIndex)
      //获取风格列表
      var data = {
        "styleId": this.data.programmeIndex,
        "conditions": "brandId"
      }
      if (wx.getStorageSync('programmeList_' + that.data.programmeIndex)) {
        that.setData({
          programmeList: wx.getStorageSync('programmeList_' + that.data.programmeIndex)
        })
      }

      getApp().ajax("queryDesignProgram", data, 'POST', function (res) {
        //console.log(res.data.designInfos)
        that.setData({
          programmeList: res.data.designInfos
        })
        wx.setStorageSync('programmeList_' + that.data.programmeIndex, that.data.programmeList)

        that.onChange();
        //console.log(that.data.programmeList)
      })
    },
  },
  methods: {
    onChange: function () {
      var myEventDetail = {} // detail对象，提供给事件监听函数
      var myEventOption = {} // 触发事件的选项
      this.triggerEvent('changeHeight', myEventDetail, myEventOption)
    }
  }
})