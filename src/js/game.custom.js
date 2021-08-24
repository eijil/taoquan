/** @module gameCustom */

require('../css/reset.css'); //若项目内嵌在其他页面中，则不建议引入reset.css，避免引起其他页面其他部分的样式问题
require('../css/common.css');
require('../css/popup.css');
require('../css/popup.custom.css');
require('../css/game.custom.css');

//start:常用模块
//game.custom并不依赖这些模块，但是项目开发中常常都会用到，因此就直接写在这里了
var common = require('./common'),
	popup = require('./popup');
//end:常用模块
window.PIXI = require('phaser-ce/build/custom/pixi.min');
window.p2 = require('phaser-ce/build/custom/p2.min');
window.Phaser = require('phaser-ce/build/custom/phaser-split.min');
var Preloader = require('./preloader.js');
var Main = require('./mainGame.js');


var mainGame;


module.exports = {

	/**
	 * @callback draw
	 *		@param {Number} [idx = 1] - 要调用的抽奖组件在CONF.gameConf的moduleId中的索引
	 */

	/**
	 * 初始化
	 * @param {Object} opts - 参数
	 *		@param {module:gameCustom~draw} opts.draw - 调用该方法后会立即抽奖并根据抽奖结果显示对应的弹框
	 *		@param {String} type - 初始化类型，可能的值：normal（一般情况）、login（登录成功后返回）、back（跳转后返回）
	 *		@param {Object} opts.custom - 自定义参数
	 */
	init : function(opts){
		var ua = navigator.userAgent;
		if (game.env.wx) {
            $('body').addClass('wx');
        }
        if(game.env.xview){
        	$('body').addClass('xview');
        }
        if(ua.indexOf('Android') > -1 || ua.indexOf('Adr') > -1){

        	 $('body').addClass('android');
        }
		window.opts = opts;
	},

	/**
	 * 初始化“开始游戏”（第1次“开始游戏”前的处理函数）
	 * @param {Object} opts - 参数
	 *		@param {Boolean} opts.isFirst - 是否是第1次“开始游戏”
	 *		@param {module:gameCustom~draw} opts.draw - 调用该方法后会立即抽奖并根据抽奖结果显示对应的弹框
	 *		@param {String} type - 初始化类型，可能的值：normal（一般情况）、login（登录成功后返回）、back（跳转后返回）
	 *		@param {Object} opts.custom - 自定义参数
	 */
	initStart : function(opts){

	},

	/**
	 * 由“普通流程”触发的“开始游戏”的处理函数
	 * @param {Object} opts - 参数
	 *		@param {Boolean} opts.isFirst - 是否是第1次“开始游戏”
	 *		@param {module:gameCustom~draw} opts.draw - 调用该方法后会立即抽奖并根据抽奖结果显示对应的弹框
	 *		@param {String} type - 初始化类型，可能的值：normal（一般情况）、login（登录成功后返回）、back（跳转后返回）
	 *		@param {Object} opts.custom - 自定义参数
	 */
	start : function(opts){

		mainGame = new Phaser.Game(750,1334 , Phaser.CANVAS, 'container');
		mainGame.state.add('Preload', Preloader,false);
		mainGame.state.add('Main', Main,false);
		mainGame.state.start('Preload');
	},

	/**
	 * 由点击“再玩一次”触发的“开始游戏”的处理函数
	 * @param {Object} opts - 参数
	 *		@param {Boolean} opts.isFirst - 是否是第1次“开始游戏”
	 *		@param {module:gameCustom~draw} opts.draw - 调用该方法后会立即抽奖并根据抽奖结果显示对应的弹框
	 *		@param {String} type - 初始化类型，可能的值：normal（一般情况）、login（登录成功后返回）、back（跳转后返回）
	 *		@param {Object} opts.custom - 自定义参数
	 */
	restart : function(opts){
		$('.preload').hide();
		mainGame.state.start('Main');
		
	}
};