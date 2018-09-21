// pages/user/register/register.js
require('../../../utils/strophe.js')
var WebIM = require('../../../utils/WebIM.js').default
Page({

  /**
   * 页面的初始数据
   */
  data: {
    mobile:'',//手机号
    code:'',//验证码
    wxCode:'',//微信登录code
    sendName:'发送验证码',//按钮名称
    disabled:false,
    userInfo:'',//用户信息
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var wxCode=options.code || '';
    var userInfo=options.userInfo
    this.setData({
      wxCode:wxCode,
      userInfo:userInfo
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
  //发送验证码
  secCode:function(){
    var that=this;
    var mobile = this.data.mobile;
    var Ptest= /^1[34578]{1}\d{9}$/;
    if (!Ptest.test(mobile)) {
      wx.showToast({
        title: '请输入正确的手机号!',
        icon: 'none',
        duration: 2000
      })
      return;
    }
    var t=60;
    var timer=setInterval(function(){
      t--;
      that.setData({
        sendName:t,
        disabled:true
      })
      if(t==0){
        that.setData({
          sendName: '重新发送',
          disabled: false
        })
        clearTimeout(timer)
      }
    },1000)
    //获取手机验证码
    getApp().ajax("sendCode", { "sendType": "1", "mobileNum": mobile}, 'POST', function (res) {})
  },
  //手机号
  bindKeyInput: function (e) {
    this.setData({
      mobile: e.detail.value
    })
  },
  //验证码
  bindKeyCode: function (e) {
    this.setData({
      code: e.detail.value
    })
  },
  //绑定手机号
  bindMobile:function(e){
    var that=this;
    var mobile=this.data.mobile;
    var code=this.data.code;
    var wxCode = this.data.wxCode;
    var Ptest = /^1[34578]{1}\d{9}$/;
    if (!Ptest.test(mobile)) {
      wx.showToast({
        title: '请输入正确的手机号!',
        icon: 'none',
        duration: 2000
      })
      return;
    }
    if (code=="" || code.length!=6) {
      wx.showToast({
        title: '请输入正确的验证码!',
        icon: 'none',
        duration: 2000
      })
      return;
    }
    //注册
    getApp().ajax("wechatSignUp", { "wxCode": wxCode, "mobileNum": mobile, "mobileCode": code }, 'POST', function (res) {
        //console.log(res)
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
          data:'1'
        })
        wx.setStorage({
          key: "userInfo",
          data:that.data.userInfo
        })
        WebIM.conn.open(options, function () {
          wx.switchTab({
            url: '/pages/user/user'
          })
        });
     })
  }
})