var strophe = require('../../../utils/strophe.js')
var WebIM = require('../../../utils/WebIM.js')
var WebIM = WebIM.default

var RecordStatus = {
  SHOW: 0,
  HIDE: 1,
  HOLD: 2,
  SWIPE: 3,
  RELEASE: 4
}

var RecordDesc = {
  0: '长按开始录音',
  2: '向上滑动取消',
  3: '松开手取消',
}

Page({
  data: {
    userPhoto:'/img/chat/number.png',//用户头像
    chatMsg: [],
    emojiStr: '',
    yourname: '',
    myName: '',
    sendInfo: '',
    userMessage: '',
    inputMessage: '',
    indicatorDots: true,
    autoplay: false,
    interval: 5000,
    duration: 1000,
    show: 'emoji_list',
    view: 'scroll_view',
    toView: '',
    emoji: WebIM.Emoji,
    emojiObj: WebIM.EmojiObj,
    msgView: {},
    RecordStatus: RecordStatus,
    RecordDesc: RecordDesc,
    recordStatus: RecordStatus.HIDE,
    keyBoxBottom: 0,//浮动距离
    inputDisabled: false,//禁用输入框
    oldTime:0,
    headerPic:''//头像
  },
  onLoad: function (options) {
    //console.log(options)
    var options = JSON.parse(options.username)
    if (options.your == "customerservice") {
      wx.setNavigationBarTitle({
        title: '客服'
      })
    } else {
      wx.setNavigationBarTitle({
        title: "设计师"
      })
    }
    
    if (wx.getStorageSync('userInfo')){
      //console.log(wx.getStorageSync('userInfo'))
      var userInfo = JSON.parse(wx.getStorageSync('userInfo'));
      this.setData({
        userPhoto: userInfo.avatarUrl,
      })
    }
    var that = this
    //console.log(options)
    var myName = wx.getStorageSync('myUsername')
    //console.log(myName)
    var num = wx.getStorageSync(options.your + myName).length - 1
    if (num > 0) {
      setTimeout(function () {
        that.setData({
          toView: wx.getStorageSync(options.your + myName)[num].mid
        })
      }, 10)
    }
    var msgList = wx.getStorageSync(options.your + myName) || [];
    var oldTime=0;
    if (msgList.length!=0){
      oldTime = msgList[msgList.length - 1].createTime;
    }
    this.setData({
      yourname: options.your,
      myName: myName,
      inputMessage: '',
      chatMsg: wx.getStorageSync(options.your + myName) || [],
      oldTime: oldTime
    })
    //console.log(that.data.chatMsg)
    //获取头像列表
    getApp().ajax('getCustomerMesg', '', 'get', function (res) {
      //console.log(res)
      var list = res.data.custmerMsg;
      for (var i = 0; i < list.length; i++) {
        if (list[i].hxName == options.your) {
          that.setData({
            headerPic: list[i].headPortrait
          })
        }
      }
    })
  },
  onShow: function () {
    var that = this
    this.setData({
      inputMessage: ''
    })
  },
  //下拉刷新
  onPullDownRefresh: function () {
    //console.log(1)
    var that = this;
    setTimeout(function () {
      wx.stopPullDownRefresh();
      that.onLoad(that.options);
    }, 1000)
  },
  bindMessage: function (e) {
    this.setData({
      userMessage: e.detail.value
    })
  },
  cleanInput: function () {
    var that = this
    var setUserMessage = {
      sendInfo: that.data.userMessage
    }
    that.setData(setUserMessage)
  },
  //***************** 录音 begin ***************************
  changedTouches: null,
  toggleRecordModal: function (e) {
    this.setData({
      recordStatus: this.data.recordStatus == RecordStatus.HIDE ? RecordStatus.SHOW : RecordStatus.HIDE
    })
  },
  toggleWithoutAction: function (e) {
    console.log('toggleWithoutModal 拦截请求不做处理')
  },
  handleRecordingMove: function (e) {
    var touches = e.touches[0]
    var changedTouches = this.changedTouches

    if (!this.changedTouches) {
      return
    }
    // 无效
    // var changedTouches = e.changedTouches[0]
    // console.log(changedTouches.pageY, touches.pageY)

    if (this.data.recordStatus == RecordStatus.SWIPE) {
      if (changedTouches.pageY - touches.pageY < 20) {
        this.setData({
          recordStatus: RecordStatus.HOLD
        })
      }
    }
    if (this.data.recordStatus == RecordStatus.HOLD) {
      if (changedTouches.pageY - touches.pageY > 20) {
        this.setData({
          recordStatus: RecordStatus.SWIPE
        })
      }
    }

  },
  handleRecording: function (e) {
    var self = this
    console.log('handleRecording')
    this.changedTouches = e.touches[0]
    this.setData({
      recordStatus: RecordStatus.HOLD
    })
    wx.startRecord({
      fail: function (err) {
        // 时间太短会失败
        console.log(err)
      },
      success: function (res) {
        console.log('success')
        // 取消录音发放状态 -> 退出不发送
        if (self.data.recordStatus == RecordStatus.RELEASE) {
          console.log('user canceled')
          return
        }
        // console.log(tempFilePath)
        self.uploadRecord(res.tempFilePath)
        console.log(res.tempFilePath)
      },
      complete: function () {
        console.log("complete")
        this.handleRecordingCancel()
      }.bind(this)
    })

    setTimeout(function () {
      //超时 
      self.handleRecordingCancel()
    }, 100000)
  },
  handleRecordingCancel: function () {
    console.log('handleRecordingCancel')
    // 向上滑动状态停止：取消录音发放
    if (this.data.recordStatus == RecordStatus.SWIPE) {
      this.setData({
        recordStatus: RecordStatus.RELEASE
      })
    } else {
      this.setData({
        recordStatus: RecordStatus.HIDE
      })
    }
    wx.stopRecord()
  },
  stopRecord: function (e) {
    let { url, mid } = e.target.dataset
    this.data.msgView[mid] = this.data.msgView[mid] || {}
    this.data.msgView[mid].isPlay = false;
    this.setData({
      msgView: this.data.msgView
    })
    wx.stopVoice()
  },
  playRecord: function (e) {
    var that=this;
    let url = e.target.dataset.url
    wx.downloadFile({
      url: url,
      success: function (res) {
        //console.log(res)
        wx.playVoice({
          filePath: res.tempFilePath,
          complete: function () {
            this.stopRecord(e);
          }.bind(this)
        })
      }.bind(this),
      fail: function (err) {
      },
      complete: function complete() {
      }
    })
  },
  uploadRecord: function (tempFilePath) {
    var lastMsglist = JSON.parse(wx.getStorageSync('linkMan'));
    var str = WebIM.config.appkey.split('#')
    var that = this
    getApp().ajax("qiNiuToken", {}, 'POST', function (res) {
      wx.uploadFile({
        url: 'https://up.qbox.me/',
        filePath: tempFilePath,
        formData: {
          token: res.data.token
        },
        name: 'file',
        header: {
          'Content-Type': 'multipart/form-data'
        },
        success: function (res) {
          // return;
         // console.log(res);
          // 发送xmpp消息
          var msg = new WebIM.message('audio', WebIM.conn.getUniqueId())
          var data = res.data
          var dataObj = JSON.parse(data)
          var file = {
            type: 'audio',
            'url': getApp().globalData.qiniuUrl + dataObj.key,
            'filetype': '',
            'filename': tempFilePath
          }
          var option = {
            apiUrl: WebIM.config.apiURL,
            body: file,
            to: that.data.yourname,                  // 接收消息对象
            roomType: false,
            chatType: 'singleChat'
          }
          msg.set(option)
          //WebIM.conn.send(msg.body)
          var messageData = {
            "from": wx.getStorageSync('myUsername'),
            "target": [that.data.yourname],
            "msg": file.url,
            "userType": 2,
            "type": 3//文本1 图片2 录音3
          }
          getApp().ajax("sendMessage", messageData, 'POST', function (res) {
            //console.log(res)
            var time = getApp().formatDate(res.data.createTime);
            var chatList = that.data.chatMsg;
            //console.log(chatList)
            var showTime = false;
            var len = chatList.length;
            if (len != 0) {
              var oldTime = that.data.oldTime;
              oldTime = parseInt(oldTime / 60000);//转换成分钟
              var newTime = parseInt(res.data.createTime / 60000);//转换成分钟
              if (newTime - oldTime < 3) {
                showTime = true;
              } else {
                that.setData({
                  oldTime: res.data.createTime
                })
              }
            } else {
              that.setData({
                oldTime: res.data.createTime
              })
            }
            // 本地消息展示
            var msgData = {
              info: {
                to: msg.body.to
              },
              username: that.data.myName,
              yourname: msg.body.to,
              msg: {
                type: msg.type,
                data: msg.body.body.url,
                url: msg.body.body.url,
              },
              style: 'self',
              time: time,
              createTime: res.data.createTime,
              showTime: showTime,
              mid: msg.id
            }
            that.data.chatMsg.push(msgData)
            console.log(that.data.chatMsg)
            // 存储到本地消息
            var myName = wx.getStorageSync('myUsername')
            wx.setStorage({
              key: that.data.yourname + myName,
              data: that.data.chatMsg,
              success: function () {
                //console.log('success', that.data)
                that.setData({
                  chatMsg: that.data.chatMsg
                })
                setTimeout(function () {

                  that.setData({
                    toView: that.data.chatMsg[that.data.chatMsg.length - 1].mid
                  })
                }, 10)
              }
            })
            //写入缓存
            for (var i = 0; i < lastMsglist.length; i++) {
              if (lastMsglist[i].name == that.data.yourname) {
                lastMsglist[i].lastChat = '[语音]';
                lastMsglist[i].time = time;
              }
            }
            wx.setStorage({
              key: "linkMan",
              data: JSON.stringify(lastMsglist)
            })
          })
        }
      })
    })
  },
  //***************** 录音 end ***************************
  sendMessage: function () {
    //获取聊天列表
    var lastMsglist = JSON.parse(wx.getStorageSync('linkMan'));

    if (!this.data.userMessage.trim()) return;

    var that = this
    
    // //console.log(that.data.userMessage)
    // //console.log(that.data.sendInfo)
    var myName = wx.getStorageSync('myUsername')
    var id = WebIM.conn.getUniqueId();
    var msg = new WebIM.message('txt', id);
    msg.set({
      msg: that.data.sendInfo,
      to: that.data.yourname,
      roomType: false,
      success: function (id, serverMsgId) {
        //console.log('send text message success')
      }
    });
    // //console.log(msg)
    //console.log("Sending textmessage")
    msg.body.chatType = 'singleChat';
    //WebIM.conn.send(msg.body);
    //服务器发送消息
    var messageData={
      "from": wx.getStorageSync('myUsername'),
      "target": [that.data.yourname],
      "msg": msg.body.msg,
      "userType":2,
      "type": 1//文本1 图片2
    }
    getApp().ajax("sendMessage", messageData, 'POST', function (res) {
      //console.log(res)
      var value = WebIM.parseEmoji(msg.value.replace(/\n/mg, ''))
      //var time = WebIM.time()
      //console.log(time)
      var time = getApp().formatDate(res.data.createTime);
      var chatList = that.data.chatMsg;
      var  showTime=false;
      var len = chatList.length;
      if (len != 0) { 
        var oldTime = that.data.oldTime;
        oldTime = parseInt(oldTime / 60000);//转换成分钟
        var newTime = parseInt(res.data.createTime / 60000);//转换成分钟
        if (newTime - oldTime < 3){
          showTime=true;
        }else{
          that.setData({
            oldTime: res.data.createTime
          })
        }
      }else{
        that.setData({
          oldTime: res.data.createTime
        })
      }
      var msgData = {
        info: {
          to: msg.body.to
        },
        username: that.data.myName,
        yourname: msg.body.to,
        msg: {
          type: msg.type,
          data: value
        },
        style: 'self',
        time: time,
        showTime: showTime,
        createTime: res.data.createTime,
        mid: msg.id
      }
      that.data.chatMsg.push(msgData)
      //console.log(that.data.chatMsg)
      wx.setStorage({
        key: that.data.yourname + myName,
        data: that.data.chatMsg,
        success: function () {
          //console.log('success', that.data)
          that.setData({
            chatMsg: that.data.chatMsg,
            emojiList: [],
            inputMessage: ''
          })
          setTimeout(function () {
            that.setData({
              toView: that.data.chatMsg[that.data.chatMsg.length - 1].mid
            })
          }, 100)
        }
      })
      that.setData({
        userMessage: ''
      })
      //写入缓存
      for (var i = 0; i < lastMsglist.length;i++){
        if (lastMsglist[i].name == that.data.yourname){
          lastMsglist[i].lastChat=msg.body.msg;
          lastMsglist[i].time=time;
        }
      }
      wx.setStorage({
        key: "linkMan",
        data: JSON.stringify(lastMsglist)
      })
    })
  },

  receiveMsg: function (msg, type) {
    //console.log(msg)
    var lastMsglist = JSON.parse(wx.getStorageSync('linkMan'));
    var that = this
    var myName = wx.getStorageSync('myUsername')
    if (msg.from == that.data.yourname || msg.to == that.data.yourname) {
      if (type == 'txt') {
        var value = WebIM.parseEmoji(msg.data.replace(/\n/mg, ''))
        value.ext = msg.ext
      } else if (type == 'emoji') {
        var value = msg.data
      } else if (type == 'audio') {
        // 如果是音频则请求服务器转码
        //console.log('Audio Audio msg: ', msg);
        var token = msg.accessToken;
        //console.log('get token: ', token)
        var options = {
          url: msg.url,
          header: {
            'X-Requested-With': 'XMLHttpRequest',
            'Accept': 'audio/mp3',
            'Authorization': 'Bearer ' + token
          },
          success: function (res) {
            //console.log('downloadFile success Play', res);
            // wx.playVoice({
            // filePath: res.tempFilePath
            // })
            msg.url = res.tempFilePath
            var msgData = {
              info: {
                from: msg.from,
                to: msg.to
              },
              username: '',
              yourname: msg.from,
              msg: {
                type: type,
                data: value,
                url: msg.url
              },
              style: '',
              time: time,
              mid: msg.type + msg.id
            }
            
            if (msg.from == that.data.yourname) {
              msgData.style = ''
              msgData.username = msg.from
            } else {
              msgData.style = 'self'
              msgData.username = msg.to
            }
            var msgArr = that.data.chatMsg;
            msgArr.pop();
            msgArr.push(msgData);

            that.setData({
              chatMsg: that.data.chatMsg,
            })
            //console.log("New audio");
          },
          fail: function (e) {
            //console.log('downloadFile failed', e);
          }
        };
        //console.log('Download');
        wx.downloadFile(options);
      }
      //console.log(msg)
      //console.log(value)
      var time = WebIM.time();
      console.log(time)
      time = getApp().timeFomit(time);
      var date = new Date(time);
      var createTime = date.getTime();
      var showTime=false;
      
      var chatList = that.data.chatMsg;
      var len = chatList.length;
      if (len != 0) {
        var oldTime = that.data.oldTime;
        oldTime = parseInt(oldTime / 60000);//转换成分钟
        var newTime = parseInt(createTime / 60000);//转换成分钟
        if (newTime - oldTime < 3) {
          showTime = true;
        }else{
          that.setData({
            oldTime: createTime
          })
        }
      } else {
        that.setData({
          oldTime: createTime
        })
      }

      var msgData = {
        info: {
          from: msg.from,
          to: msg.to
        },
        username: '',
        yourname: msg.from,
        msg: {
          type: type,
          data: value,
          url: msg.url
        },
        style: '',
        time: time,
        createTime: createTime,
        showTime: showTime,
        mid: msg.type + msg.id
      }
      //console.log('Audio Audio msgData: ', msgData);
      if (msg.from == that.data.yourname) {
        msgData.style = ''
        msgData.username = msg.from
      } else {
        msgData.style = 'self'
        msgData.username = msg.to
      }
      var chatMsgData = '';
      if (msgData.msg.data.ext){
        if (msgData.msg.data.ext.type==2){
          msgData.msg.type = "img";
          msgData.msg.size={
            width: msgData.msg.data.ext.width,
            height: msgData.msg.data.ext.height
          }
          msgData.msg.data = msgData.msg.data.ext.imageUrl;
          chatMsgData='[图片]';
        }
      }else{
        if (msgData.msg.data[0].type == "emoji"){
          chatMsgData ='[表情]'
        }else{
          chatMsgData = msgData.msg.data[0].data;
        }
      }
      //写入缓存
      for (var i = 0; i < lastMsglist.length; i++) {
        if (lastMsglist[i].name == that.data.yourname) {
          lastMsglist[i].lastChat = chatMsgData;
          lastMsglist[i].time = time;
          lastMsglist[i].num+=1;
        }
      }
      wx.setStorage({
        key: "linkMan",
        data: JSON.stringify(lastMsglist)
      })
      //console.log(msgData)
      //console.log(msgData, that.data.chatMsg, that.data)
      that.data.chatMsg.push(msgData)
      wx.setStorage({
        key: that.data.yourname + myName,
        data: that.data.chatMsg,
        success: function () {
          if (type == 'audio')
            return;
          //console.log('success', that.data)
          that.setData({
            chatMsg: that.data.chatMsg,
          })
          setTimeout(function () {
            that.setData({
              toView: that.data.chatMsg[that.data.chatMsg.length - 1].mid
            })
          }, 100)
        }
      })
    }
  },
  openEmoji: function () {
    this.setData({
      inputDisabled:true,
      show: 'showEmoji',
      view: 'scroll_view_change'
    })
  },
  sendEmoji: function (event) {
    var that = this
    var emoji = event.target.dataset.emoji
    var msglen = that.data.userMessage.length - 1
    if (emoji && emoji != '[del]') {
      var str = that.data.userMessage + emoji
    } else if (emoji == '[del]') {
      var start = that.data.userMessage.lastIndexOf('[')
      var end = that.data.userMessage.lastIndexOf(']')
      var len = end - start
      if (end != -1 && end == msglen && len >= 3 && len <= 4) {
        var str = that.data.userMessage.slice(0, start)
      } else {
        var str = that.data.userMessage.slice(0, msglen)
      }
    }
    this.setData({
      userMessage: str,
      inputMessage: str
    })
  },
  sendImage: function () {
    var that = this
    //var pages = getCurrentPages()
    //console.log(pages)
    that.cancelEmoji()
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album'],
      success: function (res) {
        if (that) {
          that.upLoadImage(res, that)
        }
      }
    })
  },

  sendLocation: function () {
    var that = this
    //var pages = getCurrentPages()
    that.cancelEmoji()
    wx.chooseLocation({
      success: function (respData) {
        var id = WebIM.conn.getUniqueId();
        var msg = new WebIM.message('location', id);
        msg.set({
          msg: that.data.sendInfo,
          to: that.data.yourname,
          roomType: false,
          lng: respData.longitude,
          lat: respData.latitude,
          addr: respData.address,
          success: function (id, serverMsgId) {
            //console.log('success')
          }
        });
        // //console.log(msg)
        msg.body.chatType = 'singleChat';
        WebIM.conn.send(msg.body);
      }
    })
  },

  testInterfaces: function () {
    var option = {
      roomId: '21873157013506',
      success: function (respData) {
        wx.showToast({
          title: "JoinChatRoomSuccess",
        });
        //console.log('Response data: ', respData);
      }
    };

    WebIM.conn.joinChatRoom(option);
    // var option = {
    //     apiUrl: WebIM.config.apiURL,
    //     pagenum: 1,
    //     pagesize: 20,
    //     success: function(resp){
    //         console.log(resp);
    //     },
    //     error: function(e){
    //         console.log(e);
    //     }
    // };
    // WebIM.conn.getChatRooms(option);
  },
  quitChatRoom: function () {
    //console.log('ScareCrow');
    var option = {
      roomId: '21873157013506',
      success: function () {
        console.log("quitChatRoom");
      }
    }
    WebIM.conn.quitChatRoom(option);
  },
  // sendVideo: function() {
  //     var that = this
  //     wx.chooseVideo({
  //         sourceType: ['album', 'camera'],
  //         maxDuration: 60,
  //         camera: 'back',
  //         success: function(res) {
  //             console.log(res)
  //             var tempFilePaths = res.tempFilePath
  //             var str = WebIM.config.appkey.split('#')
  //             wx.uploadFile({
  //                 url: 'https://a1.easemob.com/'+ str[0] + '/' + str[1] + '/chatfiles',
  //                 filePath: tempFilePaths,
  //                 name: 'file',
  //                 header: {
  //                     'Content-Type': 'multipart/form-data'
  //                 },
  //                 success: function (res) {
  //                         var data = res.data

  //                         var dataObj = JSON.parse(data)
  //                         console.log(dataObj)
  //                         var id = WebIM.conn.getUniqueId();                   // 生成本地消息id
  //                         var msg = new WebIM.message('img', id);
  //                         console.log(msg)
  //                         var file = {
  //                             type: 'img',
  //                             'url': dataObj.uri + '/' + dataObj.entities[0].uuid,
  //                             'filetype': 'mp4',
  //                             'filename': tempFilePaths
  //                         }
  //                         //console.log(file)
  //                         var option = {
  //                             apiUrl: WebIM.config.apiURL,
  //                             body: file,
  //                             to: that.data.yourname,                  // 接收消息对象
  //                             roomType: false,
  //                             chatType: 'singleChat'
  //                         }
  //                         msg.set(option)
  //                         WebIM.conn.send(msg.body)
  //                         if (msg) {
  //                             //console.log(msg,msg.body.body.url)
  //                             var time = WebIM.time()
  //                             var msgData = {
  //                                 info: {
  //                                     to: msg.body.to
  //                                 },
  //                                 username: that.data.myName,
  //                                 yourname: msg.body.to,
  //                                 msg: {
  //                                     type: msg.type,
  //                                     data: msg.body.body.url
  //                                 },
  //                                 style: 'self',
  //                                 time: time,
  //                                 mid: msg.id
  //                             }
  //                             that.data.chatMsg.push(msgData)
  //                             console.log(that.data.chatMsg)
  //                             var myName = wx.getStorageSync('myUsername')
  //                             wx.setStorage({
  //                                 key: that.data.yourname + myName,
  //                                 data: that.data.chatMsg,
  //                                 success: function () {
  //                                     //console.log('success', that.data)
  //                                     that.setData({
  //                                         chatMsg: that.data.chatMsg
  //                                     })
  //                                     setTimeout(function () {
  //                                         that.setData({
  //                                             toView: that.data.chatMsg[that.data.chatMsg.length - 1].mid
  //                                         })
  //                                     }, 10)
  //                                 }
  //                             })
  //                         }

  //                 }
  //             })
  //         }
  //     })
  // },
  receiveImage: function (msg, type) {
    var that = this
    var myName = wx.getStorageSync('myUsername')
    //console.log(msg)
    if (msg) {
      //console.log(msg)
      var time = WebIM.time()
      var msgData = {
        info: {
          from: msg.from,
          to: msg.to
        },
        username: msg.from,
        yourname: msg.from,
        msg: {
          type: 'img',
          data: msg.url
        },
        style: '',
        time: time,
        mid: 'img' + msg.id
      }
      //console.log(msgData)
      that.data.chatMsg.push(msgData)
      //console.log(that.data.chatMsg)
      wx.setStorage({
        key: that.data.yourname + myName,
        data: that.data.chatMsg,
        success: function () {
          //console.log('success', that.data)
          that.setData({
            chatMsg: that.data.chatMsg
          })
          setTimeout(function () {
            that.setData({
              toView: that.data.chatMsg[that.data.chatMsg.length - 1].mid
            })
          }, 100)
        }
      })
    }
  },

  receiveVideo: function (msg, type) {
    var that = this
    var myName = wx.getStorageSync('myUsername')
    //console.log(msg)
    if (msg) {
      //console.log(msg)
      var time = WebIM.time()
      var msgData = {
        info: {
          from: msg.from,
          to: msg.to
        },
        username: msg.from,
        yourname: msg.from,
        msg: {
          type: 'video',
          data: msg.url
        },
        style: '',
        time: time,
        mid: 'video' + msg.id
      }
      //console.log(msgData)
      that.data.chatMsg.push(msgData)
      //console.log(that.data.chatMsg)
      wx.setStorage({
        key: that.data.yourname + myName,
        data: that.data.chatMsg,
        success: function () {
          //console.log('success', that.data)
          that.setData({
            chatMsg: that.data.chatMsg
          })
          setTimeout(function () {
            that.setData({
              toView: that.data.chatMsg[that.data.chatMsg.length - 1].mid
            })
          }, 100)
        }
      })
    }
  },

  openCamera: function () {
    var that = this
    //var pages = getCurrentPages()
    that.cancelEmoji()
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['camera'],
      success: function (res) {
        if (that) {
          that.upLoadImage(res, that)
        }
      }
    })
  },
  //聚焦
  focus: function (event) {
    //console.log(event.detail.height)
    this.setData({
      keyBoxBottom: 70
    })
  },
  //点击
  clickInput: function (event) {
    //console.log(event.detail.height)
    this.setData({
      inputDisabled: false,
      show: 'emoji_list',
      view: 'scroll_view'
    })
  },
  //失去焦点
  blurFocus: function () {
    this.setData({
      keyBoxBottom: 0
    })
  },
  cancelEmoji: function () {
    this.setData({
      show: 'emoji_list',
      view: 'scroll_view'
    })
  },
  scroll: function (e) {
    // //console.log(e)
  },
  lower: function (e) {
    //console.log(e)
  },
  upLoadImage: function (res, that) {
    var lastMsglist = JSON.parse(wx.getStorageSync('linkMan'));
    //console.log(res)
    var tempFilePaths = res.tempFilePaths
    //console.log(tempFilePaths)
    wx.getImageInfo({
      src: res.tempFilePaths[0],
      success: function (res) {
        // console.log(res)
        var allowType = {
          'jpg': true,
          'gif': true,
          'png': true,
          'bmp': true
        };
        var str = WebIM.config.appkey.split('#')
        var width = res.width
        var height = res.height
        var index = res.path.lastIndexOf('.')
        if (index != -1) {
          var filetype = res.path.slice(index + 1)
        }
        if (filetype.toLowerCase() in allowType) {
          getApp().ajax("qiNiuToken", {}, 'POST', function (res) {
           // console.log(res)
            wx.uploadFile({
              url: 'https://up.qbox.me/',
              filePath: tempFilePaths[0],
              name: 'file',
              formData:{
                token: res.data.token
              },
              header: {
                'Content-Type': 'multipart/form-data'
              },
              success: function (res) {
                //console.log(res)
                var dataObj = JSON.parse(res.data)
                //console.log(dataObj)
                var id = WebIM.conn.getUniqueId();                   // 生成本地消息id
                var msg = new WebIM.message('img', id);
                var file = {
                  type: 'img',
                  size: {
                    width: width,
                    height: height
                  },
                  'url': getApp().globalData.qiniuUrl + dataObj.key,
                  'filetype': filetype,
                  'filename': tempFilePaths[0]
                }
                //console.log(file)
                var option = {
                  apiUrl: WebIM.config.apiURL,
                  body: file,
                  to: that.data.yourname,                  // 接收消息对象
                  roomType: false,
                  chatType: 'singleChat'
                }
                msg.set(option)
                //WebIM.conn.send(msg.body)
                var  messageData={
                  "from": wx.getStorageSync('myUsername'),
                  "target": [that.data.yourname],
                  "msg": file.url,
                  "width": width,
                  "height": height,
                  "userType":2,
                  "type": 2//文本1 图片2
                }
                getApp().ajax("sendMessage", messageData, 'POST', function (res) {
                  //console.log(res)
                  //var time = WebIM.time()
                  var time = getApp().formatDate(res.data.createTime);
                  var chatList = that.data.chatMsg;
                  //console.log(chatList)
                  var showTime = false;
                  var len = chatList.length;
                  if (len != 0) {
                    var oldTime = that.data.oldTime;
                    oldTime = parseInt(oldTime / 60000);//转换成分钟
                    var newTime = parseInt(res.data.createTime / 60000);//转换成分钟
                    if (newTime - oldTime < 3) {
                      showTime = true;
                    }else{
                      that.setData({
                        oldTime: res.data.createTime
                      })
                    }
                  } else {
                    that.setData({
                      oldTime: res.data.createTime
                    })
                  }
                  var msgData = {
                    info: {
                      to: msg.body.to
                    },
                    username: that.data.myName,
                    yourname: msg.body.to,
                    msg: {
                      type: msg.type,
                      data: msg.body.body.url,
                      size: {
                        width: msg.body.body.size.width,
                        height: msg.body.body.size.height,
                      }
                    },
                    style: 'self',
                    time: time,
                    createTime: res.data.createTime,
                    showTime: showTime,
                    mid: msg.id
                  }
                  //console.log(msgData)
                  that.data.chatMsg.push(msgData)
                  //console.log(that.data.chatMsg)
                  var myName = wx.getStorageSync('myUsername')
                  wx.setStorage({
                    key: that.data.yourname + myName,
                    data: that.data.chatMsg,
                    success: function () {
                      //console.log('success', that.data)
                      that.setData({
                        chatMsg: that.data.chatMsg
                      })
                      setTimeout(function () {
                        that.setData({
                          toView: that.data.chatMsg[that.data.chatMsg.length - 1].mid
                        })
                      }, 10)
                    }
                  })
                  //写入缓存
                  for (var i = 0; i < lastMsglist.length; i++) {
                    if (lastMsglist[i].name == that.data.yourname) {
                      lastMsglist[i].lastChat ='[图片]';
                      lastMsglist[i].time = time;
                    }
                  }
                  wx.setStorage({
                    key: "linkMan",
                    data: JSON.stringify(lastMsglist)
                  })
                })
              }
            })
          })
        }
      }
    })
  },
  previewImage: function (event) {
    var url = event.target.dataset.url
    wx.previewImage({
      urls: [url]  // 需要预览的图片http链接列表
    })
  }
})