// pages/user/user.js
require('../../utils/strophe.js')
var WebIM = require('../../utils/WebIM.js').default
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loginFlag:false,//登录状态
    nickName: '',//用户昵称
    userPhoto: '',//用户头像
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
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this;
    wx.getStorage({
      key: 'token',
      success: function (res) {
        wx.getStorage({
          key: 'userInfo',
          success: function (res) {
            //console.log(JSON.parse(res.data))
            var userInfo = JSON.parse(res.data);
            that.setData({
              nickName: userInfo.nickName,
              userPhoto: userInfo.avatarUrl,
              loginFlag: true
            })
          }
        })
      },
      fail: function(e){
        that.setData({
          loginFlag: false,//登录状态
          nickName: '',//用户昵称
          userPhoto: '',//用户头像
        })
      }
    })
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
      that.onShow();
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
  //登录
  bindGetUserInfo:function(event){
    if (this.data.loginFlag) return;
    wx.showLoading({
      title: '正在登录...'
    });
    var that = this;
    var userInfo = event.detail.userInfo;
    // 查看是否授权
    wx.getSetting({
      success: function (res) {
        //console.log(res)
        if (res.authSetting['scope.userInfo']) {
            //检验session是否有效
          wx.login({
            success: function (res) {
              //console.log(res)
              //登陆成功
              if (res.code) {
                var wxCode = res.code;
                getApp().ajax("wechatLogin", { "wxCode": wxCode }, 'POST', function (res) {
                  //console.log(res);
                  if (res.data.resultType == 1) {
                    //console.log(1)
                    wx.navigateTo({
                      url: '/pages/user/register/register?code=' + wxCode + '&userInfo=' + JSON.stringify(userInfo)
                    })
                  }else{
                    wx.setStorage({
                      key: "token",
                      data: res.data.token
                    })
                    //登录环信
                    var options = {
                      apiUrl: WebIM.config.apiURL,
                      user: res.data.userInfo.hxName,
                      pwd: res.data.userInfo.hxPassWord,
                      grant_type: 'password',
                      appKey: WebIM.config.appkey //应用key
                    }
                    wx.setStorage({
                      key: "myUsername",
                      data: res.data.userInfo.hxName
                    })
                    wx.setStorage({
                      key: "loginFlag",
                      data: '1'
                    })
                    wx.setStorage({
                      key: "userInfo",
                      data: JSON.stringify(userInfo)
                    })
                    WebIM.conn.open(options,function(){
                      if(wx.getStorageSync('goUrl')){
                        wx.navigateTo({
                          url: wx.getStorageSync('goUrl')
                        })
                      }else{
                        that.onShow();
                      }
                    });
                  }
                })
              } else {
                wx.hideLoading();
                wx.showToast({
                  title: '登录失败',
                  icon: 'none',
                  duration: 2000
                })
              }
            },
            fail: function () {
              wx.hideLoading();
              wx.showToast({
                title: '登录失败',
                icon: 'none',
                duration: 2000
              })
            }
          })
        } else {
          wx.hideLoading();
          wx.showToast({
            title: '用户未授权',
            icon: 'none',
            duration: 2000
          })
        }
      }
    })
  },
  //跳转到我的订单
  myOrder: function () {
    if (wx.getStorageSync('token')) {
      wx.navigateTo({
        url: '/pages/order/myOrder/myOrder'
      })
    } else {
      wx.showToast({
        title: '请先进行登录操作',
        icon: 'none',
        duration: 2000
      })
    }
  },
  //地址管理
  addressManage: function () {
    if (wx.getStorageSync('token')) {
      wx.navigateTo({
        url: '/pages/order/selectAddress/selectAddress'
      })
    } else {
      wx.showToast({
        title: '请先进行登录操作',
        icon: 'none',
        duration: 2000
      })
    }
  },
  //跳转到我的方案
  programmeManage:function() {
    if (wx.getStorageSync('token')){
      wx.navigateTo({
        url: '/pages/programme/myprogramme/myprogramme'
      })
    }else{
      wx.showToast({
        title: '请先进行登录操作',
        icon: 'none',
        duration: 2000
      })
    }
  }

})