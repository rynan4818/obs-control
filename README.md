# obs-control

[Beat Saber Overlay 改良版](https://github.com/rynan4818/beat-saber-overlay)でOBS Studioのシーンコントロールをする追加スクリプトです。

メニュー画面とゲームプレイ画面の枠（カメラ枠とか)を変更したり、画面切替時にトランジションを入れたり、開始や終了時などイベント毎に中間のシーンで違った動画を再生したりできます。

シーン切替を使用しない場合も、BeatSaberプレイ時のOBSのシーンをゲームシーン名、メニューシーン名に設定しておくことでシーン切替忘れ防止になります。

また、録画忘れ防止機能として、録画ボタンを押さないで譜面のプレイ開始をすると警告音が鳴る機能もあります。

[サンプル動画](https://twitter.com/rynan4818/status/1383422547090284550)

※[Streamlabs OBS版はこちら](https://github.com/rynan4818/Streamlabs-obs-control)

※[XSplit Broadcaster用の同様ツールはこちら](https://github.com/rynan4818/BS-AutoSceneChanger)

## 使用方法

 1. OBS Studioにobs-websocketをインストールします

    配布サイト：https://github.com/Palakis/obs-websocket/releases

    から、最新のリリースの
    obs-websocket-＊.＊.＊-Windows-Installer.exe  (*は最新バージョンを選択)
    をダウンロードしてインストールします

 2. OBS Studioを起動してメニューの`ツール`にある`Websocketサーバ設定`を開いて`WebSocketsサーバを有効にする`をチェックします。また、サーバーポートが`4444`になっているか確認します。(4444と違う場合は、4444に修正するか後述する本ツールの設定でポート番号を指定します。)

    `認証を有効にする`をチェックすると、パスワード設定できますが
     その場合は後述する、本ツールのパスワード設定が必要です

    ![preview](https://rynan4818.github.io/obs-control1.png)

 3. Beat Saber Overlay 改良版をインストールして使えるようにします
 
    配布サイト:https://github.com/rynan4818/beat-saber-overlay

    インストールと設定方法は上記サイトに詳細があります。
    
    オーバーレイ機能を使用しない場合は、OBS Studio上でオーバーレイを非表示にしてください

    (例えば、他のDataPullerとかのオーバーレイを使用している場合など)
    
    非表示にしても、裏でOBSコントロール機能は動くのでOBS Studioのどこかのシーンのソースにオーバーレイを設定する必要があります

    **注意点として `表示されていないときにソースをシャットダウン` と `シーンがアクティブになったときにブラウザの表示を更新` の２つはチェックしないで下さい**

    ![preview](https://rynan4818.github.io/obs-control2.png)

 4. 本ツールの[リリースページ](https://github.com/rynan4818/obs-control/releases)から最新リリースをダウンロードします。

 5. 3.でインストールしたオーバーレイのフォルダに、本ツールのファイルをコピーしてください。

    - `js` フォルダに、`obs-control.js` と `obs-websocket.js` の２つ
    - インストールフォルダの `index.html` を本ツールの物に差し替え(上書き)

    本ツールは、Beat Saber Overlay 改良版の[Release v2021/05/09](https://github.com/rynan4818/beat-saber-overlay/releases/tag/v2021%2F05%2F09)～[Release v2021/08/09](https://github.com/rynan4818/beat-saber-overlay/releases/tag/v2021%2F08%2F09)を元にしています。

    オーバーレイがそれ以外のバージョンになっている場合、`index.html` を上書きするとおかしくなる場合があります。
    
    その場合は、インストールしたオーバーレイの `index.html` をメモ帳で開いて、最後の方の

        <script src="./js/options.js"></script>

    の上の行に

        <script src='./js/obs-websocket.js'></script>
        <script src='./js/obs-control.js'></script>

    の２つを追加してください。

 6. オーバーレイの `js` フォルダにコピーした `obs-control.js` をメモ帳で開きます

    行頭が `const obs_` で始まる内容は必要に応じて変更します。

    デフォルト設定のまま使う場合は、メニューシーンのOBS Studioのシーン名を `BS-Game` ゲームシーンのシーン名を `BS-Menu` とします。
    
    シーン切り替え機能を使用せず、録画状態チェックのみ使用する場合は `obs_game_scene_name` と `obs_menu_scene_name` を普段BeatSaberで使用するシーン名にして、`obs_recording_check`を`true`にしてください。シーン切り替え忘れ防止、録画忘れ防止になります。

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

 7. あとは通常通りOBS Studioで記録・配信すればＯＫです。

## ライセンス

本ツールのライセンスは[MITライセンス](https://github.com/rynan4818/obs-control/blob/main/LICENSE)を適用します

本ツールに添付している `obs-websocket.js` は以下の物を使用しています。

[obs-websocket-js](https://github.com/haganbmj/obs-websocket-js)

obs-websocket-jsのライセンスは以下になります。

[obs-websocket-js MIT License](https://github.com/haganbmj/obs-websocket-js/blob/master/LICENSE.md)
