Page({

  /**
   * 页面的初始数据
   */
  data: {
    mobileNum: '18268304329',
    pageStu:true,
    startX:0,//开始坐标
    startY: 0,
    index:0,
    notMessage: true,
    itemIndex:[],
    isTouchMove:false,
    jumpStatus:false,
    objData:[],
    dataAddress:{
      shipID: 2,  //用户收件地址id，修改订单地址时不可为空，新增地址时不传送
      linkman: '徐先生',  //联系人，不可为空
      mobileNum: '18268304329',  //联系电话，不可为空
      province: '浙江省',         //省，不可为空
      provinceId: '1',            //省id，不可为空
      city: '杭州市',              //市，不可为空
      cityId: '2',                //市id，不可为空
      distincts: '西湖区',         //区，不可为空
      distinctId: '3',             //区id，不可为空
      address: '天目山路国际花园写字楼7F' // 详细地址，不可为空
    },
    addressArr:[],
    //接受暂存数据
    data:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    if (options.optionsData) {
      let bb = JSON.parse(options.optionsData);
      that.setData({
        data: bb,
        jumpStatus:true
      })
    }
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
   this.onLoad(this.options)
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
  /**
 * 页面相关事件处理函数--监听用户下拉动作
 */
  //下拉刷新
  onPullDownRefresh: function () {
    var that = this;
    setTimeout(function () {
      wx.stopPullDownRefresh();
      that.onLoad(that.options);
    }, 1000)
  },

  // 获取地址信息
  getData: function(res){
    var that = this;
    that.data.addressArr = [];
    wx.getStorage({
      key: 'token',
      success: function(res) {
        getApp().ajax("queryShippingAddress", { token: res.data }, 'post', function (res) {
          //控制无网络时的状态
          if (res.data.addressList.length == 0) {
            // 控制无信息时的状态
            that.data.notMessage = true;
          } else {
            that.data.notMessage = false;
          }
          for (let i = 0; i < res.data.addressList.length; i++) {
            that.data.itemIndex.push(0);
          }
          that.setData({
            addressArr: res.data.addressList,
            itemIndex: that.data.itemIndex,
            notMessage: that.data.notMessage,
          })
        })
      },
    })
   
  },
  // 点击跳转到修改地址页面
  updateBtn(e){
    let that = this;
    //需要传到updataAddress 页面的参数
    that.data.objData = [];
    that.data.objData.push(e.target.dataset.index)
    that.data.objData.push(that.data.addressArr[e.target.dataset.index].shipID)
    that.data.objData.push(that.data.addressArr[e.target.dataset.index].linkman)
    that.data.objData.push(that.data.addressArr[e.target.dataset.index].mobileNum)
    that.data.objData.push(that.data.addressArr[e.target.dataset.index].province)
    that.data.objData.push(that.data.addressArr[e.target.dataset.index].provinceId)
    that.data.objData.push(that.data.addressArr[e.target.dataset.index].city)
    that.data.objData.push(that.data.addressArr[e.target.dataset.index].cityId)
    that.data.objData.push(that.data.addressArr[e.target.dataset.index].distincts)
    that.data.objData.push(that.data.addressArr[e.target.dataset.index].distinctId)
    that.data.objData.push(that.data.addressArr[e.target.dataset.index].address)
   
    //构建一个对象用来存储 地址id和 地址下标
    wx.navigateTo({
      //传一个index，用于重新调取接口，获取地址信息
      url: "/pages/order/updataAddress/updataAddress?indexValue="+JSON.stringify(that.data.objData)
    })
  },
  // 点击跳转到新增地址页面
  addAddress: function(){
    let that = this;
    wx.navigateTo({
      url: '/pages/order/addAddress/addAddress?pageStu='+that.data.pageStu
    })
  },
  // 手指触摸开始，记录起点坐标
  touchstart:function(e){
    let that = this;
    //重置 删除 按钮的状态
    if (that.data.isTouchMove == true){
      that.data.isTouchMove = false;
    }
    this.setData({
      startX: e.changedTouches[0].clientX,
      startY: e.changedTouches[0].clientY
    })
  },
  //滑动事件处理
  touchmove:function(e){
    var that = this,
      startX = that.data.startX,//开始X坐标
      startY = that.data.startY,//开始Y坐标
      touchMoveX = e.changedTouches[0].clientX,//滑动变化坐标
      touchMoveY = e.changedTouches[0].clientY,//滑动变化坐标
      //获取滑动角度
      angle = that.angle({ X: startX, Y: startY }, { X: touchMoveX, Y: touchMoveY });
    that.data.index = e.currentTarget.dataset.index,//当前索引
      that.data.isTouchMove = false
      //滑动超过30度角 return
      if (Math.abs(angle) > 30) return;
      var arr = that.data.itemIndex;
        if (touchMoveX > startX) //右滑
        {
          arr[that.data.index] = 0;
        } else {
          arr[that.data.index] = 1;
        }
      that.setData({
        itemIndex: arr
      })
  },
  /**
  * 计算滑动角度
  * @param {Object} start 起点坐标
  * @param {Object} end 终点坐标
  */
  angle: function (start, end) {
    var _X = end.X - start.X,
      _Y = end.Y - start.Y
    //返回角度 /Math.atan()返回数字的反正切值
    return 360 * Math.atan(_Y / _X) / (2 * Math.PI);
  },
  deleteAddress:function(e){
    let that = this;
    wx.showModal({
      title: '提示',
      content: '确认删除该地址吗？',
      duration: 1000,
      success: function (res) {
        if (res.confirm) {
          wx.getStorage({
            key: 'token',
            success: function (res) {
              getApp().ajax("deleteShippingAddress", {
                shipID: that.data.addressArr[e.currentTarget.dataset.index].shipID,
                token: res.data
              }, 'post', function (res) {
                //删除之后重新拉去数据
                that.getData();
              })
              that.data.itemIndex.splice(that.data.index);
            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      
      }
    })
  
 
  },
  
  defaultAddress:function(e){
    let that = this;
    if(that.data.jumpStatus){
      //选择的当前项
      let objData = JSON.stringify(that.data.addressArr[e.currentTarget.dataset.index]);
      //从确认订单页面带回来的数据
      let aa = JSON.stringify(that.data.data)
      wx.redirectTo({
        url: '/pages/order/confirm/confirm?obj=' + objData + '&product=' + aa,
      })
    }

  }

})