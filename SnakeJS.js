function SnakeJS() {

    const RIGHT = 'right';
    const LEFT = 'left';
    const UP = 'up';
    const DOWN = 'down';
    const PLAY = 'play';
    const PAUSE = 'pause';
    const GAMEOVER = 'gameover';
    const MENU = "menu";
    const MIDDLE = "middle";
    const RANDOM = "random";
    const ERROR = "error";
    const LANDSCAPE = "landscape";
    const PORTRAIT = "portrait";
    const ID = "snake-js";

    this.themes = [
        {
            "background": "rgba(43, 48, 58)",
            "snake": "rgba(146, 220, 229)",
            "apple": "rgba(238, 229, 233)",
        },
        {
            "background": "rgba(73, 81, 111)",
            "snake": "rgba(98, 121, 184)",
            "apple": "rgba(142, 164, 222)",
        },
        {
            "background": "rgba(164, 194, 165)",
            "snake": "rgba(216, 218, 211)",
            "apple": "rgba(241, 242, 235)",
        },
        {
            "background": "rgba(180, 184, 171)",
            "snake": "rgba(21, 50, 67)",
            "apple": "rgba(40, 75, 99)",
        },
        {
            "background": "rgba(255, 234, 236)",
            "snake": "rgba(109, 177, 191)",
            "apple": "rgba(48, 26, 75)",
        },
        {
            "background": "rgba(25, 56, 31)",
            "snake": "rgba(145, 203, 62)",
            "apple": "rgba(238, 232, 44)",
        },
    ];

    this.env = {
        "ctx": null,
        "html": {
            "canvas": {
                "id": ID,
            },
            "bar": null,
            "onlineBar": null,
            "settings": null,
        },
        "celsize": 0, 
        "interval": null,
        "rotate": null,
        "barOnPause": false,
    };

    this.config = {
        "custom": false,
        "online": true,
        "levelling": {
            "startFps": 4,
            "everyScore": 15,
            "incrementFps": 1,
        },
        "levels": [],
    };

    this.settings = {
        "snake": {
            "start": {
                "position": MIDDLE,
                "direction": RIGHT,
                "length": 5,
                "speed": 0,
            },
        },
        "theme": this.themes[0],
        "keys": {
            "up": 56,
            "left": 52,
            "right": 54,
            "down": 53,
            "pause": 13,
            "speed": 32,
        }
    };

    this.game = {
        "status": MENU,
        "gameover": false,
        "bestScore": 0,
        "direction": this.settings.snake.start.direction,
        "keypress": false,
        "speed": false,
        "score": 0,
        "level": {},
        "snake": [],
        "apple": {},
    };

    this.menu = {
        "cursor": 0,
        "snakeCursor": [
            {"x": 0, "y": 0},
            {"x": 0, "y": 0},
            {"x": 0, "y": 0},
            {"x": 0, "y": 0},
            {"x": 0, "y": 0},
        ],
        "cursorMove": false,
        "cursorDirection": LEFT,
        "keypress": false,
        "itemOpen": false,
        "items": [
            {
                "text": "PLAY",
                "onclick":
                    function(init= {}) {
                        refreshHTMLKeys();
                        init.menu.cursor = 0;
                        init.game.status = PLAY;
                        resetFrame(init)
                    },
                
            },
            {
                "text": "SETTINGS",
                "onclick":
                    function (init = {}) {
                        settings(init);
                        init.menu.itemOpen = true;
                    },
            },
        ],
        "gameover": {
            "items": [
                {
                    "text": "REPLAY",
                    "onclick":
                        function(init = {}) {
                            init.game.score = 0;
                            init.game.gameover = false;
                            init.game.status = PLAY;
                            refreshHTMLScore(init.game);
                            resetFrame(init);
                        }
                },
                {
                    "text": "MENU",
                    "onclick":
                        function() {
                            location.reload();
                        }
                }
            ]
        }
    };

    this.initConfig = function() {

        // let levels = [
            // {"score": 0, "fps": 5 },
            // {"score": 10, "fps": 6 },
            // {"score": 20, "fps": 7}
        // ];

        if (this.config.custom == false) {
            let speed = parseInt(this.settings.snake.start.speed);

            for (let i = 0; i < 3; i++) {
                this.config.levels[i] = {
                    "score": i * this.config.levelling.everyScore,
                    "fps": (i * this.config.levelling.incrementFps) + (this.config.levelling.startFps) + speed,
                }
            }
        }

        this.game.level = this.config.levels[0];
        //console.log(this.config.levels)
    }

    this.initMenu = function() {
        if (this.config.online == true) {

            let onlineMenu = {
                "text": "ONLINE",
                "onclick": function(init = {}) { online(init); init.menu.itemOpen = true;},
            }

            this.menu.items.push(onlineMenu);
        }
    }

    function online(init) {

        let title = document.createElement("h1");
        title.innerHTML = "TOP 100"

        let onlineWindow = createHTMLWindow(
            init,
            "online_window",
            init.env.ctx.canvas.width * (60/100),
            init.env.ctx.canvas.height - 40
        )
        document.body.appendChild(onlineWindow);

        onlineWindow.style.textAlign = "center";
        onlineWindow.style.overflowY = "scroll";
        onlineWindow.appendChild(title);

        let cross = document.createElement("h1");
        cross.innerHTML = "<i class='fas fa-times-circle'></i>";
        cross.style.position = "fixed";
        cross.style.left = onlineWindow.offsetLeft + 10 + "px";
        cross.style.top = onlineWindow.offsetTop + "px";
        cross.style.cursor = "pointer";

        cross.addEventListener("click", function(e) {
            onlineWindow.remove();
            init.menu.itemOpen = false;
        })
        onlineWindow.appendChild(cross);

        $.get("online.php?scores=100", function (data) {

            let scores = JSON.parse(data);

            for (score in scores) {
                // console.log(scores[score]);

                let span = document.createElement("span");
                span.style.textAlign = "center";
                span.innerHTML = "<b>" + (parseInt(score) + 1) + "</b> -- " + scores[score].player + " : <br /><b>" + scores[score].score.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "</b><br /><br />";
                onlineWindow.appendChild(span);
            }
        });
    }

    this.initCookies = function() {

        if (!getCookie("theme")) setCookie("theme", "0");
        if (!getCookie("bestScore")) setCookie("bestScore", "0");

        if (!getCookie("snakeStartPosition")) setCookie("snakeStartPosition", this.settings.snake.start.position);
        if (!getCookie("snakeStartDirection")) setCookie("snakeStartDirection", this.settings.snake.start.direction);
        if (!getCookie("snakeStartLength")) setCookie("snakeStartLength", this.settings.snake.start.length);
        if (!getCookie("snakeStartSpeed")) setCookie("snakeStartSpeed", this.settings.snake.start.speed);

        if (!getCookie("keyUp")) setCookie("keyUp", this.settings.keys.up);
        if (!getCookie("keyLeft")) setCookie("keyLeft", this.settings.keys.left);
        if (!getCookie("keyRight")) setCookie("keyRight", this.settings.keys.right);
        if (!getCookie("keyDown")) setCookie("keyDown", this.settings.keys.down);

    }

    this.initSettings = function() {
        this.settings.theme = this.themes[getCookie("theme")];

        this.settings.snake.start.position = getCookie("snakeStartPosition");
        this.settings.snake.start.direction = getCookie("snakeStartDirection");
        this.settings.snake.start.length = getCookie("snakeStartLength");
        this.settings.snake.start.speed = getCookie("snakeStartSpeed");

        this.settings.keys.up = getCookie("keyUp");
        this.settings.keys.left = getCookie("keyLeft");
        this.settings.keys.right = getCookie("keyRight");
        this.settings.keys.down = getCookie("keyDown");

        this.game.direction = this.settings.snake.start.direction;
    }

    function getCookie(key = null) {

        let cookies = document.cookie;
        if (cookies == "") return false;

        cookies = cookies.split(";");
        let cookiesObject = {};

        if (key == null) return cookiesObject;

        for (let cookie in cookies) {

            cookies[cookie] = cookies[cookie].split("=");
            cookiesObject[cookies[cookie][0].trim()] = cookies[cookie][1].trim();
        }

        
        if ("0123456789".includes(cookiesObject[key])) return parseInt(cookiesObject[key]);

        return cookiesObject[key];
    }

    function clearCookie(key = null) {

        let cookies = getCookie();

        if (key == null) {
            
            for (let cookie in cookies) {
                document.cookie = cookie + "=; " + "expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=strict; Secure";
            }
        }

        else if (cookies[key]) {
            document.cookie = key + "=; " + "expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=strict; Secure";
        }
        
    }

    function setCookie(key = null, value = null) {

        if ("0123456789".includes(value)) value = parseInt(value);
        document.cookie = key + "=" + value + "; expires=Fri, 31 Dec 9999 23:59:59 GMT; SameSite=strict; Secure";
    }

    this.init = function() {

        this.initCookies();
        this.initSettings();
        this.initConfig();
        this.initHTMLElements();
        this.initCanvas();
        this.initMenu();
        this.initBar();
        this.initOnlineBar();
//console.log(getCookie())
        this.env.celsize = initCelsize(this.env);
        this.game.snake = initSnake(this.env, this.settings, this.game);
        this.game.apple = initApple(this.env);

        return {
            "themes": this.themes,
            "config": this.config,
            "settings": this.settings,
            "game": this.game,
            "env": this.env,
            "menu": this.menu,
        }
    };

    this.initOnlineBar = function() {
        
        if (this.env.rotate == LANDSCAPE && this.env.html.bar.offsetWidth >= 150) {       

            // Create Online Bar
            let onlineBar = document.createElement("div");
            onlineBar.id = "online_bar";

            onlineBar.style.position = "absolute";
            onlineBar.style.right = "0";
            onlineBar.style.top = this.env.html.bar.style.top;
            onlineBar.style.width = this.env.html.bar.style.width;
            onlineBar.style.height = this.env.html.bar.style.height;
            onlineBar.style.display = "flex";
            onlineBar.style.flexDirection = "column";

            let title = document.createElement("h1");
            title.style.textAlign = "center";
            title.style.color = this.settings.theme.background;
            title.innerHTML = "TOP 10";
            onlineBar.appendChild(title);
            document.body.appendChild(onlineBar);

            let scoresList = document.createElement("div");
            scoresList.id = "scores10_list";
            scoresList.style.textAlign = "center";
            onlineBar.appendChild(scoresList);

            updateOnlineBar(this);
            window.setInterval(updateOnlineBar, 2000, this);
        }
    }

    this.initCanvas = function() {

        // Declare the canvas context in SnakeJS.env
        this.env.ctx = document.getElementById(this.env.html.canvas.id).getContext('2d');

        // Initialize canvas rotation according to the window size (width/height)
        if (window.innerWidth >= window.innerHeight) {
            this.env.ctx.canvas.height = window.innerHeight - (window.innerHeight % 100);
            this.env.ctx.canvas.width = this.env.ctx.canvas.height;
            this.env.rotate = LANDSCAPE;
 
        } else {
            this.env.ctx.canvas.width = window.innerWidth - (window.innerWidth % 100);
            this.env.ctx.canvas.height = this.env.ctx.canvas.width;
            this.env.rotate = PORTRAIT;
        }

        // Initialize CSS styles
        let canvas =  document.getElementById(this.env.html.canvas.id);

        canvas.style.backgroundColor = this.settings.theme.background;
        canvas.style.borderRadius = "6px";
        canvas.style.position = "absolute";
        canvas.style.left = (window.innerWidth / 2) - (this.env.ctx.canvas.width / 2) + "px";
        canvas.style.top = (window.innerHeight / 2) - (this.env.ctx.canvas.height / 2) + "px";

        if (this.env.ctx.canvas.width <= 500 && this.env.ctx.canvas.height <= 500) this.game.status = ERROR;
    }

    this.initHTMLElements = function() {

        // Create font HTML link
        let font = document.createElement('link');
        font.setAttribute('rel', 'stylesheet');
        font.setAttribute('type', 'text/css');
        font.setAttribute('href', 'https://fonts.googleapis.com/css2?family=Oswald&display=swap');

        // Create font-awosome lib HTML link
        let fa = document.createElement('link');
        fa.setAttribute('rel', 'stylesheet');
        fa.setAttribute('href', ' https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css');
        fa.setAttribute('integrity', 'sha512-Fo3rlrZj/k7ujTnHg4CGR2D7kSs0v4LLanw2qksYuRlEzO+tcaEPQogQ0KaoGN26/zrn20ImR1DfuLWnOo7aBA==');
        fa.setAttribute('crossorigin', 'anonymous');
        fa.setAttribute('referrerpolicy', 'no-referrer');

        document.body.style.margin = 0;
        document.body.style.padding = 0;
        document.body.style.boxSizing = "border-box";
        document.body.style.width = "100vw";
        document.body.style.height = "100vh";

        // Create HTML canvas with const ID
        let canvas = document.createElement("canvas");
        canvas.id = ID;

        // Create HTML bar
        let bar = document.createElement("div");
        bar.id = "bar";
        this.env.html.bar = bar;


        
        // Insert elements in DOM
        document.head.appendChild(font);
        document.head.appendChild(fa);
        
        document.body.appendChild(this.env.html.bar);
        document.body.appendChild(canvas);

        

        // Initialize CSS styles
        document.body.style.fontFamily = "'Oswald', sans-serif";
        document.body.style.backgroundColor = this.settings.theme.apple;
        document.body.style.display = "flex";
    }

    this.initBarOnPause = function() {

        this.env.barOnPause = true;
        this.env.html.bar.style.display = "none";

        barWidth = this.env.ctx.canvas.width  * (75/100);
        barHeight = this.env.ctx.canvas.height  * (25/100);

        this.env.html.bar.style.color = this.settings.theme.apple;
        this.env.html.bar.style.fontSize = "40%";
        this.env.html.bar.style.width = barWidth + "px";
        this.env.html.bar.style.height = barHeight + "px";
        this.env.html.bar.style.top = ((window.innerHeight / 2) - (barHeight /2)) + "px";
        this.env.html.bar.style.left = ((window.innerWidth / 2) - (barWidth /2)) + "px";
        this.env.html.bar.style.zIndex = "999";

        let pauseText = document.createElement("h1");
        pauseText.setAttribute("style", "text-align: center;");

        this.env.html.bar.insertBefore(pauseText, document.getElementById("score_container"));
        pauseText.innerHTML = "PAUSE !!<br />"

    }

    this.initBar = function() {

        // let bar = document.getElementById("bar");
        this.env.html.bar.style.position = "absolute";

        // Place the bar according to screen rotation.
        // If too little, bar elements in PAUSE menu while playing (div bar become hidden and appears on pause)
        if (this.env.rotate == LANDSCAPE) {

            if (((window.innerWidth - this.env.ctx.canvas.width)) / 2 < 75){
                this.initBarOnPause();
                return;
            } else {

                this.env.html.bar.style.width = (window.innerWidth - this.env.ctx.canvas.width) / 2 + "px";
                this.env.html.bar.style.height = window.innerHeight - (window.innerHeight - this.env.ctx.canvas.height) + "px";
                this.env.html.bar.style.top = (window.innerHeight - this.env.ctx.canvas.height) / 2 + "px";
                this.env.html.bar.style.flexDirection = "column";
            }
        }

        else if (this.env.rotate == PORTRAIT) {

            if (((window.innerHeight - this.env.ctx.canvas.height) / 2) < 45) {
                this.initBarOnPause();
                return;
            } else {

                document.body.style.flexDirection = "column";
                this.env.html.bar.style.width = window.innerWidth - (window.innerWidth - this.env.ctx.canvas.width) + "px";
                this.env.html.bar.style.height = (window.innerHeight - this.env.ctx.canvas.height) / 2 + "px";
                this.env.html.bar.style.left = (window.innerWidth - this.env.ctx.canvas.width) / 2 + "px";
            }
        }
 
        this.env.html.bar.style.display = "flex";
        this.env.html.bar.style.justifyContent = "center";
        this.env.html.bar.style.alignItems = "center";
        this.env.html.bar.style.color = this.settings.theme.background;
        this.env.html.bar.style.fontSize = "50%";

    }

    function displayScore(init = {}) {

        if (!document.getElementById("score_container")) {

            if (init.game.score > 0) {
                init.game.status = ERROR;
                return;
            }

            let score = document.createElement("div");
            score.id = "score_container";

            score.setAttribute("style", "text-align: center; margin-right: 3%");

            init.env.html.bar.insertBefore(score, document.getElementById("keys_container"));
            score.innerHTML = "<h1>SCORE:</h1><h2 id='score'>0</h2>";
        }   
    }

    function refreshHTMLKeys() {
        document.body.removeChild(document.getElementById("keys_container"));
    }

    function displayKeys(init = {}) {

        if (!document.getElementById("keys_container")) {

            let keys = document.createElement("div");
            
            keys.id = "keys_container";

            if (init.game.status == MENU) {
                keys.style.display = "flex";
                keys.style.justifyContent = "space-between";
                keys.style.position = "absolute";
                keys.style.fontSize = "60%";
                keys.style.color = init.settings.theme.apple;
                keys.style.width = init.env.ctx.canvas.width * (75/100) + "px";
                keys.style.bottom = (window.innerHeight - init.env.ctx.canvas.height) / 2 + "px";
                keys.style.left = ((window.innerWidth - init.env.ctx.canvas.width) / 2) + 20 + "px";

                document.body.appendChild(keys);
            }

            else if (init.game.status == PLAY && init.env.barOnPause == false) {

                if (init.env.rotate == LANDSCAPE) {

                    keys.setAttribute("style", "display: flex; flex-direction: column;");

                } else if (init.env.rotate == PORTRAIT) {
    
                    keys.setAttribute("style", "display: flex; justify-content: space-between;")
                }
                
                init.env.html.bar.appendChild(keys);
            }

            else if (init.game.status == PAUSE && init.env.barOnPause == true) {

                keys.setAttribute("style", "display: flex; justify-content: space-between; z-index: 999")
                init.env.html.bar.appendChild(keys);
            }


            let html = "<h1 style='margin-right: 3%; text-align: center;'>KEYS:</h1>";

            html += "<h2 style='margin-right: 3%; text-align: center;'><i class='fas fa-arrow-up'></i>&nbsp; : &nbsp;" + String.fromCharCode(init.settings.keys.up) + "</h2>";

            html += "<h2 style='margin-right: 3%; text-align: center;'><i class='fas fa-arrow-right'></i>&nbsp; : &nbsp;" + String.fromCharCode(init.settings.keys.right) + "</h2>";
    
            html += "<h2 style='margin-right: 3%; text-align: center;'><i class='fas fa-arrow-down'></i>&nbsp; : &nbsp;" + String.fromCharCode(init.settings.keys.down) + "</h2>";
    
            html += "<h2 style='margin-right: 3%; text-align: center;'><i class='fas fa-arrow-left'></i>&nbsp; : &nbsp;" + String.fromCharCode(init.settings.keys.left) + "</h2>";
    
            html += "<h2 style='margin-right: 3%; text-align: center;'><i class='fas fa-fast-forward'></i>&nbsp; : &nbsp; [SPACEBAR]</h2>";
    
            html += "<h2 style='margin-right: 3%; text-align: center;'><i class='fas fa-pause'></i>&nbsp; : &nbsp; [ENTER]</h2>";

            keys.innerHTML = html;
        }
        
    }

    function createHTMLWindow(init = {}, id, width = 0, height = 0) {

            let w = document.createElement("div");
            w.id = id;

            w.style.position = "absolute";
            w.style.width = width + "px";;
            w.style.height = height + "px";;
            w.style.top = (window.innerHeight / 2) - (height / 2) + "px";
            w.style.left = (window.innerWidth / 2) - (width / 2) + "px";
            w.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
            w.style.color = init.settings.theme.apple;
            w.style.zIndex = "999";
            w.style.padding = "10px";
        
            return w;
    }

    function settings(init = {}) {

        if (!document.getElementById("settings")) {
            
            let settingsWindow = createHTMLWindow(
                init,
                "settings",
                init.env.ctx.canvas.width * (60/100), 
                init.env.ctx.canvas.height * (40/100),
            );

            document.body.appendChild(settingsWindow);

            // Create form tag

            let form = document.createElement("form");
            form.id = "settings_form";
            form.setAttribute("name", "settings_form");
            form.setAttribute("action", "#");
            form.setAttribute("onsubmit", "sets = new SnakeJS; sets.saveSettings(this);");
            form.style.display = "flex";
            form.style.flexWrap = "wrap";
            form.style.justifyContent = "center";
            settingsWindow.appendChild(form)

            // Create Theme choose
            let themeContainer = document.createElement("div");
            themeContainer.style.width = settingsWindow.offsetWidth - 10 + "px";
            themeContainer.style.textAlign = "center";
            form.appendChild(themeContainer);

            let selectThemeLabel = document.createElement("label");
            selectThemeLabel.setAttribute("for", "theme");
            selectThemeLabel.innerHTML = "Choose a theme&nbsp;&nbsp;";
            themeContainer.appendChild(selectThemeLabel);

            let selectTheme = document.createElement("select");
            selectTheme.setAttribute("name", "theme");
            selectTheme.setAttribute("id", "theme");
            selectTheme.setAttribute("required", "required");
            themeContainer.appendChild(selectTheme);

            for (let theme in init.themes) {
        
                let option = document.createElement("option");
                option.setAttribute("value", theme);
                
                if (init.themes[theme] == init.settings.theme) option.setAttribute("selected", "selected");
                option.innerHTML = "Colors n° " + theme;
                selectTheme.appendChild(option);
            }

            // Create snake start direction, position, length and speed choose "At Starting"

            // Position
            let changeStart = document.createElement("div");
            changeStart.style.textAlign = "end";
            changeStart.style.width = (settingsWindow.offsetWidth / 2) - 10 + "px";
            changeStart.innerHTML = "<p>Starting options</p>";
            form.appendChild(changeStart);

            let textPosition = document.createElement("span");
            textPosition.innerHTML = "Position&nbsp;"
            changeStart.appendChild(textPosition);

            let middle = document.createElement("input");
            middle.id = MIDDLE;
            middle.setAttribute("type", "radio");
            middle.setAttribute("name", "snakeStartPosition");
            middle.setAttribute("value", MIDDLE);
            changeStart.appendChild(middle);

            let labelMiddle = document.createElement("label");
            labelMiddle.setAttribute("for", MIDDLE);
            labelMiddle.innerHTML = "Middle";
            changeStart.appendChild(labelMiddle);

            let random = document.createElement("input");
            random.id = RANDOM;
            random.setAttribute("type", "radio");
            random.setAttribute("name", "snakeStartPosition");
            random.setAttribute("value", RANDOM);
            changeStart.appendChild(random);

            let labelRandom = document.createElement("label");
            labelRandom.setAttribute("for", RANDOM);
            labelRandom.innerHTML = "Random<br />";
            changeStart.appendChild(labelRandom);

            if (init.settings.snake.start.position == RANDOM) random.setAttribute("checked", "checked");
            else middle.setAttribute("checked", "checked");

            // Direction
            let textDirection = document.createElement("label");
            textDirection.setAttribute("for", "direction");
            textDirection.innerHTML = "Direction&nbsp;"
            changeStart.appendChild(textDirection);

            let selectDirection = document.createElement("select");
            selectDirection.setAttribute("name", "snakeStartDirection");
            selectDirection.setAttribute("id", "direction");
            selectDirection.setAttribute("required", "required");
            changeStart.appendChild(selectDirection);

            for (let i = 0; i < 5; i++) {

                let direction; 

                if (i == 0) direction = UP;
                else if (i == 1) direction = LEFT;
                else if (i == 2) direction = RIGHT;
                else if (i == 3) direction = DOWN;
                else if (i == 4) direction = RANDOM;


                let option = document.createElement("option");
                option.setAttribute("value", direction);
                
                if (init.settings.snake.start.direction == direction) option.setAttribute("selected", "selected");
                option.innerHTML = direction;
                selectDirection.appendChild(option);
            }


            // Length
            changeStart.appendChild(document.createElement("br"));

            let textLength = document.createElement("label");
            textLength.setAttribute("for", "length")
            textLength.innerHTML = "Length&nbsp;"
            changeStart.appendChild(textLength);

            let length = document.createElement("input");
            length.setAttribute("type", "number");
            length.setAttribute("name", "snakeStartLength");
            length.setAttribute("min", "5");
            length.setAttribute("max", "500");
            length.setAttribute("value", init.settings.snake.start.length);
            length.setAttribute("required", "required");
            length.id = "length";
            changeStart.appendChild(length);

            // Speed
            changeStart.appendChild(document.createElement("br"));

            let textSpeed = document.createElement("label");
            textSpeed.setAttribute("for", "speed")
            textSpeed.innerHTML = "Speed&nbsp;"
            changeStart.appendChild(textSpeed);

            let speed = document.createElement("input");
            speed.setAttribute("type", "number");
            speed.setAttribute("name", "snakeStartSpeed");
            speed.setAttribute("min", "0");
            speed.setAttribute("max", "100");
            speed.setAttribute("value", init.settings.snake.start.speed);
            speed.setAttribute("required", "required");
            speed.id = "speed";
            changeStart.appendChild(speed);

            // Create keys choose "Keys"

            let changeKeys = document.createElement("div");
            changeKeys.style.textAlign = "end";
            changeKeys.style.width = (settingsWindow.offsetWidth / 2) - 10 + "px";
            changeKeys.innerHTML = "<p>Change keys</p>"
            form.appendChild(changeKeys);

            for (i = 0; i < 4; i++) {
                let key;

                if (i == 0) key = "Left";
                else if (i == 1) key = "Up";
                else if (i == 2) key = "Right";
                else if (i == 3) key = "Down";

                lowerKey = key.toLowerCase();

                let text = document.createElement("label");
                text.setAttribute("for", lowerKey)
                text.innerHTML = key + "&nbsp;"
                changeKeys.appendChild(text);

                let input = document.createElement("input");
                input.setAttribute("type", "text");
                input.setAttribute("name", "key" + key);
                input.setAttribute("minlength", "1");
                input.setAttribute("maxlength", "1");
                input.setAttribute("size", "1");
                input.setAttribute("value", String.fromCharCode(init.settings.keys[lowerKey]));
                input.setAttribute("required", "required");
                input.id = lowerKey;
                changeKeys.appendChild(input);

                changeKeys.appendChild(document.createElement("br"));

            }

            // Create buttons

            let divButtons = document.createElement("div");
            divButtons.style.display = "flex";
            divButtons.style.position = "absolute";
            divButtons.style.bottom = "0"
            form.appendChild(divButtons);

            let saveButton = document.createElement("button");
            saveButton.setAttribute("type", "submit");
            saveButton.style.border = "none";
            saveButton.style.padding = "10px";
            saveButton.style.margin = "10px";
            saveButton.style.cursor = "pointer";
            saveButton.style.fontWeight = "bold";
            saveButton.style.backgroundColor =  "#0ffa4a";

            saveButton.innerHTML = "SAVE";
            divButtons.appendChild(saveButton)

            let cancelButton = document.createElement("button");
            cancelButton.style.border = "none";
            cancelButton.style.padding = "10px";
            cancelButton.style.margin = "10px";
            cancelButton.style.cursor = "pointer";
            cancelButton.style.fontWeight = "bold";
            cancelButton.style.backgroundColor =  "#d60a58";

            cancelButton.innerHTML = "CANCEL";
            divButtons.appendChild(cancelButton)

            cancelButton.addEventListener("click", function(){ document.getElementById('settings').remove(); init.menu.itemOpen = false; })
        }
        
    }

    this.saveSettings = function(form) {

        let datas = new FormData(form);

        setCookie("theme", datas.get("theme"))
        setCookie("snakeStartPosition", datas.get("snakeStartPosition"));
        setCookie("snakeStartDirection", datas.get("snakeStartDirection"));
        setCookie("snakeStartLength", datas.get("snakeStartLength"));
        setCookie("snakeStartSpeed", datas.get("snakeStartSpeed"));

        setCookie("keyUp", datas.get("keyUp").charCodeAt(0));
        setCookie("keyLeft", datas.get("keyLeft").charCodeAt(0));
        setCookie("keyRight", datas.get("keyRight").charCodeAt(0));
        setCookie("keyDown", datas.get("keyDown").charCodeAt(0));

    }

    function updateOnlineBar(init = {}){

        $.get("online.php?scores=10", function (datas) {
//console.log(datas)
            datas = JSON.parse(datas);

            document.getElementById("scores10_list").innerHTML = "";

            for (data in datas) {

//console.log(datas[data].score.replace(/\B(?=(\d{3})+(?!\d))/g, ","))
                datas[data].score = datas[data].score.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                
                let score = document.createElement("span");
                score.style.color = init.settings.theme.background;
                score.style.fontSize = "75%";
                score.style.textAlign = "center";

                score.innerHTML = datas[data].player + " : <br /><b>" + datas[data].score + "</b><br />";
                document.getElementById("scores10_list").appendChild(score);
            }
        });
    }
    
    this.display = function() {

        let init = this.init();

        window.addEventListener('keypress', function(e) { keypressEvent(e, init) });
        window.addEventListener('keydown', function(e) { speedUp(e, init)});
        window.addEventListener('keyup', function(e) { speedDown(e, init)});

        init.env.interval = startFrame(init);
    }

    function startFrame(init = {}) {
        return window.setInterval(function() { game(init); }, getFramerate(init));
    }

    function getFramerate(init = {}) {
        switch(init.game.status) {
            case PLAY:
                return 1000 / init.game.level.fps;

            case MENU: case GAMEOVER: case PAUSE:
//console.log(init.game.level)
                return 1000/60;
        }
    }

    function setRandomPosition(env = {}) {
        return setPosition(
            Math.floor((Math.random() * (env.ctx.canvas.width - env.celsize))),
            Math.floor((Math.random() * (env.ctx.canvas.height - env.celsize))),
            env.celsize
        );
    };

    function setPosition(posX, posY, celsize) {
        return {
            "x": gridPosition(posX, celsize),
            "y": gridPosition(posY, celsize),
        };
    };

    function gridPosition(position, celsize) {
        return position - (position % celsize);
    };

    function refreshHTMLScore(game = {}, id = "score") {

        let html = document.getElementById(id);
        let score = String(game.score * 100);

        html.innerHTML = score.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    }

    function initCelsize(env = {}) {
        return env.ctx.canvas.width / 100;
    }

    function initSnake(env = {}, settings = {}, game = {}) {

        let snake = [];
        let cel = {};
        let randomDir = Math.floor(Math.random() * 4);

        const DIRECTIONS = [
            function(i, cel) {
                return setPosition(cel.x - (i * env.celsize), cel.y, env.celsize);
            },
            function(i, cel) {
                return setPosition(cel.x + (i * env.celsize), cel.y, env.celsize);
            },
            function(i, cel) {
                return setPosition(cel.x, cel.y + (i * env.celsize), env.celsize);
            },
            function(i, cel) {
                return setPosition(cel.x, cel.y - (i * env.celsize), env.celsize);
            },
        ];

        switch (settings.snake.start.position) {

            case MIDDLE:
                cel =   setPosition((env.ctx.canvas.width / 2), (env.ctx.canvas.height / 2), env.celsize);
                break;

            case RANDOM:
                cel = setRandomPosition(env);
                break;

            default:
                cel = setRandomPosition(env);
        }


        for (let i = 0; i < settings.snake.start.length; i++) {

            switch (settings.snake.start.direction) {

                case RIGHT:
                    snake[i] = DIRECTIONS[0](i, cel);
                    break;
                    
                case LEFT:
                    snake[i] = DIRECTIONS[1](i, cel);

                    break;
    
                case DOWN:
                    snake[i] = DIRECTIONS[3](i, cel);

                    break;
    
                case UP:
                    snake[i] = DIRECTIONS[2](i, cel);
                    break;

                case RANDOM:
                    snake[i] = DIRECTIONS[randomDir](i, cel);
                    if (randomDir == 0) dir = RIGHT;
                    else if (randomDir == 1) dir = LEFT;
                    else if (randomDir == 2) dir = UP;
                    else if (randomDir == 3) dir = DOWN;
                    game.direction = dir;
                    break;
            }
        }
    
        return snake;
    }

    function initApple(env = {}) {
        return setRandomPosition(env);
    }

    function screenBlank(init) {
        init.env.ctx.clearRect(0, 0, init.env.ctx.canvas.width, init.env.ctx.canvas.height);
    }

    function game(init) {
        
        screenBlank(init);
        displayKeys(init);

        switch(init.game.status) {

            case PLAY:
                play(init);
                break;

            case PAUSE:
                pause(init);
                break;

            case MENU:
                menu(init);
                break;

            case ERROR:
                document.body.innerHTML = "Oops... une erreur est survenue :(";
                clearInterval(init.env.interval);
                break;

            case GAMEOVER:
                gameover(init);
                break;
        }
    }

    function gameover(init = {}) {

        if (document.getElementById("speed_up_info")) document.getElementById("speed_up_info").remove();
        if (document.getElementById("go_fast")) document.getElementById("go_fast").remove();

        init.env.ctx.textAlign = "center";
        init.env.ctx.fillStyle = init.settings.theme.apple;

        // Display game over text
        init.env.ctx.font = init.env.ctx.canvas.width * (10/100) + "px Oswald";
        init.env.ctx.fillText(
            "GAME OVER",
            (init.env.ctx.canvas.width / 2),
            init.env.ctx.canvas.width * (15/100)
        );


        // Display game score
        init.env.ctx.font = init.env.ctx.canvas.width * (7/100) + "px Oswald";
        init.env.ctx.fillText(
            String(init.game.score * 100).replace(/\B(?=(\d{3})+(?!\d))/g, ","),
            (init.env.ctx.canvas.width / 2),
            init.env.ctx.canvas.width * (25/100)
        );

        displayCommentary(init, init.game.score * 100, 30);
        displayMenu(init, GAMEOVER);

        if (!init.game.gameover) {

            init.game.gameover = true;

            let best = getCookie("bestScore");

            if (init.game.score * 100 > best) {
    
                setCookie("bestScore", init.game.score * 100);
    
                if (init.config.online == true) {
                    init.menu.itemOpen = true;
                    recordOnline(init);
                }
            }
    
            init.game.direction = init.settings.snake.start.direction;
            init.game.keypress = false;
            init.game.speed = false;
            init.game.level = init.config.levels[0];
            init.game.snake = initSnake(init.env, init.settings, init.game);
            init.game.apple = initApple(init.env);
        }

    }

    function generateToken() {
        let timestamp = new Date().valueOf();
        
        let rand = () => { return (timestamp * (Math.random() * 100) * (Math.random() * 100)) };
        let first = (rand() + rand()).toString(36);
        let second = (rand() + rand()).toString(36);
        let token = first + second;

        return token;
    }

    function recordOnline(init = {}) {

        let recordWindow = createHTMLWindow(
            init,
            "record_window",
            init.env.ctx.canvas.width / 2,
            init.env.ctx.canvas.height / 4,
        );

        recordWindow.textAlign = "center";
        recordWindow.display = "flex";
        recordWindow.justifyContent = "center";
        recordWindow.alignItems = "center";

        document.body.appendChild(recordWindow);

        let text = document.createElement("p");
        text.style.textAlign = "center";
        text.style.fontStyle = "italic";
        text.innerHTML = "<b>You beat your best score !<br />You can save it online right now. Not later.</b>";

        recordWindow.appendChild(text);

        let form = document.createElement("form");
        form.style.textAlign = "center";
        recordWindow.appendChild(form);

        let playerText = document.createElement("label");
        playerText.setAttribute("for", "player_name");
        playerText.innerHTML = "Your name : ";
        form.appendChild(playerText);

        let player = document.createElement("input");
        player.id = "player_name";
        player.setAttribute("type", "text");
        player.setAttribute("name", "player");
        player.setAttribute("minlength", "3");
        player.setAttribute("maxlength", "16");
        player.setAttribute("required", "required");
        player.setAttribute("pattern", "^[a-zA-Z]{3,16}$");

        form.appendChild(player);

        // Create buttons

        let divButtons = document.createElement("div");
        divButtons.style.display = "flex";
        divButtons.style.position = "absolute";
        divButtons.style.bottom = "0"
        form.appendChild(divButtons);
        divButtons.style.left = "25%";


        let saveButton = document.createElement("button");
        saveButton.setAttribute("type", "submit");
        saveButton.style.border = "none";
        saveButton.style.padding = "10px";
        saveButton.style.margin = "10px";
        saveButton.style.cursor = "pointer";
        saveButton.style.fontWeight = "bold";
        saveButton.style.backgroundColor =  "#0ffa4a";

        saveButton.innerHTML = "SAVE";
        divButtons.appendChild(saveButton)

        let cancelButton = document.createElement("button");
        cancelButton.style.border = "none";
        cancelButton.style.padding = "10px";
        cancelButton.style.margin = "10px";
        cancelButton.style.cursor = "pointer";
        cancelButton.style.fontWeight = "bold";
        cancelButton.style.backgroundColor =  "#d60a58";

        cancelButton.innerHTML = "CANCEL";
        divButtons.appendChild(cancelButton)

        cancelButton.addEventListener("click", function(){ document.getElementById('record_window').remove(); init.menu.itemOpen = false;})

        saveButton.addEventListener("click", function(e) {
            e.preventDefault();

            if (getCookie("token")) clearCookie("token");

            let token = generateToken();
            setCookie("token", token);

            let score = parseInt(init.game.score);
            let player = document.getElementById("player_name").value;

            $.post("online.php", {score: score, token: token, player: player})
            .done(function(data) {

                if (data == "success") {
                    clearCookie("token");
                    recordWindow.innerHTML = "<p>Your score is now online !</p>"
                    window.setTimeout(function() { document.getElementById('record_window').remove(); }, 2000);
                    init.menu.itemOpen = false;
                } else if (data == "invalidName") {
                    document.getElementById("player_name").style.border = "2px solid red";
                }
                
            });

// console.log(score);
// console.log(token);
// console.log(player);
        });
    }

    function displayCommentary(init = {}, score = 0, yPercent = 0) {

        // Display a little commentary according the score
        init.env.ctx.font = "italic " + init.env.ctx.canvas.width * (3/100) + "px Oswald";
        let commentary;

        if (score >= 1000000) commentary = "Mmm, the dev should fix this issue...";
        if (score < 1000000) commentary = "Fuckin' god you are ! How is it possible ??";
        if (score < 500000) commentary = "More than 200 000 ? How the fuck ?"; 
        if (score < 200000) commentary = "You'll become millionary tomorrow, for real.";
        if (score < 100000) commentary = "Oh, perhaps you should finally pass...";
        if (score < 50000) commentary = "Hey you're awesome my boy. I love you <3";
        if (score < 37000) commentary = "Such a snake master !";
        if (score < 25000) commentary = "You're not too bad. But you can do better.";
        if (score < 20000) commentary = "You love snake. And snake loves you too.";
        if (score < 15000) commentary = "Mhm, you're on the right way. 'right ?";
        if (score < 10000) commentary = "Just once again, come on.";
        if (score < 5000) commentary = "Okay let's start...";
        if (score < 1000) commentary = "Come back later, noob !!";

        init.env.ctx.fillText(
            commentary,
            (init.env.ctx.canvas.width / 2),
            init.env.ctx.canvas.width * (yPercent/100)
        );
    }

    function displayMenu(init = {}, menu = null) {

        init.game.keypress = false;
        init.menu.keypress = true;

        let canvasWidth = init.env.ctx.canvas.width;
        let size =  canvasWidth * (6/100);
        let items;

        if (menu == null) {
            items = init.menu.items;
        } else {
            items = init.menu[menu].items;
        }

        // Display menu items
        for (let item in items) {

            let y = (canvasWidth / 2) - size*2 + (item*size*2);

            init.env.ctx.font = size + "px Oswald";
            init.env.ctx.textAlign = "center";

            if (init.menu.cursor == item) {

                displayCursor(init, init.env.ctx.measureText(items[item].text), y);
                init.env.ctx.fillStyle = init.settings.theme.apple;
                init.env.ctx.fillText(
                    items[item].text,
                    (canvasWidth / 2),
                    y
                );
            } else {
                init.env.ctx.strokeStyle = init.settings.theme.apple;
                init.env.ctx.strokeText(
                    items[item].text,
                    (canvasWidth / 2),
                    y
                );
            }

        }

    }

    function menu(init = {}) {

        let best = String(getCookie("bestScore"));

        // Diplay best score
        init.env.ctx.font = init.env.ctx.canvas.width * (3/100) + "px Oswald";
        init.env.ctx.textAlign = "center";
        init.env.ctx.fillStyle = init.settings.theme.apple;
        init.env.ctx.fillText(
            "Your best score: " + best.replace(/\B(?=(\d{3})+(?!\d))/g, ","),
            (init.env.ctx.canvas.width / 2),
            init.env.ctx.canvas.width * (15/100)
        );

        displayCommentary(init, best, 20);
        displayMenu(init);
    }

    function displayCursor(init = {}, canvasMeasure = null, y = 0) {

        let width = gridPosition(canvasMeasure.width, init.env.celsize);
        let left = gridPosition((init.env.ctx.canvas.width / 2) - canvasMeasure.actualBoundingBoxLeft, init.env.celsize);
        let start = gridPosition(init.env.ctx.canvas.width / 2, init.env.celsize);

        
        if (!init.menu.cursorMove) {
            init.menu.cursorMove = true;
            for (let cel in init.menu.snakeCursor) {

                init.menu.snakeCursor[cel].y = y + 10;
                init.menu.snakeCursor[cel].x = start + (cel * init.env.celsize);
            }
        }
        
        if (init.menu.snakeCursor[0].x == left) init.menu.cursorDirection = RIGHT;
        else if (init.menu.snakeCursor[0].x == left + width) init.menu.cursorDirection = LEFT;
      

        for (let j = init.menu.snakeCursor.length - 1; j >= 1; j--) {
            init.menu.snakeCursor[j].x = init.menu.snakeCursor[j - 1].x;
            init.menu.snakeCursor[j].y = init.menu.snakeCursor[j - 1].y;
        }

        if (init.menu.cursorDirection == RIGHT) init.menu.snakeCursor[0].x += init.env.celsize;
        else if (init.menu.cursorDirection == LEFT) init.menu.snakeCursor[0].x -= init.env.celsize;

        for (let cel in init.menu.snakeCursor) {

            if (cel == 0) {
                init.env.ctx.fillStyle = init.settings.theme.apple;
            } else {
                init.env.ctx.fillStyle = init.settings.theme.snake;
            }

            drawCel(init.env.ctx, init.menu.snakeCursor[cel].x + 1, init.menu.snakeCursor[cel].y + 1, init.env.celsize - 1, init.env.celsize - 1, 3);
        }

    }

    function pause(init = {}) {

        if (init.env.html.bar.style.display == "none" && init.env.barOnPause == true) init.env.html.bar.style.display = "block";

        else {

            if (!document.getElementById("normal_pause") && init.env.barOnPause == false) {

                let pauseText = document.createElement("h1");
                pauseText.id = "normal_pause";
                document.body.appendChild(pauseText);
    
                pauseText.style.color = init.settings.theme.apple;
                pauseText.style.position = "absolute";
                pauseText.style.zIndex = "999";
    
                pauseText.innerHTML = "PAUSE !!";

                pauseText.style.top = (window.innerHeight / 2) - (pauseText.offsetHeight / 2) + "px";
                pauseText.style.left = (window.innerWidth / 2) - (pauseText.offsetWidth / 2) + "px";
            }
        }
    }

    function play(game = {}) {

        game.menu.keypress = false;
        game.game.keypress = true;

        if (game.env.html.bar.style.display == "block" && game.env.barOnPause == true) game.env.html.bar.style.display = "none";

        displayScore(game);
   
        moveTail(game);
        moveHead(game);
    
        playControllers(game);

        displayApple(game);
        displaySnake(game);
    }

    function speedDown(e, game = {}) {

        if (e.keyCode == game.settings.keys.speed && game.game.status == PLAY && game.game.speed == true) {
            game.game.speed = false;

            if (document.getElementById("go_fast")) document.getElementById("go_fast").remove();

            //game.game.level.fps = game.config.levels[getLevelByGameScore(game, true)];
            game.game.level.fps = parseInt(game.game.level.fps) -5;

            resetFrame(game);
// console.log(game.game.level);

        }

    }

    function speedUp(e, game = {}) {

        if (e.keyCode == game.settings.keys.speed && !game.game.speed && game.game.status == PLAY) {
            game.game.speed = true;

            displaySpeedUp(game);
            game.game.level.fps = parseInt(game.game.level.fps) + 5;
            // game.game.speed = true;
            // game.game.level = game.config.levels[getLevelByGameScore(game, true) + 2];
            resetFrame(game);
// console.log(game.game.level);

        }

    }

    function displaySpeedUp(init = {}) {
        if (!document.getElementById("go_fast")) {
            let icon = document.createElement("h1");
            icon.id = "go_fast";
            icon.style.color = init.settings.theme.apple;
            icon.style.margin = "auto";
            icon.style.opacity = "0.4";
            icon.style.zIndex = "999";
            icon.innerHTML = "<i class='fas fa-fast-forward'></i>";
            document.body.appendChild(icon);
        }
    }

    function resetFrame(game = {}) {
        clearInterval(game.env.interval);
        game.env.interval = startFrame(game);
    }

    function keyPressMenu(e, init, menu = null) {

        let items;

        if (menu == null) items = init.menu.items;
        else items = init.menu[menu].items;

        if (e.keyCode == init.settings.keys.up && init.menu.cursor > 0) {
            init.menu.cursorMove = false;
            init.menu.cursor--;
        }
            
        else if (e.keyCode == init.settings.keys.down && init.menu.cursor < items.length - 1) {
            init.menu.cursorMove = false;
            init.menu.cursor++;
        }

        else if (e.keyCode == init.settings.keys.speed) {
            
            items[init.menu.cursor].onclick(init);
        }

    }

    function keypressEvent(e, init) {

        if (init.game.status === PLAY && e.keyCode == init.settings.keys.pause) {
            init.game.status = PAUSE;
            resetFrame(init);
        }
        else if (init.game.status === PAUSE && e.keyCode == init.settings.keys.pause) {

            if (document.getElementById("normal_pause")) document.body.removeChild(document.getElementById("normal_pause"));

            init.game.status = PLAY;
            resetFrame(init);
            return;
        }

        if (init.menu.keypress && init.menu.itemOpen == false) {

            if (init.game.status == MENU) keyPressMenu(e, init);
            else if (init.game.status == GAMEOVER) keyPressMenu(e, init, GAMEOVER);

            return;
        }

        if (init.game.keypress && init.game.status == PLAY) {
            if (e.keyCode == init.settings.keys.up && init.game.direction != DOWN) init.game.direction = UP;
        
            else if (e.keyCode == init.settings.keys.left && init.game.direction != RIGHT) init.game.direction = LEFT;
        
            else if (e.keyCode == init.settings.keys.down && init.game.direction != UP) init.game.direction = DOWN;
        
            else if (e.keyCode == init.settings.keys.right && init.game.direction != LEFT) init.game.direction = RIGHT;

            init.game.keypress = false;
        }


    }

    function displayApple(init) {

        init.env.ctx.fillStyle = init.settings.theme.apple;
        drawCel(init.env.ctx, init.game.apple.x + 1, init.game.apple.y + 1, init.env.celsize - 1, init.env.celsize - 1, 2);
    }
    
    function displaySnake(init) {
    
        for (let cel in init.game.snake) {

            if (cel == 0) {
                init.env.ctx.fillStyle = init.settings.theme.apple;
            } else {
                init.env.ctx.fillStyle = init.settings.theme.snake;
            }
            drawCel(init.env.ctx, init.game.snake[cel].x + 1, init.game.snake[cel].y + 1, init.env.celsize - 1, init.env.celsize - 1, 2);
        }
    }
    
    function moveHead(init) {
    
        switch (init.game.direction) {
            case RIGHT:
                init.game.snake[0].x += init.env.celsize;
                break;
            
            case UP:
                init.game.snake[0].y -= init.env.celsize;
                break;
    
            case DOWN:
                init.game.snake[0].y += init.env.celsize;
                break;
    
            case LEFT:
                init.game.snake[0].x -= init.env.celsize;
                break;
        }
    }
    
    function moveTail(init) {
    
        for (let cel = init.game.snake.length - 1; cel >= 1; cel--) {
            init.game.snake[cel].x = init.game.snake[cel - 1].x;
            init.game.snake[cel].y = init.game.snake[cel - 1].y;
        }
    }

    function playControllers(game = {}) {
        gameOverControl(game);
        eatAppleControl(game);
        outScreenControl(game);
    }

    function gameOverControl(game = {}) {
        for (let cel = 1; cel < game.game.snake.length - 1; cel++) {

            if (game.game.snake[0].x === game.game.snake[cel].x
                && game.game.snake[0].y === game.game.snake[cel].y)
            {
                game.game.status = GAMEOVER;
                resetFrame(game);
                return;
            }
        }
    }

    function eatAppleControl(game = {}) {
        if (game.game.snake[0].x === game.game.apple.x
            && game.game.snake[0].y === game.game.apple.y)
        {
            eatApple(game);

        }
    }

    function drawCel(ctx, x, y, largeur, hauteur, rayon) {
        ctx.beginPath();
        ctx.moveTo(x, y + rayon);
        ctx.lineTo(x, y + hauteur - rayon);
        ctx.quadraticCurveTo(x, y + hauteur, x + rayon, y + hauteur);
        ctx.lineTo(x + largeur - rayon, y + hauteur);
        ctx.quadraticCurveTo(x + largeur, y + hauteur, x + largeur, y + hauteur - rayon);
        ctx.lineTo(x + largeur, y + rayon);
        ctx.quadraticCurveTo(x + largeur, y, x + largeur - rayon, y);
        ctx.lineTo(x + rayon,y);
        ctx.quadraticCurveTo(x, y, x, y + rayon);
        ctx.fill();
    }

    function eatApple(game = {}) {

        game.game.snake.push(setPosition(
            game.game.snake[game.game.snake.length - 1].x,
            game.game.snake[game.game.snake.length - 1].y,
            game.env.celsize
        ));

        game.game.score++;
        game.game.apple = setRandomPosition(game.env);
        
        checkLevel(game);
        refreshHTMLScore(game.game);
        // game.game.level = getLevelByGameScore(game);

        // if (game.game.speed == true && game.game.level.score == game.game.score) {
        //     game.game.speed = false;
        //     game.game.level.fps = parseInt(game.game.level.fps) - 5;
        // }

        // addLevel(game);
// console.log(game.game.level);     
// console.log(game.config.levels)
    }

    function checkLevel(init = {}) {
        
        let isSpeeding = false;

        if (init.game.level.score != getLevelByGameScore(init).score) { // Then level change... (based on score because fps can change with speed up)

            // If player speed up pressing spacebar...
            if (init.game.speed == true) {
                isSpeeding = true; //flag
                init.game.speed = false; // Disable speed keyup event (see speedDown())
                init.game.level.fps = parseInt(init.game.level.fps) - 5; // Remove speed
            }

            init.game.level = getLevelByGameScore(init);
            generateLevel(init);

            if (isSpeeding == true) {
                init.game.speed = true;
                init.game.level.fps = parseInt(init.game.level.fps) + 5;
            }

            displayLevelUp(init);
            resetFrame(init);
        }
    }

    function generateLevel(game = {}) {

        //if (game.game.score == game.game.level.score) {

            game.config.levels.push(
                {
                    "score": game.game.level.score + 2 * (game.config.levelling.everyScore),
                    "fps": game.game.level.fps + (2 * game.config.levelling.incrementFps),
                }
            );

           // displayLevelUp(game);
        //}
    }

    function displayLevelUp(init = {}) {

        if (!document.getElementById("speed_up_info")) {

            if (document.getElementById("go_fast")) {
                document.getElementById("go_fast").remove();
            }

            let info = document.createElement("h1");
            info.id = "speed_up_info"
            info.style.color = init.settings.theme.apple;
            info.style.opacity = "0.6";
            info.style.fontStyle = "italic";
            info.style.zIndex = "999";
            info.style.margin = "auto";
            info.innerHTML = "Let's speed up !";

            document.body.appendChild(info);

            window.setTimeout(function() {
                document.getElementById("speed_up_info").remove();

                if (init.game.speed == true) {
                    displaySpeedUp(init);
                }
            }, 1000)
        }
    }

    function getLevelByGameScore(game = {}, getId = false) {
        let found = false;
        let score = game.game.score;

        while (!found) {

            for (let level in game.config.levels) {

                if (game.config.levels[level].score == score) {
                    found = true;

                    if (getId) return parseInt(level);
                    return game.config.levels[level];
                }
            }
            score--;
        }
    }

    function outScreenControl(game = {}) {

        if (game.game.snake[0].x >= game.env.ctx.canvas.width) game.game.snake[0].x = 0;

        else if (game.game.snake[0].x < 0) game.game.snake[0].x = game.env.ctx.canvas.width;

        else if (game.game.snake[0].y >= game.env.ctx.canvas.height) game.game.snake[0].y = 0;

        else if (game.game.snake[0].y < 0) game.game.snake[0].y = game.env.ctx.canvas.height;
    }
}