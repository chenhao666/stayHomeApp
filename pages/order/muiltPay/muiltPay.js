// pages/order/muiltPay/muiltPay.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderNo:'',
    alreadyAmount:0,
    allMoney:0,
    needPay:0,
    payNum:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //console.log(options);
    var str = JSON.parse(options.str)
    this.setData({
      orderNo: str.orderNo,
      allMoney: str.allMoney,
      alreadyAmount: str.alreadyAmount,
      needPay: (parseFloat(str.allMoney) - parseFloat(str.alreadyAmount)).toFixed(2)
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
  onPullDownRefresh: function () {

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
  //监听输入
  bindKeyInput:function(e){
    if (parseFloat(e.detail.value) != e.detail.value){
      this.setData({
        payNum:0
      })
      return 0;
    }
    if (parseFloat(e.detail.value) > parseFloat(this.data.needPay)){
      this.setData({
        payNum: parseFloat(this.data.needPay)
      })
      return parseFloat(this.data.needPay);
    }
    this.setData({
      payNum: e.detail.value
    })
  },
  goPay:function(){
    var that = this;
    if (that.data.payNum==''){
      wx.showToast({
        title: '支付金额不能为空',
        icon: 'none',
        duration: 2000
      })
      return;
    }
    if (parseInt(that.data.payNum) < 5000) {
      wx.showToast({
        title: '单笔支付金额不可小于5000',
        icon: 'none',
        duration: 2000
      })
      return;
    }
    var token = wx.getStorageSync('token');
    var timestamp = Date.parse(new Date());
    timestamp = parseInt(timestamp / 1000);
    //生成预支付订单
    var data = {
      orderNo: that.data.orderNo,
      token: token,
      alreadyAmount:that.data.payNum.toString(),
      payTypes: 1,
      appId: "wxb53277d6f003f586"
    }
    var orderNo = that.data.orderNo;
    getApp().ajax("saveOrderInstallment", data, 'POST', function (res) {
      //console.log(res);
      var info = JSON.parse(res.data.resultString);
      wx.requestPayment({
        'timeStamp': info.timestamp.toString(),
        'nonceStr': info.noncestr,
        'package': "prepay_id=" + info.prepayid,
        'signType': 'MD5',
        'paySign': info.sign,
        'success': function (res) {
          wx.showToast({
            title: '支付成功!',
            icon: 'success',
            duration: 2000
          })
          var str = {
            orderStatus: 1,
            orderNo: orderNo
          }
          wx.redirectTo({
            url: '/pages/order/orderDetail/orderDetail?orderStatus=' + JSON.stringify(str)
          })
        },
        'complete': function (res) {

          if (res.errMsg == "requestPayment:cancel") {
            wx.showToast({
              title: '支付失败!',
              icon: 'none',
              duration: 2000
            })
            wx.redirectTo({
              url: '/pages/order/payfail/payfail?orderNo=' + orderNo
            })
          }
        },
        'fail': function (res) {

          wx.showToast({
            title: '支付失败!',
            icon: 'none',
            duration: 2000
          })
          wx.redirectTo({
            url: '/pages/order/payfail/payfail?orderNo=' + orderNo
          })
        }
      })
    })
  }
})