// pages/order/confirm/confirm.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    orderStatus: -1,
    addressData: {},
    addressArr: [],
    message:{},
    maskHidden:true,
    defaultAddress: 0,
    notMessage: false,
    payTime:'',
    getArr: [],
    requireData: {
      allMoney: 0
    },
    totalData: {},
    orderNumber: '',

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    if (options.product) {
      let cc = JSON.parse(options.product);
      that.setData({
        requireData: cc
      })

    }
    //接收我的订单传过来的订单编号以及订单状态
    if (options.orderStatus) {
      let dd = JSON.parse(options.orderStatus);
      that.setData({
        orderStatus: dd.orderStatus, //订单状态
        orderNumber: dd.orderNo  //订单编号
      })
      //获取到订单编号，调取订单数据
      if (that.data.orderNumber !== '') {
        that.getOrderDetail();
      }
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
  onPullDownRefresh: function () {
    var that = this;
    setTimeout(function () {
      wx.stopPullDownRefresh();
      that.onLoad(that.options);
    }, 1000)
  },
  //获取我的订单详情 
  getOrderDetail() {
    let that = this;
    getApp().ajax("queryOrderDetailByNoV3", { orderNo: that.data.orderNumber }, 'post', function (res) {
      //console.log(res)
      var payTime = res.data.goodsOrders.updateTime;
      if (payTime.indexOf('.')>-1){
        var payTimeArr = payTime.split('.');
        payTime = payTimeArr[0]
      }
      that.setData({
        payTime: payTime
      })
      var list = res.data.orderDetailList;
      //console.log(list);
      for(var i=0;i<list.length;i++){
        for (var j = 0; j < list[i].orderDetails.length;j++){
          if (list[i].orderDetails[j].groupInfoList){
            for (var x = 0; x < list[i].orderDetails[j].groupInfoList.length;x++){
              var imageUrl = list[i].orderDetails[j].groupInfoList[x].imageUrl;
              if (list[i].orderDetails[j].groupInfoList[x].imageUrl.indexOf(',') > -1) {
                var arr = imageUrl.split(',');
                list[i].orderDetails[j].groupInfoList[x].imageUrl = arr[0]+'-thum';
                list[i].orderDetails[j].groupInfoList[x].imageUrlArr=arr;
              }else{
                list[i].orderDetails[j].groupInfoList[x].imageUrl = imageUrl + '-thum';
                list[i].orderDetails[j].groupInfoList[x].imageUrlArr = [imageUrl];
              }
            }
          }else{
            var imageUrl = list[i].orderDetails[j].imageUrl;
            if (list[i].orderDetails[j].imageUrl.indexOf(',')>-1){
              var arr = imageUrl.split(',');
              list[i].orderDetails[j].imageUrl = arr[0] + '-thum';
              list[i].orderDetails[j].imageUrlArr = arr;
            }else{
              list[i].orderDetails[j].imageUrl = imageUrl + '-thum';
              list[i].orderDetails[j].imageUrlArr = [imageUrl];
            }
          }
        }
      }  
      //更新调取到的数据
      that.setData({
        orderStatus: res.data.goodsOrders.orderStatus,
        addressData: res.data.goodsOrders,   //地址信息
        defaultAddress: 1,  //显示地址信息的表示
        requireData: list//给订单信息赋值
      })
    })
  },
  //去付款
  goPay() {
    this.setData({
      maskHidden: false
    })
  },
  cancelPay(){
    let that = this;
    wx.showModal({
      title: '提示',
      content:'确认取消订单？',
      success: function (res) {
        if (res.confirm) {
          getApp().ajax("cancelOrder", { orderNo: that.data.orderNumber }, 'post', function (res) {
            //设置默认地址
            if (res.data.retCode === 0) {
              that.getOrderDetail();
              that.onLoad(that.options);
              wx.showToast({
                title: '已取消',
                icon: 'success',
                duration: 2000
              })
            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  
  },
  showDetail:function(e){
    let that= this;
    let token = wx.getStorageSync("token");
    let detail = e.currentTarget.dataset.data[e.currentTarget.dataset.index];
    let dataType = e.currentTarget.dataset.type;
    //console.log(detail)
    if (detail.species=="组合"){
      return;
    }

    var showPrice=true;
    if (dataType=="2"){
      showPrice=false;
    }
    wx.navigateTo({
      url: '/pages/order/productDetail/productDetail?orderDetail=' + JSON.stringify(detail) + '&showPrice=' + showPrice
    })
  },
  //关闭支付
  closePay: function () {
    this.setData({
      maskHidden: true
    })
  },
  //调用支付
  payWx: function () {
    let that = this;
    //订单编号
    let orderNum = that.data.orderNumber;
    //调取付款接口
    // getApp().ajax("toGenerateOrders", {orderNo:orderNum}, 'post', function (res) {
    //   //设置默认地址
    //   if (res.data.Code === 0) {
    //     console.log("成功")
    //   }
    // })
    var token = wx.getStorageSync('token');
    //调取付款接口

    var timestamp = Date.parse(new Date());
    timestamp = parseInt(timestamp / 1000);
    //生成预支付订单
    var data = {
      orderNo: orderNum,
      token: token,
      payTypes: 1,
      appId: "wxb53277d6f003f586"
    }
    var orderNo = orderNum;
    getApp().ajax("saveOrderInstallment", data, 'POST', function (res) {
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
  },
  //多次支付
  goMuiltPay: function () {
    let that = this;
    //订单编号
    let orderNum = that.data.orderNumber;
    var str = {
      orderNo: orderNum,
      allMoney: that.data.addressData.actualAmount/100,
      alreadyAmount: (parseFloat(that.data.addressData.actualAmount) - parseFloat(that.data.addressData.remainAmount))/100,
    }
    wx.redirectTo({
      url: '/pages/order/muiltPay/muiltPay?str=' + JSON.stringify(str)
    })
  },
  //复制订单编号
  copyNum:function(e){
    var that=this;
    wx.setClipboardData({
      data: that.data.orderNumber,
      success: function (res) {
        wx.showToast({
          title: '复制成功！',
          icon: 'none',
          duration: 2000
        })
      },
      fail:function(e){
        wx.showToast({
          title: '复制失败！',
          icon: 'none',
          duration: 2000
        })
        console.log(e)
      }
    })
  }
})