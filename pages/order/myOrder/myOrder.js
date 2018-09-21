// pages/order/myOrder/myOrder.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderList:[], //订单列表
    imageUrlList:[],
    notMessage: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getData();
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
    this.getData();
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
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },
  onPullDownRefresh: function () {
    var that = this;
    setTimeout(function () {
      wx.stopPullDownRefresh();
      that.onLoad(that.options);
    }, 1000)
  },
  //获取列表数据
  getData(){
    let that = this;
    if (wx.getStorageSync('token')){
      getApp().ajax("queryGoodsOrder", { token: wx.getStorageSync('token') }, 'post', function (res) {
        var list = res.data.ordersList;
        //修改时间的格式
        for (let i = 0; i < list.length; i++) {
          var arr = list[i].createTime.split(':');
          list[i].createTime = arr[0] + ':' + arr[1];
        }
        that.setData({
          orderList: list
        })

        if (res.data.ordersList.length == 0) {
          // 控制无信息时的状态
          that.data.notMessage = true;
        } else {
          that.data.notMessage = false;
        }
        that.setData({
          orderList: that.data.orderList,
          notMessage: that.data.notMessage
        })
      })
    }
  },

  showDetail(e){
    let that = this;
    that.data.prudectData = JSON.stringify(that.data.orderList[e.currentTarget.dataset.index])
    wx.navigateTo({
      url: '/pages/order/orderDetail/orderDetail?orderStatus=' + that.data.prudectData
    })
  }

})