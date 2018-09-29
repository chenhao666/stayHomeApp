require('./utils/strophe.js')
var WebIM = require('./utils/WebIM.js').default
//app.js
App({
  getRoomPage: function () {
    return this.getPage("pages/chat/chatroom/chatroom")
  },
  getPage: function (pageName) {
    var pages = getCurrentPages()
    return pages.find(function (page) {
      return page.__route__ == pageName
    })
  },
  onLaunch: function (options) {
    //日期时间
    Date.prototype.Format = function (fmt) { //author: meizz 
      if (isNaN(this.getMonth())) {
        //console.log(this.getMonth())
        return '';
      }
      var o = {
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "h+": this.getHours(), //小时 
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds() //毫秒 
      };
      if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
      for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
      return fmt;
    }

    var that = this
    //console.log(WebIM)
    //监听环信
    WebIM.conn.listen({
      onOpened: function (message) {          //连接成功回调       
        WebIM.conn.setPresence();
        console.log("连接成功");
      },
      onTextMessage: function (message) {
        //console.log(message)
        wx.vibrateLong();
        var page = that.getRoomPage()
        //console.log(page)
        if (message) {
          if (page) {
            page.receiveMsg(message, 'txt')
          } else {
            var chatMsg = that.globalData.chatMsg || []
            var value = WebIM.parseEmoji(message.data.replace(/\n/mg, ''))
            var time = WebIM.time()
            time = getApp().timeFomit(time);
            var date = new Date(time);
            var createTime = date.getTime();
            var msgData = {
              createTime: createTime,
              info: {
                from: message.from,
                to: message.to
              },
              username: message.from,
              yourname: message.from,
              msg: {
                type: 'txt',
                data: value
              },
              style: '',
              time: time,
              mid: 'txt' + message.id
            }
            chatMsg = wx.getStorageSync(msgData.yourname + message.to) || []
            chatMsg.push(msgData)
            //console.log(msgData)
            wx.setStorageSync(msgData.yourname + message.to, chatMsg);
            //接收到消息
            var flag=0;
            if (wx.getStorageSync('linkMan')){
              var lastMsglist = JSON.parse(wx.getStorageSync('linkMan'));
              //写入缓存
              for (var i = 0; i < lastMsglist.length; i++) {
                if (lastMsglist[i].name == message.from) {
                  lastMsglist[i].lastChat = value[0].data;
                  lastMsglist[i].time = time;
                  lastMsglist[i].num += 1;
                  flag=1;
                }
              }
              if (!flag){
                var linkManList = {
                  name: message.from,
                  num: 1,
                  lastChat: value[0].data,
                  time: time
                }
                lastMsglist.push(linkManList);
              }
              wx.setStorageSync("linkMan", JSON.stringify(lastMsglist));
            }else{
              var linkManList = {
                name: message.from,
                num: 1,
                lastChat: value[0].data,
                time: time
              }
              //console.log(value)
              wx.setStorageSync("linkMan", JSON.stringify([linkManList]));
            }
          }
        }
      },
      //收到表情消息
      onEmojiMessage: function (message) {
        //console.log('onEmojiMessage',message)
        var page = that.getRoomPage()
        //console.log(pages)
        if (message) {
          if (page) {
            page.receiveMsg(message, 'emoji')
          } else {
            var chatMsg = that.globalData.chatMsg || []
            var time = WebIM.time()
            time = getApp().timeFomit(time);
            var date = new Date(time);
            var createTime = date.getTime();
            var msgData = {
              createTime: createTime,
              info: {
                from: message.from,
                to: message.to
              },
              username: message.from,
              yourname: message.from,
              msg: {
                type: 'emoji',
                data: message.data
              },
              style: '',
              time: time,
              mid: 'emoji' + message.id
            }
            msgData.style = '';
            chatMsg = wx.getStorageSync(msgData.yourname + message.to) || [];
            chatMsg.push(msgData)
            //console.log(message.data)
            wx.setStorageSync(msgData.yourname + message.to, chatMsg);
            //接收到消息
            var flag = 0;
            if (wx.getStorageSync('linkMan')) {
              var lastMsglist = JSON.parse(wx.getStorageSync('linkMan'));
              //写入缓存
              for (var i = 0; i < lastMsglist.length; i++) {
                if (lastMsglist[i].name == message.from) {
                  lastMsglist[i].lastChat = '[表情]';
                  lastMsglist[i].time = time;
                  lastMsglist[i].num += 1;
                  flag = 1;
                }
              }
              if (!flag) {
                var linkManList = {
                  name: message.from,
                  num: 1,
                  lastChat: '[表情]',
                  time: time
                }
                lastMsglist.push(linkManList);
              }
              wx.setStorageSync("linkMan", JSON.stringify(lastMsglist));
            } else {
              var linkManList = {
                name: message.from,
                num: 1,
                lastChat: '[表情]',
                time: time
              }
              wx.setStorageSync("linkMan", JSON.stringify([linkManList]));
            }
          }
        }
      }, 
      //连接关闭回调
      onClosed: function (message) {
        console.log("断开连接");
        wx.showToast({
          title: '连接断开,请重新登录！',
          icon: 'none',
          duration: 2000
        })
        setTimeout(function(){
          wx.removeStorageSync('loginFlag');
          wx.removeStorageSync('userInfo');
          wx.removeStorageSync('token');
          wx.switchTab({
            url: '/pages/user/user',
          })
          var page = getCurrentPages().pop();
          if (page == undefined || page == null) return;
          page.onShow();
        },1000)
      },         
    })
  },
  onShow: function (options) {
    // Do something when show.
  },
  onHide: function () {
    // Do something when hide.
  },
  onError: function (msg) {
    console.log(msg)
  },
  globalData: {
    resUrl:'https://m.wojiali.cn/ourHouse/',
    //resUrl: 'http://192.168.2.62:8080/ourHouse/',
    qiniuUrl: 'http://images.wojiali.cn/' 
  },
  ajax: function (url, data, method, callback) {
    wx.showLoading({
      title: '加载中...',
      mask: 'true'
    })
    wx.request({
      url: getApp().globalData.resUrl + url,
      data: data,
      method: method || 'GET',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        wx.hideLoading();
        var pageArr = getCurrentPages();
        var len = pageArr.length;
        //console.log(pageArr);
        if (len > 1){
          var options = pageArr[len - 1].options;
          var option="";
          for (var x in options){
            option += x + '=' + options[x];
          }
          if (option!=""){
            option = '?' + option;
          }
          wx.setStorageSync('goUrl', '/' + pageArr[len - 1].route + option);
        }
        if (res.data.retCode == 0) {
          callback(res);
        } else if (res.data.retCode == -1002){
          var msg = res.data.retMsg || '登录状态过期,请重新登录';
          wx.showToast({
            title: msg,
            icon: 'none',
            duration: 2000
          })
          wx.removeStorageSync('token');
          setTimeout(function(){
            wx.switchTab({
              url: '/pages/user/user'
            })
          },1000)
        } else {
          //console.log(res);
          var msg = res.data.retMsg || '网络请求错误,请下拉重试';
          wx.showToast({
            title: msg ,
            icon: 'none',
            duration: 2000
          })
        }
      },
      fail: function (err) {
        wx.hideLoading();
        console.log(err);
        wx.showToast({
          title: '网络连接错误,请下拉重试',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },
  //时间戳转换
  formatDate:function(timeStamp) {
    var date = new Date();
    date.setTime(timeStamp);
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    m = m < 10 ? ('0' + m) : m;
    var d = date.getDate();
    d = d < 10 ? ('0' + d) : d;
    var h = date.getHours();
    h = h < 10 ? ('0' + h) : h;
    var minute = date.getMinutes();
    var second = date.getSeconds();
    minute = minute < 10 ? ('0' + minute) : minute;
    second = second < 10 ? ('0' + second) : second;
    return y + '-' + m + '-' + d + ' ' + h + ':' + minute;
  },
  //时间格式化
  timeFomit:function(timeDate) {
    //console.log(timeDate)
    return (new Date(timeDate)).Format("yyyy-MM-dd hh:mm");
  },
  //token判断
  checkToken:function(url,callback){
    if (wx.getStorageSync('token')){
      callback(true);
    }else{
      wx.showToast({
        title: '请先登录！',
        icon: 'none',
        duration: 2000
      })
      wx.setStorageSync('goUrl', url)
      setTimeout(function () {
        wx.switchTab({
          url: '/pages/user/user',
        })
      }, 1000)
    }
  },
  //日期显示规则格式化
  timeFormitRule:function(timer){
    var timeArr = timer.split(' ');
    var dateArr = timeArr[0].split('-');
    //获取当前日期
    var myDate = new Date(); 
    var y = myDate.getFullYear();
    var m = myDate.getMonth()+1;
    var d = myDate.getDate();
    if (dateArr[0] != y) {
      return dateArr[0] + '-' + dateArr[1] + '-' + dateArr[2] + ' ' + timeArr[1];
    }
    if (parseInt(dateArr[2])==parseInt(d)){
      return timeArr[1];
    }
    if (parseInt(parseInt(d)-dateArr[2])==1) {
      return '昨天'+timeArr[1];
    }
    if (parseInt(parseInt(d) - dateArr[2])!= 1) {
      return dateArr[1] + '-' + dateArr[2]+' '+ timeArr[1];
    }
  }
})