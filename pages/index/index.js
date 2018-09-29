// pages/index/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    location:'海南',
    //banner
    imgUrls: [],
    styleArr:[],//风格数组
    indicatorDots: true,
    autoplay: true,
    interval: 5000,
    duration: 1000,
    select:0,
    fixedTab:false,//浮动tab
    tabTop:0,//tab距离上面距离
    changeHeight:0,//swipper高度
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (this.data.imgUrls.length == 0) {
      if (wx.getStorageSync('indexData')) {
        this.setData(wx.getStorageSync('indexData'));
        this.setData({
          select: 0,
          fixedTab: false,//浮动tab
          tabTop: 0,//tab距离上面距离
          changeHeight: 0,//swipper高度
        })
      }
    }
    //获取tab距离
    var query = wx.createSelectorQuery();
    query.select("#tab").boundingClientRect();
    query.selectViewport().scrollOffset();
    var that = this;
    query.exec(function (res) {
      //console.log(res[0].top)      // #the-id节点的上边界坐标
      that.setData({
        "tabTop": res[0].top
      })
    })
    //获取banner图列表
    getApp().ajax("queryBanners", {}, 'GET', function (res) {
      //console.log(res);
      that.setData({
        imgUrls: res.data.banners
      })
      wx.setStorageSync('indexData', that.data);
    })
    //获取风格列表
    var data = {
      "conditions": "styleId"
    }
    getApp().ajax("queryDesignProgram", data, 'POST', function (res) {
      //console.log(res)
      var list = res.data.designInfos;
      var idArr = [];
      for (var i = 0; i < list.length; i++) {
        idArr.push(parseInt(list[i].styleId));
      }
      idArr = idArr.sort(that.sortNumber);
      var styleArr = [];
      for (var i = 0; i < idArr.length; i++) {
        for (var j = 0; j < list.length; j++) {
          if (parseInt(idArr[i]) == parseInt(list[j].styleId)) {
            styleArr.push(list[j]);
            break;
          }
        }
      }
      //console.log(styleArr)
      that.setData({
        styleArr: styleArr
      })
      wx.setStorageSync('indexData', that.data);
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
    this.setData({
      select: 0
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
    var that=this;
    setTimeout(function () {
      wx.stopPullDownRefresh();
      that.onLoad();
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
  //选择风格
  selectStyle:function(event){
    //console.log(event.currentTarget.dataset.index)
    this.setData({
      select: event.currentTarget.dataset.index
    })
  },
  //监听页面滚动
  onPageScroll: function (ev) {
    //console.log(ev)
    let scrollTop = ev.scrollTop;
    if (scrollTop > this.data.tabTop) {
      this.setData({
        "fixedTab": true 
      })
    } else {
      this.setData({
        "fixedTab": false
      })
    }
  },
  //滑块变化
  changeCurrent:function(ev){
    //console.log(ev.detail.current)
    this.setData({
      select: ev.detail.current
    })
    //改变高度
    var index = this.data.select;
    var query = wx.createSelectorQuery();
    query.select("#list_item" + index).boundingClientRect();
    var that = this;
    query.exec(function (res) {
      that.setData({
        "changeHeight": res[0].height
      })
    })
  },
  //改变高度
  OnChangeHeight:function(e){
    //console.log(e);
    var that=this;
    //改变高度
    var index = this.data.select;
    var query = wx.createSelectorQuery();
    query.select("#list_item" + index).boundingClientRect();
    var that = this;
    query.exec(function (res) {
      that.setData({
        "changeHeight": res[0].height
      })
    })
  },
  //banner图点击
  bannerTap:function(e){
    //console.log(e.target.dataset.index);
    var index = e.target.dataset.index;
    var bannerType = e.target.dataset.type;
    if (bannerType==1){
      var nameList = {
        myName: wx.getStorageSync('myUsername') || '',
        your: 'designer'
      }//跳转信息
      var linkManList = {
        name: 'designer',
        num: 0,
        lastChat: '',
        time: ''
      }
      if (wx.getStorageSync('linkMan')){
        var flag = 0;//标记
        var list = JSON.parse(wx.getStorageSync('linkMan')) || [];
        for (var i = 0; i < list.length; i++) {
          if (list[i].name == 'designer') {
            flag = 1;
          }
        }
        if (!flag) {
          list.push(linkManList);
          wx.setStorage({
            key: "linkMan",
            data: JSON.stringify(list)
          })
        }
      }else{
        var list = [];
        list.push(linkManList);
        wx.setStorage({
          key: "linkMan",
          data: JSON.stringify(list)
        })
      }
      wx.navigateTo({
        url: '/pages/chat/chatroom/chatroom?username=' + JSON.stringify(nameList)
      })
    } else if (bannerType==3){
      var url = this.data.imgUrls[index].content;
      wx.navigateTo({
        url: '/pages/programme/showThree/showThree?url=' + url
      })
    } else if (bannerType==4){
      var brandId = this.data.imgUrls[index].brandId;
      var houseId = this.data.imgUrls[index].houseId;
      var styleId = this.data.imgUrls[index].styleId;
      wx.navigateTo({
        url: '/pages/programme/house/house?styleId=' + styleId + '&brandId=' + brandId + '&houseId=' + houseId
      })
    }else{
      
    }
  },
  //聊天
  goChat:function(e){
    var url = '/pages/chat/chat';
    getApp().checkToken(url,function(flag){
        if(flag){
          wx.navigateTo({
            url: url,
          })
        }
    })
  },
  //排序
  sortNumber:function(a, b){
    return a - b
  }

})