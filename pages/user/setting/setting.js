// pages/user/setting/setting.js
require('../../../utils/strophe.js')
var WebIM = require('../../../utils/WebIM.js').default
Page({

  /**
   * 页面的初始数据
   */
  data: {
    storageInfoSize:'0M'
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
    try {
      var res = wx.getStorageInfoSync()
      //console.log(res.keys)
     // console.log(res.currentSize)
      //console.log(res.limitSize)
      var num = res.currentSize / 1024;
      this.setData({
        storageInfoSize: num.toFixed(1)+'M'
      })
    } catch (e) {
      // Do something when catch error
    }
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
  //清除全部缓存
  clearAllStorage:function(e){
    wx.showLoading({
      title: '清理中',
      duration: 2000
    })
    try {
      wx.clearStorageSync();
      wx.hideLoading();
      wx.showToast({
        title: '清理成功',
        icon: 'success',
        duration: 2000,
        success:function(){
          setTimeout(function(){
            WebIM.conn.close();
          },1000)
        }
      })
    } catch (e) {
      // Do something when catch error
      wx.hideLoading();
      wx.showToast({
        title: '清理失败',
        icon: 'none',
        duration: 2000
      })
      console.log(e);
    }
  },
  //联系我们
  phoneCall:function(e){
    wx.showModal({
      title:'提示',
      content:'是否拨打4009667757？',
      showCancel:true,
      success: function (confirm){
        if (confirm){
          wx.makePhoneCall({
            phoneNumber: '4009667757'
          })
        }     
      }
    })
  },
  //退出登录
  loginOut:function(e){
    try {
      wx.removeStorageSync('loginFlag');
      wx.removeStorageSync('userInfo');
      wx.removeStorageSync('token'); 
      wx.showToast({
        title: '退出成功',
        icon: 'success',
        duration: 2000,
        success: function () {
          setTimeout(function () {
            WebIM.conn.close();
          }, 1000)
        }
      })
      setTimeout(function () {
        wx.switchTab({
          url: '/pages/user/user',
          complete: function (e) {
            var page = getCurrentPages().pop();
            if (page == undefined || page == null) return;
            page.onShow();
          } 
        })
      }, 1000)
    } catch (e) {
      // Do something when catch error
    }
  }
})