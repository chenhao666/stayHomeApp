// pages/programme/programmeInfo/programmeInfo.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    nowInfo:{},//传值
    selectStyle:0,//选择风格
    styleArr:[],//风格列表
    brandArr: [],//品牌列表
    selectBrand: 0,//选择品牌
    programme:{},//当前方案
    changeHeight:0,//tab高度
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that=this;
    //console.log(options)
    this.setData({
      nowInfo: options
    })
    //获取风格列表
    /*getApp().ajax("queryStyleInfo", { "start": 0, "length": 3 }, 'POST', function (res) {
      console.log(res);
      that.setData({
        styleArr: res.data.styleInfoList
      })
    })*/
    var data = {
      "conditions": "styleId",
      "houseId": options.houseId,
      "houseTypeName": options.houseTypeName
    }
    getApp().ajax("queryDesignProgram", data, 'POST', function (res) {
      //console.log(res.data.designInfos)
      var select=0;
      var list = res.data.designInfos;
      for (var i = 0; i < list.length;i++){
        if (list[i].styleId == options.styleId){
          select=i;
        }
      }
      that.setData({
        styleArr: res.data.designInfos,
        selectStyle: select
      })
      //console.log(that.data.styleArr)
    })
    //获取品牌列表
    var data = {
      "styleId": options.styleId,
      "conditions": "brandId",
      "houseId": options.houseId,
      "houseTypeName": options.houseTypeName
    }
    getApp().ajax("queryDesignProgram", data, 'POST', function (res) {
      //console.log(res.data.designInfos)
      var select = 0;
      var list = res.data.designInfos;
      for (var i = 0; i < list.length; i++) {
        if (list[i].brandId == options.brandId) {
          select = i;
        }
      }
      that.setData({
        brandArr: res.data.designInfos,
        selectBrand: select
      })
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  //下拉刷新
  onPullDownRefresh: function () {
    //console.log(1)
    var that = this;
    setTimeout(function () {
      wx.stopPullDownRefresh();
      that.onLoad(that.options);
    }, 1000)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },
  //选择风格
  selectStyle:function(event){
    this.setData({
      selectStyle:event.currentTarget.dataset.index
    })
    //console.log(event.currentTarget.dataset)
    var that=this;
    //获取品牌列表
    var data = {
      "styleId": event.currentTarget.dataset.styleid,
      "conditions": "brandId",
      "houseId": this.data.nowInfo.houseId,
      "houseTypeName": this.data.nowInfo.houseTypeName
    }
    getApp().ajax("queryDesignProgram", data, 'POST', function (res) {
      //console.log(res.data.designInfos)
      var select = 0;
      var list = res.data.designInfos;
      for (var i = 0; i < list.length; i++) {
        if (list[i].brandId == that.data.nowInfo.brandId) {
          select = i;
        }
      }
      that.setData({
        brandArr:[],
      })
      that.setData({
        brandArr: res.data.designInfos,
        selectBrand: 0
      })
    })
  },
  //选择品牌
  selectBrand:function(event){
    this.setData({
      selectBrand: event.currentTarget.dataset.index
    })
    //改变高度
    var index = this.data.selectBrand;
    var query = wx.createSelectorQuery();
    query.select("#list_item" + index).boundingClientRect();
    var that = this;
    query.exec(function (res) {
      //console.log(res)
      that.setData({
        "changeHeight": res[0].height
      })
    })
  },
  //滑动选择
  changeCurrent:function(event){
    //console.log(event.detail.current)
    this.setData({
      selectBrand: event.detail.current
    })
    //改变高度
    var index = this.data.selectBrand;
    var query = wx.createSelectorQuery();
    query.select("#list_item" + index).boundingClientRect();
    var that = this;
    query.exec(function (res) {
      that.setData({
        "changeHeight": res[0].height
      })
    })
  },
  //下拉刷新
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh()
  },
  //改变高度
  OnChangeHeight: function (e) {
    //console.log(e);
    var that = this;
    //改变高度
    var index = this.data.selectBrand;
    var query = wx.createSelectorQuery();
    query.select("#list_item" + index).boundingClientRect();
    var that = this;
    query.exec(function (res) {
      that.setData({
        "changeHeight": res[0].height
      })
    })
  },
  //商品列表页
  goProductList:function(){
    wx.navigateTo({
      url: '/pages/order/productList/productList?programme=' + this.data.brandArr[this.data.selectBrand].designId
    })
  },
  //联系客服
  connectCustomer:function(e){
    var nameList = {
      myName: wx.getStorageSync('myUsername') || '',
      your: 'customerservice'
    }//跳转信息
    var linkManList = {
      name: 'customerservice',
      num: 0,
      lastChat: '',
      time: ''
    }
    wx.getStorage({
      key: 'linkMan',
      success: function (res) {
        var flag=0;//标记
        var list=JSON.parse(res.data);
        
        //客服信息
        for(var i=0;i<list.length;i++){
          if (list[i].name =='customerservice'){
            flag=1;
          }
        }
        if (!flag){
          list.push(linkManList);
          wx.setStorage({
            key: "linkMan",
            data: JSON.stringify(list)
          })
        }
        wx.navigateTo({
          url: '/pages/chat/chatroom/chatroom?username=' + JSON.stringify(nameList)
        })
      },
      fail:function(){
        var list=[];
        list.push(linkManList);
        wx.setStorage({
          key: "linkMan",
          data: JSON.stringify(list)
        })
      }
    })
  },
  //联系设计师
  connectDesigner: function (e) {
    var nameList = {
      myName: wx.getStorageSync('myUsername') || '',
      your: 'designer'
    }//跳转信息
    var linkManList = {
      name: 'designer',
      num: 0,
      lastChat: '',
      time: ''
    }
    wx.getStorage({
      key: 'linkMan',
      success: function (res) {
        var flag = 0;//标记
        var list = JSON.parse(res.data);
        //客服信息
        for (var i = 0; i < list.length; i++) {
          if (list[i].name == 'designer') {
            flag = 1;
          }
        }
        if (!flag) {
          list.push(linkManList);
          wx.setStorage({
            key: "linkMan",
            data: JSON.stringify(list)
          })
        }
        wx.navigateTo({
          url: '/pages/chat/chatroom/chatroom?username=' + JSON.stringify(nameList)
        })
      },
      fail: function () {
        var list = [];
        list.push(linkManList);
        wx.setStorage({
          key: "linkMan",
          data: JSON.stringify(list)
        })
      }
    })
  },
  //分享
  onShareAppMessage: function (res) {
    //console.log(res.target.dataset)
    if (res.from === 'button') {
      // 来自页面内转发按钮
      //console.log(res.target)
    }
    return {
      title: res.target.dataset.stylename + '-' + res.target.dataset.brandname,
      imageUrl: res.target.dataset.pic,
      path: "/pages/programme/showThree/showThree?url=" + res.target.dataset.url
    }
  }
})