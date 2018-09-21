// pages/chat/chat.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    'linkList':[],
    'customerServicePic':'',
    'designerPic':'',
    'show':false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that=this;
    getApp().ajax('getCustomerMesg','','get',function(res){
      //console.log(res)
      var list = res.data.custmerMsg;
      for (var i = 0; i < list.length;i++){
        if (list[i].hxName == "customerService"){
          that.setData({
            customerServicePic: list[i].headPortrait
          })
        }
        if (list[i].hxName == "designer") {
          that.setData({
            designerPic: list[i].headPortrait
          })
        }
      }
    })
    //console.log(wx.getStorageSync('linkMan'))
    if (wx.getStorageSync('linkMan')){
      var linkList = JSON.parse(wx.getStorageSync('linkMan'));
      //console.log(linkList)
      var flag=true;
      for (var i = 0; i < linkList.length;i++){
        if (linkList[i].lastChat!=""){
          flag=false;
        }
        linkList[i].time = getApp().timeFormitRule(linkList[i].time);
      }
      this.setData({
        linkList: linkList,
        show: flag
      })
    }else{
      this.setData({
        show:true
      })
    }
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
  //跳转聊天室
  goChatRoom:function(event){
    //console.log(wx.getStorageSync('linkMan'))
    var linkList = JSON.parse(wx.getStorageSync('linkMan'));
    for(var i=0;i<linkList.length;i++){
      if (linkList[i].name == event.currentTarget.dataset.user){
        linkList[i].num=0;
      }
    }
    wx.setStorageSync('linkMan', JSON.stringify(linkList));
    //console.log(event.currentTarget.dataset.user);
    var nameList = {
      myName: wx.getStorageSync('myUsername') || '',
      your: event.currentTarget.dataset.user
    }
    wx.navigateTo({
      url: '/pages/chat/chatroom/chatroom?username=' + JSON.stringify(nameList)
    })
  }
})