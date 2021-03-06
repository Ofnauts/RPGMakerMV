//========================================
// TF_TextWindowMenu.js
// Version :0.4.0.0
// For : RPGツクールMV (RPG Maker MV)
// -----------------------------------------------
// Copyright : Tobishima-Factory 2020
// Website : http://tonbi.jp
//
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
//========================================
/**
 * 
 */
/*:ja
 * @plugindesc タイトルにテキストウィンドウ表示メニューを追加。
 * @author とんび@鳶嶋工房
 *
 * @param windowParams
 * @desc メニューとウィンドウの設定。
 * @type struct<WindowParamJa>[]
 * @default ["{\"menuLabel\":\"著作・製作\",\"lines\":\"12\",\"contents\":\"\\\"\\\\\\\\}(c)KADOKAWA CORPORATION\\\\\\\\{\\\"\"}"]
 *
 * @param isAnimate
 * @desc 開閉アニメーションをするか。
 * @type boolean
 * @default true
 * 
 * @help
 * タイトル画面への著作権情報や操作説明の追加を想定したプラグインです。
 * 
 * windowParams パラメータ1行につき1メニューがタイトル画面に追加されます。
 * そのメニューを選択すると、ウィンドウが1枚開きます。
 * 
 * ウィンドウの行数は lines パラメータで指定します。
 * 
 * contents パラメータを入力する際はコンテクストメニュー(右クリック)の
 * [アイコンセットビューア]を利用して \I[n] の n の数値を入力できます。
 * その他、メッセージと同じ制御文字が使えますので、ご活用ください。
 *
 * 利用規約 : MITライセンス
 */
/*~struct~WindowParamJa:
 *
 * @param menuLabel
 * @desc タイトル画面でのメニュー名。
 * @type string
 * @default 著作・製作
 *
 * @param lines
 * @desc ウィンドウの行数。
 * @type number
 * @default 12
 *
 * @param contents
 * @desc ウィンドウに表示する内容(制御文字が使えます)
 * @type note
 * @default "\\}(c)KADOKAWA CORPORATION\\{"
 */
( function() {
	'use strict';
	const TF_OPEN_WINDOW_COMMAND = 'TF_OPEN_WINDOW_COMMAND';
	const TRIGGER_OK = 'ok';
	const TRIGGER_CANCEL = 'cancel';

    /**
     * パラメータを受け取る
     */
	const pluginParams = PluginManager.parameters( 'TF_TextWindowMenu' );

	const TF = JSON.parse( JSON.stringify(
		pluginParams,
		( key, value ) => {
			try { return JSON.parse( value ); } catch( e ) { }
			return value;
		}
	) );
	TF.topRows = null;
	TF.itemIndex = null;

	/*---- Window_TitleCommand ----*/
	/**
	 * タイトルのメニューにコマンドを追加。
	 */
	const _Window_TitleCommand_makeCommandList = Window_TitleCommand.prototype.makeCommandList;
	Window_TitleCommand.prototype.makeCommandList = function() {
		_Window_TitleCommand_makeCommandList.call( this );

		TF.topRows = this.maxItems();
		TF.windowParams.forEach( e => this.addCommand( e.menuLabel, TF_OPEN_WINDOW_COMMAND ) );
	};
	// 選択中の項目を記録
	const _Window_TitleCommand_processOk = Window_TitleCommand.prototype.processOk;
	Window_TitleCommand.prototype.processOk = function() {
		_Window_TitleCommand_processOk.call( this );
		TF.itemIndex = this.index();
	};

	const _Window_TitleCommand_selectLast = Window_TitleCommand.prototype.selectLast;
	Window_TitleCommand.prototype.selectLast = function() {
		if( TF.itemIndex ) {
			this.select( TF.itemIndex );
		} else {
			_Window_TitleCommand_selectLast.call( this );
		}
	};

	/*---- Scene_Title ----*/
	/**
	 * コマンドハンドラを追加。
	 */
	const _Scene_Title_createCommandWindow = Scene_Title.prototype.createCommandWindow;
	Scene_Title.prototype.createCommandWindow = function() {
		_Scene_Title_createCommandWindow.call( this );

		this._commandWindow.setHandler( TF_OPEN_WINDOW_COMMAND, () => {
			this._commandWindow.close();
			SceneManager.push( Scene_TF_SingleWindow );
		} );
	};

	/*---- Scene_TF_SingleWindow ----*/
	class Scene_TF_SingleWindow extends Scene_MenuBase {
		create() {
			super.create();

			const lines = parseInt( TF.windowParams[ TF.itemIndex - TF.topRows ].lines, 10 );
			this._singleWindow = new Window_Help( lines );
			this.addWindow( this._singleWindow );
			this._singleWindow.y = ( Graphics.boxHeight - this._singleWindow.height ) / 2;
			this._singleWindow.pause = true;

			if( TF.isAnimate ) {
				this._singleWindow.openness = 0;
				this._singleWindow.open();
			}
		}

		getTriggerType() {
			if( TouchInput.isTriggered() || Input.isTriggered( TRIGGER_OK ) ) return TRIGGER_OK;
			if( TouchInput.isCancelled() || Input.isTriggered( TRIGGER_CANCEL ) ) return TRIGGER_CANCEL;
			return '';
		}

		exitScene( triggerType ) {
			if( triggerType === '' ) return;

			if( triggerType == TRIGGER_OK ) {
				SoundManager.playOk();
			} else {
				SoundManager.playCancel();
			}

			if( TF.isAnimate ) {
				this._singleWindow.close();
			} else {
				SceneManager.pop();
			}
		}

		setContents() {
			if( this._singleWindow._text ) return;
			this._singleWindow.setText( TF.windowParams[ TF.itemIndex - TF.topRows ].contents );
		}

		update() {
			super.update();

			if( this._singleWindow.isOpen() ) {
				this.setContents();
				// 入力のチェック(Window_Help は addHandler を持たないので)
				this.exitScene( this.getTriggerType() );
			} else if( this._singleWindow.isClosed() ) {
				SceneManager.pop();
			}
		}
	}

} )();
