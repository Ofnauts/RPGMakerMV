//========================================
// TF_Utility.js
// Version :0.7.0.0
// For : RPGツクールMV (RPG Maker MV)
// -----------------------------------------------
// Copyright : Tobishima-Factory 2019-2020
// Website : http://tonbi.jp
//
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
//========================================
/*:ja
 * @plugindesc [スクリプト]から使いやすいコマンド集
 * @author とんび@鳶嶋工房
 * 
 * @help
 * イベントコマンドの[スクリプト]から使いやすいようにラッピング。
 * TkoolMV_PluginCommandBook.js 必須。
 */

( function() {
	'use strict';
	const PARAM_TRUE = 'true';

	// 画面周り
	const SCREEN_WIDTH = 1280;
	const SCREEN_HEIGHT = 720;
	const INTERFACE_WIDTH = 1080;
	const INTERFACE_HEIGHT = 720;

	const VOLUME_OFFSET = 5;	//オプション: 音量の最小変更数を5に。


	// イベントコマンドの番号
	const COMMAND_END = 0;
	const TRANSFER_PLAYER = 201;
	const SET_MOVEMENT_ROUTE = 205;
	const CHANGE_PLAYER_FOLLOWERS = 216;
	const FADEOUT_SCREEN = 221;
	const FADEIN_SCREEN = 222;
	const WAIT_FOR = 230;
	const PLAY_SE = 250;
	const TF_PATTERN = 'TF_pattern';

	const PLAYER_CHARACTER = -1;
	const gc = Game_Character;

	/**
	 * データベースにオリジナルのJSONを追加する
	 */
	// const $myJson;
	// DataManager._databaseFiles.push(
	// 	{ name: '$myJson', src: '$myJson.json' }
	// );



	/**
	 * 与えられた文字列に変数が指定されていたら、変数の内容に変換して返す。
	 * @param {String} value 変換元の文字列( v[n]形式を含む )
	 * @return {String} 変換後の文字列
	 */
	function treatValue( value ) {
		if( value === undefined || value === '' ) return '0';
		if( value[ 0 ] === 'V' || value[ 0 ] === 'v' ) {
			return value.replace( /[Vv]\[([0-9]+)\]/, ( match, p1 ) => $gameVariables.value( parseInt( p1, 10 ) ) );
		}
		return value;
	}

	/**
	 * @method parseIntStrict
	 * @param {String} value
	 * @return {Number} 数値に変換した結果
	 */
	function parseIntStrict( value ) {
		const result = parseInt( treatValue( value ), 10 );
		if( isNaN( result ) ) throw Error( '指定した値[' + value + ']が数値ではありません。' );
		return result;
	};

	/**
	 * @method parseFloatStrict
	 * @param {String} value
	 * @return {Number} 数値に変換した結果
	 */
	function parseFloatStrict( value ) {
		const result = parseFloat( treatValue( value ) );
		if( isNaN( result ) ) throw Error( '指定した値[' + value + ']が数値ではありません。' );
		return result;
	}


	/**
	 * マップ移動前の処理。
	 * 向きは省略可能で、規定値は現在の向き( 0 )が設定される。
	 * TF_moveBefore マップID x座標 y座標 向き
	 */
	Game_Interpreter.prototype.pluginCommandBook_TF_moveBefore = function( args ) {
		const mapId = parseIntStrict( args[ 0 ] );
		const x = parseIntStrict( args[ 1 ] );
		const y = parseIntStrict( args[ 2 ] );
		const d = parseIntStrict( args[ 3 ] );
		const commandList = [
			{
				indent: 0, code: SET_MOVEMENT_ROUTE, parameters: [ PLAYER_CHARACTER,
					{
						repeat: false, skippable: true, wait: true, list: [
							{ code: gc.ROUTE_THROUGH_ON },
							{ code: gc.ROUTE_MOVE_FORWARD },
							{ code: gc.ROUTE_END }
						]
					}
				]
			},
			{ indent: 0, code: CHANGE_PLAYER_FOLLOWERS, parameters: [ 1 ] },
			{ indent: 0, code: FADEOUT_SCREEN },
			{ indent: 0, code: PLAY_SE, parameters: [ { name: 'Move1', volume: 30, pitch: 100, pan: 0 } ] },
			{ indent: 0, code: TRANSFER_PLAYER, parameters: [ 0, mapId, x, y, d, 2 ] },
			{ indent: 0, code: COMMAND_END }
		];
		this.setupChild( commandList, this._eventId );
	};

	/**
	 * TF_moveAfter
	 */
	Game_Interpreter.prototype.pluginCommandBook_TF_moveAfter = function() {
		const targetEvent = this.character( PLAYER_CHARACTER );
		if( targetEvent.direction() === 2 ) {
			// 下向きの際は、-0.5座標を移動する
			targetEvent._realY = targetEvent._y -= 0.5;
		}

		const commandList = [
			{ indent: 0, code: CHANGE_PLAYER_FOLLOWERS, parameters: [ 0 ] },
			{ indent: 0, code: FADEIN_SCREEN },
			{
				indent: 0, code: SET_MOVEMENT_ROUTE, parameters: [ PLAYER_CHARACTER,
					{
						repeat: false, skippable: true, wait: true, list: [
							{ code: gc.ROUTE_THROUGH_ON },
							{ code: gc.ROUTE_DIR_FIX_OFF },
							{ code: gc.ROUTE_MOVE_FORWARD },
							{ code: gc.ROUTE_MOVE_FORWARD },
							{ code: gc.ROUTE_THROUGH_OFF },
							{ code: gc.ROUTE_END }
						]
					}
				]
			},
			{ indent: 0, code: COMMAND_END }
		];
		this.setupChild( commandList, this._eventId );
	};


	// Show Picture
	Game_Interpreter.prototype.pluginCommandBook_TF_pict = function( args ) {
		const x = args[ 0 ];
		const y = args[ 1 ];
		// 
		$gameScreen.showPicture( this._params[ 0 ], this._params[ 1 ], this._params[ 2 ],
			x, y, this._params[ 6 ], this._params[ 7 ], this._params[ 8 ], this._params[ 9 ] );
		return true;
	};


	/**
	 * 
	 */
	Game_Interpreter.prototype.pluginCommandBook_TF_self = function() {
		return this.eventId();
	};

	/**
	 * 変数を名前の文字列で指定して値を ID1 の変数に代入
	 * args[ 0 ] | String | 変数名
	 */
	Game_Interpreter.prototype.pluginCommandBook_TF_variable = function() {
		$gameVariables.setValue( 1, $gameVariables.getValueByName( args[ 0 ] ) );
	};
	/**
	 * スイッチを名前の文字列で指定して値を ID1 のスイッチに代入
	 * args[ 0 ] | String | 変数名
	 */
	Game_Interpreter.prototype.pluginCommandBook_TF_switch = function() {
		$gameSwitches.setValue( 1, $gameSwitches.getValueByName( args[ 0 ] ) );
	};


	/**
	 * [セルフスイッチ] を設定します
	 * @param {Array} args [ type, isOn ]
	 * @param {String} type A・B・C・D いずれかの文字
	 * @param {String} isOn ON/OFF状態
	 */
	Game_Interpreter.prototype.pluginCommandBook_TF_setSelfSw = function( args ) {
		const type = args[ 0 ];
		const isOn = args[ 1 ];
		$gameSelfSwitches.setValue( [ $gameMap.mapId(), this.eventId(), type ], isOn );
		return this;
	};
	Game_Interpreter.prototype.pluginCommandBook_TF_getSelfSw = function() {
		$gameSelfSwitches.setValue( [ $gameMap.mapId(), this.eventId(), "A" ], true );
		return this;
	};

	// 出現条件(アイテム)
	Game_Interpreter.prototype.pluginCommandBook_TF_conditionItem = function() {
		return $dataItems[ this.character( this.eventId() ).page().conditions.itemId ];
	};


	/*--- Game_Variables ---*/
	/**
	 * 変数を文字列で指定して返す
	 */
	Game_Variables.prototype.getValueByName = function( name ) {
		const i = $dataSystem.variables.findIndex( i => i === name );
		if( i === -1 ) throw new Error( `I can't find the variable '${name}'` );
		return this.value( i );
	};

	/*--- Game_Switches ---*/
	/**
	 * スイッチを文字列で指定して返す
	 */
	Game_Switches.prototype.getValueByName = function( name ) {
		const i = $dataSystem.switches.findIndex( value => value === name );
		if( i === -1 ) throw new Error( `I can't find the switch '${name}'` );
		return this.value( i );
	};

	/*==== 音設定 ====*/
	/*--- Window_Options ---*/
	Window_Options.prototype.volumeOffset = () => VOLUME_OFFSET;


	/*==== 画面設定 ====*/
	/*--- SceneManager ---*/
	const _SceneManager_initialize = SceneManager.initialize;
	SceneManager.initialize = function() {
		this._screenWidth = SCREEN_WIDTH;
		this._screenHeight = SCREEN_HEIGHT;
		this._boxWidth = INTERFACE_WIDTH;
		this._boxHeight = INTERFACE_HEIGHT;
		_SceneManager_initialize.call( this );
	};


	/*--- Spriteset_Base ---*/
	/**
	 * setFrameで表示位置を原点からずらさないように
	 */
	const _Spriteset_Base_createPictures = Spriteset_Base.prototype.createPictures;
	Spriteset_Base.prototype.createPictures = function() {
		_Spriteset_Base_createPictures.call( this );
		this._pictureContainer.setFrame( 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT );
	};


	/**
	 * 顔画像に名前を追加。
	 */
	const FACE_WIDTH = 208;
	const ALIGN_LEFTR = 'left';
	const ALIGN_CENTER = 'center';
	const ALIGN_RIGHT = 'right';
	const NAME_FONT_SIZE = 24;
	const _Window_Message_drawMessageFace = Window_Message.prototype.drawMessageFace;
	Window_Message.prototype.drawMessageFace = function() {
		_Window_Message_drawMessageFace.call( this );
		if( $gameMessage.faceName() === '' ) return;

		const getActorName = () => {
			const faceName = $gameMessage.faceName();
			// $dataActors[ 0 ] は null なのでオブジェクトの有無を確認( e && )している
			const resultIndex = $dataActors.findIndex( e => e && e.faceName === faceName );
			return ( resultIndex === -1 ) ? '' : $dataActors[ resultIndex ].name;
		};
		const tempFontSize = this.contents.fontSize;
		this.contents.fontSize = NAME_FONT_SIZE;
		this.contents.drawText( getActorName(), 0, 146, 144, NAME_FONT_SIZE, ALIGN_CENTER );// ここのNAME_FONT_SIZE は height の指定
		this.contents.fontSize = tempFontSize;
	};

	/**
	 * 顔グラの有無に応じて、行頭位置を設定。
	 */
	Window_Message.prototype.newLineX = function() {
		return $gameMessage.faceName() ? FACE_WIDTH : ( this.standardPadding() - this._margin );
	};


	/*---- BattleManager ----*/
	/**
	 * 逃亡音声を流さない。
	 */
	BattleManager.checkAbort = function() {
		if( $gameParty.isEmpty() || this.isAborting() ) {
			//        SoundManager.playEscape();
			//        this._escaped = true;
			this.processAbort();
		}
		return false;
	};

	/*---- Scene_Battle ----*/
	/**
	 * パーティコマンドを飛ばす。
	 */
	const _Scene_Battle_changeInputWindow = Scene_Battle.prototype.changeInputWindow;
	Scene_Battle.prototype.changeInputWindow = function() {
		if( BattleManager.isInputting() && !BattleManager.actor() ) {
			this.selectNextCommand();
		}
		_Scene_Battle_changeInputWindow.call( this );
	};

	/*--- Window_ActorCommand ---*/
	/**
	 * [スキル][防御][アイテム]コマンドを削除。
	 */
	Window_ActorCommand.prototype.addSkillCommands = function() { };
	Window_ActorCommand.prototype.addGuardCommand = function() { };
	Window_ActorCommand.prototype.addItemCommand = function() { };


	/*--- Window_TitleCommand ---*/
	/**
	 * コンティニューを削除。
	 */
	Window_TitleCommand.prototype.makeCommandList = function() {
		this.addCommand( TextManager.newGame, 'newGame' );
		this.addCommand( TextManager.options, 'options' );
	};
	/**
	 * 表示位置の設定
	 */
	Window_TitleCommand.prototype.updatePlacement = function() {
		this.x = 46;
		this.y = 340;
	};


	/*--- Spriteset_Battle ---*/
	const TYPE_STAGE = 1;
	const TYPE_SET = 2;
	Spriteset_Battle.prototype.createBattleback = function() {
		this._back1Sprite = new Sprite_Battleback( this.battleback1Name(), TYPE_STAGE );
		this._back2Sprite = new Sprite_Battleback( this.battleback2Name(), TYPE_SET );
		this._battleField.addChild( this._back1Sprite );
		this._battleField.addChild( this._back2Sprite );
	};
	Spriteset_Battle.prototype.updateBattleback = function() { };


	/*--- Sprite_Battleback ---*/
	class Sprite_Battleback extends Sprite {
		constructor( bitmapName, type ) {
			super();
			this._bitmapName = bitmapName;
			this._battlebackType = type;
			this.createBitmap();
		}

		/**
		 * 背景画像の生成・読み込み
		 */
		createBitmap() {
			if( this._bitmapName === '' ) {
				this.bitmap = new Bitmap( Graphics.width, Graphics.height );
				return;
			}

			if( this._battlebackType === TYPE_STAGE ) {
				this.bitmap = ImageManager.loadBattleback1( this._bitmapName );
			} else {
				;
				this.bitmap = ImageManager.loadBattleback2( this._bitmapName );
			}
			this.scaleSprite();
		}

		/**
		 * 画面サイズに合わせて戦闘背景を拡大
		 */
		scaleSprite() {
			if( this.bitmap.width <= 0 ) return setTimeout( this.scaleSprite.bind( this ), 5 );
			const w = Graphics.width;
			const h = Graphics.height;
			if( this.bitmap.width < w ) this.scale.x = w / this.bitmap.width;
			if( this.bitmap.height < h ) this.scale.y = h / this.bitmap.height;

			this.anchor.x = 0.5;
			this.x = w / 2;
			if( $gameSystem.isSideView() ) {
				this.anchor.y = 1;
				this.y = h;
			} else {
				this.anchor.y = 0.5;
				this.y = h / 2;
			}
		}
	}


	/*--- Sprite_Enemy ---*/
	const DEFAULT_SCREEN_WIDTH = 816;
	const DEFAULT_SCREEN_HEIGHT = 624;
	/**
	 * 敵位置をスクリーンサイズに合わせて調整
	 */
	const _Sprite_Enemy_setBattler = Sprite_Enemy.prototype.setBattler;
	Sprite_Enemy.prototype.setBattler = function( battler ) {
		_Sprite_Enemy_setBattler.call( this, battler );

		if( !this._enemy._alteredScreenY ) {
			this._homeY += Math.floor( ( Graphics.height - DEFAULT_SCREEN_HEIGHT ) / 2 );
			this._enemy._screenY = this._homeY;
			this._enemy._alteredScreenY = true;
		}
		if( $gameSystem.isSideView() || this._enemy._alteredScreenX ) return;

		this._homeX += ( Graphics.width - DEFAULT_SCREEN_WIDTH ) / 2;
		this._enemy._screenX = this._homeX;
		this._enemy._alteredScreenX = true;
	};

	// 追加キー設定
	const KEY_BS = 8;
	const KEY_DEL = 46;
	const KEY_M = 77;
	const ACTION_MENU = 'menu';
	const ACTION_CANCEL = 'cancel';
	Input.keyMapper[ KEY_M ] = ACTION_MENU;
	Input.keyMapper[ KEY_BS ] = ACTION_CANCEL;
	Input.keyMapper[ KEY_DEL ] = ACTION_CANCEL;
} )();
