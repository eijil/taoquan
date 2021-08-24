// window.jdGame.menu({
//     gameUrl: '/', // 游戏首页地址,可不传，不传则不展示回到游戏首页的按钮
//     prizeUrl: 'https://game-module-yf.jd.com/my_prize.html?activityId=10002760&sourceName=szgame', // 我的奖品页面，配置请参看第0条
// });

var Preloader = function(game) {
	
}
Preloader.prototype = {
    init: function() {
        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        // this.scale.pageAlignHorizontally = false;
        // this.scale.pageAlignVertically = true;
       // this.scale.forcePortrait = true;
        //this.scale.forceOrientation(false, true);
        this.game.time.advancedTiming = true;
        console.log('xx')
    },
   	preload: function() {
   		
    },
    create: function() {
    	var _this = this;
    	this.load.onFileComplete.add(this.fileComplete,this);
        this.load.onLoadComplete.addOnce(this.loadComplete, this);	
        this.loadResources();
        $(".btnStart").on('click',function(){
        	$('.preload').hide();
    		_this.state.start('Main');
        })

    },
    loadResources: function() {
        this.load.image('321', '../img/321.png');
        this.load.image('quan', '../img/quan.png');
        this.load.image('quanback', '../img/bquan.png');
        this.load.image('quanfront', '../img/fquan.png');
        this.load.image('boxbg', '../img/boxbg.png');
        this.load.image('bubble', '../img/bubble.png');
        this.load.image('map', '../img/map.png');
        
        this.load.image('gamebox', '../img/gamebox.png');
        this.load.image('texture', '../img/texture_.png');
        this.load.image('rule', '../img/rule.png');
        this.load.image('zhenshadow', '../img/zhenshadow.png');
        this.load.image('water', '../img/water.png');
        this.load.spritesheet('leftButton', '../img/leftbutton.png', 254, 216);
        this.load.spritesheet('rightButton', '../img/rightbutton.png', 254, 216);
        
        this.load.image('zhen', '../img/zhen.png');
        this.load.image('+10', '../img/+10.png');
        
        // this.load.image('321', '../taoquan/img/321.png');
        // this.load.image('quan', '../taoquan/img/quan.png');
        // this.load.image('quanback', '../taoquan/img/bquan.png');
        // this.load.image('quanfront', '../taoquan/img/fquan.png');
        // this.load.image('boxbg', '../taoquan/img/boxbg.png');
        // this.load.image('bubble', '../taoquan/img/bubble.png');
        // this.load.image('map', '../taoquan/img/map.png');

        // this.load.image('gamebox', '../taoquan/img/gamebox.png');
        // this.load.image('texture', '../taoquan/img/texture_.png');
        // this.load.image('rule', '../taoquan/img/rule.png');
        // this.load.image('zhenshadow', '../taoquan/img/zhenshadow.png');
        // this.load.image('water', '../taoquan/img/water.png');
        // this.load.spritesheet('leftButton', '../taoquan/img/leftbutton.png', 254, 216);
        // this.load.spritesheet('rightButton', '../taoquan/img/rightbutton.png', 254, 216);

        // this.load.image('zhen', '../taoquan/img/zhen.png');
        // this.load.image('+10', '../taoquan/img/+10.png');


        // this.load.audio('getScore','https://static.360buyimg.com/jdcopr/activity/20171117/getScore.mp3');
        // this.load.audio('bgmusic','https://static.360buyimg.com/jdcopr/activity/20171117/bg.mp3');
        // this.load.audio('countDown','https://static.360buyimg.com/jdcopr/activity/20171117/countDown.mp3');
        this.load.start();
    },
    fileComplete: function(progress, cacheKey, success, totalLoaded, totalFiles) {
        $('.progress').text(progress + '%');
    },
    loadComplete: function() {
    	// $('.preload').hide();
    	$(".loadingbox").hide();
    	$(".btnStart").show();
    	// this.state.start('Main');
    }
}


module.exports = Preloader;