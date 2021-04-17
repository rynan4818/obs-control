# obs-control

[Beat Saber Overlay 改良版](https://github.com/rynan4818/beat-saber-overlay)でOBSのシーンコントロールをする追加スクリプトです。

## 使用方法

 1. OBSにobs-websocketをインストールします

    配布サイト：https://github.com/Palakis/obs-websocket/releases

    から、最新のリリースの
    obs-websocket-*.*.*-Windows-Installer.exe  (*は最新バージョンを選択)
    をダウンロードしてインストールします

 2. OBSを起動して「ツール」の「Websocketサーバ設定」を開いて「WebSocketsサーバを有効にする」をチェックします。

    「認証を有効にする」をチェックすると、パスワード設定できますが
     その場合は後述する、本ツールのパスワード設定が必要です

 3. Beat Saber Overlay 改良版をインストールして使えるようにします
 
    配布サイト:https://github.com/rynan4818/beat-saber-overlay

    インストールと設定方法は上記サイトに詳細があります。
    
    オーバーレイ機能を使用しない場合は、OBS上でオーバーレイを非表示にしてください

    (例えば、他のDataPullerとかのオーバーレイを使用している場合など)
    
    非表示にしても、裏でOBSコントロール機能は動くでのOBSのどこかのシーンのソースにオーバーレイを設定する必要があります

 4. 3.でインストールしたオーバーレイのフォルダに、本ツールのファイルをコピーしてください。

    - 「js」フォルダに、obs-control.js と obs-websocket.js の２つ
    - インストールフォルダの index.htmlを本ツールの物に差し替え(上書き)

    本ツールは、Beat Saber Overlay 改良版の[Release v2021/02/22](https://github.com/rynan4818/beat-saber-overlay/releases/tag/v2021%2F02%2F22)を元にしています。

    オーバーレイがそれ以外のバージョンになっている場合、index.htmlを上書きするとおかしくなる場合があります。
    
    その場合は、インストールしたオーバーレイのindex.htmlをメモ帳で開いて、最後の方の

        <script src="./js/options.js"></script>

    の上の行に

        <script src='./js/obs-websocket.js'></script>
        <script src='./js/obs-control.js'></script>

    の２つを追加してください。

 5. オーバーレイの「js」フォルダにコピーした obs-control.js をメモ帳で開きます

    先頭の以下の7行の内容を必要に応じて変更します。

    デフォルト設定のまま使う場合は、メニューシーンのOBSのシーン名を `BS-Game` ゲームシーンのOBSのシーン名を `BS-Game` とします。

        const obs_address  = 'localhost:4444';   //基本的に変更不要
        const obs_password = '';                 //OBSにパスワード設定がある場合のみ設定
        const obs_start_scene_duration = 0;      //ゲームシーンに切り替える前に開始シーンを表示する時間(秒単位) [0の場合は開始シーンは無効になる]
        const obs_menu_scene_duration  = 0;      //メニューシーンに切替わる前に待機する時間(秒単位)
        const obs_start_scene_name = 'BS-Start'; //開始シーン名
        const obs_game_scene_name  = 'BS-Game';  //ゲームシーン名
        const obs_menu_scene_name  = 'BS-Menu';  //メニューシーン名

 6. あとは通常通りOBSで記録・配信すればＯＫです。

    BeatSaber起動直後のメニューシーン切り替えは発生しないので、手動でOBSのシーン名をメニューシーンにしておくか１度プレイすれば切り替わります。

## ライセンス

本ツールのライセンスはMITライセンスを適用します

本ツールに添付シている obs-websocket.js は以下の物を使用しています。

[obs-websocket-js](https://github.com/haganbmj/obs-websocket-js)

obs-websocket-jsのライセンスは以下になります。

[obs-websocket-js MIT License](https://github.com/haganbmj/obs-websocket-js/blob/master/LICENSE.md)
