const obs_address  = 'localhost:4444';   //基本的に変更不要
const obs_password = '';                 //OBSにパスワード設定がある場合のみ設定
const obs_start_scene_duration = 0;      //ゲームシーンに切り替える前に開始シーンを表示する時間(秒単位) [0の場合は開始シーンは無効になる]
const obs_menu_scene_duration  = 0;      //メニューシーンに切替わる前に待機する時間(秒単位)
const obs_start_scene_name = 'BS-Start'; //開始シーン名
const obs_game_scene_name  = 'BS-Game';  //ゲームシーン名
const obs_menu_scene_name  = 'BS-Menu';  //メニューシーン名

const obs = new OBSWebSocket();
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

// You must add this handler to avoid uncaught exceptions.
obs.on('error', err => {
    console.error('socket error:', err);
});

function obs_start_scene_change() {
	obs.send('SetCurrentScene', {
	    'scene-name': obs_start_scene_name
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
	if (obs_start_scene_duration > 0) {
		obs_start_scene_change();
		setTimeout(obs_game_scene_change, obs_start_scene_duration * 1000);
	} else {
		obs_game_scene_change();
	}
}

function op_menu(data) {
	setTimeout(obs_menu_scene_change, obs_menu_scene_duration * 1000);
}
