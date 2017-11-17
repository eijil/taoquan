/** @module popup */

var DEFAULT_COOKIE_EXPIRE = 24 * 3600 * 1000, //默认的cookie过期时间（毫秒）
	ua = navigator.userAgent,
	isJd = /jdapp/i.test(ua),
	isWx = /MicroMessenger/i.test(ua), //是否在微信环境
	isQq = /MQQBrowser/i.test(ua), //是否在QQ环境
	handlers, //按钮处理函数的集合
	showns = [], //已经显示的弹框
	onShowHandler = null, //当显示弹框时的回调
	onHideHandler = null, //当隐藏弹框时的回调
	onTapHideBtnHandler = null, //当点击隐藏按钮时的回调
	cookieExpire, //cookie的过期时间（毫秒）
	$con, //弹框容器
	$copyShareCon, //“复制链接分享”弹框容器
	$shareTips, //分享提示
	common, //通用配置
	TPLS = {
		popup : [
			'<div class="padt_flex_c padt_p">',
				'<p class="padt_p_overlay"></p>',
				'<div class="padt_p_content" padt-role="content"></div>',
				'<a class="padt_p_hide_btn" padt-handler="hide"></a>',
			'</div>'
		].join(''),

		//start:弹框模块
		icon : '<p class="padt_p_icon"></p>',
		title : '<p class="padt_p_title" padt-role="title"></p>',
		subtitle : '<p class="padt_p_subtitle" padt-role="subtitle"></p>',
		packWrap : [
			'<div class="padt_p_pack_wrap">',
				'<ul class="padt_p_pack" padt-npd padt-role="pack"></ul>',
			'</div>'
		].join(''),
		btns : '<p class="padt_p_btns"></p>',
		prizesWrap : [
			'<div class="padt_p_prizes_wrap">',
				'<p class="padt_p_prizes" padt-npd padt-role="prizes"></p>',
			'</div>'
		].join(''),
		tipsWrap : [
			'<div class="padt_p_tips_wrap">',
				'<p class="padt_p_tips" padt-role="tips"></p>',
			'</div>'
		].join(''),
		linkWrap : [
			'<p class="padt_p_link_wrap">',
				'<a class="padt_p_link" padt-role="link"></a>',
			'</p>'
		].join(''),
		//end:弹框模块

		//start:券包
		packItem : '<li class="padt_p_pack_item" padt-role="item"></li>',
		packItemVal : '<p class="padt_p_pack_item_val" padt-role="val"></p>',
		packItemCond : '<p class="padt_p_pack_item_cond" padt-role="cond"></p>',
		packItemCate : '<p class="padt_p_pack_item_cate" padt-role="cate"></p>',
		packItemTips : '<p class="padt_p_pack_item_tips" padt-role="tips"></p>',
		//end:券包

		//start:按钮
		btn : [
			'<a class="padt_p_btn">',
				'<span class="padt_p_btn_txt" padt-role="txt"></span>',
			'</a>'
		].join(''),
		//end:按钮

		//start:奖品
		prize : '<img class="padt_p_prize" padt-role="prize"/>',
		//end:奖品

		copyShare : [
			'<div class="padt_cs">',
				'<p class="padt_cs_overlay"></p>',
				'<div class="padt_cs_content">',
					'<div class="padt_cs_top">',
						'<p class="padt_cs_txt">请复制以下内容，将其分享给微信好友：</p>',
						'<div class="padt_cs_textarea_wrap">',
							'<textarea class="padt_cs_textarea" padt-role="textarea"></textarea>',
						'</div>',
						'<p class="padt_cs_txt">复制完成后，打开微信：</p>',
					'</div>',
					'<p class="padt_cs_btn_wrap">',
						'<a class="padt_cs_open_btn" padt-role="open_btn">打开微信</a>',
					'</p>',
					'<a class="padt_cs_hide_btn" padt-role="hide_btn"></a>',
				'</div>',
			'</div>'
		].join('')
	}, //弹框模板

	/**
	 * 将源对象的属性依次添加到目标对象上
	 * @param {Object} target - 目标对象
	 * @param {...Object} src - 源对象
	 */
	extend = function(target){
		var len = arguments.length,
			src,

			/**
			 * 递归将源对象的属性设置到目标对象上
			 * @param {Object} target - 目标对象
			 * @param {Object} src - 源对象
			 */
			recurison = function(target,src){
				for(var i in src){
					if($.isPlainObject(src[i])){
						if(!$.isPlainObject(target[i])){
							target[i] = {};
						}
						recurison(target[i],src[i]);
					}else{
						target[i] = src[i];
					}
				}
			};
		for(var i=1; i<len; i++){
			recurison(target,arguments[i]);
		}
		return target;
	},

	/**
	 * 首字母大写
	 * @param {String} word - 要首字母大写的单词
	 * @returns {String} 首字母打大写后的单词
	 */
	capitalize = function(word){
		return word.replace(/^./,function(str){
			return str.toUpperCase();
		});
	},

	/**
	 * 从自身开始寻找符合选择器的元素
	 * @param {Zepto} $dom - 在这个元素及其后代元素中寻找
	 * @param {Zepto} selector - 选择器
	 * @returns {Zepto} 找到的元素
	 */
	findFromSelf = function($dom,selector){
		var ret = $dom.find(selector);
		if($dom.is(selector)){
			return ret = $dom.add(ret);
		}
		return ret;
	},

	/**
	 * 解绑所有弹窗相关事件
	 * @param {Object} opts - 参数
	 *		@param {Zepto} opts.$dom - 弹窗的dom
	 *		@param {Zepto} [opts.$pack] - 弹窗券包的dom
	 *		@param {Zepto} [opts.$prizes] - 弹窗奖品列表的dom
	 */
	destroy = function(opts){
		opts.$dom.off();
		opts.$pack && opts.$pack.off();
		opts.$prizes && opts.$prizes.off();
	},

	/**
	 * 弹框
	 * @namespace
	 */
	popup = {

		/**
		 * 设置模板
		 * @param {String} name - 模板名称
		 * @param {String} htmlStr - 模板的html字符串（可以通过“将dom的padt-handler属性设置某个‘功能名称’”为该dom绑定点击后的功能）
		 */
		setTpl : function(name,htmlStr){
			TPLS[name] = htmlStr;
			return popup;
		},

		/**
		 * 解析替换字符串中的“{XXX}”（支持js语句）
		 * @param {String} str - 要解析的字符串
		 * @param {Object} info - 替换成的信息
		 * @returns {String} 解析后的字符串
		 */
		parseStr : function(str,info){
			return str ? str.replace(/{([^}]+)}/g,function(match,name){
				var ret;
				try{
					name = name.replace(/^[a-zA-Z_$\d]+$/,'info.$&');
					ret = eval(name);
				}catch(e){}
				if(typeof ret == 'number'){
					ret = ret + '';
				}
				return ret || '';
			}) : '';
		},

		/**
		 * 解析替换字符串中的“{XXX}”（支持js语句）
		 * @param {String | null | undefined} str - 要解析的值
		 * @param {Object} info - 替换成的信息
		 * @returns {String | null | undefined} 解析后的值
		 */
		parse : function(str,info){
			if(str == null){
				return str;
			}else{
				return popup.parseStr(str,info);
			}
		},

		/**
		 * 解析替换字符串中换行符
		 * @param {String} [str] - 要替换的字符串
		 * @returns {String} 替换后的字符串
		 */
		parseLine : function(str){
			return str.replace(/\n/g,'<br/>');
		},

		/**
		 * 预初始化
		 * @param {Object} [opts] 参数
		 *		@key {Object} [handlers] 功能的处理函数的集合
		 *			@key {Function} [功能名称] 功能的处理函数
		 *				@tips 这里“功能名称”的有以下值：
		 *					share 分享
		 *					coupon 跳转到领券中心
		 *					login 跳转到登录界面
		 *					home 回到首页
		 *					go 跳转到会场
		 *					jump0 跳转到CONF.jumpUrls[0]（与之类似的还有jump1、jump2...）
		 *					call0 跳转到CONF.jumpUrls[0]（与之类似的还有call1、call2...）
		 *					sku0 跳转到CONF.skuIds[0]（与之类似的还有sku1、sku2...）
		 *					shop0 跳转到CONF.shopIds[0]（与之类似的还有shop1、shop2...）
		 *					replay 再玩一次
		 *					reload 刷新页面
		 *					copyShareOpen “复制链接分享”中的“打开”功能
		 *					onSlicePrize 当“滚动查看奖品”时的处理函数
		 *					onHideCopyShare 当隐藏“复制链接分享”界面的处理函数
		 *
		 *				除copyShareOpen和onHideCopyShare外，处理函数的提供的信息
		 * 					@this {Dom} 按钮的dom
		 *					@param {Object} [all] 所有相关的信息
		 * 						@key {String} [type] 按钮所在的弹框类型
		 * 						@key {Object} [info] 调用popup方法时传入的弹框信息
		 * 						@key {Object} [common] 弹框的通用配置
		 * 						@key {Object} [conf] 弹框的个性化配置
		 * 						@key {Event} [e] touchend事件对象
		 *
		 *				copyShareOpen和onHideCopyShare的处理函数的提供的信息
		 * 					@this {Dom} 按钮的dom
		 *					@param {Object} [all] 所有相关的信息
		 *						@key {String} [txt] 分享的文案
		 *						@key {String} [url] 分享的链接
		 *						@key {Object} [info] 分享文案和链接中替换成的信息
		 * 						@key {Object} [common] 弹框的通用配置
		 * 						@key {Event} [e] touchend事件对象
		 *		@key {Object} [cookieObj] cookie的处理函数
		 *			@key {Function} [get] 获取cookie
		 *				@param {String} [key] key
		 *			@key {Function} [add] 设置cookie
		 *				@param {String} [key] key
		 *				@param {Any} [val] val
		 *				@param {Number} [expire] 过期时间到当前时间的毫秒数
		 *				@param {String} [path] 路径
		 *				@param {String} [domain] 域
		 *			@key {Function} [del] 删除cookie
		 *				@param {String} [key] key
		 *				@param {String} [path] 路径
		 *				@param {String} [domain] 域
		 */
		preinit : function(opts){
			popup.handlers = handlers = opts.handlers;

			//start:修改replay方法
			//TODO 用于判断是否是点击“再玩一次”触发game.start方法的全局变量，以后要换一种更好的（不使用全局变量的）方式实现
			var replay = popup.handlers.replay;
			popup.handlers.replay = function(){
				window.isPopupReplay = true;
				replay.apply(popup.handlers,arguments);
				window.isPopupReplay = false;
			};
			//end:修改replay方法

			//start:封装cookie操作
			var cookie = opts.cookieObj;
			popup.handlers.cookie = {

				/**
				 * 获取cookie
				 * @param {String} [key] key
				 */
				get : cookie.get,

				/**
				 * 设置cookie
				 * @param {String} [key] key
				 * @param {Any} [val] val
				 * @param {Number | Date} [expire = cookieExpire] 若为Number类型，则表示过期时间到当前时间的毫秒数；若为Date类型，则过期时间为该Date类型所表示的时间
				 * @param {String} [path = '/'] 路径
				 * @param {String} [domain = location.hostname] 域
				 */
				set : function(name,val,expire,path,domain){
					switch(typeof expire){
						case 'undefined':
							expire = cookieExpire;
							break;
						case 'number':
							expire = expire;
							break;
						default:
							expire = expire - new Date();
					}
					path = path || '/';
					domain = domain || location.hostname;
					cookie.add(name,val,Math.ceil(expire / (24 * 3600 * 1000)),path,domain);
				},

				/**
				 * 删除cookie
				 * @param {String} [path = '/'] 路径
				 * @param {String} [domain = location.hostname] 域
				 */
				del : function(name,path,domain){
					path = path || '/';
					domain = domain || location.hostname;
					cookie.del(name,path,domain);
				}
			};
			//end:封装cookie操作

			popup.handlers.setGameResultInfo = opts.setGameResultInfo;
			return popup;
		},

		/**
		 * 初始化
		 * @param {Object} allConf - 配置
		 */
		init : function(allConf){
			var DEFAULT_CONF = {

					//start:弹框的通用配置
					common : {
						/*
							弹框的通用配置参数：
								prefix : '',											活动前缀标识
								end : {													活动结束时间
									year : 2016,
									month : 1,
									day : 1,
									hour : 0,
									minute : 0,
									second : 0
								},
								preloads : [											需要预加载的弹框的图片路径（若为相对路径，则从html地址算起）
									'img/padt_p_img0.png',
									'img/padt_p_img1.png',
									'img/padt_p_img2.png'
								]
						*/

						prefix : ''
					},
					//end:弹框的通用配置

					//start:弹框的个性化配置
					/*
						弹框的个性化配置参数：
							coupon : {													弹框类型
								orders : [												弹框模块的排列顺序
									'icon',
									'title',
									'subtitle',
									'pack',
									'btns',
									'prizes',
									'tips',
									'link'
								],
								icon : 'coupon', 										图标类型
								title : '恭喜您获得{val}元优惠券', 						标题（可使用“{XXX}”动态设置，可使用\n强制换行）
								subtitle : '满{cond}元可用',							副标题（可使用“{XXX}”动态设置，可使用\n强制换行）
								pack : [{												以券包UI展示的单张券或券包
									type : 'val',
									val : '{val}元'
								},{
									type : 'cond',
									val : '满{cond}元可用'
								},{
									type : 'cate',
									val : '{cate}'
								},{
									type : 'tips',
									val : '{tips}'
								}],
								packItemClass : '',										每张券所需要添加的额外class
								btns : ['home','share'],								弹框所包含的按钮类型
								prizes : ['prize0.png','prize1.png','prize2.png'],		奖品图片
								tips : '优惠券到账可能有延迟',							提示（可使用“{XXX}”动态设置，可使用\n强制换行）
								linkTxt : '去首页',										链接的文字（可使用“{XXX}”动态设置，可使用\n强制换行）
								linkType : 'go'											点击链接，执行的功能
								class : '',												要添加额外的class
								shareBtnTxt : '',										分享按钮文案
								couponBtnTxt : '',										跳转到领券中心按钮文案
								loginBtnTxt : '',										跳转到登录界面按钮文案
								homeBtnTxt : '',										回到首页按钮文案
								goBtnTxt : '',											跳转到会场按钮文案
								cartBtnTxt : '',										跳转到购物车按钮文案
								jump0BtnTxt : '',										跳转到CONF.jumpUrls[0]按钮文案（与之类似的还有jump1BtnTxt、jump2BtnTxt...）
								call0BtnTxt : '',										唤起app并跳转到CONF.jumpUrls[0]按钮文案（与之类似的还有call1BtnTxt、call2BtnTxt...）
								sku0BtnTxt : '',										跳转到CONF.skuIds[0]对应商详按钮文案（与之类似的还有sku1BtnTxt、sku2BtnTxt...）
								shop0BtnTxt : '',										跳转到CONF.shopIds[0]按钮文案（与之类似的还有shop1BtnTxt、shop2BtnTxt...）
								addCart0BtnTxt : '',									将CONF.skuIds[0]添加到购物车按钮文案（与之类似的还有addCart1BtnTxt、addCart2BtnTxt...）
								replayBtnTxt : '',										再玩一次按钮文案
								reloadBtnTxt : '',										刷新页面按钮文案
								retryBtnTxt : ''										重试按钮文案
							}

						以上属性中若icon为''；btns为null或[]；prizes为null或[]则相应的dom不显示
						以上属性中title、subtitle、tips和linkTxt若为null，则相应的dom不显示

						弹框的类型有以下值：
							default 	所有弹框的默认配置
							coupon		中小奖
							fail		未中奖
							login		需登录
							entity		中大奖
							miss		游戏失败

						图标类型有以下值：
							coupon 		中小奖
							fail 		未中奖
							login 		需登录
							entity		中大奖
							miss		游戏失败

						按钮类型有以下值：
							share 								分享（在京东app中，将打开分享界面；在微信中，将显示common.$shareTips；在其他环境中，将显示“复制链接分享”）
							coupon 								跳转到领券中心
							login								跳转到登录界面
							home								回到首页（在xview中关闭xview；其他环境，唤起app，同时当前页跳转到m站首页）
							go									跳转到会场（在xview中，将先关闭xview，再在webview中打开会场；其他环境，唤起app并在app中打开会场，同时当前页直接跳转到会场）
							cart								跳转到购物车（在xview中，将先关闭xview，再打开购物车；其他环境，唤起app并在app中打开购物车，同时当前页直接跳转到购物车）
							jump0、jump1、jump2...				跳转到CONF.jumpUrls[0]、CONF.jumpUrls[1]、CONF.jumpUrls[2]...页面（在xview中，将先关闭xview，再在webview中打开；其他环境，唤起app并在app中打开，同时当前页也会打开）
							call0、call1、call2...				唤起app并跳转到CONF.jumpUrls[0]、CONF.jumpUrls[1]、CONF.jumpUrls[2]...页面（在京东app中，将在webview中打开；其他环境，唤起app并在app中打开，同时当前页会跳转到下载页）
							sku0、sku1、sku2...					跳转到CONF.skuIds[0]、CONF.skuIds[1]、CONF.skuIds[2]...的商详（在xview中，将先关闭xview，再在webview中打开；其他环境，唤起app并在app中打开，同时当前页也会打开）
							shop0、shop1、shop2...				跳转到CONF.shopIds[0]、CONF.shopIds[1]、CONF.shopIds[2]...的店铺（在xview中，将先关闭xview，再在webview中打开；其他环境，唤起app并在app中打开，同时当前页也会打开）
							addCart0、addCart1、addCart2...		将商品CONF.skuIds[0]、CONF.skuIds[1]、CONF.skuIds[2]...添加到购物车
							replay								再玩一次
							reload								刷新页面
							retry								重新发送抽奖请求
					 */
					default : {
						orders : [
							'icon',
							'title',
							'subtitle',
							'pack',
							'btns',
							'prizes',
							'tips',
							'link'
						],
						linkTxt : null,
						linkType : 'go',
						shareBtnTxt : '',
						couponBtnTxt : '',
						loginBtnTxt : '',
						homeBtnTxt : '',
						goBtnTxt : '',
						replayBtnTxt : '',
						reloadBtnTxt : '',
						retryBtnTxt : ''
					},
					coupon : {
						icon : 'coupon',
						title : '恭喜您获得{val}元优惠券',
						btns : ['go','share'],
						tips : '优惠券到账可能有延迟'
					},
					fail : {
						icon : 'fail',
						title : '和奖品擦肩而过',
						btns : ['go','replay']
					},
					login : {
						icon : 'login',
						title : '登录后离中奖更进一步',
						btns : ['login']
					},
					entity : {
						icon : 'entity',
						title : '恭喜您获得{val}元优惠券',
						btns : ['go','coupon'],
						tips : '优惠券到账可能有延迟'
					},
					miss : {
						icon : 'miss',
						title : '游戏失败',
						btns : ['go','replay']
					},
					retry : {
						icon : 'retry',
						title : '网络开小差了，重试一下！',
						btns : ['retry']
					}
					//end:弹框的个性化配置
				}, //默认配置
				type = {}; //配置中所有的type（包括common和default）
			common = extend({},DEFAULT_CONF.common,allConf.common);
			cookieExpire = (function(){
				var end = common.end,
					tmpExpire,
					expire = DEFAULT_COOKIE_EXPIRE;
				if(end){
					tmpExpire = new Date(end.year,end.month - 1,end.day,end.hour,end.minute,end.second) - new Date();
					if(tmpExpire > 0){
						expire = tmpExpire;
					}
				}
				return expire;
			})();
			$con = $copyShareCon = $(document.body);
			$shareTips = $('#share_tips');
			for(var i in DEFAULT_CONF){
				type[i] = null;
			}
			for(var i in allConf){
				type[i] = null;
			}
			for(var i in type){
				(function(type){
					if(type != 'common' && type != 'default'){

						//start:在popup上添加弹框方法
						/**
						 * 显示弹框
						 * @param {Object} [info] 弹框信息
						 *		@key {Array} [pack] 券包信息
						 *			@elem {Object} 优惠券的信息
						 *				@key {String} [val] 优惠金额
						 *				@key {String} [cond] 满减金额
						 *				@key {String} [cate] 类别
						 *				@key {String} [tips] 使用提示
						 *				@key {String} [cls] 类型
						 *				@key {String} [img] 图片
						 *				@key {String} [name] 名称
						 * @param {Boolean} [noAnim = false] 是否“不显示弹框动画，并使用cookie中的数据”
						 */
						popup[type] = function(info,noAnim){
							var conf = extend({},DEFAULT_CONF.default,DEFAULT_CONF[type],allConf.default,allConf[type]);

							//start:对重试弹框做特殊处理
							if(type == 'retry'){
								var retryHandler = info; //重试弹框的info参数为“点击‘重试’按钮后的处理函数”
								info = noAnim; //重试弹框的noAnim参数为“弹框的信息”（作用同普通弹框中的info）
								noAnim = arguments[2]; //重试弹框的第3个参数为“是否‘不显示弹框动画，并使用cookie中的数据’”
							}
							//end:对重试弹框做特殊处理

							if(noAnim){
								var popupInfo = handlers.cookie.get(common.prefix + capitalize(type) + 'PopupInfo');
								if(popupInfo){
									try{
										info = JSON.parse(popupInfo);
									}catch(e){}
								}
							}else if(info){
								var PACK_PROPS = ['val','cond','cate','tips','cls','img','name']; //优惠券属性

								//start:若info中有任何一个PACK_PROPS中指定的属性；且无pack属性，则以PACK_PROPS中指定的属性在info中的值为样本，为info添加pack属性
								if(
									(!info.pack || !info.pack.length) && 
									PACK_PROPS.some(function(prop){
										return info[prop];
									})
								){
									info.pack = [
										(function(){
											var ret = {};
											PACK_PROPS.forEach(function(prop){
												ret[prop] = info[prop];
											});
											return ret;
										})()
									];
								}
								//end:若info中有任何一个PACK_PROPS中指定的属性；且无pack属性，则以PACK_PROPS中指定的属性在info中的值为样本，为info添加pack属性

								//start:若info中有pack属性；且无任何一个PACK_PROPS中指定的属性，则以info.pack[0]为样本，在info中添加所有PACK_PROPS中指定的属性
								if(
									info.pack && info.pack.length && 
									!PACK_PROPS.some(function(prop){
										return info[prop];
									})
								){
									var infoPack0 = info.pack[0];
									PACK_PROPS.forEach(function(prop){
										info[prop] = infoPack0[prop];
									});
								}
								//end:若info中有pack属性；且无任何一个PACK_PROPS中指定的属性，则以info.pack[0]为样本，在info中添加所有PACK_PROPS中指定的属性
							}
							info = info || {};
							info.gameRet = popup.getGameRet();
							if(conf.dyn){
								conf = extend(
									conf,
									conf.dyn[
										(conf.dyn.keys || []).reduce(function(prev,cur){
											var key = info && typeof info[cur] != 'undefined' ? info[cur] : '';
											return (prev ? prev + ',' : '') + key;
										},'') || 'default'
									] || conf.dyn.default
								);
							}
							var $popup = $(TPLS.popup),
								popupDom = $popup[0],
								$content = findFromSelf($popup,'[padt-role="content"]'),
								$pack,
								$prizes;

							//start:设置弹框界面
							$popup.addClass('padt_p_type_' + type);
							conf.orders.forEach(function(name){
								switch(name){
									case 'icon':
										var parsedIcon = popup.parse(conf.icon,info);
										if(parsedIcon != null){
											$(TPLS.icon).addClass('padt_p_icon_' + parsedIcon).appendTo($content);
										}
										break;
									case 'title':
										var parsedTitle = popup.parse(conf.title,info);
										if(parsedTitle != null){
											findFromSelf($(TPLS.title).appendTo($content),'[padt-role="title"]').html(popup.parseLine(parsedTitle));
										}
										break;
									case 'subtitle':
										var parsedSubtitle = popup.parse(conf.subtitle,info);
										if(parsedSubtitle != null){
											findFromSelf($(TPLS.subtitle).appendTo($content),'[padt-role="subtitle"]').html(popup.parseLine(parsedSubtitle));
										}
										break;
									case 'pack':
										if(conf.pack && conf.pack.length && info && info.pack && info.pack.length){
											$pack = findFromSelf($(TPLS.packWrap).appendTo($content),'[padt-role="pack"]');
											info.pack.forEach(function(packItem){
												packItem.gameRet = info.gameRet;
												var $packItem = findFromSelf($(TPLS.packItem).appendTo($pack),'[padt-role="item"]'),
													parsedPackItemClass = popup.parse(conf.packItemClass,packItem);
												if(parsedPackItemClass){
													$packItem.addClass(parsedPackItemClass);
												}
												conf.pack.forEach(function(packItemConf){
													var parsedVal = popup.parse(packItemConf.val,packItem);
													if(parsedVal != null){
														findFromSelf(
															$(TPLS['packItem' + capitalize(packItemConf.type)]).appendTo($packItem),
															'[padt-role="' + packItemConf.type + '"]'
														).html(popup.parseLine(parsedVal));
													}
												});
											});

											//start:若优惠券列表中内容的高度不大于容器的高度，则禁止滚动
											$pack.on('touchstart',function(e){
												if(this.scrollHeight <= this.offsetHeight){
													e.preventDefault();
												}
											});
											//end:若优惠券列表中内容的高度不大于容器的高度，则禁止滚动
										}
										break;
									case 'btns':
										if(typeof conf.btns == 'function'){
											conf.btns = conf.btns();
										}
										if(conf.btns && conf.btns.length){

											//start:在微信和QQ环境中强制不显示分享功能的按钮
											if(!isJd && isWx){
												conf.btns = conf.btns.filter(function(btnType){
													return btnType != 'share';
												});
											}
											//end:在微信和QQ环境中强制不显示分享功能的按钮

											//start:去除被设置为null的按钮
											conf.btns = conf.btns.filter(function(btnType){
												return btnType != null;
											});
											//end:去除被设置为null的按钮

											if(conf.btns && conf.btns.length){
												var $btns = $(TPLS.btns).appendTo($content);
												conf.btns.forEach(function(btnType){
													var $btn = $(TPLS.btn),
														parsedBtnTxt = popup.parse(conf[btnType + 'BtnTxt'],info);
													if(parsedBtnTxt){
														findFromSelf($btn,'[padt-role="txt"]').html(popup.parseLine(parsedBtnTxt));
													}
													$btn.addClass('padt_p_btn_' + btnType)
														.attr('padt-handler',btnType)
														.appendTo($btns);
												});
											}
										}
										break;
									case 'prizes':
										if(typeof conf.prizes == 'function'){
											conf.prizes = conf.prizes();
										}
										if(conf.prizes && conf.prizes.length){
											$popup.addClass('padt_p_with_prizes');
											$prizes = findFromSelf($(TPLS.prizesWrap).appendTo($content),'[padt-role="prizes"]');

												/**
												 * 设置奖品dom属性
												 * @param {String} type - 设置的类型
												 * @param {Zepto} $dom - 要设置的dom
												 * @param {String} val - 设置的值
												 */
											var setPrizeDomProp = function(type,$dom,val){
													var parsedVal = popup.parse(val,info);
													if(parsedVal != null){
														switch(type){
															case 'html':
																$dom.html(popup.parseLine(parsedVal));
																break;
															case 'class':
																$dom.addClass(parsedVal);
																break;
															default:
																$dom.attr(type,parsedVal);
														}
													}
												};
											conf.prizes.forEach(function(src){
												if(typeof src == 'string'){
													setPrizeDomProp('src',findFromSelf($(TPLS.prize).appendTo($prizes),'[padt-role="prize"]'),src);
												}else{
													var $prize = $(TPLS.prize).appendTo($prizes);
													for(var i in src){
														setPrizeDomProp(conf.prizeTypes[i] || 'html',findFromSelf($prize,'[padt-role="prize_' + i + '"]'),src[i]);
													}
												}
											});

											//start:若奖品列表中内容的宽度不大于容器的宽度，则禁止滚动
											$prizes.on('touchstart',function(e){
												if(this.scrollWidth <= this.offsetWidth){
													e.preventDefault();
												}
											});
											//end:若奖品列表中内容的宽度不大于容器的宽度，则禁止滚动

											//start:绑定奖品滚动事件
											var slid = false; //是否已经滑动
											$prizes.on({
												touchmove : function(){
													slid = true;
												},
												touchend : function(e){
													if(slid && !e.touches.length){ //仅在最后一根手指释放时触发onSlicePrize
														handlers.onSlicePrize && handlers.onSlicePrize.call(this,{
															type : type,
															info : info,
															common : common,
															conf : conf,
															e : e
														});
														slid = false;
													}
												}
											});
											//end:绑定奖品滚动事件
										}
										break;
									case 'tips':
										var parsedTips = popup.parse(conf.tips,info);
										if(parsedTips != null){
											findFromSelf(
												$(TPLS.tipsWrap).appendTo($content),
												'[padt-role="tips"]'
											).html(popup.parseLine(parsedTips));
										}
										break;
									case 'link':
										var parsedLinkTxt = popup.parse(conf.linkTxt,info),
											parsedLinkType = popup.parse(conf.linkType,info);
										if(parsedLinkType != null && parsedLinkType){
											findFromSelf(
												$(TPLS.linkWrap).appendTo($content),
												'[padt-role="link"]'
											).html(popup.parseLine(parsedLinkTxt)).attr('padt-handler',parsedLinkType);
										}
										break;
								}
							});
							var parsedClass = popup.parse(conf.class,info)
							if(parsedClass){
								$popup.addClass(parsedClass);
							}
							if(noAnim){
								$popup.addClass('padt_p_no_anim');
							}else{
								$popup.removeClass('padt_p_no_anim');
							}
							//end:设置弹框界面

							//start:绑定点击事件
							$popup.on('touchend','[padt-handler]',function(e){
								var $that = $(this),
									handlerType = $that.attr('padt-handler');
								if(handlerType){
									var all = {
											type : type,
											info : info,
											common : common,
											conf : conf,
											e : e
										};
									[{
										re : /^jump(\d+)$/,
										handler : function(match){
											handlerType = 'jump';
											all.urlIdx = match[1];
										}
									},{
										re : /^call(\d+)$/,
										handler : function(match){
											handlerType = 'call';
											all.urlIdx = match[1];
										}
									},{
										re : /^sku(\d+)$/,
										handler : function(match){
											handlerType = 'sku';
											all.idIdx = match[1];
										}
									},{
										re : /^shop(\d+)$/,
										handler : function(match){
											handlerType = 'shop';
											all.idIdx = match[1];
										}
									},{
										re : /^addCart(\d+)$/,
										handler : function(match){
											handlerType = 'addCart';
											all.idIdx = match[1];
											all.onSuc = popup.onAddCartSuc;
											all.onFail = popup.onAddCartFail;
										}
									}].some(function(chker){
										var match = handlerType.match(chker.re);
										if(match){
											chker.handler(match);
											return true;
										}
									});
									handlers[handlerType] && handlers[handlerType].call(this,all);
								}
							});

							//start:绑定点击关闭弹框事件
							$popup.on('touchend','[padt-handler="hide"]',function(e){
								showns.some(function(shown,idx){
									if(popupDom == shown.$dom[0]){
										showns.splice(idx,1);
										destroy(shown);
										$popup.remove();
										handlers.cookie.del(common.prefix + capitalize(type) + 'PopupInfo');
										onTapHideBtnHandler && onTapHideBtnHandler(type,$popup,e);
										onHideHandler && onHideHandler(type,$popup,true);
										return true;
									}
								});
							});
							//end:绑定点击关闭弹框事件

							//start:绑定点击重试事件
							$popup.on('touchend','[padt-handler="retry"]',function(e){
								retryHandler && retryHandler.call(this,{
									type : type,
									info : info,
									common : common,
									conf : conf,
									e : e
								});

								//start:点击“重试”按钮后隐藏界面
								showns.some(function(shown,idx){
									if(popupDom == shown.$dom[0]){
										showns.splice(idx,1);
										destroy(shown);
										$popup.remove();
										handlers.cookie.del(common.prefix + capitalize(type) + 'PopupInfo');
										onHideHandler && onHideHandler(type,$popup,false);
										return true;
									}
								});
								//end:点击“重试”按钮后隐藏界面
							});
							//end:绑定点击重试事件
							//end:绑定点击事件

							//start:阻止默认事件（例如：滚动等）
							$popup.on('touchstart',function(e){
								if(!$(e.target).closest('[padt-npd]').length){ //padt-npd的dom不会阻止默认事件（例如：确保奖品区域能够滚动）
									e.preventDefault();
								}
							});
							//end:阻止默认事件（例如：滚动等）

							//start:记录弹框的显示顺序
							showns.some(function(shown,idx){
								if(popupDom == shown.$dom[0]){
									showns.splice(idx,1);
									return true;
								}
							});
							showns.push({
								type : type,
								$dom : $popup,
								$pack : $pack,
								$prizes : $prizes
							});
							//end:记录弹框的显示顺序

							//start:在cookie中记录info
							if(!noAnim){
								var toRecord = extend({},info); //要记录的info
								delete toRecord.info; //不在info中记录游戏结果数据
								if(toRecord && !$.isEmptyObject(toRecord)){
									handlers.cookie.set(common.prefix + capitalize(type) + 'PopupInfo',JSON.stringify(toRecord),0);
								}
							}
							//end:在cookie中记录info

							$popup.appendTo($con);
							onShowHandler && onShowHandler(type,info,noAnim,$popup);
							return popup;
						};

						/**
						 * 隐藏弹框
						 */
						popup['hide' + capitalize(type)] = function(){
							showns.some(function(shown,idx){
								if(type == shown.type){
									showns.splice(idx,1);
									destroy(shown);
									shown.$dom.remove();
									handlers.cookie.del(common.prefix + capitalize(shown.type) + 'PopupInfo');
									onHideHandler && onHideHandler(shown.type,shown.$dom,false);
									return true;
								}
							});
							return popup;
						};
						//end:在popup上添加弹框方法
					}
				})(i);
			}

			//start:分享提示
			(function(){
				var inited = false; //是否已经初始化

				/**
				 * 显示“分享提示”
				 */
				popup.shareTips = function(){
					if($shareTips && $shareTips.length){
						if(!inited){
							inited = true;
							$shareTips.on('touchend',function(){ //点击任意位置隐藏“分享提示”
								popup.hideShareTips();
							}).on('touchstart',function(e){ //阻止屏幕滚动
								e.preventDefault();
							}).addClass('share_tips');
						}
						$shareTips.show();
					}
					return popup;
				};

				/**
				 * 隐藏“分享提示”
				 */
				popup.hideShareTips = function(){
					if(inited){
						$shareTips.hide();
					}
					return popup;
				};

				/**
				 * 销毁shareTips的事件绑定
				 */
				popup.destroyShareTips = function(){
					if(inited){
						$shareTips.off();
						inited = false;
					}
					$shareTips = null;
					return popup;
				};
			})();
			//end:分享提示

			//start:复制链接分享
			(function(){
				var copyShareTxt = null,
					copyShareUrl = null,
					copyShareInfo = null,
					$copyShare = null,
					$copyShareTextarea = null,
					copyShareTextarea = null,
					$copyShareOpenBtn = null,
					$copyShareHideBtn = null;

				/**
				 * 显示“复制链接分享”
				 * @param {String} [txt] 分享文案
				 * @param {String} [url] 分享链接
				 * @param {Object} [info] 分享文案和链接中替换成的信息
				 */
				popup.copyShare = function(txt,url,info){
					copyShareTxt = txt;
					copyShareUrl = url;
					copyShareInfo = info;
					$copyShare = $(TPLS.copyShare);
					$copyShareTextarea = findFromSelf($copyShare,'[padt-role="textarea"]');
					copyShareTextarea = $copyShareTextarea[0];
					$copyShareOpenBtn = findFromSelf($copyShare,'[padt-role="open_btn"]');
					$copyShareHideBtn = findFromSelf($copyShare,'[padt-role="hide_btn"]');
					var val = popup.parse(txt + url,info); //文本框的值
					$copyShareOpenBtn.on('touchend',function(e){ //点击“打开”按钮打开微信
						handlers.copyShareOpen && handlers.copyShareOpen.call(this,{
							txt : txt,
							url : url,
							info : info,
							common : common,
							e : e
						});
					});
					$copyShareHideBtn.on('touchend',function(e){ //点击“隐藏”按钮隐藏界面
						popup.hideCopyShare(e);
					});
					$copyShare.on('touchstart',function(e){ //阻止屏幕滚动
						if(e.target != copyShareTextarea){ //确保文本框区域能够滚动
							e.preventDefault();
						}
					});
					$copyShareTextarea.on('click',function(){ //点击文本框时自动全选
						this.setSelectionRange(0,val.length);
						this.focus();
					}).on('input',function(){ //使得用户无法修改文本框内容
						if(val != $copyShareTextarea.val()){
							$copyShareTextarea.val(val);
						}
					});
					$copyShareTextarea.val(val);
					$copyShare.appendTo($copyShareCon);
					return popup;
				};

				/**
				 * 隐藏“复制链接分享”
				 * @param {Event} e - 事件
				 */
				popup.hideCopyShare = function(e){
					handlers.onHideCopyShare && handlers.onHideCopyShare.call(this,{
						txt : copyShareTxt,
						url : copyShareUrl,
						info : copyShareInfo,
						common : common,
						e : e || null
					});
					$copyShareOpenBtn && $copyShareOpenBtn.off();
					$copyShareHideBtn && $copyShareHideBtn.off();
					$copyShareTextarea && $copyShareTextarea.off();
					$copyShare && $copyShare.off().remove();
					copyShareTxt = null;
					copyShareUrl = null;
					copyShareInfo = null;
					$copyShareOpenBtn = null;
					$copyShareHideBtn = null;
					$copyShareTextarea = null;
					copyShareTextarea = null;
					$copyShare = null;
					return popup;
				};
			})();
			//end:复制链接分享

			//start:预加载弹框资源
			(function(){

				/**
				 * 预加载弹框资源
				 */
				popup.preload = function(){
					var preloads = common.preloads;
					if(preloads && preloads.length){
						var htmlArr = [];
						preloads.forEach(function(url){
							htmlArr.push('<p class="padt_p_preload" style="background-image:url(' + url + ');"></p>');
						});
						$con.append(htmlArr.join(''));
					}
					return popup;
				};
			})();
			//end:预加载弹框资源

			//start:游戏结果相关
			(function(){

				/**
				 * 获取游戏结果
				 * @return {Object} 游戏结果
				 */
				popup.getGameRet = function(){
					var gameRet = handlers.cookie.get(common.prefix + 'GameRet');
					if(gameRet){
						try{
							return JSON.parse(gameRet);
						}catch(e){}
					}
					return {};
				};

				/**
				 * 记录游戏结果
				 */
				popup.setGameRet = function(gameRet){
					handlers.setGameResultInfo(gameRet);
					handlers.cookie.set(common.prefix + 'GameRet',JSON.stringify(gameRet));
					return popup;
				};

				/**
				 * 记录游戏结果属性
				 * @param {String | Object} key - 要记录的属性名或“要记录的属性名和属性值”组成的对象
				 * @param {Any} val - 要记录的属性值（仅当key为“要记录的属性名”时有效）
				 */
				popup.setGameRetProp = function(key,val){
					var gameRet = popup.getGameRet();
					if(typeof key == 'string'){
						gameRet[key] = val;
					}else{
						for(var i in key){
							gameRet[i] = key[i];
						}
					}
					return popup.setGameRet(gameRet);
				};
			})();
			//start:游戏结果相关

			//start:抽奖组件
			(function(){

				/**
				 * 获取抽奖组件索引
				 * @return {Number} 抽奖组件索引
				 */
				popup.getModuleIdx = function(){
					return popup.getGameRet().moduleIdx;
				};

				/**
				 * 设置抽奖组件索引
				 * @param {Number} moduleIdx - 抽奖组件索引
				 */
				popup.setModuleIdx = function(moduleIdx){
					return popup.setGameRetProp('moduleIdx',moduleIdx);
				};
			})();
			//end:抽奖组件

			//start:分享
			(function(){

				/**
				 * 获取分享数据索引
				 */
				popup.getShareKey = function(){
					return popup.getGameRet().shareKey;
				};

				/**
				 * 设置分享数据索引
				 * @param {Number} shareKey - 要设置的分享数据索引
				 */
				popup.setShareKey = function(shareKey){
					return popup.setGameRetProp('shareKey',shareKey);
				};
			})()
			//end:分享

			//start:调用handlers
			for(var i in handlers){
				(function(handlerType){
					switch(handlerType){
						case 'share':

							/**
							 * 调用分享
							 * @param {String} [type = ''] - 调用分享的类型
							 * @param {String | null} [shareKey = null] - 分享配置在CONF.shareConf.random.app中的键（为null表示不设置）
							 */
							popup.callShare = function(type,shareKey){
								if(shareKey != null){
									popup.setShareKey(shareKey);
								}
								handlers.share({
									type : type || ''
								});
								return popup;
							};
							break;
						case 'jump':

							/**
							 * 调用跳转地址
							 * @param {String} [type = ''] - 调用的类型
							 * @param {String} urlIdx - 地址在CONF.jumpUrls中的键
							 */
							popup.callJump = function(type,urlIdx){
								handlers.jump({
									type : type || '',
									urlIdx : urlIdx
								});
								return popup;
							};
							break;
						case 'call':

							/**
							 * 调用唤起app并跳转
							 * @param {String} [type = ''] - 调用的类型
							 * @param {String} urlIdx - 地址在CONF.jumpUrls中的键
							 */
							popup.callCall = function(type,urlIdx){
								handlers.call({
									type : type || '',
									urlIdx : urlIdx
								});
								return popup;
							};
							break;
						case 'sku':

							/**
							 * 调用跳转商详
							 * @param {String} [type = ''] - 调用的类型
							 * @param {String} idIdx - 商品id在CONF.skuIds中的键
							 */
							popup.callSku = function(type,idIdx){
								handlers.sku({
									type : type || '',
									idIdx : idIdx
								});
								return popup;
							};
							break;
						case 'shop':

							/**
							 * 调用跳转店铺
							 * @param {String} [type = ''] - 调用的类型
							 * @param {String} idIdx - 店铺id在CONF.shopIds中的键
							 */
							popup.callShop = function(type,idIdx){
								handlers.shop({
									type : type || '',
									idIdx : idIdx
								});
								return popup;
							};
							break;
						case 'addCart':

							/**
							 * @callback onAddCart
							 * @param {String} idIdx - 要添加的商品id在CONF.skuIds中的键
							 */

							/**
							 * 调用添加到购物车
							 * @param {String} [type = ''] - 调用的类型
							 * @param {String} idIdx - 商品id在CONF.skuIds中的键
							 * @param {module:popup~onAddCart} [onSuc = game.popup.onAddCartSuc] - 添加成功
							 * @param {module:popup~onAddCart} [onFail = game.popup.onAddCartFail] - 添加失败
							 */
							popup.callAddCart = function(type,idIdx,onSuc,onFail){
								handlers.addCart({
									type : type || '',
									idIdx : idIdx,
									onSuc : onSuc || popup.onAddCartSuc,
									onFail : onFail || popup.onAddCartFail
								});
								return popup;
							};
							break;
						case 'updateTRCShare':
							popup.callUpdateTRCShare = handlers.updateTRCShare;
							break;
						default:

							/**
							 * 调用
							 * @param {String} [type = ''] - 调用的类型
							 */
							popup['call' + capitalize(handlerType)] = function(type){
								handlers[handlerType]({
									type : type || ''
								});
								return popup;
							};
					}
				})(i);
			}
			//end:调用handlers
			return popup;
		},

		/**
		 * 隐藏弹框
		 * @param {Boolean} [hideAll = false] 是否隐藏所有弹框
		 *		@tips 若为false则依次隐藏当前弹框
		 */
		hide : function(hideAll){
			showns.some(function(shown){
				destroy(shown);
				shown.$dom.remove();
				handlers.cookie.del(common.prefix + capitalize(shown.type) + 'PopupInfo');
				onHideHandler && onHideHandler(shown.type,shown.$dom,false);
				return !hideAll;
			});
			showns = [];
			return popup;
		},

		/**
		 * 当显示弹框时的回调
		 * @param {Function} [handler] 回调
		 *		@param {String} [type] 弹框的类型
		 *		@param {Object} [info] 调用弹框时传入的“弹框信息”参数
		 *		@param {Boolean} [noAnim = false] 调用弹框时传入的“不显示弹框动画”参数
		 *		@param {Zepto} [$popup] 弹框的dom
		 */
		onShow : function(handler){
			onShowHandler = handler;
			return popup;
		},

		/**
		 * 当隐藏弹框时的回调
		 * @param {Function} [handler] 回调
		 *		@param {String} [type] 弹框的类型
		 *		@param {Zepto} [$popup] 弹框的dom
		 *		@param {Boolean} [fromHideBtn] 是否是由点击隐藏按钮触发的
		 */
		onHide : function(handler){
			onHideHandler = handler;
			return popup;
		},

		/**
		 * 当点击隐藏按钮时的回调
		 * @param {Function} [handler] 回调
		 *		@param {String} [type] 弹框的类型
		 *		@param {Zepto} [$popup] 弹框的dom
		 *		@param {Event} [e] 事件对象
		 */
		onTapHideBtn : function(handler){
			onTapHideBtnHandler = handler;
			return popup;
		},

		/**
		 * 设置$con
		 * @param {Zepto} [_$con] 设置后的$con
		 */
		set$con : function(_$con){
			$con = _$con;
			return popup;
		},

		/**
		 * 设置$copyShareCon
		 * @param {Zepto} [_$copyShareCon] 设置后的$copyShareCon
		 */
		set$copyShareCon : function(_$copyShareCon){
			$copyShareCon = _$copyShareCon;
			return popup;
		},

		/**
		 * 设置$shareTips
		 * @param {Zepto} [_$shareTips] 设置后的$shareTips
		 */
		set$shareTips : function(_$shareTips){
			$shareTips = _$shareTips;
			return popup;
		},

		/**
		 * 当添加购物车成功的回调
		 * @param {String} idIdx - 添加失败的商品id在CONF.skuIds中的键
		 */
		onAddCartSuc : null,

		/**
		 * 当添加购物车成功的回调
		 * @param {String} idIdx - 添加失败的商品id在CONF.skuIds中的键
		 */
		onAddCartFail : null
	};

module.exports = popup;