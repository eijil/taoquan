/** @module common */

var common = {},
	
	/**
	 * 获取dom
	 * @param {String} [id] dom的标识
	 * @returns {Zepto} 获取到的dom
	 */
	get = (function(){
		var $doms = {};
		return function(id){
			if($doms[id]){
				return $doms[id];
			}else{
				var dom;
				switch(id){
					case 'win':
						dom = window;
						break;
					case 'body':
						dom = document.body;
						break;
				}
				return $doms[id] = $(dom);
			}
		};
	})(),

	/**
	 * 获取$win
	 * @returns {Zepto} 获取到的$win
	 */
	get$win = (function(){
		var $win;
		return function(){
			return $win = $win || $(window);
		};
	})(),

	/**
	 * 获取$body
	 * @returns {Zepto} 获取到的$body
	 */
	get$body = (function(){
		var $body;
		return function(){
			return $body = $body || $(document.body);
		};
	})();

//start:requestAnimationFrame
(function(){
var RAF_RATE = 60, //requestAnimationFrame的标准帧频（单位：帧/秒）
	RAF_INTERVAL = Math.floor(1000 / RAF_RATE), //requestAnimationFrame帧的标准间隔（单位：毫秒/帧）

	/**
	 * requestAnimationFrame
	 * @param {Function} [handler] 处理函数
	 *		@param {Number} [interval] 调用时间和回调执行时间的间隔（单位：毫秒）
	 *		@param {Number} [call] 调用的时间（单位：毫秒数）
	 *		@param {Number} [exec] 回调执行的时间（单位：毫秒数）
	 * @param {Any} [thisObj = window] 指定回调中的this
	 */
	raf = (function(){
		var raf = 	window.webkitRequestAnimationFrame ||
					window.requestAnimationFrame ||
					function(handler){
						return setTimeout(handler,RAF_INTERVAL);
					};
		return function(handler,thisObj){
			var call = new Date();
			return raf.call(window,function(){
				var exec = new Date(),
					interval = exec - call;
				handler.call(thisObj || window,interval,call,exec);
			});
		}
	})(),

	/**
	 * cancelAnimationFrame
	 * @param {Number} [rafId] rafId
	 */
	caf = (function(){
		var caf = 	window.webkitCancelAnimationFrame ||
					window.cancelAnimationFrame ||			
					function(rafId){
						clearTimeout(rafId);
					};
		return function(rafId){
			return caf.call(window,rafId);
		}
	})();
common.RAF_RATE = RAF_RATE;
common.RAF_INTERVAL = RAF_INTERVAL;
common.raf = raf;
common.caf = caf;
})();
//end:requestAnimationFrame

//start:判断样式前缀
(function(){
var transformCc = 'transform', //transform驼峰属性名
	transformDash = 'transform', //transform短横线属性名
	animCc = 'animation', //animation驼峰属性名
	animDash = 'animation', //animation短横线属性名
	animStart = 'animationstart', //animationStart事件名
	animIteration = 'animationiteration', //animationIteration事件名
	animEnd = 'animationend', //animationEnd事件名
	transCc = 'transition', //transiton驼峰属性名
	transDash = 'transition', //transiton短横线属性名
	transEnd = 'transitionend'; //transitonEnd事件名
(function(){
	var style = document.documentElement.style,
		prefix = 'webkit';
	if(prefix + 'Transform' in style){
		transformCc = prefix + 'Transform';
		transformDash = '-' + prefix + '-transform';
	}
	if(prefix + 'Animation' in style){
		animCc = prefix + 'Animation';
		animDash = '-' + prefix + '-animation';
		animStart = prefix + 'AnimationStart';
		animIteration = prefix + 'AnimationIteration';
		animEnd = prefix + 'AnimationEnd';
	}
	if(prefix + 'Transition' in style){
		transCc = prefix + 'Transition';
		transDash = '-' + prefix + '-transition';
		transEnd = prefix + 'TransitionEnd';
	}
})();
common.transformCc = transformCc;
common.transformDash = transformDash;
common.animCc = animCc;
common.animDash = animDash;
common.animStart = animStart;
common.animIteration = animIteration;
common.animEnd = animEnd;
common.transCc = transCc;
common.transDash = transDash;
common.transEnd = transEnd;
})();
//end:判断样式前缀

//start:预加载
(function(){
	/**
	 * 预加载
	 * @param {String} [url0] 图片地址0
	 * @param {String} [url1] 图片地址1
	 * ...
	 * @param {String} [urlN] 图片地址N
	 */
var preload = function(){
		var args = arguments,
			htmlArr = [];
		for(var i=0,len=args.length; i<len; i++){
			htmlArr.push('<p class="padt_preload" style="background-image:url(' + args[i] + ');"></p>');
		}
		get('body').append(htmlArr.join(''));
	},

	/**
	 * 通过class预加载
	 * @param {String} [class0] class0
	 * @param {String} [class1] class1
	 * ...
	 * @param {String} [classN] classN
	 */
	preloadClass = function(){
		var args = arguments,
			htmlArr = [];
		for(var i=0,len=args.length; i<len; i++){
			htmlArr.push('<p class="padt_preload ' + args[i] + '"></p>');
		}
		get('body').append(htmlArr.join(''));
	};
common.preload = preload;
common.preloadClass = preloadClass;
})();
//end:预加载

//start:重力感应
(function(){
var start = null, //起始的gamma值
	minExtend, //当gamma值突变到小于该值的范围时，会修正gamma值，使场景能平滑转动
	maxExtend, //当gamma值突变到大于该值的范围时，会修正gamma值，使场景能平滑转动
	gammas = [],
	BUFFER_LEN = 3, //缓冲数据长度
	handlers = [], //重力感应的处理函数组成的数组

	/**
	 * deviceorientation事件的处理函数
	 * @param {Event} [e] 事件对象
	 */
	oriHandler = function(e){
		if(typeof e.gamma != 'number'){
			handlers.forEach(function(handler){
				handler(null);
			});
			get('win').off('deviceorientation',oriHandler);
			handlers = [];
		}else{
			if(start == null){
				start = e.gamma;
				minExtend = start - 90;
				maxExtend = start + 90;
			}
			var gamma = (function(gamma){
					if(start > 0){
						if(gamma < minExtend){
							gamma = gamma + 180;
						}
					}else{
						if(gamma > maxExtend){
							gamma = gamma - 180;
						}
					}
					return Math.max(Math.min(gamma - start,common.ORI_ROTATION),-common.ORI_ROTATION);
				})(e.gamma),
				gammasLen = gammas.length;
			if(gammasLen > BUFFER_LEN){
				gammas.shift();
				gammasLen--;
			}
			gammas.push(gamma);
			gammasLen++;
			gamma = eval(gammas.join('+')) / gammasLen;
			handlers.forEach(function(handler){
				handler(gamma);
			});
		}
	},

	/**
	 * 绑定重力感应
	 * @param {Function} [handler] 要绑定的处理函数
	 *		@param {Number | null} [gamma] gamma
	 *			@tips 若gamma非数值，则返回null，同时会解绑所有的重力感应
	 * @returns {Function} 要绑定的处理函数
	 */
	onOri = function(handler){
		if(!handlers.length){
			get('win').on('deviceorientation',oriHandler);
		}
		handlers.push(handler);
		return handler;
	},

	/**
	 * 解绑重力感应
	 * @param {Function} [handler] 要解绑的处理函数
	 * @returns {Function} 要解绑的处理函数
	 */
	offOri = function(handler){
		for(var i=0,len=handlers.length; i<len; i++){
			if(handler == handlers[i]){
				handlers.splice(i,1);
				break;
			}
		}
		if(!handlers.length){
			get('win').off('deviceorientation',oriHandler);
		}
		return handler;
	};
common.onOri = onOri;
common.offOri = offOri;
common.ORI_ROTATION = 30; //一个方向上最大的旋转角度
})();
//end:重力感应

//start:埋点
(function(){
	/**
	 * 上报埋点
	 * @param {String} [id] id
	 * @param {String | Number} [param] param
	 * @param {String | Number} [level] level
	 */
var report = function(id,param,level){
		try{
			var click = new MPing.inputs.Click(id || '');
			if(param != null){
				if(!param){
					param += '';
				}
				click.event_param = param;
			}
			if(level != null){
				if(!level){
					level += '';
				}
				click.event_level = level;
			}
			click.updateEventSeries();
			new MPing().send(click);
		}catch(e){}
	};
common.report = report;
})();
//end:埋点

//start:播放音频
(function(){
var enabled = /iphone|ipad/i.test(navigator.userAgent), //音频是否可用

	/**
	 * 音频是否可用
	 * @return {Boolean} 是否可用
	 */
	isAudioEnabled = function(){
		return enabled;
	},
	
	/**
	 * 播放音频
	 * @param {Audio} audio - 要播放的音频
	 * @param {Boolean} [fromStart = true] - 是否从头开始播放
	 */
	play = function(){},

	/**
	 * 暂停音频
	 * @param {Audio} audio - 要暂停的音频
	 */
	pause = function(){},

	/**
	 * 静音
	 */
	mute = function(){},

	/**
	 * 不静音
	 */
	unmute = function(){},

	/**
	 * 切换静音/不静音
	 */
	toggleMute = function(){},

	/**
	 * 是否静音
	 * @return {Boolean} 是否静音
	 */
	isMuted = function(){
		return true;
	};

if(enabled){
	var body = document.body,
		canPlay = false, //是否可以无需等待用户输入，直接播放
		chkings = [], //用于检测canPlay的audio组成的数组
		playings = [], //正在播放的音频
		hiddenName = 'hidden', //hidden名称
		visibilityChangeName = 'visibilitychange', //visibilityChange名称
		muted = false, //是否静音

		/**
		 * 清理audio和body上用于检测canPlay的回调
		 */
		cleanHandler = function(){
			chkings.forEach(function(chking){
				chking.audio.removeEventListener('play',chking.handler,false);
			});
			body.removeEventListener('touchstart',touchStartHandler,false);
		},

		/**
		 * 从playings中删除audio
		 * @param {Audio} [audio] 要删除的audio
		 */
		removeFromPlayings = function(audio){
			var index = playings.indexOf(audio);
			if(index != -1){
				playings.splice(index,1);
			}
		},

		/**
		 * 播放所有playings中循环播放的音频
		 */
		playAll = function(){
			if(!muted){
				playings.forEach(function(audio){
					audio.play();
				});
			}
		},

		/**
		 * 暂停playings中的所有音频，若音频不循环，则从playings中删除
		 */
		pauseAll = function(){
			var audio;
			for(var i=0,len=playings.length; i<len; i++){
				audio = playings[i];
				if(audio.paused){
					playings.splice(i,1);
					i--;
					len--;
				}else{
					audio.pause();
					if(!audio.loop){
						playings.splice(i,1);
						i--;
						len--;
					}
				}
			}
		},

		/**
		 * 用户输入的回调
		 */
		touchStartHandler = function(){
			cleanHandler();
			chkings.forEach(function(chking){
				chking.audio.play();
			});
			chkings = [];
			canPlay = true;
		},

		/**
		 * 页面可见度变化时的回调
		 */
		visibilityChangeHandler = function(e){
			if(document[hiddenName]){
				pauseAll();
			}else{
				playAll();
			}
		};
	body.addEventListener('touchstart',touchStartHandler,false); //处理需要用户输入操作后才能播放音频的问题
	if(typeof document.webkitHidden != 'undefined'){
		hiddenName = 'webkitHidden';
		visibilityChangeName = 'webkitvisibilitychange';
	}
	document.addEventListener(visibilityChangeName,visibilityChangeHandler,false);
	play = function(audio,fromStart){
		if(!muted){
			if(!canPlay){
				var playHandler = function(){
						cleanHandler();
						canPlay = true;
					};
				audio.addEventListener('play',playHandler,false);
				chkings.push({
					audio : audio,
					handler : playHandler
				});
			}
			if(typeof fromStart == 'undefined' || fromStart){
				try{
					audio.currentTime = 0;
				}catch(e){}
			}
			audio.play();
		}
		playings.push(audio);

		//start:当音频播放结束时，从playings中删除，以防内存泄漏
		var endedHandler = function(){
				removeFromPlayings(this);
				this.removeEventListener('ended',endedHandler,false);
			};
		audio.addEventListener('ended',endedHandler,false);
		//end:当音频播放结束时，从playings中删除，以防内存泄漏
	};
	pause = function(audio){
		audio.pause();
		removeFromPlayings(audio);
	};
	mute = function(){
		muted = true;
		pauseAll();
	};
	unmute = function(){
		muted = false;
		playAll();
	};
	toggleMute = function(){
		if(muted){
			unmute();
		}else{
			mute();
		}
	};
	isMuted = function(){
		return muted;
	};
}

common.isAudioEnabled = isAudioEnabled;
common.play = play;
common.pause = pause;
common.mute = mute;
common.unmute = unmute;
common.toggleMute = toggleMute;
common.isMuted = isMuted;
})();
//end:播放音频

module.exports = common;