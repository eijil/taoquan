/** @module game */

var common = require('./common'),
	popup = require('./popup'),
	gameCustom = require('./game.custom') || {};

var type, //页面类型
	draw; //抽奖回调

	/**
	 * 游戏
	 * @namespace
	 */
var game = {

		/**
		 * @callback onDraw
		 *		@param {Object} [gameRet = {}] - 游戏结果
		 *			@param {Number} [gameRet.moduleIdx = 1] - 要调用的抽奖组件在CONF.gameConf的moduleId中的索引
		 */

		/**
		 * 初始化
		 * @param {Object} opts - 参数
		 *		@param {module:game~onDraw} opts.onDraw - 调用该方法后会立即抽奖并根据抽奖结果显示对应的弹框
		 */
		init : function(opts){
			opts = opts || {};
			draw = function(gameRet){
				gameRet = gameRet || {};
				game.moduleIdx = game.moduleIdx || 1;
				popup.setGameRet(gameRet);
				opts.onDraw(gameRet);
			};

			//start:判断type（TODO 该实现是从app.bundler.js中复制出来的，以后需要从app.bundler.js传出来）
			var cookiePrefix = CONF.cookiePrefix || '',
				getCookie = popup.handlers.cookie.get, //读取cookie

				/**
				 * 查询search
				 * @param {String} key - 要查询的key
				 */
				querySearch = function(key){
					var match = location.search.match(new RegExp('[\\?&]' + key + '=([^&#]+)'));
					return match && decodeURIComponent(match[1]) || '';
				};
			if(getCookie(cookiePrefix + 'gomall') == 'true'){
				type = 'back';
			}else if(querySearch('open') && getCookie(cookiePrefix + 'Gamec') != 'false'){
				type = 'login';
			}else{
				type = 'normal';
			}
			//end:判断type（TODO 该实现是从app.bundler.js中复制出来的，以后需要从app.bundler.js传出来）

			gameCustom.init && gameCustom.init({
				type : type,
				draw : draw,
				custom : opts.custom || {}
			});
		},

		/**
		 * 开始游戏，再次开始游戏时也会执行这里的逻辑
		 */
		start : (function(){
			var calledStart = false;
			return function(){
				var isFirst = !calledStart;
				if(!calledStart){
					calledStart = true;
					gameCustom.initStart && gameCustom.initStart({
						type : type,
						isFirst : isFirst,
						draw : draw,
						custom : {}
					});
				}
				if(window.isPopupReplay){ //TODO 用于判断是否是点击“再玩一次”触发game.start方法的全局变量，以后要换一种更好的（不使用全局变量的）方式实现
					gameCustom.restart && gameCustom.restart({
						type : type,
						isFirst : isFirst,
						draw : draw,
						custom : {}
					});
				}else{
					gameCustom.start && gameCustom.start({
						type : type,
						isFirst : isFirst,
						draw : draw,
						custom : {}
					});
				}
			};
		})(),
		popup : popup, //在game上暴露popup的方法
		env : (function(){
			var ua = navigator.userAgent;
			return {
				xview : typeof XView != 'undefined', //是否是在xview中
				app : /jdapp/i.test(ua), //是否在京东app中
				wx : /MicroMessenger/i.test(ua), //是否在微信中
				qq : /MQQBrowser/i.test(ua) //是否在QQ中
			}
		})() //当前环境
	};

window.game = game;