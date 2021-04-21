const obs_address  = 'localhost:4444';   //基本的に変更不要
const obs_password = '';                 //OBSにパスワード設定がある場合のみ設定
const obs_game_scene_name  = 'BS-Game';  //ゲームシーン名
const obs_menu_scene_name  = 'BS-Menu';  //メニューシーン名
const obs_start_scene_duration = 0;          //ゲームシーンに切り替える前に開始シーンを表示する時間(秒単位) [0の場合は開始シーンは無効になる]
const obs_start_scene_name     = 'BS-Start'; //開始シーン名  ※使用時はobs_start_scene_durationの設定要
const obs_end_scene_duration   = 0;          //メニューシーンに切替わる前に終了シーンを表示する時間(秒単位) [0の場合は終了シーンは無効になる]
const obs_end_scene_name       = 'BS-End';   //終了シーン名  ※使用時はobs_end_scene_durationの設定要

var bs_menu_flag = true;
var obs;

function obs_connect() {
	obs = new OBSWebSocket();
	obs.connect({
	        address: obs_address,
	        password: obs_password
	    })
	    .then(() => {
	        console.log(`Success! We're connected & authenticated.`);

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

function obs_start_scene_change() {
	obs.send('SetCurrentScene', {
	    'scene-name': obs_start_scene_name
	});
}

function obs_end_scene_change() {
	obs.send('SetCurrentScene', {
	    'scene-name': obs_end_scene_name
	});
}

function obs_game_scene_change() {
	obs.send('SetCurrentScene', {
	    'scene-name': obs_game_scene_name
	});
}

function obs_menu_scene_change() {
	obs.send('SetCurrentScene', {
	    'scene-name': obs_menu_scene_name
	});
}

function op_songStart(data) {
	if (bs_menu_flag) {
		if (obs_start_scene_duration > 0) {
			obs_start_scene_change();
			setTimeout(obs_game_scene_change, obs_start_scene_duration * 1000);
		} else {
			obs_game_scene_change();
		}
	}
	bs_menu_flag = false;
}

function op_menu(data) {
	if (!bs_menu_flag) {
		if (obs_end_scene_duration > 0) {
			obs_end_scene_change();
			setTimeout(obs_menu_scene_change, obs_end_scene_duration * 1000);
		} else {
			obs_menu_scene_change();
		}
	}
	bs_menu_flag = true;
}
