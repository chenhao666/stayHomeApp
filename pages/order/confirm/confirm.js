// pages/order/confirm/confirm.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    addressData:{},
    addressArr:[],
    defaultAddress:0,
    notMessage: false,
    maskHidden:true,
    checked:true,
    getArr:[],
    requireData: {
      allMoney: 0
    },
    totalData:{}

  },
 
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    that.data.addressData={}
    //选择完地址返回时，再次对数据进行处理
    if (options.product){
      //带到f页面的列表数据
      that.data.totalData = JSON.parse(options.product);
      //解析接受到的数据
      let product = JSON.parse(options.product);
      //计算优惠的价格，并将价格放到product里面
      product.allMoney = (parseFloat(product.totalMoney) - parseFloat(product.discountMoney)).toFixed(2)
      //将计算的价格，放到传入selectAddress页面的参数中
      that.data.totalData.allMoney = product.allMoney;
      //更新数据
      that.setData({
        requireData: product
      })
      //遍历接受到的数据，重新组合用于页面的渲染
      var productList = that.data.requireData.productList,
        flag = 0,
        data = [];
      for (var i = 0; i < productList.length; i++) {
        var az = '';
        for (var j = 0; j < data.length; j++) {
          if (data[j][0].packageName == productList[i].packageName) {
            flag = 1;
            az = j;
            break;
          }
        }
        if (flag == 1) {
          data[az].push(productList[i]);
          flag = 0;
        } else if (flag == 0) {
          let wdy = new Array();
          wdy.push(productList[i]);
          data.push(wdy);
        }
      }

      that.setData({
        getArr: data
      })
    }
    
    //接收订单列表传过来的信息
    if (options.list){ 
      //带到f页面的列表数据
      that.data.totalData = JSON.parse(options.list);
      //解析接受到的数据
      let list = JSON.parse(options.list);
      //console.log(list)
      //计算优惠的价格，并将价格放到list里面
      list.allMoney = (parseFloat(list.totalMoney) - parseFloat(list.discountMoney)).toFixed(2)
      //将计算的价格，放到传入selectAddress页面的参数中
      that.data.totalData.allMoney = list.allMoney;
      //更新数据
      that.setData({
        requireData: list
      })
      //遍历接受到的数据，重新组合用于页面的渲染
      var list = that.data.requireData.productList,
        flag = 0,
        data = [];
      for (var i = 0; i < list.length; i++) {
        var az = '';
        for (var j = 0; j < data.length; j++) {
          if (data[j][0].packageName == list[i].packageName) {
            flag = 1;
            az = j;
            break;
          }
        }
        if (flag == 1) {
          data[az].push(list[i]);
          flag = 0;
        } else if (flag == 0) {
          let wdy = new Array();
          wdy.push(list[i]);
          data.push(wdy);
        }
      }
      //console.log(data)
      that.setData({
        getArr: data
      })
    }

  //接受地址信息
    if (options.obj){
      //第二次选择地址时，接收返回过来的数据
      if (options.product){
        that.data.totalData = JSON.parse(options.product);
        that.setData({
          requireData: that.data.totalData
        })
      }
      let aa = JSON.parse(options.obj);
      that.setData({
        addressData: aa,
        defaultAddress:1
      })
   }else{
      that.getData();
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
    this.onLoad(this.options);
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
  // 跳转到选择地址页面
  selectAddress:function(){
    let that = this;
    let total =JSON.stringify(that.data.totalData)
    wx.navigateTo({
      url: '/pages/order/selectAddress/selectAddress?optionsData=' + total
    })
  },
 
  //获取默认地址信息
  getData: function (res) {
    var that = this;
    that.data.addressArr = []
    that.data.addressData={}
    wx.getStorage({
      key: 'token',
      success: function(res) {
        getApp().ajax("queryShippingAddress", { token: res.data }, 'post', function (res) {
      
          if (res.data.addressList.length == 0) {
            // 控制无信息时的状态
            that.data.notMessage = true;
          } else {
            that.data.notMessage = false;
          }
          if (res.data.addressList[0]){
            that.setData({
              addressData: res.data.addressList[0]
            })
          }
          //设置默认地址
          that.setData({
            defaultAddress: res.data.addressList.length
          })
    
        })
      },
    })
   
  },
  //去付款
  goPay(){
    
    let that= this;
    //构建数据
    if (that.data.addressData.linkman !== undefined){
      if (!this.data.checked){
        wx.showToast({
          title: '请先阅读并同意《购买须知》!',
          icon: 'none',
          duration: 2000
        })
        return;
      }
      this.setData({
        maskHidden: false
      })
    }else{
      wx.showToast({
        title: '请选择收货地址',
        icon: 'none',
        duration: 1000
      })
    }
  
  },
  //关闭支付
  closePay:function(){
    this.setData({
      maskHidden:true
    })
  },
  //调用支付
  payWx:function(){
    let that = this;
    let data = {
      brandName: "",
      designId: "",
      shipID: 0,
      packageList: [],
      styleName: "",
      totalPrice: 0,
      token: ""
    }
    let arrays = [];
    let ids = [];
    let types = [];
    // let str=[];
    data.brandName = that.data.requireData.brandName;
    data.designId = that.data.requireData.programmeId;
    data.shipID = that.data.addressData.shipID;
    data.styleName = that.data.requireData.styleName;
    data.totalPrice = Number(that.data.requireData.discountMoney);
    data.token = wx.getStorageSync('token');
    var str = JSON.stringify(that.data.getArr)
    var str1 = str.replace(/\"goodsCode\"/g, '"brandGoodId"')
    var str2 = str1.replace(/\"goodsNum\"/g, '"number"')
    var str3 = JSON.parse(str2)
    for (let i = 0; i < str3.length; i++) {
      ids.push(str3[i][0].roomId);
      data.packageList.push({
        goodsList: str3[i],
        roomId: ids[i]
      })

    }
    //console.log(data)
    for (var i = 0; i < data.packageList.length;i++){
      for (var j = 0; j < data.packageList[i].goodsList.length;j++){
        data.packageList[i].packageId = data.packageList[i].goodsList[0].packageId;
        if (data.packageList[i].goodsList[j].childList) {
          for (var x = 0; x < data.packageList[i].goodsList[j].childList.length; x++) {
            if (!data.packageList[i].goodsList[j].groupList){
              data.packageList[i].goodsList[j].groupList = [];
            }
            data.packageList[i].goodsList[j].groupList.push(data.packageList[i].goodsList[j].childList[x][0].id);
          }
        }
      } 
    }
    var token = wx.getStorageSync('token');
    //console.log(that.data.addressData)
    //调取付款接口
    getApp().ajax("toGenerateOrdersV3", data, 'post', function (res) {
      //console.log(res)
      //设置默认地址
      //var rand = that.generateMixed(32);
      //console.log(rand)
      if (res.data.retCode === 0) {
        //console.log("成功")
        //获取当前时间戳
        var timestamp = Date.parse(new Date());
        timestamp = parseInt(timestamp / 1000);
        //生成预支付订单
        var data = {
          orderNo: res.data.orderNo,
          token: token,
          payTypes: 1,
          appId: "wxb53277d6f003f586"
        }
        var orderNo = res.data.orderNo;
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
                  url: '/pages/order/payfail/payfail?orderNo='+orderNo
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
  },
  //多次支付
  goMuiltPay:function(){
    let that = this;
    let data = {
      brandName: "",
      designId: "",
      shipID: 0,
      packageList: [],
      styleName: "",
      totalPrice: 0,
      token: ""
    }
    let arrays = [];
    let ids = [];
    let types = [];
    // let str=[];
    data.brandName = that.data.requireData.brandName;
    data.designId = that.data.requireData.programmeId;
    data.shipID = that.data.addressData.shipID;
    data.styleName = that.data.requireData.styleName;
    data.totalPrice = Number(that.data.requireData.discountMoney);
    data.token = wx.getStorageSync('token');
    var str = JSON.stringify(that.data.getArr)
    var str1 = str.replace(/\"goodsCode\"/g, '"brandGoodId"')
    var str2 = str1.replace(/\"goodsNum\"/g, '"number"')
    var str3 = JSON.parse(str2)
    for (let i = 0; i < str3.length; i++) {

      ids.push(str3[i][0].roomId);
      data.packageList.push({
        goodsList: str3[i],
        roomId: ids[i]
      })

    }
    //console.log(data)
    for (var i = 0; i < data.packageList.length; i++) {
      for (var j = 0; j < data.packageList[i].goodsList.length; j++) {
        if (data.packageList[i].goodsList[j].childList) {
          for (var x = 0; x < data.packageList[i].goodsList[j].childList.length; x++) {
            if (!data.packageList[i].goodsList[j].groupList) {
              data.packageList[i].goodsList[j].groupList = [];
            }
            data.packageList[i].goodsList[j].groupList.push(data.packageList[i].goodsList[j].childList[x][0].id);
          }
        }
      }
    }
    var token = wx.getStorageSync('token');
    //console.log(that.data.addressData)
    //调取付款接口
    getApp().ajax("toGenerateOrdersV3", data, 'post', function (res) {
      //console.log(res)
      //设置默认地址
      //var rand = that.generateMixed(32);
      //console.log(rand)
      if (res.data.retCode === 0) {
        var orderNo = res.data.orderNo;
        var str={
          orderNo: orderNo,
          allMoney: that.data.requireData.discountMoney,
          alreadyAmount:0
        }
        wx.redirectTo({
          url: '/pages/order/muiltPay/muiltPay?str=' + JSON.stringify(str)
        })
      }
    })
  },
  //改变状态
  changeCheck:function(){
    this.setData({
      checked: !this.data.checked
    })
  },
  //跳转
  goArticle:function(){
    var url ='https://m.wojiali.cn/file/agreement/index.html';
    wx.navigateTo({
      url: '/pages/programme/showThree/showThree?url=' + url
    })
  }
  //获取32位数据字符串
  /*generateMixed:function(n) {
    var chars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    var res = "";
    for(var i = 0; i<n; i++) {
      var id = Math.ceil(Math.random() * 35);
        res += chars[id];
      }
    return res;
  }*/
})