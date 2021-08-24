var debugBody = false;
var Orientation = require('orientation.js');
var cookie = require('./cookie');

window.PhaserGlobal = {
    disableAudio: true
};


var innerHeight = window.innerHeight;
var Game = function(game) {
    this.quans;
    this.backQuan;
    this.line1;
    this.line2;
    this.count = 10;
    this.score = 0;
    this.quanWidth = 50;
    this.quanBorder = 6;
    this.timeEvent;
    this.water;
    this.enbaleMusic = false;
    this.tick = 60;
}
Game.prototype = {

    init: function() {

        var _this = this;
        
        this.stage.backgroundColor = '#342734';
        this.physics.startSystem(Phaser.Physics.P2JS);
        this.physics.p2.gravity.x = 0;
        this.physics.p2.gravity.y = 60;

        var guide = $("#guide");
        var isFirstPlay = cookie.get("taoquan");
        if (!isFirstPlay) {
            guide.show();
            guide.on('click', function() {
                guide.hide();
                _this.readyGo();
            })
            cookie.add('taoquan', true);
        } else {
            this.readyGo();
        }

    },
    create: function() {

        var _this = this;

        this.add.sprite(38, this.game.height - 1020, 'boxbg');

        this.createMaps();

        //针阴影
        this.add.sprite(190, this.game.height - 790, 'zhenshadow');
        this.add.sprite(490, this.game.height - 790, 'zhenshadow');
        //设置活动区域
        this.createArea();
        //泡泡
        this.createBubble();
        //圈
        this.createQuans();
        //针
        this.createNeelde();
        //层级提高
        this.world.bringToTop(this.quans);

        this.water = this.add.sprite(750 / 2 - 10, _this.game.height - 775, 'water');
        this.water.anchor.setTo(0.5, 0.3);

        this.add.sprite(0, _this.game.height - 1334, 'gamebox');
        //buttons
        this.add.button(69, _this.game.height - 362, 'leftButton', this.leftForce, this, 0, 0, 1, 2);
        this.add.button(448, _this.game.height - 362, 'rightButton', this.rightForce, this, 0, 0, 1, 2);
        //this.musicBtn = this.add.button(30, _this.game.height - 1170, 'music', this.musicControl, this);

        var style = { font: "bold 40px Arial", fill: '#dc4a10', boundsAlignH: "center", boundsAlignV: "middle" };
        var textY = this.game.height - 993;
        this.text10 = this.add.text(0, 0, "6", style);
        this.text10.setTextBounds(211, textY, 35, 42);
        this.text1 = this.add.text(0, 0, "0", style);
        this.text1.setTextBounds(256, textY, 35, 42);

        this.textScore100 = this.add.text(0, 0, "0", style);
        this.textScore100.setTextBounds(431,textY,35, 42)
        this.textScore10 = this.add.text(0, 0, "0", style);
        this.textScore10.setTextBounds(475,textY,35, 42)
        this.textScore0 = this.add.text(0, 0, "0", style);
        this.textScore0.setTextBounds(520,textY,35, 42);

        // //规则弹窗
        // var ruleBtn = this.add.button(300, this.game.height - 80, null, function() {
        //     game.popup.custom0();
        // }, this);
        // ruleBtn.width = 145;
        // ruleBtn.height = 60;

        this.add.tileSprite(0, 0, this.game.width, this.game.height, 'texture');

        //重力检测
        this.orientationEvent();

        this.setStage();


    },
    setStage: function() {

        this.score = 0;
        this.tick = 60;
        // if (this.enbaleMusic) {
        //     this.musicBtn.frame = 0;
        //     this.music.play();
        // } else {
        //     this.musicBtn.frame = 1;
        // }

        window.webviewVisible = function(state) {
            // if (state == '0') {
            //   // 退到后台
            //   if(this.enbaleMusic){
            //      this.music.pause();
            //   }
            // } else if (state == '1') {
            //   // 回到前台
            //    if(this.enbaleMusic){
            //      this.music.resume();
            //    }
            // }
        }
        document.addEventListener("visibilitychange", function() {
            // if (document.hidden) {
            //   if(this.enbaleMusic){
            //          this.music.pause();
            //      }
            // }else{
            //  if(this.enbaleMusic){
            //          this.music.resume();
            //      }
            // }
        })
        this.text10.setText('6');
        this.text1.setText('0');
        this.textScore100.setText('0');
        this.textScore10.setText('0');
    },

    createMaps: function() {
        this.mapIndexs = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        this.add.sprite(138, this.game.height - 920, 'map');
       
       
    },

    createBubble: function() {
        //left bubble
        this.leftEmitter = this.add.emitter(230, this.game.height - 374, 5);
        this.leftEmitter.makeParticles('bubble');
        this.leftEmitter.minParticleSpeed.set(-20, 0);
        this.leftEmitter.maxParticleSpeed.set(20, -200);
        this.leftEmitter.setRotation(-50, 50);
        this.leftEmitter.minParticleScale = 0.3;
        this.leftEmitter.maxParticleScale = 0.8;
        this.leftEmitter.gravity = -150;
        // this.leftEmitter.start(false, 1800, 1000, 0);

        //right bubble
        this.rightEmitter = this.add.emitter(525, this.game.height - 374, 5);
        this.rightEmitter.makeParticles('bubble');
        this.rightEmitter.minParticleSpeed.set(-20, 0);
        this.rightEmitter.maxParticleSpeed.set(20, -200);
        this.rightEmitter.setRotation(-50, 50);
        this.rightEmitter.minParticleScale = 0.3;
        this.rightEmitter.maxParticleScale = 0.8;
        this.rightEmitter.gravity = -150;
        // this.rightEmitter.start(false, 1800, 500, 0);
    },
    createQuans: function() {

        var _this = this;
        this.backQuans = this.add.group();
        this.quans = this.add.group();

        for (var i = 0; i < this.count; i++) {
            var rndx = this.rnd.between(200, 600);
            var rndy = this.rnd.between(this.game.height - 480, this.game.height - 390);
            var quan = this.quans.create(rndx, rndy, 'quanfront');
            var backquan = this.backQuans.create(0, 0, 'quanback');
            backquan.anchor.setTo(0.5, 0.5)
            quan.alpha = 0;
            this.physics.p2.enable(quan, debugBody);
            quan.body.setCircle(_this.quanBorder, -_this.quanWidth / 2);
            quan.body.addCircle(_this.quanBorder, _this.quanWidth / 2);
            quan.body.addLine(_this.quanWidth, 0, 0);


        }
    },
    createNeelde: function() {
        var needle1,
            needle2,
            needleWidth = 6;
        needle1 = this.add.sprite(230, this.game.height - 690, 'zhen');

        this.physics.p2.enable(needle1, debugBody);
        needle1.body.static = true;
        needle1.body.setRectangle(needleWidth, needle1.height - 20, 0, -10);
        needle1.body.addRectangle(77, 6, 0, 80);



        needle2 = this.add.sprite(530, this.game.height - 690, 'zhen');
        this.physics.p2.enable(needle2, debugBody);
        needle2.body.static = true;
        needle2.body.setRectangle(needleWidth, needle2.height - 20, 0, -10);
        needle2.body.addRectangle(77, 6, 0, 80);

        //辅助线
        this.line1 = new Phaser.Line(needle1.x, needle1.y - 120, needle1.x, needle1.y);
        this.line2 = new Phaser.Line(needle2.x, needle2.y - 120, needle2.x, needle2.y);
    },
    orientationEvent: function() {
       
       
        window.addEventListener('deviceorientation',(e)=>{

            const maxAngle = 30 

            const gamma = Math.abs(e.gamma) > maxAngle ? maxAngle : e.gamma

            this.water.angle = -gamma

            this.physics.p2.gravity.x = gamma

        },false)


    },
    readyGo: function() {
        var _this = this;
        var countDown = 3;
        var timeEvent;
        var $readyGo = $('#readygo');
        $readyGo.show();

        function anim() {
            countDown--;
            $('.num' + countDown).addClass('run').siblings().removeClass('run');
            if (countDown == 0) {
                _this.game.time.events.remove(timeEvent);
                setTimeout(function() {
                    _this.startGame();
                    $readyGo.hide();
                }, 400);
            }
        }
        setTimeout(function() {
            $('.ready-num.num3').addClass('run');
            timeEvent = _this.game.time.events.loop(1000, anim, this);
        }, 200);

    },
    startGame: function() {
        var _this = this;

        this.timeEvent = this.time.events.loop(1000, countDown, this);

        function countDown() {
            _this.tick--;
            // if (tick == 5) {
            //     //_this.game.sound.play('countDown')
            // }
            _this.text10.setText(Math.floor(_this.tick / 10));
            _this.text1.setText(_this.tick % 10);
            //$("#countDown").html(leadzero(_this.tick));
            if (_this.tick == 0 ) {
                _this.endGame();
            }
        }
        // var leadzero = function(x) {
        //     return (1e15 + "" + x).slice(-2);
        // };
    },
    endGame: function() {

        if (this.score == 0) {
            //0分弹窗
            game.popup.custom1();

        } else {
            window.opts.draw({
                score: this.score
            })
        }
        //倒计时停止
        this.game.time.events.remove(this.timeEvent);
        //
        // this.music.destroy();
        //this.game.cache.removeSound('bgmusic');
    },
    //圈圈的活动区域 (四个边框)
    createArea: function() {

        var gameAreaHeight = 580,
            gameAreaWidth = 750,
            gameAreaBottom = this.add.sprite(gameAreaWidth / 2, this.game.height - 370, null),
            gameAreaLeft = this.add.sprite(97, this.game.height - 940 + gameAreaHeight / 2, null),
            gameAreaRight = this.add.sprite(644, this.game.height - 940 + gameAreaHeight / 2, null),
            gameAreaTop = this.add.sprite(gameAreaWidth / 2, this.game.height - 940, null),
            borderWidth = 10;

        gameAreaBottom.width = gameAreaHeight;
        gameAreaBottom.height = borderWidth;
        gameAreaTop.width = gameAreaHeight;
        gameAreaTop.height = borderWidth;
        gameAreaLeft.width = borderWidth;
        gameAreaLeft.height = gameAreaHeight;
        gameAreaRight.width = borderWidth;
        gameAreaRight.height = gameAreaHeight;

        this.physics.p2.enable([gameAreaBottom, gameAreaLeft, gameAreaRight, gameAreaTop], debugBody);
        gameAreaBottom.body.static = true;
        gameAreaLeft.body.static = true;
        gameAreaTop.body.static = true;
        gameAreaRight.body.static = true;
    },
    leftForce() {
        var _this = this;

        this.leftEmitter.explode(2000, 2);

        // this.quans.forEachAlive(function(item) {
        //     var vy = (_this.game.width - item.x);
        //     //大于屏幕的一半时候将力减得更小
        //     vy = vy < _this.game.width / 2 ? vy / 2 : vy;
            
        //     if (item.x < _this.game.width / 2 + 150) {
        //         item.body.velocity.y = -vy * 0.5;
        //     }
            
        // })
         this.quans.forEachAlive( quan => {
            //屏幕一半
            const halfScreen = this.game.width / 2
            //根据圈的x坐标力度递减
            let vy = this.game.width - quan.x
            //屏幕大于一半速度衰减
            vy = vy < halfScreen ? vy / 2:vy
            //施加力
             if (quan.x < halfScreen + quan.width){
                quan.body.velocity.y = -vy * 0.5
            }
        })
    },
    rightForce() {
        var _this = this;

        this.rightEmitter.explode(2000, 2);

        this.quans.forEachAlive(function(item) {
            var vy = item.x < _this.game.width / 2 ? item.x / 3 : item.x;
            if (item.x > _this.game.width / 2 - 150) {
                item.body.velocity.y = -vy * 0.5;
            }
        })
      


    },
    update() {

        var _this = this;
        var i = 0;
        for (var i = 0; i < this.count; i++) {
            var frontquan = this.quans.getAt(i);
            var backquan = this.backQuans.getAt(i);
            backquan.x = frontquan.x;
            backquan.y = frontquan.y;
            backquan.angle = frontquan.body.angle;

            if (frontquan.alive) {
                //半径
                var r = this.quanWidth / 2 - this.quanBorder; //半径

                //圆点
                var x0 = frontquan.x;
                var y0 = frontquan.y;
                //StartPoint
                var startPoint = {
                    x: x0 - r * Math.cos(frontquan.angle * (Math.PI / 180)),
                    y: y0 - r * Math.sin(frontquan.angle * (Math.PI / 180))
                }
                //EndPoint
                var endPoint = {
                    x: x0 + r * Math.cos(-frontquan.angle * (Math.PI / 180)),
                    y: y0 + r * Math.sin(frontquan.angle * (Math.PI / 180))
                }
                //判断两线是否相交
                const result1 = Phaser.Line.intersectsPoints(_this.line1.start, _this.line1.end, startPoint, endPoint, true);
                const result2 = Phaser.Line.intersectsPoints(_this.line2.start, _this.line2.end, startPoint, endPoint, true);

                if (result1 || result2) {
                    frontquan.alive = false;
                    frontquan.alpha = 1;
                    frontquan.body.mass = 5;
                    this.getScore();
                }
            }
        }
    },
    /*
     * 
     */
    getScore: function() {
        this.score += 10;
        //播放音效
        // if (this.enbaleMusic) {
        //     this.game.sound.play('getScore');
        // };
        //随机点亮地图
        var rnd = this.rnd.between(0, this.mapIndexs.length - 1);
  
        //+10
        var ten = this.add.sprite(336, 469, '+10');
        this.add.tween(ten).to({ y: '-30', alpha: 0 }, 1000, Phaser.Easing.Circular.Out, true);
        //分数
        // var str = this.score < 100 ? '0' + this.score : this.score;
        // $("#score").html(str);

        this.textScore10.setText(this.score/10);

        if(this.score == 100){
            this.textScore100.setText('1');
            this.textScore10.setText('0');
        }

        //结束
        if (this.score == 100 && this.tick > 0) {

            this.endGame();
        }

    },
    musicControl: function() {

        // if (this.enbaleMusic) {
        //     this.enbaleMusic = false;
        //     this.music.pause();
        //     this.musicBtn.frame = 1;
        // } else {
        //     this.enbaleMusic = true;
        //     this.musicBtn.frame = 0;
        //     if (this.music.paused) {
        //         this.music.resume();
        //     } else {
        //         this.music.play();
        //     }
        // }

    },

    //debug
    render() {
        //this.game.debug.text('FPS: ' + this.game.time.fps || '--', 20, 30, '', '25px Arial');
        // this.game.debug.geom(this.line1, 'rgb(0,0,0)');
        // this.game.debug.geom(testline1,'rgb(0,0,0)');
        // this.game.debug.spriteBounds(test);
        //this.game.debug.text(window.innerHeight, 32, 32, '', '30px');
        // if (this.ori) {
        //     this.game.debug.text('isLeft:' + this.ori.isLeft, 32, 32, '', '30px');
        //     this.game.debug.text('isRight:' + this.ori.isRight, 150, 32, '', '30px');
        //     this.game.debug.text('isBackward:' + this.ori.isBackward, 300, 32, '', '30px');
        //     this.game.debug.text('lat:' + Math.round(this.ori.lat * 100) / 100, 32, 64, '', '30px');
        //     this.game.debug.text('lon:' + Math.round(this.ori.lon * 100) / 100, 150, 64, '', '30px');
        //     this.game.debug.text('beta:' + Math.round(this.ori.beta * 100) / 100, 280, 64, '', '30px');
        //     this.game.debug.text('gamma:' + Math.round(this.ori.gamma * 100) / 100, 400, 64, '', '30px');
        //     this.game.debug.text('alpha:' + Math.round(this.ori.alpha * 100) / 100, 600, 64, '', '30px');
        //     this.game.debug.text('leftRotate:' + Math.round(this.ori.leftRotate * 100) / 100, 32, 100, '', '30px');
        //     this.game.debug.text('rightRotate:' + Math.round(this.ori.rightRotate * 100) / 100, 200, 100, '', '30px');
        //     this.game.debug.text('leftSlant:' + Math.round(this.ori.leftSlant * 100) / 100, 32, 130, '', '30px');
        //     this.game.debug.text('rightSlant:' + Math.round(this.ori.rightSlant * 100) / 100, 200, 130, '', '30px');

        // }
    }


}




module.exports = Game;