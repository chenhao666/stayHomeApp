// pages/order/productDetail/productDetail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrls: [],
    index:0,
    total:0,
    indicatorDots: false,
    autoplay: false,
    interval: 5000,
    duration: 1000,
    listData:{},
    showPrice:false,
    imgLength:0,
    current:1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //console.log(JSON.parse(options.detail))
    let that = this;
    if (options.showPrice=="true"){
      this.setData({
        showPrice:true
      })
    }
    if (options.detail){
    that.data.listData = JSON.parse(options.detail);
      //console.log(JSON.parse(options.detail))
    //处理listData里面的goodsImages，将字符串换成数组
      that.data.listData.goodsImages = that.data.listData.goodsImagesArr;
      that.data.imgLength = that.data.listData.goodsImages.length;
     
      that.setData({
        listData: that.data.listData,
        imgLength: that.data.imgLength
      })
    }
      if (options.orderDetail){
        //数据字段统一
        that.data.listData = JSON.parse(options.orderDetail)
        that.data.listData.goodsImages = that.data.listData.imageUrlArr;
        that.data.listData.goodsName = that.data.listData.name;
        that.data.listData.brandName = that.data.listData.brand;
        that.data.listData.unitPrice = that.data.listData.unitPrice/100;

        that.data.imgLength = that.data.listData.goodsImages.length
        that.setData({
          listData: that.data.listData,
          imgLength: that.data.imgLength
        })
    }
   
    //console.log(that.data.listData)
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
  onPullDownRefresh: function () {
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
  //获取当前图片的索引
  getIndex:function(e){
    let that = this;
    that.data.current = e.detail.current+1;
    that.setData({
      current: that.data.current
    })

  },
  showPic:function(){
    let that = this;
    //console.log(111)
    wx.previewImage({
      current: that.data.listData.goodsImages[that.data.current-1] , // 当前显示图片的http链接
      urls: that.data.listData.goodsImages // 需要预览的图片http链接列表
    })
  }

})