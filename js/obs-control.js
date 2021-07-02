const obs_address  = 'localhost:4444';         //基本的に変更不要
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

let now_scene;
let bs_menu_flag = true;
let end_event = '';
let obs;
const not_rec_audio = new Audio(obs_not_rec_sound);

function obs_connect() {
    obs = new OBSWebSocket();
    obs.connect({
            address: obs_address,
            password: obs_password
        })
        .then(() => {
            console.log(`Success! We're connected & authenticated.`);
                    obs.send('GetCurrentScene').then((data) => {
                        now_scene = data.name;
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

function recording_check() {
    if (!obs_recording_check) return;
    obs.send('GetRecordingStatus').then((data) => {
        if (!data.isRecording || data.isRecordingPaused) not_rec_audio.play();
    });
}

function scene_change(name) {
    if (name != now_scene) {
        obs.send('SetCurrentScene', {
                'scene-name': name
        });
    }
    now_scene = name;
}

function menu_scene_change() {
    scene_change(obs_menu_scene_name);
}

function game_scene_change() {
    scene_change(obs_game_scene_name);
}

function start_scene_change() {
  if (obs_start_scene_duration > 0) {
        scene_change(obs_start_scene_name);
    setTimeout(game_scene_change, obs_start_scene_duration * 1000);
  } else {
    scene_change(obs_game_scene_name);
  }
}

ex_songStart.push((data) => {
    end_event = '';
    if (bs_menu_flag) {
        recording_check()
        if (obs_game_event_delay > 0) {
            setTimeout(start_scene_change, obs_game_event_delay);
        } else {
            start_scene_change();
        }
    }
    bs_menu_flag = false;
});

function end_scene_change() {
  let end_scene_duration = 0;
  switch (end_event) {
    case 'fullcombo':
      end_scene_duration = obs_fullcombo_scene_duration;
      if (end_scene_duration > 0) scene_change(obs_fullcombo_scene_name);
      break;
    case 'finish':
      end_scene_duration = obs_finish_scene_duration;
      if (end_scene_duration > 0) scene_change(obs_finish_scene_name);
      break;
    case 'fail':
      end_scene_duration = obs_fail_scene_duration;
      if (end_scene_duration > 0) scene_change(obs_fail_scene_name);
      break;
    case 'pause':
      end_scene_duration = obs_pause_scene_duration;
      if (end_scene_duration > 0) scene_change(obs_pause_scene_name);
  }
  if (end_scene_duration > 0) {
    setTimeout(menu_scene_change, end_scene_duration * 1000);
  } else {
    scene_change(obs_menu_scene_name);
  }
}

function menu_event() {
  if (!bs_menu_flag) {
    if (obs_menu_event_delay > 0) {
      setTimeout(end_scene_change, obs_menu_event_delay);
    } else {
      end_scene_change();
    }
  }
  bs_menu_flag = true;
}

ex_menu.push((data) => {
    menu_event();
});

ex_finished.push((data) => {
    if (data.status.performance.passedNotes === data.status.performance.combo) {
        end_event = 'fullcombo';
    } else {
        end_event = 'finish';
    }
    if (obs_menu_event_switch) menu_event();
});

ex_failed.push((data) => {
    end_event = 'fail';
    if (obs_menu_event_switch) menu_event();
});

ex_pause.push((data) => {
    end_event = 'pause';
});

ex_resume.push((data) => {
    end_event = '';
});

ex_hello.push((data) => {
    end_event = '';
    if (data.status.beatmap && data.status.performance) {
        setTimeout(game_scene_change, 3000);
    } else {
        setTimeout(menu_scene_change, 3000);
    }
});
