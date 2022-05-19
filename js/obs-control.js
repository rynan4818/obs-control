const obs_address  = '127.0.0.1:4444';         //基本的に変更不要
const obs_password = '';                       //OBSにパスワード設定がある場合のみ設定
const obs_game_scene_name  = 'BS-Game';        //ゲームシーン名
const obs_menu_scene_name  = 'BS-Menu';        //メニューシーン名
const obs_game_event_delay = 0;                //ゲームシーン開始タイミングを遅らせる場合に遅らせるミリ秒を設定して下さい。タイミングを早めること（マイナス値）はできません。[0の場合は無効]
const obs_menu_event_delay = 0;                //ゲームシーン終了(メニューに戻る)タイミングを遅らせる場合に遅らせるミリ秒を設定して下さい。タイミングを早めること（マイナス値）はできません。[0の場合は無効]
const obs_menu_event_switch = false;           //[true/false]ゲームシーン終了タイミングをfinish/failした瞬間に変更する場合は true にします。約1秒程度早まりますのでobs_menu_event_delayと合わせて終了タイミングの微調整に使えます。
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

let obs_now_scene;
let obs_bs_menu_flag = true;
let obs_end_event = '';
let obs;
let obs_timeout_id;
let obs_full_combo = true;
let song_scene_list = false;
let song_scene = false;
let song_scene_next_time = false;
let song_scene_next_name = "";
let song_scene_start_change = true;
let song_scene_end_change = true;
const obs_not_rec_audio = new Audio(obs_not_rec_sound);

function obs_connect() {
  obs = new OBSWebSocket();
  obs.connect({
    address: obs_address,
    password: obs_password
  })
  .then(() => {
    console.log(`Success! We're connected & authenticated.`);
      obs.send('GetCurrentScene').then((data) => {
        obs_now_scene = data.name;
      });
    return;
  })
  .catch(err => { // Promise convention dicates you have a catch on every chain.
    console.log(err);
  });

  obs.on('ConnectionClosed', (data) => {
    setTimeout(() => {
      obs_connect();
    }, 3000);
  });

  // You must add this handler to avoid uncaught exceptions.
  obs.on('error', err => {
    console.error('socket error:', err);
  });
}

obs_connect();

function obs_rec_check() {
  if (!obs_recording_check) return;
  obs.send('GetRecordingStatus').then((data) => {
    if (!data.isRecording || data.isRecordingPaused) obs_not_rec_audio.play();
  });
}

function obs_scene_change(scene_name) {
  if (scene_name != obs_now_scene) {
    obs.send('SetCurrentScene', {
      'scene-name': scene_name
    });
  }
  obs_now_scene = scene_name;
}

function obs_menu_scene_change() {
  obs_scene_change(obs_menu_scene_name);
}

function obs_game_scene_change() {
  obs_scene_change(obs_game_scene_name);
}

function obs_start_scene_change() {
  if (obs_start_scene_duration > 0) {
    obs_scene_change(obs_start_scene_name);
    obs_timeout_id = setTimeout(obs_game_scene_change, obs_start_scene_duration * 1000);
  } else {
    obs_scene_change(obs_game_scene_name);
  }
}

if (typeof song_scene_json !== "undefined"){
  song_scene_list = JSON.parse(song_scene_json);
}

function song_scene_check(data) {
  if (song_scene_list === false) return;
  for(let i = 0; i < song_scene_list.length; i++){
    if (data.status.beatmap.songHash.toUpperCase() === song_scene_list[i].hash.toUpperCase()){
      song_scene = song_scene_list[i].timelist;
      song_scene_start_change = song_scene_list[i].startchange;
      song_scene_end_change = song_scene_list[i].endchange;
      song_scene_next();
      return;
    }
  }
  song_scene_start_change = true;
  song_scene_end_change = true;
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
  let next_scene = song_scene.shift();
  if (typeof next_scene === "undefined"){
    song_scene_next_time = false;
    song_scene_next_name = "";
  } else {
    song_scene_next_time = time_msce_cnv(next_scene.time);
    song_scene_next_name = next_scene.scene;
  }
}

ex_timer_update.push((time, delta, progress, percentage) => {
  if (song_scene === false) return;
  if (song_scene_next_time === false) return;
  if (delta >= song_scene_next_time){
    obs_scene_change(song_scene_next_name);
    song_scene_next();
  }
});

ex_songStart.push((data) => {
  obs_end_event = '';
  obs_full_combo = true;
  if (obs_bs_menu_flag) {
    clearTimeout(obs_timeout_id);
    obs_bs_menu_flag = false;
    obs_rec_check();
    song_scene_check(data);
  if (song_scene_start_change) {
      if (obs_game_event_delay > 0) {
        obs_timeout_id = setTimeout(obs_start_scene_change, obs_game_event_delay);
      } else {
        obs_start_scene_change();
      }
    }
  }
});

function obs_end_scene_change() {
  let obs_end_scene_duration = 0;
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
  if (obs_end_scene_duration > 0) {
    obs_timeout_id = setTimeout(obs_menu_scene_change, obs_end_scene_duration * 1000);
  } else {
    obs_scene_change(obs_menu_scene_name);
  }
}

function obs_menu_event() {
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
