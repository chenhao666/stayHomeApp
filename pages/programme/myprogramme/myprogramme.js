// pages/programme/myprogramme/myprogramme.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    requireData:[
      {
        imgUrl:'/img/banner.gif',
        title:'极致生活-顾家'
      }
    ],
    mobileNum: '18268304329',
    notMessage:true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
 
  onReady: function () {
    this.getData();
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
      that.onReady();
    }, 1000)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },


  // 删除方案
  deleteProgram: function(e){
    var that = this;
    wx.showModal({
      title:'提示',
      content: '确认删除该方案吗？',
      duration:1000,
      success: function (res){
        if (res.confirm){
          getApp().ajax("deleteUserProgram", { id: e.target.dataset.id }, 'post', function (res) {
            that.getData();
          })
        }else{
          console.log('用户点击取消')
        }
       
      }
    })
    // 获取我的方案列表
  },
  // 跳转到商品列表
  programList: function(e){
    wx.navigateTo({
      url: '/pages/order/productList/productList?programme=' + this.data.requireData[e.currentTarget.dataset.index].designInfoId
    })
  },
  getData: function(e){
    let that = this;
    let checkKey = wx.getStorageSync("token");
    // 获取我的方案列表
    getApp().ajax("queryUserProgram", { token: checkKey }, 'post', function (res) {
      if (res.data.userPrograms.length == 0) {
        // 控制无信息时的状态
        that.data.notMessage = true;
      } else {
        that.data.notMessage = false;
      }
      that.setData({
        requireData: res.data.userPrograms,
        notMessage: that.data.notMessage
      })
    })
  },  
  onShareAppMessage:function(e){
   var that = this;
   let title = that.data.requireData[e.target.dataset.index].styleName  + "-"+that.data.requireData[e.target.dataset.index].desigName
      　// 设置菜单中的转发按钮触发转发事件时的转发内容
   return {
     title: title,
     path: '/pages/programme/showThree/showThree?url='+that.data.requireData[e.target.dataset.index].threeDurl,
     imageUrl: that.data.requireData[e.target.dataset.index].houseModelUrl
   }

  }

})