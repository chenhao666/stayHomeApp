// pages/order/updataAddress/updataAddress.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    region: [],
    arr: [],
    pageStu: false,
    // columnIndex:'',
    // columnValue:'',
    multiIndex: [0, 0, 0],
    arrData: [[], [], []],
    isShow: false,
    flag: true,
    provinceValue: 0,
    customItem: '全部',
    indexValue: [],
    addressValue: '',
    //新增数据    
    requireData: {
      shipID: '',
      linkman: '',  //联系人，不可为空
      token: '',  //联系电话，不可为空
      province: '',         //省，不可为空
      provinceId: '',            //省id，不可为空
      city: '',              //市，不可为空
      cityId: '',                //市id，不可为空
      distincts: '',         //区，不可为空
      distinctId: '',             //区id，不可为空
      address: '' // 详细地址，不可为空
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // indexValue  接收到的地址下标  以及 地址id
    let that = this;
    if (options.indexValue) {
      // 获取带过来的数据，显示在修改地址页面
      that.setData({
        indexValue: JSON.parse(options.indexValue),
        requireData: {
          linkman: JSON.parse(options.indexValue)[2],
          mobileNum: JSON.parse(options.indexValue)[3],
          province: JSON.parse(options.indexValue)[4],
          provinceId: JSON.parse(options.indexValue)[5],
          city: JSON.parse(options.indexValue)[6],
          cityId: JSON.parse(options.indexValue)[7],
          distincts: JSON.parse(options.indexValue)[8],
          distinctId: JSON.parse(options.indexValue)[9],
          address: JSON.parse(options.indexValue)[10]
        }
      })

    } else if (options.pageStu) {
      let that = this;
      that.setData({
        pageStu: options.pageStu
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    //获取地区选择器的数据
    this.getAddress();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function (options) {

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



  isShow: function () {
    this.data.isShow = true;
    this.setData({
      isShow: this.data.isShow
    })
  },
  bindcancel: function () {
    this.data.isShow = false;
    this.setData({
      isShow: this.data.isShow
    })
  },
  // 获取所在地区的数据
  getAddress: function (e) {
    let that = this;
    getApp().ajax("queryProvince", {}, 'post', function (res) {

      // 将数组拷贝到一个新的数组中
      var arr = res.data.provinceList;
      that.setData({
        arr: arr
      })
      // 循环省，将省以对象的方式，放到region[0]数组里面
      for (let i = 0; i < arr.length; i++) {
        //第一列的值
        that.data.arrData[0].push({
          value: arr[i].province,
          index: arr[i].provinceId
        })
      }

      //region[1]的初始数据
      for (let m = 0; m < that.data.arr[0].cityList.length; m++) {
        that.data.arrData[1].push({
          value: that.data.arr[0].cityList[m].city,
          index: that.data.arr[0].cityList[m].cityId,
        })
      }
      //region[2]的初始化数据
      for (let n = 0; n < that.data.arr[0].cityList.length; n++) {
        that.data.arrData[2].push({
          value: that.data.arr[0].cityList[0].distinctsList[n].distincts,
          index: that.data.arr[0].cityList[0].distinctsList[n].distinctId,
        })
      }
      that.setData({
        region: that.data.arrData
      })
    })
  },

  // 获取用户的表单数据
  bindFormSubmit: function (e) {
    let that = this;
    // 构建要提交的数据对象
    that.setData({
      'requireData.linkman': e.detail.value.linkman,
      'requireData.mobileNum': e.detail.value.mobileNum,
      'requireData.address': e.detail.value.address,
    })
    var warn = "";
    // 获取修改列的下标值
    if (that.data.indexValue.length > 0) {
      that.data.requireData.shipID = that.data.indexValue[1]
    }
    // 重新获取修改地址页面的数据
    that.data.requireData.token = wx.getStorageSync('token');
    //对地址信息进行判断
    if (that.data.requireData.linkman == '') {
      warn = "请填写联系人姓名"
    } else if (that.data.requireData.mobileNum == '') {
      warn = "请填写您的手机号"
    } else if (!(/^1(3|4|5|7|8)\d{9}$/.test(that.data.requireData.mobileNum))) {
      warn = "手机号格式不正确"
    } else if (that.data.requireData.province == '' || that.data.requireData.city == '' || that.data.requireData.distincts == '') {
      warn = "请选择您的所在地区"
    } else if (that.data.requireData.address == '') {
      warn = "请填写您的详细地址"
    } else {
      that.data.flag = false;
      getApp().ajax("addShippingAddress", that.data.requireData, 'post', function (res) {
        if (res.data.retCode == 0) { }
      })
      wx.navigateBack({
        delta: 1
      })
    }
    if (that.data.flag == true) {
      wx.showModal({
        title: '提示',
        content: warn
      })
    }
  },
  bindRegionChange: function (e) {
    let that = this;
    if (e.target.dataset.province) {
      that.setData({
        'requireData.province': e.target.dataset.province,
        'requireData.provinceId': e.target.dataset.provinceid,
      })
    }
    if (e.target.dataset.city) {
      that.setData({
        'requireData.city': e.target.dataset.city,
        'requireData.cityId': e.target.dataset.cityid,
      })
    }
    if (e.target.dataset.distincts) {
      that.setData({
        'requireData.distincts': e.target.dataset.distincts,
        'requireData.distinctId': e.target.dataset.distinctid,
      })
    }
    that.setData({
      // 确定点击是第几个
      multiIndex: e.detail.value,
    })
  },
  // 每一列的值改变时触发
  bindMultiPickerColumnChange: function (e) {
    var arr = this.data.multiIndex;
    arr[e.detail.column] = e.detail.value;
    this.setData({
      multiIndex: arr
    })
    let that = this;
    if (e.detail.column == 0) {
      //将所选省对应的市显示出来
      that.data.arrData[1] = [];
      // 选择该列的第几个
      that.data.provinceValue = e.detail.value;

      for (let i = 0; i < that.data.arr[e.detail.value].cityList.length; i++) {
        //拿出来 所选省下面所有的市
        that.data.arrData[1].push({
          index: that.data.arr[e.detail.value].cityList[i].cityId,
          value: that.data.arr[e.detail.value].cityList[i].city
        })
      }
      that.data.arrData[2] = [];
      for (let p = 0; p < that.data.arr[e.detail.value].cityList[0].distinctsList.length; p++) {
        //拿出来 所选省下面所有的市
        that.data.arrData[2].push({
          index: that.data.arr[e.detail.value].cityList[0].distinctsList[p].distinctId,
          value: that.data.arr[e.detail.value].cityList[0].distinctsList[p].distincts
        })
      }
      that.setData({
        region: that.data.arrData
      })
    } else if (e.detail.column == 1) {
      //初始化区列表
      this.data.arrData[2] = [];
      //将市对应的区拿出来
      for (var j = 0; j < that.data.arr[that.data.provinceValue].cityList[e.detail.value].distinctsList.length; j++) {
        //拿出来 所选省下面所有的市
        that.data.arrData[2].push({
          index: that.data.arr[that.data.provinceValue].cityList[e.detail.value].distinctsList[j].distinctId,
          value: that.data.arr[that.data.provinceValue].cityList[e.detail.value].distinctsList[j].distincts
        })
      }
      that.setData({
        region: that.data.arrData
      })
    }
  }

})