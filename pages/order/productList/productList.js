// pages/order/productList/productList.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    maskHidden:true,//遮罩层
    totalMoney: 0,
    allAmount: 0,
    discountMoney: 0,
    productList: [],
    brandName: '',
    styleName: '',
    styleId:'',
    isChecked: 0,
    programmeId:'',
    isAllSelect:false,
    discount: 10,//折扣信息
    designId:'',
    changeDataList:[],//替换数据
    typeAll: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
    selectType:0,//选中款式
    aindex:0,//默认索引
    bindex:0,
    cindex:0
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //console.log(options.programme)
    var that = this;
    that.data.designId = options.programme;
    //获取商品列表
    getApp().ajax("queryGoodsListV3", { designId:options.programme }, 'POST', function (res) {
      //console.log(res.data);
      var programmeId='';
      var list = res.data.data.packageList;
      for(var i=0;i<list.length;i++){
        var locationList = [];
        if (list[i].group){
          for (var j = 0; j < list[i].group.childList.length;j++){
            var typeName = list[i].group.childList[j][0].typeName;
            if (locationList.indexOf(typeName)==-1){
              for (var x = 0; x < list[i].group.childList[j].length;x++){
                list[i].group.childList[j][x].showType = true;
              }
              locationList.push(typeName);
            }
          }
        }
      }
      for(var i=0;i<list.length;i++){
        if (list[i].group){
          list[i].roomList=[];
          list[i].roomList.push({ goodsList:[]});
          list[i].roomList[0].goodsList[0]= [list[i].group];
        }
        if (list[i].isCheck==1){
          list[i].mandatory=1;
          for (var j = 0; j < list[i].roomList.length;j++){
            for (var x = 0; x < list[i].roomList[j].goodsList.length;x++){
              list[i].roomList[j].goodsList[x][0].isCheck=true;
            }
          }
        }
      }

      //替换图片
      for (var i = 0; i < list.length; i++) {
        for (var j = 0; j < list[i].roomList.length; j++) {
          for (var x = 0; x < list[i].roomList[j].goodsList.length; x++) {
            programmeId = list[i].roomList[j].goodsList[x][0].designId;
            for (var y = 0; y < list[i].roomList[j].goodsList[x].length; y++) {
              var img = list[i].roomList[j].goodsList[x][y].goodsImages;
              if (img.indexOf(',') > -1) {
                var arr = img.split(',');
                list[i].roomList[j].goodsList[x][y].showImg = arr[0]+'-thum'
                list[i].roomList[j].goodsList[x][y].goodsImagesArr = arr;
              }else{
                list[i].roomList[j].goodsList[x][y].showImg = img + '-thum';
                list[i].roomList[j].goodsList[x][y].goodsImagesArr = [list[i].roomList[j].goodsList[x][y].goodsImages];
              }
              if (list[i].roomList[j].goodsList[x][y].childList) {
                for (var z = 0; z < list[i].roomList[j].goodsList[x][y].childList.length; z++) {
                  for (var v = 0; v < list[i].roomList[j].goodsList[x][y].childList[z].length; v++) {
                    var img = list[i].roomList[j].goodsList[x][y].childList[z][v].goodsImages;
                    if (img.indexOf(',') > -1) {
                      var arr = img.split(',');
                      list[i].roomList[j].goodsList[x][y].childList[z][v].showImg = arr[0] + '-thum';
                      list[i].roomList[j].goodsList[x][y].childList[z][v].goodsImagesArr = arr;
                    } else {
                      list[i].roomList[j].goodsList[x][y].childList[z][v].showImg = img + '-thum';
                      list[i].roomList[j].goodsList[x][y].childList[z][v].goodsImagesArr = [list[i].roomList[j].goodsList[x][y].childList[z][v].goodsImages];
                    }
                  }
                }
              }
            }
          }
        }
      }
      //console.log(list[0]);
      if(list.length==0){
        wx.showToast({
          title: '暂无商品！',
          icon: 'none',
          duration: 2000
        })
        return;
      }
      that.setData({
        productList: list,
        brandName: res.data.data.brandName,
        styleName: res.data.data.styleName,
        styleId: res.data.data.styleId,
        programmeId: programmeId,
        discount: list[0].discount || 10
      })
      that.computer();
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
  // Tab样式的改变
  tabChoose: function (event) {
    var index = event.currentTarget.dataset.id;
    var list = this.data.productList[index];
    //console.log(list)
    this.setData({
      discount: list.discount || 10,
      isChecked: index
    })
  },
  // 勾选事件处理函数
  switchSelect: function (e) {
    var price = e.target.dataset.price;
    if (!price){
      return;
    }
    var index = this.data.isChecked;

    if (this.data.productList[index].mandatory){
      wx.showToast({
        title: '该商品为必选商品,不可取消',
        icon: 'none',
        duration: 2000
      })
      return;
    }
    var list = this.data.productList[index].roomList;
    var aindex = parseInt(e.target.dataset.aindex);
    var bindex = parseInt(e.target.dataset.bindex);
    // 改变isCheck的状态，更新数据
    if (list[aindex].goodsList[bindex][0].isCheck){
      list[aindex].goodsList[bindex][0].isCheck = !list[aindex].goodsList[bindex][0].isCheck;
    }else{
      list[aindex].goodsList[bindex][0].isCheck = true;
    }
    
    var productList = this.data.productList;
    productList[index].roomList=list;

    this.setData({
      productList: productList
    })
    this.computer();
  },
  // 全选的处理函数
  AllSelect: function (e) {
    // 初始化 总价格和优惠价格
    var index = this.data.isChecked;
    var list = this.data.productList;
    for(var x=0;x<list.length;x++){
      if (!list[x].mandatory){
        for (var i = 0; i < list[x].roomList.length; i++) {
          for (var j = 0; j < list[x].roomList[i].goodsList.length; j++) {
            if (!this.data.isAllSelect) {
              list[x].roomList[i].goodsList[j][0].isCheck = true;
            } else {
              list[x].roomList[i].goodsList[j][0].isCheck = false;
            }
          }
        }
      }
    }
    //console.log(list)
    var productList = this.data.productList;
    productList = list;
    this.setData({
      productList: productList,
      isAllSelect: !this.data.isAllSelect
    })
    this.computer();
  },
  //计算
  computer:function(){
    var totalMoney=0,allAmount=0,discountMoney=0;
    var list = this.data.productList;
    var index = this.data.isChecked;//获取当前index
    var flag = [];//标记字段
    //特殊处理
    var specailTotal=0;
    var specailFlag=false;
    //console.log(list)
    //默认全选
    for (var i = 0; i < list.length; i++) {
      for (var j = 0; j < list[i].roomList.length; j++) {
        var goodsInfoList = list[i].roomList[j].goodsList;
        for (var x = 0; x < goodsInfoList.length; x++) {
          if(goodsInfoList[x][0].isCheck){
            flag.push('1');
            var discount = list[i].discount || 10;
            if (this.data.styleId == 11 && list[i].packageId == 16){
              specailFlag=true;
              //总价
              specailTotal += Math.round(parseFloat(goodsInfoList[x][0].unitPrice) * parseInt(goodsInfoList[x][0].goodsNum) * discount * 10);
            }
            //总价
            totalMoney = (parseFloat(totalMoney) + parseFloat(goodsInfoList[x][0].unitPrice) * parseInt(goodsInfoList[x][0].goodsNum)).toFixed(2);
            //折扣价
            discountMoney += Math.round(parseFloat(goodsInfoList[x][0].unitPrice) * parseInt(goodsInfoList[x][0].goodsNum) * discount * 10);
            //总数
            allAmount = parseInt(allAmount) + parseInt(goodsInfoList[x][0].goodsNum);
          }else{
            flag.push('0');
          }
        }
      }
    }
    if (flag.indexOf('0') == -1) {
      this.setData({
        isAllSelect: true,
        productList: list
      })
    } else {
      this.setData({
        isAllSelect: false,
        productList: list
      })
    }
    if (specailFlag && this.data.isAllSelect==true){
      this.setData({
        discountMoney: (discountMoney-specailTotal)/100
      })
    }else{
      this.setData({
        discountMoney: discountMoney / 100
      })
    }
    this.setData({
      totalMoney: totalMoney,
      allAmount: allAmount
    })
  },
  //替换商品
  changeGoods:function(e){
    var list = e.target.dataset.list;
    var aindex = e.target.dataset.index1;
    var bindex = e.target.dataset.index2;
    var selectType=0;
    if(list[0].isCheck){
      for (var i = 0; i < list; i++) {
        list[i].isCheck == list[0].isCheck;
      }
    }
   
    if (e.target.dataset.index3){
      var cindex = e.target.dataset.index3;
    }
    if (list[0].species!="替换"){
      for (var i = 0; i < list.length; i++) {
        list[i].classType = this.data.typeAll[i] + "款";
        list[i].classTypeId = i;
      }
    }else{
      var newList=[];
      var indexList=[];
      for (var i = 0; i < list.length; i++) {
        selectType = list[0].classTypeId;
        indexList.push(list[i].classTypeId);
      }
      indexList = indexList.sort();
      for (var i = 0; i < indexList.length; i++) {
        for(var j=0;j<list.length;j++){
          if (list[j].classTypeId == indexList[i]){
            newList.push(list[j]);
            break;
          }
        }
      }
      list=newList;
    }

    //console.log(e.target.dataset)
    if(list.length>1){
      this.setData({
        aindex: aindex,
        bindex: bindex,
        selectType:selectType,
        cindex: cindex || 0,
        maskHidden:false,
        changeDataList: list
      })
    }
  },
  //关闭弹窗
  closeMask:function(){
    this.setData({
      maskHidden: true
    })
  },
  //选择替换品
  selectClassType:function(e){
    var index = e.target.dataset.index;
    //console.log(e.target.dataset.index);
    this.setData({
      selectType:index
    })
  },
  //保存替换品
  saveChange:function(){
    var list = this.data.productList;
    var isChecked = this.data.isChecked;
    var changeList = this.data.changeDataList;
    var selectType = this.data.selectType;
    var aindex = this.data.aindex;
    var bindex = this.data.bindex;
    var cindex = this.data.cindex;
    var goods = changeList[selectType];
    changeList.splice(selectType,1);
    changeList.unshift(goods);

    if (goods.groupId || goods.groupId==0){
      list[isChecked].roomList[aindex].goodsList[bindex][0].childList[cindex] = changeList;
    }else{
      list[isChecked].roomList[aindex].goodsList[bindex] = changeList;
    }

    this.setData({
      productList: list,
      maskHidden: true
    })
    this.computer();
  },
  //跳转订单
  goOrder:function(e){
    var that=this;
    var productList = [];
    var list = that.data.productList;
    for (var i = 0; i < list.length; i++) {
      for (var j = 0; j < list[i].roomList.length; j++) {
        var goodsInfoList = list[i].roomList[j].goodsList;
        for (var x = 0; x < goodsInfoList.length; x++) {
          if (goodsInfoList[x][0].isCheck) {
            productList.push(goodsInfoList[x][0]);
          }
        }
      }
    }
    var info = {
      productList: productList,
      totalMoney: that.data.totalMoney,
      discountMoney: that.data.discountMoney,
      brandName: that.data.brandName,
      styleName: that.data.styleName,
      programmeId: that.data.programmeId
    }
    //console.log(that.data.programmeId)
    if (parseFloat(that.data.totalMoney) == 0) {
      wx.showToast({
        title: '您还没有选择商品',
        icon: 'none',
        duration: 2000
      })
      return;
    }
    var url = '/pages/order/confirm/confirm?list=' + JSON.stringify(info)
    getApp().checkToken(url,function(res){
      if (res){
        wx.navigateTo({
          url: url
        })
      }
    })
  },
  //查看详情
  showDetail:function(e){
    let list = e.currentTarget.dataset.data[e.currentTarget.id][0];
    
    if (list.species =="组合"){
      return;
    }
    var showPrice = true;
    if (list.groupId || list.groupId == 0) {
      showPrice = false;
    }
    let detail = JSON.stringify(list);
    wx.navigateTo({
      url: '/pages/order/productDetail/productDetail?detail=' + detail + '&showPrice=' + showPrice
    })
  }
})