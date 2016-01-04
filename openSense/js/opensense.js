;
(function(root, factory) {

    if (typeof define === 'function' && define.amd) {
        define(factory);
    } else if (typeof exports === 'object') {
        module.exports = factory();
    } else {
        root.OpenSense = factory();
    }

})(this, function() {

    var OpenSense = {};
    var $container,
        $mask,
        $goAgain,
        Settings = OpenSense.settings = {
            container: 'openSense',
            mask: 'maskSense',
            skip: 'openSkip',
            imgArr: [
                './asset/map/skyland/cloud1.png',
                './asset/map/skyland/cloud2.png',
                './asset/map/skyland/cloud3.png',
                './asset/map/skyland/cloud4.png',
                './asset/map/skyland/cloud7.png',
                './asset/img/ag.png'
            ],
            AudioPath: './audio/logo.mp3',
            imgLent: 6,
            loadingAudio: 1,
            isStart: false,
            isEnd: false,
            isDejavu: false,
            EndingAnimatedName: 'openEnding',
            MaskAnimatedName: 'lighting',
            AudioPlayer: null,
            isVoice: true,
            eventStat:false
        };

    OpenSense.configure = function(options) {
        var key, value;
        for (key in options) {
            value = options[key];
            if (value !== undefined && options.hasOwnProperty(key)) Settings[key] = value;
        }

        return this;
    };

    OpenSense.init = function() {
        $container = Settings.$container = document.getElementById(Settings.container);
        $mask = Settings.$mask = document.getElementById(Settings.mask);
        $skip = Settings.$skip = document.getElementById(Settings.skip);
        if(Settings.goAgain){
            $goAgain = document.getElementById(Settings.goAgain);
            $goAgain.addEventListener("click", function() {
                //动画开始时候播放
                OpenSense.loadAgain();
            }, false);
        }

        $skip.addEventListener('click', function() {
            OpenSense.pass();
        });

        Settings.start = new Date().getTime();

        preloadIMG();
        loadAudio(Settings.AudioPath);
        kickCheck();

        if ((localStorage && localStorage.getItem('isDejavu')) || Settings.isDejavu) {
            $skip.className += ' show';
        }
    }

    OpenSense.pass = function() {
        if (!Settings.isEnd) {
            Settings.isStart = true;
            Settings.isEnd = true;
            OpenSense.paused();
            $container.className = 'open-sense hide';
            // $container.parentNode.removeChild($container);
            if (localStorage) {
                localStorage.setItem('isDejavu', true);
            }
            /*setTimeout(function() { //直接在很短时间内调用可能会无法播出声音，这里先做一下hack，后续改进
                TS.Home.initBGMusic(); // 初始化声音
            }, 0);*/
        }
    }

    OpenSense.paused = function() {
        if (Settings.AudioPlayer) {
            Settings.AudioPlayer.pause();
        }
        $container.className += ' paused';
    }

    OpenSense.loadAgain = function() {
        if(Settings.isStart){
            reset();
            OpenSense.pass();
            $container.className = 'open-sense';
            loadOpenSenseAnimation();
        }
        
    }

    function loadOpenSenseAnimation() {

        Settings.isStart = true;
        Settings.isEnd = false;
        $container.className += ' animated';
        if(Settings.goAgain){
            $goAgain.className = 'game-button2 disabled';
        }

        if(!Settings.eventStat){
            Settings.eventStat = true;
            $mask.addEventListener("webkitAnimationStart", function() {
                //动画开始时候播放
                if (Settings.isVoice && Settings.loadingAudio === 0) {
                    Settings.AudioPlayer.currentTime = 0;
                    Settings.AudioPlayer.play();
                }
            }, false);
        
            $container.addEventListener("webkitAnimationStart", function(animation) {
                //动画结束时事件
                if (animation.animationName === Settings.EndingAnimatedName) {
                    $container.className += ' ending';
                    $container.innerHtml = '';
                }
        
            }, false);
        
            $container.addEventListener("webkitAnimationEnd", function(animation) {
                //动画结束时事件
                if (animation.animationName === Settings.EndingAnimatedName) {
                    OpenSense.pass();
                    if(Settings.goAgain){
                        $goAgain.className = 'game-button2 activity';
                    }
                }
            }, false);
        }
    }

    function reset(){
        Settings.loadingAudio = 0;
    }

    function preloadIMG() {
        for (var i = 0; i < Settings.imgLent; i++) {
            loadIMG(Settings.imgArr[i]);
        }
    }

    function loadIMG(src) {
        var newImg = new Image;
        newImg.onload = function() {
            loadingStore('IMG');
        }
        newImg.src = src;
    }

    function loadAudio(uri) {
        var audio = new Audio();
        audio.addEventListener('canplaythrough', function() {
            loadingStore('AUDIO');
        }, false);
        audio.src = uri;
        audio.volume = getSetting('voiceVolume', 1);

        Settings.isVoice = getSetting('isVoice', true);
        Settings.AudioPlayer = audio;
    }

    function loadingStore(_type) {
        if (_type === 'IMG') {
            Settings.imgLent--;
        } else if (_type === 'AUDIO') {
            Settings.loadingAudio--;
        }

        if (Settings.imgLent === 0 && Settings.loadingAudio === 0 && !Settings.isStart) {
            setTimeout(function() {
                $container.className = 'open-sense';
                console.log(' start by loadend');
                loadOpenSenseAnimation();
            }, 0);
        }
    }

    function kickCheck() {
        if (((new Date().getTime() - Settings.start) / 1000) > 15 && !Settings.isStart) {
            setTimeout(function() {
                $container.className = 'open-sense';
                console.log(' start by kickCheck');
                loadOpenSenseAnimation();
            }, 0);
            return;
        }
        setTimeout(function() {
            if (Settings.imgLent || Settings.loadingAudio) {
                kickCheck();
            }
        }, 50);
    }

    function getSetting(item, defaultVal) {
        var setting = localStorage.getItem('setting');

        try {
            setting = JSON.parse(setting);
            if (setting[item] !== undefined) {
                return setting[item];
            } else {
                return defaultVal;
            }
        } catch (err) {
            return defaultVal;
        }
    }

    return OpenSense;
});