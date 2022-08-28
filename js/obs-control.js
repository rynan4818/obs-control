const obs_game_scene_name  = 'BS-Game';        //ゲームシーン名
const obs_menu_scene_name  = 'BS-Menu';        //メニューシーン名
const obs_game_event_delay = 0;                //ゲームシーン開始タイミングを遅らせる場合に遅らせるミリ秒を設定して下さい。タイミングを早めること（マイナス値）はできません。[0の場合は無効]
const obs_menu_event_delay = 0;                //ゲームシーン終了(メニューに戻る)タイミングを遅らせる場合に遅らせるミリ秒を設定して下さい。タイミングを早めること（マイナス値）はできません。[0の場合は無効]
const obs_menu_event_switch = false;           //[true/false]ゲームシーン終了タイミングをfinish/failした瞬間に変更する場合は true にします。約3~4秒程度早まりますのでobs_menu_event_delayと合わせて終了タイミングの微調整に使えます。
const obs_start_scene_duration     = 0;              //ゲームシーンに切り替える前に開始シーンを表示する時間(秒単位[小数3位までOK]) [0の場合は無効]
const obs_start_scene_name         = 'BS-Start';     //開始シーン名  ※使用時はobs_start_scene_durationの設定要
const obs_finish_scene_duration    = 0;              //Finish(クリア)時にメニューシーンに切替わる前に終了シーンを表示する時間(秒単位[小数3位までOK]) [0の場合は無効]
const obs_finish_scene_name        = 'BS-Finish';    //Finish(クリア)用終了シーン名  ※使用時はobs_finish_scene_durationの設定要
const obs_fullcombo_scene_duration = 0;              //フルコンボクリア時にメニューシーンに切替わる前に終了シーンを表示する時間(秒単位[小数3位までOK]) [0の場合は無効]
const obs_fullcombo_scene_name     = 'BS-FullCombo'; //フルコンボクリア用終了シーン名  ※使用時はobs_fullcombo_scene_durationの設定要
const obs_fail_scene_duration      = 0;              //Fail(フェイル)時にメニューシーンに切替わる前に終了シーンを表示する時間(秒単位[小数3位までOK]) [0の場合は無効]
const obs_fail_scene_name          = 'BS-Fail';      //Fail(フェイル)用終了シーン名  ※使用時はobs_fail_scene_durationの設定要
const obs_pause_scene_duration     = 0;              //Pause(ポーズ)してメニューに戻る場合にメニューシーンに切替わる前に終了シーンを表示する時間(秒単位[小数3位までOK]) [0の場合は無効]
const obs_pause_scene_name         = 'BS-Pause';     //Pause(ポーズ)用終了シーン名  ※使用時はobs_pause_scene_durationの設定要
const obs_recording_check          = false;          //[true/false]trueにするとゲームシーン開始時に録画状態をチェックする。
const obs_not_rec_sound            = 'file:///C://Windows//Media//Windows%20Notify%20Calendar.wav' //ゲームシーン開始時に録画されていない場合に鳴らす音(適当な音声ファイルをブラウザに貼り付けて、アドレス欄のURLをコピーする)
const obs_option1_scene_name = 'BS-Option1';   //HttpPlayButtonStatus の "Option Scene 1"ボタンシーン名
const obs_option2_scene_name = 'BS-Option2';   //HttpPlayButtonStatus の "Option Scene 2"ボタンシーン名
const obs_option3_scene_name = 'BS-Option3';   //HttpPlayButtonStatus の "Option Scene 3"ボタンシーン名

let obs_browser_check = false;
let obs_now_scene;
let obs_bs_menu_flag = true;
let obs_end_event = '';
let obs_timeout_id;
let obs_full_combo = true;
let obs_scene_change_enable = true;
let song_scene_list = false;
let song_scene_next_time = false;
let song_scene_next_name = "";
let song_scene_time_index = 0;
let song_scene_time_list = false;
let song_scene_start_change = true;
let song_scene_end_change = true;
let song_scene_game_name = false;
let song_scene_start_name = false;
let song_scene_start_duration = false;
let song_scene_menu_name = false;
let song_scene_end_name = false;
let song_scene_end_duration = false;
const obs_not_rec_audio = new Audio(obs_not_rec_sound);

// obs-browser Documents : https://github.com/obsproject/obs-browser
if (window.obsstudio) {
	window.obsstudio.getControlLevel(function (level) {
    //Level - The level of permissions. 0 for NONE, 1 for READ_OBS (OBS data), 2 for READ_USER (User data), 3 for BASIC, 4 for ADVANCED and 5 for ALL
    if (level >= 4) {
      obs_browser_check = true;
    } else {
      console.log("Webpage control permissions are missing");
      var element = document.createElement("div") ;
      element.innerHTML = "Webpage control permissions are missing. <br>Please change to ADVANCED or higher.<br><br>ブラウザソースのプロパティでページ権限が不足しています。<br>OBSへの高度なアクセス以上に設定して下さい。";
      element.style = "display: block;font-size: 20px;font-weight: 700;line-height: 41px; letter-spacing: 2px; margin: 0 0 0 10px; color: red";
      document.body.appendChild(element);
    }
  });
} else {
	console.log("!Not OBS Studio!");
  var element = document.createElement("div") ;
  element.innerHTML = "!Not OBS Studio!";
  element.style = "display: block;font-size: 34px;font-weight: 700;line-height: 41px; letter-spacing: 2px; margin: 5px 0 0 20px; color: red";
  document.body.appendChild(element);
}

function obs_rec_check() {
  if (!obs_recording_check) return;
  if (!obs_browser_check) return;
	window.obsstudio.getStatus(function (status) {
		//status -> {recording: false, recordingPaused: false, replaybuffer: false, streaming: false, virtualcam: false}
    if (!status.recording || status.recordingPaused){
      obs_not_rec_audio.play();
    }
	});
}

function obs_scene_change(scene_name) {
  if (!obs_browser_check) return;
  if (scene_name != obs_now_scene) {
    window.obsstudio.setCurrentScene(scene_name);
  }
  obs_now_scene = scene_name;
}

function obs_menu_scene_change() {
  let menu_scene_name = obs_menu_scene_name;
  if (song_scene_menu_name !== false) menu_scene_name = song_scene_menu_name;
  obs_scene_change(menu_scene_name);
}

function obs_game_scene_change() {
  let game_scene_name = obs_game_scene_name;
  if (song_scene_game_name !== false) game_scene_name = song_scene_game_name;
  obs_scene_change(game_scene_name);
}

function obs_start_scene_change() {
  let start_scene_duration = obs_start_scene_duration;
  let start_scene_name = obs_start_scene_name;
  let game_scene_name = obs_game_scene_name;
  if (song_scene_start_duration !== false) start_scene_duration = song_scene_start_duration;
  if (song_scene_start_name !== false) start_scene_name = song_scene_start_name;
  if (song_scene_game_name !== false) game_scene_name = song_scene_game_name;
  
  if (start_scene_duration > 0) {
    obs_scene_change(start_scene_name);
    obs_timeout_id = setTimeout(obs_game_scene_change, start_scene_duration * 1000);
  } else {
    obs_scene_change(game_scene_name);
  }
}

if (typeof song_scene_json !== "undefined"){
  song_scene_list = JSON.parse(song_scene_json);
}

function song_scene_check(songHash, songName) {
  if (song_scene_list === false) return;
  song_scene_next_time = false;
  song_scene_next_name = "";
  song_scene_time_index = 0;
  song_scene_time_list = false;
  song_scene_start_change = true;
  song_scene_end_change = true;
  song_scene_game_name = false;
  song_scene_start_name = false;
  song_scene_start_duration = false;
  song_scene_menu_name = false;
  song_scene_end_name = false;
  song_scene_end_duration = false;
  for(let i = 0; i < song_scene_list.length; i++){
    let song_scene_check_string;
    let now_song_string;
    if (typeof song_scene_list[i].hash !== "undefined" && typeof songHash !== "undefined" && songHash !== null){
      song_scene_check_string = song_scene_list[i].hash.toUpperCase();
      now_song_string = songHash.toUpperCase();
    } else {
      if (typeof song_scene_list[i].songname !== "undefined" && typeof songName != "undefined"){
        song_scene_check_string = song_scene_list[i].songname;
        now_song_string = songName;
      } else {
        continue;
      }
    }
    if (now_song_string === song_scene_check_string){
      if (typeof song_scene_list[i].timelist !== "undefined") song_scene_time_list = song_scene_list[i].timelist;
      if (typeof song_scene_list[i].startchange !== "undefined") song_scene_start_change = song_scene_list[i].startchange;
      if (typeof song_scene_list[i].endchange !== "undefined") song_scene_end_change = song_scene_list[i].endchange;
      if (typeof song_scene_list[i].gamescene !== "undefined") song_scene_game_name = song_scene_list[i].gamescene;
      if (typeof song_scene_list[i].startscene !== "undefined") song_scene_start_name = song_scene_list[i].startscene;
      if (typeof song_scene_list[i].startduration !== "undefined") song_scene_start_duration = song_scene_list[i].startduration;
      if (typeof song_scene_list[i].menuscene !== "undefined") song_scene_menu_name = song_scene_list[i].menuscene;
      if (typeof song_scene_list[i].endscene !== "undefined") song_scene_end_name = song_scene_list[i].endscene;
      if (typeof song_scene_list[i].endduration !== "undefined") song_scene_end_duration = song_scene_list[i].endduration;
      song_scene_next();
      return;
    }
  }
}

function time_msce_cnv(str) {
  let sec = 0;
  let msec = 0;
  let min = str.split(':', 2)
  if (typeof min[1] !== 'undefined') {
    sec = min[1].split('.', 2)
    if (typeof sec[1] !== 'undefined') {
      msec = parseInt(sec[1], 10);
    }
    sec = parseInt(sec[0], 10) * 1000;
  }
  min = parseInt(min[0], 10) * 60 * 1000;
  return min + sec + msec;
}

function song_scene_next(){
  if (song_scene_time_list === false) return;
  let next_scene = song_scene_time_list[song_scene_time_index];
  if (typeof next_scene === "undefined"){
    song_scene_next_time = false;
    song_scene_next_name = "";
  } else {
    song_scene_next_time = time_msce_cnv(next_scene.time);
    song_scene_next_name = next_scene.scene;
  }
  ++song_scene_time_index;
}

ex_timer_update.push((time, delta, progress, percentage) => {
  if (song_scene_time_list === false) return;
  if (song_scene_next_time === false) return;
  if (delta >= song_scene_next_time){
    obs_scene_change(song_scene_next_name);
    song_scene_next();
  }
});

function obs_playStart_event2(){
  obs_rec_check();
  if (song_scene_start_change) {
    if (obs_game_event_delay > 0) {
      obs_timeout_id = setTimeout(obs_start_scene_change, obs_game_event_delay);
    } else {
      obs_start_scene_change();
    }
  }
}

function obs_playStart_event(songHash, songName, delay = 0) {
  if (!obs_scene_change_enable) return;
  obs_end_event = '';
  obs_full_combo = true;
  if (obs_bs_menu_flag) {
    clearTimeout(obs_timeout_id);
    obs_bs_menu_flag = false;
    song_scene_check(songHash, songName);
    if (typeof delay === "undefined") delay = 0;
    if (delay > 0){
      obs_timeout_id = setTimeout(obs_playStart_event2, delay * 1000);
    } else{
      obs_playStart_event2()
    }
  }
}

ex_songStart.push((data) => {
  obs_playStart_event(data.status.beatmap.songHash, data.status.beatmap.songName);
});

ex_other.push((data) => {
  if (typeof data.other !== "undefined") {
    if (typeof data.other.HttpPlayButtonStatus !== "undefined") {
      if (typeof data.other.HttpPlayButtonStatus.OptionScene === "undefined"){
        if (typeof data.other.HttpPlayButtonStatus.SceneChange !== "undefined") obs_scene_change_enable = data.other.HttpPlayButtonStatus.SceneChange;
        if (typeof data.other.HttpPlayButtonStatus.PlayStart !== "undefined" && data.other.HttpPlayButtonStatus.PlayStart) {
          obs_playStart_event(data.other.HttpPlayButtonStatus.SongHash, data.other.HttpPlayButtonStatus.SongName, data.other.HttpPlayButtonStatus.PlayButtonDelay);
        }
        if (typeof data.other.HttpPlayButtonStatus.MenuScene !== "undefined" && data.other.HttpPlayButtonStatus.MenuScene){
          obs_menu_event();
        }
      } else {
        switch (data.other.HttpPlayButtonStatus.OptionScene) {
          case 0:
            obs_scene_change(obs_menu_scene_name);
            break;
          case 1:
            obs_scene_change(obs_option1_scene_name);
            break;
          case 2:
            obs_scene_change(obs_option2_scene_name);
            break;
          case 3:
            obs_scene_change(obs_option3_scene_name);
            break;
        }
      }
    }
  }
});

function obs_end_scene_change() {
  let obs_end_scene_duration = 0;
  if (song_scene_end_name !== false && song_scene_end_duration !== false){
    if (song_scene_end_duration > 0) obs_scene_change(song_scene_end_name);
    obs_end_scene_duration = song_scene_end_duration;
  } else {
    switch (obs_end_event) {
      case 'fullcombo':
        obs_end_scene_duration = obs_fullcombo_scene_duration;
        if (obs_end_scene_duration > 0) obs_scene_change(obs_fullcombo_scene_name);
        break;
      case 'finish':
        obs_end_scene_duration = obs_finish_scene_duration;
        if (obs_end_scene_duration > 0) obs_scene_change(obs_finish_scene_name);
        break;
      case 'fail':
        obs_end_scene_duration = obs_fail_scene_duration;
        if (obs_end_scene_duration > 0) obs_scene_change(obs_fail_scene_name);
        break;
      case 'pause':
        obs_end_scene_duration = obs_pause_scene_duration;
        if (obs_end_scene_duration > 0) obs_scene_change(obs_pause_scene_name);
    }
  }
  let menu_scene_name = obs_menu_scene_name;
  if (song_scene_menu_name !== false) menu_scene_name = song_scene_menu_name;
  if (obs_end_scene_duration > 0) {
    obs_timeout_id = setTimeout(obs_menu_scene_change, obs_end_scene_duration * 1000);
  } else {
    obs_scene_change(menu_scene_name);
  }
}

function obs_menu_event() {
  if (!obs_scene_change_enable) return;
  if (!obs_bs_menu_flag) {
    clearTimeout(obs_timeout_id);
    obs_bs_menu_flag = true;
    if (song_scene_end_change){
      if (obs_menu_event_delay > 0) {
        obs_timeout_id = setTimeout(obs_end_scene_change, obs_menu_event_delay);
      } else {
        obs_end_scene_change();
      }
    }
  }
}

ex_menu.push((data) => {
  obs_menu_event();
});

ex_finished.push((data) => {
  if (obs_full_combo && data.status.performance.passedNotes === data.status.performance.combo) {
    obs_end_event = 'fullcombo';
  } else {
    obs_end_event = 'finish';
  }
  if (obs_menu_event_switch) obs_menu_event();
});

ex_failed.push((data) => {
  obs_end_event = 'fail';
  if (obs_menu_event_switch) obs_menu_event();
});

ex_pause.push((data) => {
  obs_end_event = 'pause';
});

ex_resume.push((data) => {
  obs_end_event = '';
});

ex_hello.push((data) => {
  obs_end_event = '';
  if (data.status.beatmap && data.status.performance) {
    obs_timeout_id = setTimeout(obs_game_scene_change, 3000);
  } else {
    obs_timeout_id = setTimeout(obs_menu_scene_change, 3000);
  }
});

ex_bombCut.push((data) => {
  obs_full_combo = false;
});

ex_obstacleEnter.push((data) => {
  obs_full_combo = false;
});
