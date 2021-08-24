var ENV = (function(){
		var ua = navigator.userAgent;

		return {
			xview : typeof XView != 'undefined', //是否是在xview中
			app : true, //是否在京东app中
			wx : /MicroMessenger/i.test(ua), //是否在微信中
			qq : /MQQBrowser/i.test(ua) //是否在QQ中
		}
	})(), //当前环境
	CONF = {
	custom : { //自定义配置参数

	},
	popup : { //弹框的配置参数
		common : {
			prefix : 'padt', //活动前缀标识
			end : {
				year : 2017,
				month : 1,
				day : 1,
				hour : 0,
				minute : 0,
				second : 0
			}, //活动结束时间
			preloads : [
				
			]
		},
		default : {
			orders : [
				'title',
				'btns'
			],
			linkTxt : '文字链文案',
			linkType : 'go',
			shareBtnTxt : '',
			couponBtnTxt : '“去优惠券”按钮文案',
			loginBtnTxt : '',
			homeBtnTxt : '“回首页”按钮文案',
			goBtnTxt : '“去会场”按钮文案',
			replayBtnTxt : '',
			retryBtnTxt : ''
		},
		//优惠券
		coupon : {
			orders : [
				'title',
				'subtitle',
				'pack',
				'btns'
			],
			title : '{info.gameRet.score}分',
			pack : [{
				type : 'val',
				val : '<span>¥</span>{val}'
			},{
				type : 'cond',
				val : '满{cond}元可用'
			},{
				type : 'cate',
				val : '{cate}'
			},{
				type : 'tips',
				val : '元优惠券'
			}],
			packItemClass : 'padt_p_pack_item_{cls}',
			btns : ['jump0','share','replay']
		},
		//已入库实物券
		entity : {
			orders : [
				'title',
				'subtitle',
				'pack',
				'btns',
				'link'
			],
			title : '中已入库实物券标题',
			subtitle : '中已入库实物券副标题',
			pack : [{
				type : 'val',
				val : '{val}元'
			},{
				type : 'tips',
				val : '{tips}'
			}],
			btns : ['share','replay']
		},
		//未入库实物券
		unstore : {
			orders : [
				'title',
				'subtitle',
				'pack',
				'btns',
				'link'
			],
			title : '中未入库实物券标题',
			subtitle : '中未入库实物券副标题',
			pack : [{
				type : 'val',
				val : '{val}元'
			},{
				type : 'tips',
				val : '{tips}'
			}],
			btns : ['share','replay']
		},
		//未中奖
		fail : {
			orders : [
				'title',
				'subtitle',
				'btns'
			],
			title : '{info.gameRet.score}分',
			btns : ['jump0','share','replay']
		},
		//未登录
		login : {
			title : '{info.gameRet.score}分',
			btns : ['login','share','replay']
		},
		//重试
		retry : {
			title : '',
			btns : ['retry']
		},
		//规则弹窗
		custom0 : {
			title : '',
			btns : ['hide']
		},
		//0分弹窗
		custom1 : {
			title : '0分',
			btns : ['jump0','share','replay']
		}
	},

	host : 'api.m.jd.com', //可选值：api.m.jd.com、beta-api.m.jd.com
	functionId : 'babelActivityLuckDraw', //可选值：babelActivityLuckDraw、leGaoDrawCoupon

	//接口超时
	timeout: 5000,

	//主会场地址，如果按钮是回首页，可以置空
	mallURL: 'https://h5.m.jd.com/dev/qqm4hw8zMjZjspYuimTBaFt7QYk/index.html',

	//指定跳转地址
	jumpUrls: {
		0: 'https://pro.m.jd.com/mall/active/3vgiBMHNkB5vuYCPpTqMyrEJXvGA/index.html',
		1: 'https://h5.m.jd.com/dev/32g4G7FQEG6DFqZrVd82HsNWbmSF/index.html'
	},

	//指定商品id
	skuIds: {
		0: '3227300',
		1: '2205060'
	},

	//指定店铺id
	shopIds: {
		0: '1000004123',
		1: '1000004259'
	},

	//抽奖接口中的页面信息配置及默认抽奖moduleId配置
	lotteryConf: {
		activityId: '31nwz3WP4stekLitWDc61rBBCGGV',
		pageId: '183301',
		moduleId: [
			'3VUdjpgxKZ9yeWpFdKwYCECFyv6i',		//单张券
		]
	},

	//每场游戏配置
	/**
	 *	每一个id，对应一组moduleId, slogan图片，当前场次红包雨结束时间
	 */
	gameConf: {
		id1: {
			//时间配置说明
			//对于零点情况，配置成如：'2016/12/27 00:00:00'这种形式；而不是'2016/12/26 24:00:00'这种形式
			//
			time: '2016/10/27 10:32:00',	//当前场次红包雨结束时间，不可遗漏，否则会出错
			moduleId: [
				'a16Wgeyach2mPgAhicSoD14wP2Q78',		//单张券
				'a26Wgeyach2mPgAhicSoD14wP2Q7t',		//两张券
				'a36Wgeyach2mPgAhicSoD14wP2Q7t'		//三张券
			],
		},

		id2: {
			time: '',				//当前场次红包雨结束时间
			moduleId: [
				'c16Wgeyach2mPgAhicSoD14wP2Q7t',		//单张券
				'c26Wgeyach2mPgAhicSoD14wP2Q7t',		//两张券
				'c36Wgeyach2mPgAhicSoD14wP2Q7t'		//三张券
			],
		}
	},

	//客户端版本
	clientVersion: 540,
	
	//分享配置
	shareConf: {
		//缩略图图片地址
		img: './img/share.jpg',

		//长图分享图片地址
		longImg: '',

		//分享地址
		url: '',

		//分享随机文案
		random: {
			//app
			app: {
				key1: [
					{
						url: 'https://m.jd.com?id=1-1',
						img: '',
						title: '给世界点颜色看看~',
						content: '黑五价到，儿时神器也来搞事情了！',
						timeline_title: '黑五价到，儿时神器也来搞事情了！'
					}
				]
				
			
			},

			//微信，微信侧分享文案，不要配置{score}这种坑
			wx: [
				{
					url: '',
					img: '',
					title: '给世界点颜色看看~',
					content: '黑五价到，儿时神器也来搞事情了！',
					timeline_title: '黑五价到，儿时神器也来搞事情了！'
				}
			]
		}
	},

	//埋点前缀配置
	trackPrefix: 'Babel_dev_adv_',

	//埋点参数
	trackParam: {
		activityId: '00087174',
		groupId: '987654321',
		advertIds: {
			LotteryInterface : '',
			InterfaceSucceed : ''
		}
	},

	//状态码文案
	subTitleConf: {
		default: 'code默认文案..',	//默认文案，用于code!=0情况
		content: [

			//code
			'code 1...',			//1
			'code -1...', 			//-1
			'code -701...', 		//-701

			//subcode
			'subcode 1',			//1
			'subcode -1', 			//-1
			'1-1;1-2;1-3;1-4',		//1-1;1-2;1-3;1-4
			'3-1;3-2',				//3-1;3-2
			'2-1',					//2-1
			'4-2',					//4-2
			'4-5',					//4-5
			'5-1;5-2;5-3;5-4',		//5-1;5-2;5-3;5-4
			'6-2;6-3;6-4',			//6-2;6-3;6-4
			'subcode 6-1',			//6-1
			'subcode 默认错误文案'	//else
		]
	}
};