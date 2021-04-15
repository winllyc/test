(function () {
    'use strict';

    class Bridge extends Laya.EventDispatcher {
    }
    Bridge.main_color = "#54B537";
    Bridge.arr_q_data = new Array();
    Bridge.curr_q_num = 0;
    Bridge.total_q_num = 0;

    var Text = Laya.Text;
    class CountDownBlock extends Laya.Sprite {
        constructor() {
            super();
            this.block_width = 90;
            this.block_height = 30;
        }
        onEnable() {
            this.size(this.block_width, this.block_height);
            this.graphics.drawRect(0, 0, this.block_width, this.block_height, Bridge.main_color);
            this.pivot(0, this.height / 2);
            this.txt_countdown = new Text();
            this.txt_countdown.align = "center";
            this.txt_countdown.fontSize = 25;
            this.txt_countdown.color = "#ffffff";
            this.txt_countdown.text = "00:00";
            this.addChild(this.txt_countdown);
            this.txt_countdown.pivot(this.txt_countdown.width / 2, this.txt_countdown.height / 2);
            this.txt_countdown.pos(this.block_width / 2, this.block_height / 2);
        }
        setTxt(txt) {
            this.txt_countdown.text = txt;
        }
    }

    class QuestionVideo extends Laya.Sprite {
        constructor(video_path, co_sp) {
            super();
            this.video_path = video_path;
            this.coordinate_space = co_sp;
            this.creatVideo();
        }
        creatVideo() {
            let divElement = Laya.Browser.createElement("div");
            divElement.className = "div";
            Laya.Browser.document.body.appendChild(divElement);
            Laya.Utils.fitDOMElementInArea(divElement, this.coordinate_space, 0, 0, this.coordinate_space.width, this.coordinate_space.height);
            this.divElement = divElement;
            let videoElement = Laya.Browser.createElement("video");
            videoElement.setAttribute("id", "questionvideo");
            this.videoElement = videoElement;
            videoElement.controls = true;
            videoElement.autoPlay = true;
            videoElement.setAttribute('preload', 'auto');
            videoElement.setAttribute('width', '100%');
            videoElement.setAttribute('height', '100%');
            videoElement.type = "vedio/mp4";
            videoElement.src = this.video_path;
            videoElement.play();
            this.divElement.appendChild(videoElement);
            if (videoElement.requestFullscreen) {
                videoElement.requestFullscreen();
            }
            else if (videoElement.mozRequestFullScreen) {
                videoElement.mozRequestFullScreen();
            }
            else if (videoElement.webkitRequestFullScreen) {
                videoElement.webkitRequestFullScreen();
            }
            this.videoEvent();
        }
        videoEvent() {
            this.videoElement.addEventListener("loadstart", () => {
                console.log("loadstart");
            });
            this.videoElement.addEventListener("progress", () => {
                console.log("progress");
            });
            this.videoElement.addEventListener("play", () => {
                console.log("play");
            });
            this.videoElement.addEventListener("pause", () => {
                console.log("pause");
            });
            this.videoElement.addEventListener("seeking", () => {
                console.log("seeking");
            });
            this.videoElement.addEventListener("seeked", () => {
                console.log("seeked");
            });
            this.videoElement.addEventListener("waiting", () => {
                console.log("waiting");
            });
            this.videoElement.addEventListener("timeupdate", () => {
                console.log("timeupdate");
            });
            this.videoElement.addEventListener("ended", () => {
                console.log("ended");
                this.videoElement.pause();
                this.event("VIDEO_ELEMENT_ENDED");
            });
            this.videoElement.addEventListener("error", () => {
                console.log("error");
            });
        }
        removeVideo() {
            this.videoElement.pause();
            Laya.Browser.document.body.removeChild(this.divElement);
        }
    }

    var Sprite = Laya.Sprite;
    var Event = Laya.Event;
    var Button = Laya.Button;
    var SoundManager = Laya.SoundManager;
    var Handler = Laya.Handler;
    class ReadingPanel extends Laya.Sprite {
        constructor(_w, _h, m_t) {
            super();
            this.radian_to_point_dis = 10;
            this.rect_radius = 10;
            this.btn_skin_path = "q_comp/button.png";
            this.musicTime = 0;
            this.media_name = m_t;
            this.size(_w, _h);
            this.block_width = _w - 20;
            this.block_height = _h - 20;
            this.rect_path = [
                ["moveTo", this.radian_to_point_dis, 0],
                ["lineTo", this.block_width - this.radian_to_point_dis, 0],
                ["arcTo", this.block_width, 0, this.block_width, this.radian_to_point_dis, this.rect_radius],
                ["lineTo", this.block_width, this.block_height - this.radian_to_point_dis],
                ["arcTo", this.block_width, this.block_height, this.block_width - this.radian_to_point_dis, this.block_height, this.rect_radius],
                ["lineTo", this.radian_to_point_dis, this.block_height],
                ["arcTo", 0, this.block_height, 0, this.block_height - this.radian_to_point_dis, this.rect_radius],
                ["lineTo", 0, this.radian_to_point_dis],
                ["arcTo", 0, 0, this.radian_to_point_dis, 0, this.rect_radius],
            ];
            this.graphics.drawRect(0, 0, this.width, this.height, "#00000088");
            this.graphics.drawPath(10, 10, this.rect_path, { fillStyle: "#ffffff" }, { "strokeStyle": "#000000", "lineWidth": "1" });
            this.media_type = this.media_name.substr(this.media_name.lastIndexOf("."), this.media_name.length);
            switch (this.media_type) {
                case ".mp3":
                    this.sp_play_btn = new Sprite();
                    this.sp_play_btn["flag"] = false;
                    this.sp_play_btn["texture_play"] = "q_comp/play_btn/play_btn.png";
                    this.sp_play_btn["texture_stop"] = "q_comp/play_btn/stop_btn.png";
                    var sp_play_btn_texture = Laya.loader.getRes(this.sp_play_btn["texture_play"]);
                    this.sp_play_btn.size(sp_play_btn_texture.width, sp_play_btn_texture.height);
                    this.sp_play_btn.graphics.drawTexture(sp_play_btn_texture);
                    this.sp_play_btn.pos((this.width - this.sp_play_btn.width) / 2, (this.height - this.sp_play_btn.height) / 2);
                    this.sp_play_btn.on(Event.CLICK, this, this.playMp3Handler);
                    this.addChild(this.sp_play_btn);
                    this.btn_back = new Button(this.btn_skin_path);
                    this.btn_back.labelSize = 20;
                    this.btn_back.label = "返回";
                    this.btn_back.pivotX = this.btn_back.width / 2;
                    this.btn_back.pos(this.width / 2, this.height - this.btn_back.height * 3);
                    this.btn_back.labelColors = "#FFFFFF";
                    this.addChild(this.btn_back);
                    this.btn_back.on(Event.CLICK, this, this.btnBackClickHandler);
                    this.sound_channel = new Laya.SoundChannel();
                    break;
                case ".mp4":
                    this.sp_play_btn = new Sprite();
                    var sp_play_btn_texture = Laya.loader.getRes("q_comp/play_btn/video_play_btn.png");
                    this.sp_play_btn.size(sp_play_btn_texture.width, sp_play_btn_texture.height);
                    this.sp_play_btn.graphics.drawTexture(sp_play_btn_texture);
                    this.sp_play_btn.pos((this.width - this.sp_play_btn.width) / 2, (this.height - this.sp_play_btn.height) / 2);
                    this.sp_play_btn.on(Event.CLICK, this, this.playMp4Handler);
                    this.addChild(this.sp_play_btn);
                    break;
                case ".png":
                    break;
            }
        }
        playMp4Handler(e) {
            var reading_video_path = "q_comp/questions/" + (Bridge.curr_q_num + 1) + "/" + this.media_name;
            var q_video = new QuestionVideo(reading_video_path, this);
            var fun_video_ended = function () {
                q_video.off("VIDEO_ELEMENT_ENDED", q_video, fun_video_ended);
                q_video.removeVideo();
                this.event("QUESTION_READ_COMPLETE");
                this.destroy(true);
            };
            q_video.on("VIDEO_ELEMENT_ENDED", this, fun_video_ended);
        }
        playMp3Handler(e) {
            var sp_play_btn_temp = e.currentTarget;
            var textureUrl = (sp_play_btn_temp["flag"] = !sp_play_btn_temp["flag"]) ? sp_play_btn_temp["texture_stop"] : sp_play_btn_temp["texture_play"];
            sp_play_btn_temp.graphics.clear();
            var texture = Laya.loader.getRes(textureUrl);
            sp_play_btn_temp.size(texture.width, texture.height);
            sp_play_btn_temp.graphics.drawTexture(texture);
            if (sp_play_btn_temp["flag"]) {
                var sound_path = "q_comp/questions/" + (Bridge.curr_q_num + 1) + "/" + this.media_name;
                this.sound_channel = SoundManager.playMusic(sound_path, 1, new Handler(this, this.soundCompleteHandler), this.musicTime);
            }
            else {
                this.musicTime = this.sound_channel.position;
                SoundManager.stopMusic();
            }
        }
        soundCompleteHandler() {
            console.log("soundCompleteHandler");
            if (this.sound_channel.duration == this.sound_channel.position) {
                this.musicTime = 0;
                var textureUrl = (this.sp_play_btn["flag"] = !this.sp_play_btn["flag"]) ? this.sp_play_btn["texture_stop"] : this.sp_play_btn["texture_play"];
                this.sp_play_btn.graphics.clear();
                var texture = Laya.loader.getRes(textureUrl);
                this.sp_play_btn.size(texture.width, texture.height);
                this.sp_play_btn.graphics.drawTexture(texture);
            }
        }
        btnBackClickHandler(e) {
            switch (this.media_type) {
                case ".mp3":
                    SoundManager.stopMusic();
                    this.musicTime = 0;
                    this.sp_play_btn["flag"] = false;
                    this.sp_play_btn.graphics.clear();
                    var texture = Laya.loader.getRes(this.sp_play_btn["texture_play"]);
                    this.sp_play_btn.size(texture.width, texture.height);
                    this.sp_play_btn.graphics.drawTexture(texture);
                    break;
            }
            this.visible = false;
        }
        onEnable() {
            super.onEnable();
        }
    }

    var Sprite$1 = Laya.Sprite;
    var ProgressBar = Laya.ProgressBar;
    var Button$1 = Laya.Button;
    var Event$1 = Laya.Event;
    var Text$1 = Laya.Text;
    var Handler$1 = Laya.Handler;
    class MainQuestion extends Laya.Sprite {
        constructor(_w, _h) {
            super();
            this.a_random = true;
            this.rocket_running_gap = 0;
            this.time_takes = 0;
            this.btn_skin_path = "q_comp/button.png";
            this.size(_w, _h);
        }
        onEnable() {
            console.log("MainQuestion onEnable");
            this.txt_info = new Text$1();
            this.txt_info.align = "left";
            this.txt_info.fontSize = 20;
            this.txt_info.y = this.height - this.txt_info.height;
            this.addChild(this.txt_info);
            this.y = Laya.stage.height - this.height;
            this.q_type_icon = new Sprite$1();
            this.q_type_icon.x = 10;
            this.q_type_icon.y = 10;
            this.q_type_icon.graphics.clear();
            var q_type_icon_texture = Laya.loader.getRes("q_comp/" + Bridge.arr_q_data[Bridge.curr_q_num]["题目标签"]);
            this.q_type_icon.size(q_type_icon_texture.width, q_type_icon_texture.height);
            this.q_type_icon.graphics.drawTexture(q_type_icon_texture);
            this.addChild(this.q_type_icon);
            this.container_countdown = new Sprite$1();
            this.container_countdown.visible = false;
            this.addChild(this.container_countdown);
            this.countdown_progress_bar = new ProgressBar("q_comp/progress.png");
            this.countdown_progress_bar.width = Laya.stage.width - 150;
            this.countdown_progress_bar.pivotY = this.countdown_progress_bar.height / 2;
            this.countdown_progress_bar.value = 0;
            this.container_countdown.addChild(this.countdown_progress_bar);
            this.countdown_rocket = new Sprite$1();
            var locket_texture = Laya.loader.getRes("q_comp/timer_rocket.png");
            this.countdown_rocket.graphics.drawTexture(locket_texture);
            this.countdown_rocket.size(locket_texture.width, locket_texture.height);
            this.countdown_rocket.pivotY = this.countdown_rocket.height / 2;
            this.container_countdown.addChild(this.countdown_rocket);
            this.rocket_running_gap = (this.countdown_progress_bar.width - this.countdown_rocket.width) / Bridge.arr_q_data[Bridge.curr_q_num]["倒计时间"];
            this.countdown_block = new CountDownBlock();
            this.countdown_block.x = this.countdown_progress_bar.x + this.countdown_progress_bar.width + 35;
            this.container_countdown.addChild(this.countdown_block);
            this.container_countdown.height = this.countdown_block.height;
            this.startCountDown();
            this.btn_next = new Button$1(this.btn_skin_path);
            this.btn_next.labelSize = 26;
            Bridge.curr_q_num < (Bridge.arr_q_data.length - 1) ? this.btn_next.label = "下一题" : this.btn_next.label = "提交";
            this.btn_next.pivotX = this.btn_next.width / 2;
            this.btn_next.pos(Laya.stage.width / 2, Laya.stage.height - this.btn_next.height * 5);
            this.btn_next.labelColors = "#FFFFFF";
            this.addChild(this.btn_next);
            this.btn_next.on(Event$1.CLICK, this, this.btnNextClickHandler);
            var arr_media = Bridge.arr_q_data[Bridge.curr_q_num]["音频题_视频题_图片题"].split(",");
            var meida_suffix = "";
            if (arr_media[0] == "") {
            }
            else {
                meida_suffix = arr_media[0].substr(arr_media[0].lastIndexOf("."), arr_media[0].length);
            }
            if (meida_suffix == ".mp3" || meida_suffix == ".mp4" || meida_suffix == ".png") {
                this.reading_panel = new ReadingPanel(this.width, this.height, arr_media[0]);
                this.reading_panel.visible = false;
                this.addChild(this.reading_panel);
                if (arr_media.length < 2) {
                    this.sp_btn_read = new Sprite$1();
                    this.sp_btn_read.graphics.clear();
                    var sp_btn_read_texture = Laya.loader.getRes("q_comp/读题btn.png");
                    this.sp_btn_read.graphics.drawTexture(sp_btn_read_texture);
                    this.sp_btn_read.size(sp_btn_read_texture.width, sp_btn_read_texture.height);
                    this.sp_btn_read.x = Laya.stage.width - this.sp_btn_read.width - 10;
                    this.sp_btn_read.y = this.q_type_icon.y;
                    this.addChild(this.sp_btn_read);
                    this.sp_btn_read.on(Event$1.CLICK, this, this.readBtnClickHandler);
                }
                else {
                    this.reading_panel.visible = true;
                }
            }
            this.arr_assets = new Array();
            var arr_drag_pic_name = Bridge.arr_q_data[Bridge.curr_q_num]["资源图片名称"].split(",");
            for (var i = 0; i < arr_drag_pic_name.length; i++) {
                this.arr_assets.push({ url: "q_comp/questions/" + (Bridge.curr_q_num + 1) + "/" + arr_drag_pic_name[i], type: Laya.Loader.IMAGE });
            }
            if (Bridge.arr_q_data[Bridge.curr_q_num]["题目主图"]) {
                this.arr_assets.push({ url: "q_comp/questions/" + (Bridge.curr_q_num + 1) + "/" + Bridge.arr_q_data[Bridge.curr_q_num]["题目主图"], type: Laya.Loader.IMAGE });
            }
            Laya.loader.retryNum = 3;
            Laya.loader.load(this.arr_assets, Handler$1.create(this, this.onAssetLoaded));
            Laya.loader.on(Event$1.ERROR, this, this.onAssetLoadError);
        }
        btnNextClickHandler() {
            this.event("NEXT_BTN_CLICK", this.btn_next.label);
        }
        onAssetLoaded() { }
        onAssetLoadError(err) { }
        drawBgColor() {
            console.log("Laya.stage.height =", Laya.stage.height, "MainQuestion setheight =", this.height);
            this.graphics.drawRect(0, 0, this.width, this.height, "#E7F2BC");
        }
        startCountDown() {
            this.countdown_block.setTxt(this.GetTimeLeft2BySecond(Bridge.arr_q_data[Bridge.curr_q_num]["倒计时间"]));
            this.timer.loop(1000, this, this.timeCountDownHandler);
        }
        timeCountDownHandler() {
            if (this.time_takes < Bridge.arr_q_data[Bridge.curr_q_num]["倒计时间"]) {
                this.time_takes++;
                this.countdown_progress_bar.value = this.time_takes / Bridge.arr_q_data[Bridge.curr_q_num]["倒计时间"];
                this.countdown_rocket.x += this.rocket_running_gap;
                this.countdown_block.setTxt(this.GetTimeLeft2BySecond(Bridge.arr_q_data[Bridge.curr_q_num]["倒计时间"] - this.time_takes));
            }
            else {
                console.log("当前做题时间到");
                this.timer.clear(this, this.timeCountDownHandler);
            }
        }
        readBtnClickHandler() {
            console.log("MainQuestion readBtmClickHandler");
            this.setChildIndex(this.reading_panel, this.numChildren - 1);
            this.reading_panel.visible = true;
        }
        setInfoText(str) {
            this.txt_info.text = str.toString();
            console.log(this.txt_info.height);
            this.txt_info.y = this.height - this.txt_info.height;
        }
        destroy(pd = false) {
            console.log("MainQuestion destory");
            this.timer.clear(this, this.timeCountDownHandler);
            super.destroy(pd);
        }
        GetTimeLeft2BySecond(s) {
            let hours = Math.round((s - 30 * 60) / (60 * 60));
            let minutes = Math.round((s - 30) / 60) % 60;
            let seconds = s % 60;
            let str_hours;
            let str_minutes;
            let str_seconds;
            if (hours == 0) {
                str_hours = "00";
            }
            else if (hours > 0 && hours < 10) {
                str_hours = "0" + hours;
            }
            else {
                str_hours = hours.toString();
            }
            if (minutes == 0) {
                str_minutes = "00";
            }
            else if (minutes > 0 && minutes < 10) {
                str_minutes = "0" + minutes;
            }
            else {
                str_minutes = minutes.toString();
            }
            if (seconds == 0) {
                str_seconds = "00";
            }
            else if (seconds > 0 && seconds < 10) {
                str_seconds = "0" + seconds;
            }
            else {
                str_seconds = seconds.toString();
            }
            return str_minutes + ":" + str_seconds;
        }
        asciiToString(n) {
            return String.fromCharCode(n);
        }
        stringToAscii(str) {
            return str.charCodeAt(0);
        }
    }

    var Sprite$2 = Laya.Sprite;
    var Text$2 = Laya.Text;
    class ChoiceWidget extends Laya.Sprite {
        constructor(p_url) {
            super();
            this.fill_color = "#d2d2d2";
            this.selected_color = Bridge.main_color;
            this.selected = false;
            this.circle_radius = 25;
            this.rect_width = 256;
            this.rect_height = 100;
            this.radian_to_point_dis = 10;
            this.rect_radius = 10;
            this.rect_path = [
                ["moveTo", this.radian_to_point_dis, 0],
                ["lineTo", this.rect_width - this.radian_to_point_dis, 0],
                ["arcTo", this.rect_width, 0, this.rect_width, this.radian_to_point_dis, this.rect_radius],
                ["lineTo", this.rect_width, this.rect_height - this.radian_to_point_dis],
                ["arcTo", this.rect_width, this.rect_height, this.rect_width - this.radian_to_point_dis, this.rect_height, this.rect_radius],
                ["lineTo", this.radian_to_point_dis, this.rect_height],
                ["arcTo", 0, this.rect_height, 0, this.rect_height - this.radian_to_point_dis, this.rect_radius],
                ["lineTo", 0, this.radian_to_point_dis],
                ["arcTo", 0, 0, this.radian_to_point_dis, 0, this.rect_radius],
            ];
            this.id = -1;
            this.pic_url = p_url;
        }
        onEnable() {
            this.pic_rect = new Sprite$2();
            this.pic_rect.size(this.rect_width, this.rect_height);
            this.pic_rect.graphics.drawPath(0, 0, this.rect_path, { fillStyle: this.fill_color });
            this.pic_rect.x = this.circle_radius * 2 + 5;
            this.addChild(this.pic_rect);
            this.choice_circle = new Sprite$2();
            this.choice_circle.graphics.drawCircle(this.circle_radius, this.circle_radius, this.circle_radius, this.fill_color);
            this.choice_circle.size(this.circle_radius * 2, this.circle_radius * 2);
            this.choice_circle.y = (this.pic_rect.height - this.choice_circle.height) / 2;
            this.addChild(this.choice_circle);
            this.txt_choice = new Text$2();
            this.txt_choice.mouseEnabled = false;
            this.txt_choice.fontSize = 26;
            this.txt_choice.text = "O";
            this.txt_choice.pivot(this.txt_choice.width / 2, this.txt_choice.height / 2);
            this.txt_choice.pos(this.choice_circle.width / 2, this.choice_circle.height / 2);
            this.choice_circle.addChild(this.txt_choice);
            var sp_pic = new Sprite$2();
            var pic_texture = Laya.loader.getRes(this.pic_url);
            sp_pic.size(pic_texture.width, pic_texture.height);
            sp_pic.graphics.drawTexture(pic_texture);
            sp_pic.pivot(sp_pic.width / 2, sp_pic.height / 2);
            sp_pic.pos(this.pic_rect.x + this.pic_rect.width / 2, this.pic_rect.y + this.pic_rect.height / 2);
            this.addChild(sp_pic);
            this.size(this.pic_rect.x + this.pic_rect.width, this.pic_rect.height);
            this.choice_circle.on(Laya.Event.CLICK, this, this.circleClickHandler);
        }
        circleClickHandler() {
            console.log("ChoiceWidget circleClickHandler");
            this.event("CHOICEWIDGET_CLICKED", this);
        }
        turnSelected() {
            this.pic_rect.graphics.clear();
            this.pic_rect.graphics.drawPath(0, 0, this.rect_path, { fillStyle: this.selected_color });
            this.choice_circle.graphics.clear();
            this.choice_circle.graphics.drawCircle(this.circle_radius, this.circle_radius, this.circle_radius, this.selected_color);
        }
        restore() {
            this.pic_rect.graphics.clear();
            this.pic_rect.graphics.drawPath(0, 0, this.rect_path, { fillStyle: this.fill_color });
            this.choice_circle.graphics.clear();
            this.choice_circle.graphics.drawCircle(this.circle_radius, this.circle_radius, this.circle_radius, this.fill_color);
        }
        set circleText(txt) {
            this.txt_choice.text = txt;
        }
        get circleText() {
            return this.txt_choice.text;
        }
    }

    var Sprite$3 = Laya.Sprite;
    class ChoiceQuestion extends MainQuestion {
        constructor(_w, _h) {
            super(_w, _h);
            this.widget_updown_gap = 30;
            this.widget_leftright_gap = 30;
            this.selected_id = -1;
        }
        onEnable() {
            super.onEnable();
            console.log("ChoiceQuestion onEnable");
        }
        onAssetLoaded() {
            this.big_question_pic = new Sprite$3();
            this.big_question_pic.graphics.clear();
            var big_question_pic_texture = Laya.loader.getRes("q_comp/questions/" + (Bridge.curr_q_num + 1) + "/" + Bridge.arr_q_data[Bridge.curr_q_num]["题目主图"]);
            this.big_question_pic.graphics.drawTexture(big_question_pic_texture);
            this.big_question_pic.pivot(big_question_pic_texture.width / 2, 0);
            this.big_question_pic.x = Laya.stage.width / 2;
            this.big_question_pic.y = this.q_type_icon.y + this.q_type_icon.height + 30;
            this.addChild(this.big_question_pic);
            this.container_countdown.x = this.q_type_icon.x;
            this.container_countdown.y = this.big_question_pic.y + big_question_pic_texture.height + 30;
            this.container_countdown.visible = true;
            console.log("ChoiceQuestion ", Bridge.arr_q_data[Bridge.curr_q_num]);
            this.arr_select_pic = new Array();
            var arr_pic = Bridge.arr_q_data[Bridge.curr_q_num]["资源图片名称"].split(",");
            var has_unsure = false;
            for (var i = 0; i < arr_pic.length; i++) {
                switch (arr_pic[i].substring(0, 5)) {
                    case "right":
                        this.arr_select_pic.push({ "pic_name": arr_pic[i], "selected": false, "right_answer": 1 });
                        break;
                    case "wrong":
                        this.arr_select_pic.push({ "pic_name": arr_pic[i], "selected": false, "right_answer": 0 });
                        break;
                    case "unsur":
                        has_unsure = true;
                        break;
                }
            }
            if (this.a_random) {
                for (var i = this.arr_select_pic.length - 1; i >= 0; i--) {
                    var randomIndex = Math.floor(Math.random() * (i + 1));
                    var itemAtIndex = this.arr_select_pic[randomIndex];
                    this.arr_select_pic[randomIndex] = this.arr_select_pic[i];
                    this.arr_select_pic[i] = itemAtIndex;
                }
            }
            has_unsure ? this.arr_select_pic.push({ "pic_name": "unsure.png", "selected": false, "right_answer": 2 }) : 0;
            for (var i = 0; i < arr_pic.length; i++) {
                this.arr_select_pic[i]["select_lab"] = this.asciiToString(i + this.stringToAscii("A"));
            }
            console.log(this.arr_select_pic);
            var arr_single_index = [];
            var arr_double_index = [];
            this.arr_choice_widget = new Array();
            for (var i = 0; i < this.arr_select_pic.length; i++) {
                var choice_widget = new ChoiceWidget("q_comp/questions/" + (Bridge.curr_q_num + 1) + "/" + this.arr_select_pic[i]["pic_name"]);
                choice_widget.id = i;
                choice_widget.on("CHOICEWIDGET_CLICKED", this, this.selectedHandler);
                this.addChild(choice_widget);
                choice_widget.circleText = this.arr_select_pic[i]["select_lab"];
                if (i % 2 == 0) {
                    arr_double_index.push(choice_widget);
                    choice_widget.x = this.widget_leftright_gap;
                }
                else {
                    arr_single_index.push(choice_widget);
                    choice_widget.x = Laya.stage.width - choice_widget.width - this.widget_leftright_gap;
                }
                choice_widget.y = this.container_countdown.y + this.widget_updown_gap;
                this.arr_choice_widget.push(choice_widget);
            }
            for (var i = 0; i < arr_double_index.length; i++) {
                if (i > 0) {
                    arr_double_index[i].y = arr_double_index[i - 1].y + arr_double_index[i - 1].height + this.widget_updown_gap;
                }
            }
            for (var i = 0; i < arr_single_index.length; i++) {
                if (i > 0) {
                    arr_single_index[i].y = arr_single_index[i - 1].y + arr_single_index[i - 1].height + this.widget_updown_gap;
                }
            }
        }
        onAssetLoadError(err) {
            console.log("CheckQuestion:", "加载资源图片失败: " + err);
        }
        selectedHandler(cw) {
            if (this.selected_id >= 0) {
                if (cw.id != this.selected_id) {
                    this.arr_choice_widget[this.selected_id].restore();
                    this.arr_select_pic[this.selected_id]["selected"] = false;
                    cw.turnSelected();
                    this.selected_id = cw.id;
                    this.arr_select_pic[this.selected_id]["selected"] = true;
                }
            }
            else {
                this.selected_id = cw.id;
                cw.turnSelected();
                this.arr_select_pic[this.selected_id]["selected"] = true;
            }
            console.log(this.arr_select_pic);
            this.btn_next.disabled = false;
        }
        btnNextClickHandler() {
            console.log("ChoiceQuestion btnNextClickHandler");
            super.btnNextClickHandler();
        }
    }

    var Event$2 = Laya.Event;
    class BlankBlock extends Laya.Sprite {
        constructor() {
            super();
            this.block_width = 100;
            this.block_height = 100;
            this.radian_to_point_dis = 10;
            this.rect_radius = 10;
            this.rect_path = [
                ["moveTo", this.radian_to_point_dis, 0],
                ["lineTo", this.block_width - this.radian_to_point_dis, 0],
                ["arcTo", this.block_width, 0, this.block_width, this.radian_to_point_dis, this.rect_radius],
                ["lineTo", this.block_width, this.block_height - this.radian_to_point_dis],
                ["arcTo", this.block_width, this.block_height, this.block_width - this.radian_to_point_dis, this.block_height, this.rect_radius],
                ["lineTo", this.radian_to_point_dis, this.block_height],
                ["arcTo", 0, this.block_height, 0, this.block_height - this.radian_to_point_dis, this.rect_radius],
                ["lineTo", 0, this.radian_to_point_dis],
                ["arcTo", 0, 0, this.radian_to_point_dis, 0, this.rect_radius],
            ];
            this.index = -1;
            this.right_pic_name = "";
            this.touched_drag_block = null;
            this.has_default_pic = false;
            this.size(this.block_width, this.block_height);
            if (this.has_default_pic) {
            }
            else {
                this.graphics.drawPath(0, 0, this.rect_path, { fillStyle: "#ffffff" }, { "strokeStyle": "#000000", "lineWidth": "1" });
                var blank_block_rigidbody = this.addComponent(Laya.RigidBody);
                blank_block_rigidbody.type = "static";
                blank_block_rigidbody.allowSleep = false;
                var blank_block_collider = this.addComponent(Laya.BoxCollider);
                blank_block_collider.width = 30;
                blank_block_collider.height = 30;
                blank_block_collider.x = (blank_block_collider.owner.width - blank_block_collider.width) / 2;
                blank_block_collider.y = (blank_block_collider.owner.height - blank_block_collider.height) / 2;
                this.on(Event$2.MOUSE_DOWN, this, this.mouseDownHandler);
            }
        }
        mouseDownHandler(e) {
            var blank_block_temp = e.currentTarget;
            if (blank_block_temp.touched_drag_block) {
                blank_block_temp.graphics.clear();
                blank_block_temp.graphics.drawPath(0, 0, this.rect_path, { fillStyle: "#ffffff" }, { "strokeStyle": "#000000", "lineWidth": "1" });
                blank_block_temp.touched_drag_block.pos(blank_block_temp.touched_drag_block.parent.mouseX - blank_block_temp.touched_drag_block.width / 2, blank_block_temp.touched_drag_block.parent.mouseY - blank_block_temp.touched_drag_block.height / 2);
                blank_block_temp.touched_drag_block.event("START_DRAG", blank_block_temp.touched_drag_block);
                blank_block_temp.touched_drag_block.startDrag();
                blank_block_temp.touched_drag_block = null;
            }
        }
        changeSkin(touched_drag_block) {
            this.touched_drag_block = touched_drag_block;
            this.graphics.clear();
            this.graphics.drawTexture(this.touched_drag_block.drag_texture);
        }
    }

    var Event$3 = Laya.Event;
    class DragBlock extends Laya.Sprite {
        constructor(pic_path) {
            super();
            this.block_width = 100;
            this.block_height = 100;
            this.$x = 0;
            this.$y = 0;
            this.pic_name = "";
            this.radian_to_point_dis = 10;
            this.rect_radius = 10;
            this.rect_path = [
                ["moveTo", this.radian_to_point_dis, 0],
                ["lineTo", this.block_width - this.radian_to_point_dis, 0],
                ["arcTo", this.block_width, 0, this.block_width, this.radian_to_point_dis, this.rect_radius],
                ["lineTo", this.block_width, this.block_height - this.radian_to_point_dis],
                ["arcTo", this.block_width, this.block_height, this.block_width - this.radian_to_point_dis, this.block_height, this.rect_radius],
                ["lineTo", this.radian_to_point_dis, this.block_height],
                ["arcTo", 0, this.block_height, 0, this.block_height - this.radian_to_point_dis, this.rect_radius],
                ["lineTo", 0, this.radian_to_point_dis],
                ["arcTo", 0, 0, this.radian_to_point_dis, 0, this.rect_radius],
            ];
            this.index = -1;
            this.touched_blank_block = null;
            this.pic_path = pic_path;
            this.pic_name = this.pic_path.substring(this.pic_path.lastIndexOf("/") + 1, this.pic_path.lastIndexOf(".png"));
            this.size(this.block_width, this.block_height);
            this.drag_texture = Laya.loader.getRes(this.pic_path);
            this.drag_texture.width = this.width;
            this.drag_texture.height = this.height;
            this.graphics.drawTexture(this.drag_texture);
            var pic_block_rigidbody = this.addComponent(Laya.RigidBody);
            pic_block_rigidbody.group = -1;
            pic_block_rigidbody.type = "dynamic";
            pic_block_rigidbody.gravityScale = 0;
            pic_block_rigidbody.allowSleep = false;
            var pic_block_collider = this.addComponent(Laya.BoxCollider);
            pic_block_collider.isSensor = true;
            pic_block_collider.width = 50;
            pic_block_collider.height = 50;
            pic_block_collider.x = (pic_block_collider.owner.width - pic_block_collider.width) / 2;
            pic_block_collider.y = (pic_block_collider.owner.height - pic_block_collider.height) / 2;
            this.on(Event$3.MOUSE_DOWN, this, this.dragBlockMouseDownHandler);
            this.on(Event$3.MOUSE_UP, this, this.dragBlockStopDragHandler);
            var pic_block_script = this.addComponent(DragBlockScript);
        }
        dragBlockMouseDownHandler(e) {
            this.event("START_DRAG", this);
            this.startDrag();
        }
        dragBlockStopDragHandler(e) {
            this.event("STOP_DRAG", this);
        }
    }
    class DragBlockScript extends Laya.Script {
        constructor() { super(); }
        onEnable() { }
        onDisable() { }
        onTriggerEnter(other, self, contact) {
            console.log("onTriggerEnter");
            var blank_block = other.owner;
            var drag_block = self.owner;
            drag_block.touched_blank_block = other.owner;
        }
        onTriggerStay(other, self, contact) {
        }
        onTriggerExit(other, self, contact) {
            console.log("onTriggerExit");
            var blank_block = other.owner;
            var drag_block = self.owner;
            drag_block.touched_blank_block = null;
        }
    }

    var Event$4 = Laya.Event;
    var Text$3 = Laya.Text;
    class DragQuestion extends MainQuestion {
        constructor(_w, _h) {
            super(_w, _h);
            this.max_block_in_one_line = 6;
            this.block_gap = 0;
            this.rect_width = 100;
            this.rect_height = 100;
            console.log("DragQuestion constructor");
        }
        onEnable() {
            super.onEnable();
            console.log("DragQuestion onEnable");
        }
        onAssetLoaded() {
            console.log(Bridge.arr_q_data[Bridge.curr_q_num]);
            this.container_countdown.x = this.q_type_icon.x;
            this.container_countdown.y = this.q_type_icon.y + this.q_type_icon.height + 30;
            this.container_countdown.visible = true;
            var txt_zuodaqu = new Text$3();
            txt_zuodaqu.fontSize = 25;
            txt_zuodaqu.text = "作答区";
            txt_zuodaqu.color = "#747474";
            txt_zuodaqu.x = this.q_type_icon.x;
            txt_zuodaqu.y = this.container_countdown.y + this.container_countdown.height + 15;
            this.addChild(txt_zuodaqu);
            this.block_gap = (Laya.stage.width - 2 * this.q_type_icon.x - this.rect_width * this.max_block_in_one_line) / (this.max_block_in_one_line - 1);
            var right_pic_num = 0;
            var arr_drag_pic_name = Bridge.arr_q_data[Bridge.curr_q_num]["资源图片名称"].split(",");
            var has_unsure = false;
            this.arr_drag_block = new Array();
            var unsure_pic_name;
            for (var i = 0; i < arr_drag_pic_name.length; i++) {
                console.log(arr_drag_pic_name[i].substring(0, 5));
                switch (arr_drag_pic_name[i].substring(0, 5)) {
                    case "right":
                        right_pic_num++;
                        var drag_block_temp = new DragBlock("q_comp/questions/" + (Bridge.curr_q_num + 1) + "/" + arr_drag_pic_name[i]);
                        drag_block_temp.index = i;
                        drag_block_temp.on("START_DRAG", this, this.startDragHandler);
                        drag_block_temp.on("STOP_DRAG", this, this.stopDragHandler);
                        this.arr_drag_block.push(drag_block_temp);
                        break;
                    case "wrong":
                        var drag_block_temp = new DragBlock("q_comp/questions/" + (Bridge.curr_q_num + 1) + "/" + arr_drag_pic_name[i]);
                        drag_block_temp.index = i;
                        drag_block_temp.on("START_DRAG", this, this.startDragHandler);
                        drag_block_temp.on("STOP_DRAG", this, this.stopDragHandler);
                        this.arr_drag_block.push(drag_block_temp);
                        break;
                    case "unsur":
                        unsure_pic_name = arr_drag_pic_name[i];
                        has_unsure = true;
                        break;
                }
            }
            if (this.a_random) {
                for (var i = this.arr_drag_block.length - 1; i >= 0; i--) {
                    var randomIndex = Math.floor(Math.random() * (i + 1));
                    var itemAtIndex = this.arr_drag_block[randomIndex];
                    this.arr_drag_block[randomIndex] = this.arr_drag_block[i];
                    this.arr_drag_block[i] = itemAtIndex;
                }
            }
            if (has_unsure) {
                var drag_block_temp = new DragBlock("q_comp/questions/" + (Bridge.curr_q_num + 1) + "/" + unsure_pic_name);
                drag_block_temp.index = this.arr_drag_block.length;
                drag_block_temp.on("START_DRAG", this, this.startDragHandler);
                drag_block_temp.on("STOP_DRAG", this, this.stopDragHandler);
                this.arr_drag_block.push(drag_block_temp);
            }
            this.arr_blank_block = new Array();
            for (var i = 0; i < Bridge.arr_q_data[Bridge.curr_q_num]["空白块数目"]; i++) {
                var blank_block_temp = new BlankBlock();
                i < right_pic_num ? blank_block_temp.right_pic_name = "right" + (i + 1) : blank_block_temp.right_pic_name = "";
                blank_block_temp.index = i;
                blank_block_temp.x = this.q_type_icon.x + i % this.max_block_in_one_line * (this.block_gap + blank_block_temp.width);
                blank_block_temp.y = (txt_zuodaqu.y + txt_zuodaqu.height + 15) +
                    Math.floor(i / this.max_block_in_one_line) * (this.block_gap + blank_block_temp.height);
                this.addChild(blank_block_temp);
                this.arr_blank_block.push(blank_block_temp);
            }
            var txt_xuanxiangqu = new Text$3();
            txt_xuanxiangqu.fontSize = 25;
            txt_xuanxiangqu.text = "选项区";
            txt_xuanxiangqu.color = "#747474";
            txt_xuanxiangqu.x = txt_zuodaqu.x;
            txt_xuanxiangqu.y = this.arr_blank_block[this.arr_blank_block.length - 1].y + this.arr_blank_block[this.arr_blank_block.length - 1].height + 30;
            this.addChild(txt_xuanxiangqu);
            for (var i = 0; i < this.arr_drag_block.length; i++) {
                this.arr_drag_block[i].x = this.q_type_icon.x + i % this.max_block_in_one_line * (this.block_gap + this.arr_drag_block[i].width);
                this.arr_drag_block[i].y = txt_xuanxiangqu.y + txt_xuanxiangqu.height +
                    Math.floor(i / this.max_block_in_one_line) * (this.block_gap + this.arr_drag_block[i].height) + 15;
                this.arr_drag_block[i].$x = this.arr_drag_block[i].x;
                this.arr_drag_block[i].$y = this.arr_drag_block[i].y;
                var drag_texture = this.arr_drag_block[i].drag_texture;
                this.graphics.drawTexture(drag_texture, this.arr_drag_block[i].x, this.arr_drag_block[i].y);
                this.addChild(this.arr_drag_block[i]);
            }
            this.setChildIndex(this.reading_panel, this.numChildren - 1);
            Laya.stage.on(Event$4.MOUSE_OUT, this, this.dragOutStageHandler);
        }
        onAssetLoadError(err) {
            console.log("DragQuestion:", "加载资源图片失败: " + err);
        }
        startDragHandler(drag_block) {
            this.dragging_block = drag_block;
            this.setChildIndex(this.dragging_block, this.numChildren - 1);
        }
        stopDragHandler(drag_block) {
            if (drag_block.touched_blank_block) {
                drag_block.touched_blank_block.changeSkin(drag_block);
                this.dragging_block.x = this.dragging_block.$x;
                this.dragging_block.y = this.dragging_block.$y;
            }
            else {
                Laya.Tween.to(this.dragging_block, { x: this.dragging_block.$x, y: this.dragging_block.$y }, 100);
            }
            this.dragging_block = null;
        }
        btnNextClickHandler() {
            for (var i = 0; i < Bridge.arr_q_data[Bridge.curr_q_num]["空白块数目"]; i++) {
            }
            console.log("DragQuestion btnNextClickHandler");
            super.btnNextClickHandler();
        }
        dragOutStageHandler(e) {
            if (this.dragging_block) {
                Laya.Tween.to(this.dragging_block, { x: this.dragging_block.$x, y: this.dragging_block.$y }, 100);
                this.dragging_block.touched_blank_block = null;
                this.dragging_block = null;
            }
        }
    }

    var Sprite$4 = Laya.Sprite;
    class CheckQuestion extends MainQuestion {
        constructor(_w, _h) {
            super(_w, _h);
            this.widget_updown_gap = 30;
            this.widget_leftright_gap = 30;
        }
        onEnable() {
            super.onEnable();
            console.log("CheckQuestion onEnable");
        }
        onAssetLoaded() {
            this.question_pic = new Sprite$4();
            this.question_pic.graphics.clear();
            var question_pic_texture = Laya.loader.getRes("q_comp/questions/" + (Bridge.curr_q_num + 1) + "/" + Bridge.arr_q_data[Bridge.curr_q_num]["题目主图"]);
            this.question_pic.size(question_pic_texture.width, question_pic_texture.height);
            this.question_pic.graphics.drawTexture(question_pic_texture);
            this.question_pic.x = (Laya.stage.width - this.question_pic.width) / 2;
            this.question_pic.y = this.q_type_icon.y + this.q_type_icon.height + 30;
            this.question_pic["small_x"] = this.question_pic.x;
            this.question_pic["small_y"] = this.question_pic.y;
            this.question_pic["isSmallPic"] = true;
            this.addChild(this.question_pic);
            this.container_countdown.x = this.q_type_icon.x;
            this.container_countdown.y = this.question_pic.y + question_pic_texture.height + 30;
            this.container_countdown.visible = true;
            console.log("CheckQuestion ", Bridge.arr_q_data[Bridge.curr_q_num]);
            this.arr_select_pic = new Array();
            var arr_pic = Bridge.arr_q_data[Bridge.curr_q_num]["资源图片名称"].split(",");
            var has_unsure = false;
            for (var i = 0; i < arr_pic.length; i++) {
                switch (arr_pic[i].substring(0, 5)) {
                    case "right":
                        this.arr_select_pic.push({ "pic_name": arr_pic[i], "selected": false, "right_answer": 1 });
                        break;
                    case "wrong":
                        this.arr_select_pic.push({ "pic_name": arr_pic[i], "selected": false, "right_answer": 0 });
                        break;
                    case "unsur":
                        has_unsure = true;
                        break;
                }
            }
            if (this.a_random) {
                for (var i = this.arr_select_pic.length - 1; i >= 0; i--) {
                    var randomIndex = Math.floor(Math.random() * (i + 1));
                    var itemAtIndex = this.arr_select_pic[randomIndex];
                    this.arr_select_pic[randomIndex] = this.arr_select_pic[i];
                    this.arr_select_pic[i] = itemAtIndex;
                }
            }
            has_unsure ? this.arr_select_pic.push({ "pic_name": "unsure.png", "selected": false, "right_answer": 2 }) : 0;
            for (var i = 0; i < arr_pic.length; i++) {
                this.arr_select_pic[i]["select_lab"] = this.asciiToString(i + this.stringToAscii("A"));
            }
            console.log(this.arr_select_pic);
            var arr_single_index = [];
            var arr_double_index = [];
            this.arr_choice_widget = new Array();
            for (var i = 0; i < this.arr_select_pic.length; i++) {
                var choice_widget = new ChoiceWidget("q_comp/questions/" + (Bridge.curr_q_num + 1) + "/" + this.arr_select_pic[i]["pic_name"]);
                choice_widget.id = i;
                choice_widget.on("CHOICEWIDGET_CLICKED", this, this.selectedHandler);
                this.addChild(choice_widget);
                choice_widget.circleText = this.arr_select_pic[i]["select_lab"];
                if (i % 2 == 0) {
                    arr_double_index.push(choice_widget);
                    choice_widget.x = this.widget_leftright_gap;
                }
                else {
                    arr_single_index.push(choice_widget);
                    choice_widget.x = Laya.stage.width - choice_widget.width - this.widget_leftright_gap;
                }
                choice_widget.y = this.container_countdown.y + this.widget_updown_gap;
                this.arr_choice_widget.push(choice_widget);
            }
            for (var i = 0; i < arr_double_index.length; i++) {
                if (i > 0) {
                    arr_double_index[i].y = arr_double_index[i - 1].y + arr_double_index[i - 1].height + this.widget_updown_gap;
                }
            }
            for (var i = 0; i < arr_single_index.length; i++) {
                if (i > 0) {
                    arr_single_index[i].y = arr_single_index[i - 1].y + arr_single_index[i - 1].height + this.widget_updown_gap;
                }
            }
        }
        onAssetLoadError(err) {
            console.log("CheckQuestion:", "加载资源图片失败: " + err);
        }
        selectedHandler(cw) {
            cw.selected = !cw.selected;
            if (cw.selected) {
                this.arr_select_pic[cw.id]["selected"] = true;
                cw.turnSelected();
            }
            else {
                this.arr_select_pic[cw.id]["selected"] = false;
                cw.restore();
            }
            console.log(this.arr_select_pic);
            this.btn_next.disabled = false;
        }
        btnNextClickHandler() {
            console.log("CheckQuestion btnNextClickHandler");
            super.btnNextClickHandler();
        }
    }

    var Sprite$5 = Laya.Sprite;
    var Button$2 = Laya.Button;
    var Event$5 = Laya.Event;
    class SpriteStart extends Sprite$5 {
        constructor() {
            super();
            this.btn_skin_path = "q_comp/button.png";
        }
        onEnable() {
            super.onEnable();
            this.btn_start = new Button$2(this.btn_skin_path);
            this.btn_start.labelSize = 26;
            this.btn_start.label = "开始答题";
            this.btn_start.pivot(this.btn_start.width / 2, this.btn_start.height / 2);
            this.btn_start.x = Laya.stage.width / 2;
            this.btn_start.y = Laya.stage.height - this.btn_start.height * 3;
            this.btn_start.labelColors = "#FFFFFF";
            this.addChild(this.btn_start);
            this.btn_start.on(Event$5.CLICK, this, this.btnStartClickHandler);
        }
        btnStartClickHandler() {
            this.btn_start.off(Event$5.CLICK, this, this.btnStartClickHandler);
            this.event("START_TEST");
            this.destroy(true);
        }
        onDisable() {
        }
    }

    var Text$4 = Laya.Text;
    class TotalTimeBar extends Laya.Sprite {
        constructor(tt) {
            super();
            this.bar_height = 100;
            this.total_questions = 0;
            this.total_time = tt;
        }
        onEnable() {
            this.size(Laya.stage.width, this.bar_height);
            this.graphics.drawRect(0, 0, Laya.stage.width, this.bar_height, Bridge.main_color);
            this.txt_static = new Text$4();
            this.txt_static.fontSize = 20;
            this.txt_static.color = "#FFFFFF";
            this.txt_static.text = "已用时";
            this.txt_static.pivot(this.txt_static.width / 2, this.txt_static.height);
            this.txt_static.x = this.width / 2;
            this.txt_static.y = this.height - 3;
            this.addChild(this.txt_static);
            this.txt_q_index = new Text$4();
            this.txt_q_index.fontSize = 24;
            this.txt_q_index.color = "#FFFFFF";
            this.txt_q_index.align = "right";
            this.addChild(this.txt_q_index);
            this.txt_total_time = new Text$4();
            this.txt_total_time.fontSize = 36;
            this.txt_total_time.color = "#FFFFFF";
            this.txt_total_time.text = "00:00:00";
            this.txt_total_time.pivot(this.txt_total_time.width / 2, this.txt_total_time.height / 2);
            this.txt_total_time.x = this.width / 2;
            this.txt_total_time.y = this.height / 2;
            this.addChild(this.txt_total_time);
            this.timeStart();
        }
        timeStart() {
            var t = 0;
            this.timer.loop(1000, this, function () {
                t++;
                this.hh = Math.round((t - 30 * 60) / (60 * 60));
                this.mm = Math.round((t - 30) / 60) % 60;
                this.ss = t % 60;
                var str_hh;
                this.hh.toString().length > 1 ? str_hh = this.hh.toString() : str_hh = "0" + this.hh.toString();
                var str_mm;
                this.mm.toString().length > 1 ? str_mm = this.mm.toString() : str_mm = "0" + this.mm.toString();
                var str_ss;
                this.ss.toString().length > 1 ? str_ss = this.ss.toString() : str_ss = "0" + this.ss.toString();
                this.txt_total_time.text = str_hh + ":" + str_mm + ":" + str_ss;
                if (t >= this.total_time) {
                    this.event("TIMES_UP");
                    this.timer.clearAll(this);
                }
            });
        }
        setTotalQuestions(n) {
            this.total_questions = n;
        }
        setQuestionIndex(cur_n) {
            this.txt_q_index.text = "第" + cur_n + "题/共" + this.total_questions + "题";
            this.txt_q_index.pivot(this.txt_q_index.width, this.txt_q_index.height / 2);
            this.txt_q_index.x = this.width - 5;
            this.txt_q_index.y = this.height / 2;
        }
    }

    var Event$6 = Laya.Event;
    var ProgressBar$1 = Laya.ProgressBar;
    var Handler$2 = Laya.Handler;
    class MainScene extends Laya.Script {
        constructor() {
            super();
            this.progress_bar_skin_path = "q_comp/progress.png";
            this.q_random = false;
            this.total_time = 3600;
        }
        onEnable() {
            super.onEnable();
            Laya.loader.load("res/atlas/q_comp.atlas", Handler$2.create(this, this.onProgressLoaded));
        }
        onProgressLoaded() {
            this.progress_bar = new ProgressBar$1(this.progress_bar_skin_path);
            console.log(this.progress_bar.width);
            this.progress_bar.pivotX = this.progress_bar.width / 2;
            this.progress_bar.pivotY = this.progress_bar.height / 2;
            this.progress_bar.pos(Laya.stage.width / 2, Laya.stage.height / 2);
            this.owner.addChild(this.progress_bar);
            this.arr_assets = new Array();
            this.arr_assets.push({ url: "data/q_data.json", type: Laya.Loader.JSON });
            this.arr_assets.push({ url: "res/atlas/q_comp/play_btn.atlas", type: Laya.Loader.ATLAS });
            Laya.loader.retryNum = 3;
            Laya.loader.load(this.arr_assets, Handler$2.create(this, this.onAssetLoaded), Handler$2.create(this, this.onAssetLoading, null, false));
            Laya.loader.on(Event$6.ERROR, this, this.onAssetLoadError);
        }
        onAssetLoading(progress) {
            this.progress_bar.value = progress;
        }
        onAssetLoadError(err) {
            console.log("MainScene:", "加载失败: " + err);
        }
        onAssetLoaded() {
            console.log("MainScene:", "onAssetLoaded");
            this.progress_bar.destroy(true);
            var q_data = Laya.loader.getRes(this.arr_assets[0].url);
            for (var i in q_data) {
                Bridge.arr_q_data.push(q_data[i]);
            }
            Bridge.total_q_num = Bridge.arr_q_data.length;
            if (this.q_random) {
                Bridge.arr_q_data.sort(function () {
                    return (0.5 - Math.random());
                });
            }
            this.sp_start_page = new SpriteStart();
            this.owner.addChild(this.sp_start_page);
            this.sp_start_page.on("START_TEST", this, this.startTestHandler);
        }
        startTestHandler() {
            this.sp_start_page.off("START_TEST", this, this.startTestHandler);
            this.total_time_bar = new TotalTimeBar(this.total_time);
            this.total_time_bar.setTotalQuestions(Bridge.total_q_num);
            this.total_time_bar.on("TIMES_UP", this, this.timesUpHandler);
            this.owner.addChild(this.total_time_bar);
            this.changeQuestion(Bridge.curr_q_num);
        }
        changeQuestion(q_num) {
            if (this.sp_curr_question) {
                this.sp_curr_question.destroy(true);
            }
            if ((q_num) < Bridge.total_q_num) {
                this.total_time_bar.setQuestionIndex(q_num + 1);
            }
            console.log("第" + (q_num + 1) + "题 " + Bridge.arr_q_data[q_num]["题目类型"]);
            switch (Bridge.arr_q_data[q_num]["题目类型"]) {
                case "拖动题":
                    this.sp_curr_question = new DragQuestion(Laya.stage.width, Laya.stage.height - this.total_time_bar.height);
                    break;
                case "单选题":
                    this.sp_curr_question = new ChoiceQuestion(Laya.stage.width, Laya.stage.height - this.total_time_bar.height);
                    break;
                case "多选题":
                    this.sp_curr_question = new CheckQuestion(Laya.stage.width, Laya.stage.height - this.total_time_bar.height);
                    break;
            }
            this.sp_curr_question.on("NEXT_BTN_CLICK", this, this.nextBtnClickHandler);
            this.owner.addChild(this.sp_curr_question);
            this.sp_curr_question.drawBgColor();
        }
        nextBtnClickHandler(btn_label) {
            console.log("MainScene btn_label =", btn_label);
            if (btn_label == "下一题") {
                Bridge.curr_q_num++;
                this.changeQuestion(Bridge.curr_q_num);
            }
            else {
            }
        }
        timesUpHandler() {
            console.log("总时间到！");
        }
        onDisable() {
        }
    }

    class GameConfig {
        constructor() {
        }
        static init() {
            var reg = Laya.ClassUtils.regClass;
            reg("MainScene.ts", MainScene);
        }
    }
    GameConfig.width = 768;
    GameConfig.height = 1200;
    GameConfig.scaleMode = "showall";
    GameConfig.screenMode = "none";
    GameConfig.alignV = "middle";
    GameConfig.alignH = "center";
    GameConfig.startScene = "MainScene.scene";
    GameConfig.sceneRoot = "";
    GameConfig.debug = false;
    GameConfig.stat = false;
    GameConfig.physicsDebug = false;
    GameConfig.exportSceneToJson = true;
    GameConfig.init();

    class Main {
        constructor() {
            Config.isAntialias = true;
            if (window["Laya3D"])
                Laya3D.init(GameConfig.width, GameConfig.height);
            else
                Laya.init(GameConfig.width, GameConfig.height, Laya["WebGL"]);
            Laya["Physics"] && Laya["Physics"].enable();
            Laya["DebugPanel"] && Laya["DebugPanel"].enable();
            Laya.stage.scaleMode = GameConfig.scaleMode;
            Laya.stage.screenMode = GameConfig.screenMode;
            Laya.stage.alignV = GameConfig.alignV;
            Laya.stage.alignH = GameConfig.alignH;
            Laya.URL.exportSceneToJson = GameConfig.exportSceneToJson;
            if (GameConfig.debug || Laya.Utils.getQueryString("debug") == "true")
                Laya.enableDebugPanel();
            if (GameConfig.physicsDebug && Laya["PhysicsDebugDraw"])
                Laya["PhysicsDebugDraw"].enable();
            if (GameConfig.stat)
                Laya.Stat.show();
            Laya.alertGlobalError(true);
            Laya.ResourceVersion.enable("version.json", Laya.Handler.create(this, this.onVersionLoaded), Laya.ResourceVersion.FILENAME_VERSION);
        }
        onVersionLoaded() {
            Laya.AtlasInfoManager.enable("fileconfig.json", Laya.Handler.create(this, this.onConfigLoaded));
        }
        onConfigLoaded() {
            GameConfig.startScene && Laya.Scene.open(GameConfig.startScene);
            Laya.stage.bgColor = "#307177";
            Laya.stage.frameRate = "slow";
            Laya.MouseManager.multiTouchEnabled = false;
        }
        getUrlParam(name) {
            var query = window.location.search.substring(1);
            var param_arr = query.split("&");
            for (var i = 0; i < param_arr.length; i++) {
                var pair = param_arr[i].split("=");
                if (pair[0] == name) {
                    return pair[1];
                }
            }
            return (false);
        }
    }
    new Main();

}());
