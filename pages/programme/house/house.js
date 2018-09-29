// pages/programme/house/house.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    area:'',//面积
    areaArr:[],//面积数组
    home:'',//居室
    homeArr: [],//居室数组
    maskHidden:true,//遮罩层
    selectIndex:0,//当前选中
    houseList:[],//户型列表
    nowInfo:{},//接收传入值
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //console.log(options)
    this.setData({
      nowInfo:options
    })
    //获取楼盘面积列表
    var that = this;
    var data = {
      styleId: options.styleId,
      /*brandId: options.brandId,*/
      houseId: options.houseId,
      conditions: 'houseArea'
    }
    getApp().ajax("queryDesignProgram", data, 'POST', function (res) {
      //console.log(res.data)
      var arr = [];
      arr.push({ houseArea: '全部' });
      arr=arr.concat(res.data.designInfos)
      that.setData({
        areaArr: arr
      })
    })
    //获取居室列表
    var that = this;
    var data = {
      styleId: options.styleId,
      /*brandId: options.brandId,*/ 
      houseId: options.houseId,
      conditions: 'houseTypeName'
    }
    getApp().ajax("queryDesignProgram", data, 'POST', function (res) {
      //console.log(res.data)
      var arr=[];
      arr.push({ houseTypeName:'全部' });
      arr =arr.concat(res.data.designInfos)
      that.setData({
        homeArr: arr
      })
    })
    //获取户型列表
    var that = this;
    var data = {
      styleId: options.styleId,
      /*brandId: options.brandId,*/ 
      houseId: options.houseId,
      houseArea: this.data.area,
      houseTypeName: this.data.home,
      conditions: 'houseModel'
    }
    if (data.houseArea == "全部") {
      data.houseArea = "";
    }
    if (data.houseTypeName == "全部") {
      data.houseTypeName = "";
    }
    getApp().ajax("queryDesignProgram", data, 'POST', function (res) {
      //console.log(res.data)
      that.setData({
        houseList: res.data.designInfos
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
  //选择面积或者居室
  filterHouse:function(event){
    //console.log(event.currentTarget.dataset.index)
    this.setData({
      maskHidden:false,
      selectIndex:event.currentTarget.dataset.index
    })
  },
  //筛选
  selectHome:function(event){
    //console.log(event.currentTarget.dataset.index)
    var index = event.currentTarget.dataset.index;
    if (this.data.selectIndex==0){
      var arr=this.data.areaArr;
      this.setData({
        area: arr[index].houseArea,
        maskHidden: true
      })
    }else{
      var arr = this.data.homeArr;
      this.setData({
        home: arr[index].houseTypeName,
        maskHidden: true
      })
    }
    var that = this;
    var data = {
      styleId: this.data.nowInfo.styleId,
      /*brandId: this.data.nowInfo.brandId,*/ 
      houseId: this.data.nowInfo.houseId,
      houseArea: this.data.area,
      houseTypeName: this.data.home,
      conditions: 'houseModel'
    }
    if (data.houseArea=="全部"){
      data.houseArea="";
    }
    if (data.houseTypeName == "全部") {
      data.houseTypeName = "";
    }
    getApp().ajax("queryDesignProgram", data, 'POST', function (res) {
      //console.log(res.data)
      that.setData({
        houseList: res.data.designInfos
      })
    })
  }
})