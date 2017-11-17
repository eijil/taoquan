var Preloader = function(game) {
	
}
Preloader.prototype = {
    init: function() {
        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        // this.scale.pageAlignHorizontally = false;
        // this.scale.pageAlignVertically = true;
        this.scale.forcePortrait = true;
        //this.scale.forceOrientation(false, true);
        this.game.time.advancedTiming = true;

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
        this.load.image('map1', '../img/map1.png');
        this.load.image('map2', '../img/map2.png');
        this.load.image('map3', '../img/map3.png');
        this.load.image('map4', '../img/map4.png');
        this.load.image('map5', '../img/map5.png');
        this.load.image('map6', '../img/map6.png');
        this.load.image('map7', '../img/map7.png');
        this.load.image('map8', '../img/map8.png');
        this.load.image('map9', '../img/map9.png');
        this.load.image('map10', '../img/map10.png');
        this.load.image('gamebox', '../img/gamebox.png');
        this.load.image('texture', '../img/texture.png');
        this.load.image('rule', '../img/rule.png');
        this.load.image('zhenshadow', '../img/zhenshadow.png');
        this.load.image('water', '../img/water.png');
        this.load.spritesheet('leftButton', '../img/leftbutton.png', 254, 216);
        this.load.spritesheet('rightButton', '../img/rightbutton.png', 254, 216);
        this.load.spritesheet('music','../img/music.png',83,87);
        this.load.image('zhen', '../img/zhen.png');
        this.load.image('+10', '../img/+10.png');
        this.load.audio('getScore','https://static.360buyimg.com/jdcopr/activity/20171117/getScore.mp3');
        this.load.audio('bgmusic','https://static.360buyimg.com/jdcopr/activity/20171117/bg.mp3');
        this.load.audio('countDown','https://static.360buyimg.com/jdcopr/activity/20171117/countDown.mp3');
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