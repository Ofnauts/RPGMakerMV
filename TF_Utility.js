//========================================
// TF_Utility.js
// Version :0.12.0.0
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
 *
 *------------------------------
 * TF_BEFORE_MOVE [マップID] [x]] [y] [向き]
 * 　一歩前進してフェードアウトを行い、マップを移動する。
 * 　[マップID]  マップID(数値) か マップ名(文字列) か 現在のマップ: self, this
 * 　[x] x位置(タイル数)
 * 　[y] y位置(タイル数)
 * 　[向き] 移動後のキャラの向き(規定値: 0 現在の向き)
 * 　　上: 8, up, u, north, n, ↑
 * 　　左: 4, left, l, west, w, ←
 * 　　右: 6, right, r, east, e, →
 * 　　下: 2, down, d, south, s, ↓
 * 　　※[向き]は大文字小文字の区別をしません。
 * 
 * 例: TF_BEFORE_MOVE 砂漠の町 10.5 25 W
 *------------------------------
 * TF_AFTER_MOVE
 * 　フェードインして一歩前進。
 *------------------------------
 */

( function() {
	'use strict';
	const PARAM_TRUE = 'true';
	const PARAM_ON = 'on';

	const VOLUME_OFFSET = 5;	//オプション: 音量の最小変更数を5に。
	console.log( `ユーティリティーだよ` );


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


	/*---- パラメータパース関数 ----*/
	const PARAM_TRUE = 'true';
	const PARAM_ON = 'on';
	const TYPE_BOOLEAN = 'boolean';
	const TYPE_NUMBER = 'number';
	const TYPE_STRING = 'string';
	/**
	 * 与えられた文字列に変数が指定されていたら、変数の内容に変換して返す。
	 * @param {String} value 変換元の文字列( v[n]形式を含む )
	 * @return {String} 変換後の文字列
	 */
	function treatValue( value ) {
		if( value === undefined || value === '' ) return '0';
		const result = value.match( /v\[(.+)\]/i );
		if( result === null ) return value;
		const id = parseInt( result[ 1 ], 10 );
		if( isNaN( id ) ) {
			return $gameVariables.valueByName( result[ 1 ] );
		} else {
			return $gameVariables.value( id );
		}
	}

	/**
	 * @param {String} value 変換元文字列
	 * @return {Number} 数値への変換結果
	 */
	function parseFloatStrict( value ) {
		const result = parseFloat( treatValue( value ) );
		if( isNaN( result ) ) throw Error( '指定した値[' + value + ']が数値ではありません。' );
		return result;
	}


	const EVENT_THIS = 'this';
	const EVENT_SELF = 'self';
	const EVENT_PLAYER = 'player';
	const EVENT_FOLLOWER0 = 'follower0';
	const EVENT_FOLLOWER1 = 'follower1';
	const EVENT_FOLLOWER2 = 'follower2';
	/**
	 * 文字列をイベントIDへ変換
	 * @param {String} value イベントIDの番号か識別子
	 * @returns {Number} 拡張イベントID
	 */
	function stringToEventId( value ) {
		value = treatValue( value );

		const label = value.toLowerCase();
		switch( label ) {
			case EVENT_THIS:
			case EVENT_SELF: return 0;
			case EVENT_PLAYER: return -1;
			case EVENT_FOLLOWER0: return -2;
			case EVENT_FOLLOWER1: return -3;
			case EVENT_FOLLOWER2: return -4;
		}
		// イベント名で指定できるようにする
		const i = $gameMap._events.findIndex( e => {
			if( e === undefined ) return false;	// _events[0] が undefined なので無視
			return $dataMap.events[ e._eventId ].name === value;
		} );
		if( i !== -1 ) return i;

		const result = parseInt( value, 10 );
		if( !isNaN( result ) ) return result;
		throw Error( `指定したイベント[${value}]がありません。` );
	}

	/**
	 * 文字列をマップIDへ変換
	 * @param {String} value マップIDの番号か識別子
	 * @returns {Number} マップID
	 */
	function stringToMapId( value ) {
		value = treatValue( value );

		const label = value.toLowerCase();
		if( label === EVENT_THIS || label === EVENT_SELF ) return $gameMap.mapId();

		const i = $dataMapInfos.findIndex( e => {
			if( !e ) return false;
			return e.name === value;
		} );
		if( i !== -1 ) return i; // $dataMapInfos[ i ].id が正しい気がするが、実は使われていないようだ
		const result = parseInt( value, 10 );
		if( isNaN( result ) ) throw Error( `指定したマップ[${value}]がありません。` );
		return result;
	}

	const DIRECTION_DOWN_LEFT = [ 'downleft', 'dl', 'southwest', 'sw', '↙︎' ];
	const DIRECTION_DOWN = [ 'down', 'd', 'south', 's', '↓' ];
	const DIRECTION_DOWN_RIGHT = [ 'downright', 'dr', 'southeast', 'se', '↘︎' ];
	const DIRECTION_LEFT = [ 'left', 'l', 'west', 'w', '←' ];
	const DIRECTION_RIGHT = [ 'right', 'r', 'east', 'e', '→' ];
	const DIRECTION_UP_LEFT = [ 'upleft', 'ul', 'northwest', 'nw', '↖︎' ];
	const DIRECTION_UP = [ 'up', 'u', 'north', 'n', '↑' ];
	const DIRECTION_UP_RIGHT = [ 'upright', 'ur', 'northeast', 'ne', '↗︎' ];
	/**
		 * 方向文字列をテンキー方向の数値に変換して返す
		 * @param {String} value 方向た文字列
		 * @returns {Number} テンキー方向の数値(変換できなかった場合:undefined)
		 */
	function stringToDirection( value ) {
		value = treatValue( value );
		const result = parseInt( value, 10 );
		if( !isNaN( result ) ) return result;

		value = value.toLowerCase();
		if( DIRECTION_DOWN_LEFT.includes( value ) ) return 1;
		if( DIRECTION_DOWN.includes( value ) ) return 2;
		if( DIRECTION_DOWN_RIGHT.includes( value ) ) return 3;
		if( DIRECTION_LEFT.includes( value ) ) return 4;
		if( DIRECTION_RIGHT.includes( value ) ) return 6;
		if( DIRECTION_UP_LEFT.includes( value ) ) return 7;
		if( DIRECTION_UP.includes( value ) ) return 8;
		if( DIRECTION_UP_RIGHT.includes( value ) ) return 9;
	}


	/*--- Game_Variables ---*/
	/**
	 * 変数を文字列で指定し、値を返す。
	 * @param {String} name 変数(ID, 名前, V[n]による指定が可能)
	 */
	Game_Variables.prototype.valueByName = function( name ) {
		return this.value( stringToVariableId( name ) );
	};
	/**
	 * 変数を文字列で指定し、値を設定。
	 * @param {String} name 変数(ID, 名前, V[n]による指定が可能)
	 * @param {String} value 設定する値
	 */
	Game_Variables.prototype.setValueByName = function( name, value ) {
		this.setValue( stringToVariableId( name ), value );
	};

	/**
	 * 指定された変数のIDを返す。
	 * @param {String} name 変数(ID, 名前, V[n]による指定が可能)
	 */
	function stringToVariableId( name ) {
		name = treatValue( name );
		let i = $dataSystem.variables.findIndex( i => i === name );
		if( 0 <= i ) return i;
		i = parseInt( name, 10 );
		if( isNaN( i ) ) throw Error( `I can't find the variable '${name}'` );
		return i;
	}

	/*---- Game_Interpreter ----*/
    /**
     * プラグインコマンドの実行
     */
	const TF_BEFORE_MOVE = 'TF_BEFORE_MOVE';
	const TF_AFTER_MOVE = 'TF_AFTER_MOVE';
	const TF_PICT = 'TF_PICT';
	const _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
	Game_Interpreter.prototype.pluginCommand = function( command, args ) {
		_Game_Interpreter_pluginCommand.apply( this, arguments );

		const commandStr = command.toUpperCase();
		console.log( `${commandStr}` );

		// コマンド文字列による分岐
		switch( commandStr ) {
			case TF_BEFORE_MOVE: TF_beforeMove( this, args[ 0 ], args[ 1 ], args[ 2 ], args[ 3 ] ); break;
			case TF_AFTER_MOVE: TF_afterMove( this ); break;
			case TF_PICT: TF_pict( this, args[ 0 ], args[ 1 ], args[ 2 ], args[ 3 ] ); break;

		}
	};

	/**
	 * マップ移動前の処理。
	 * 向きは省略可能で、規定値は現在の向き( 0 )が設定される。
	 * @example TF_BEFORE_MOVE マップID x座標 y座標 向き
	 * @param {Game_Interpreter} インタプリター
	 * @param {String} mapId マップID | マップ名 | self | this
	 * @param {String} x x座標(タイル数)
	 * @param {String} y y座標(タイル数)
	 * @param {String} d 向き(テンキー対応 | 方向文字列)
	 */
	function TF_beforeMove( interpreter, mapId, x, y, d ) {
		mapId = stringToMapId( mapId );
		x = parseFloatStrict( x );
		y = parseFloatStrict( y );
		d = stringToDirection( d );
		console.log( `ビフォームーブ：${mapId}` );

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
		interpreter.setupChild( commandList, interpreter._eventId );
	};

	/**
	 * 移動後のフェードインおよび一歩前進処理を行う
	 */
	function TF_afterMove() {
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
							{ code: gc.ROUTE_THROUGH_OFF },
							{ code: gc.ROUTE_END }
						]
					}
				]
			},
			{ indent: 0, code: COMMAND_END }
		];
		interpreter.setupChild( commandList, interpreter._eventId );
	};


	/**
	 * TF_PICT
	 * showPicture (pictureId, name, origin, x, y, scaleX, scaleY, opacity, blendMode)
	 * DL DR
	 */
	const ORIGN_TOPLEFT = 0;
	const LEFT_GAME_PICTURE = new Game_Picture();// pictureId は undefinedでいく。
	const RIGHT_GAME_PICTURE = new Game_Picture();
	const LEFT_SPRITE_PICTURE = new Sprite_Picture();
	const RIGHT_SPRITE_PICTURE = new Sprite_Picture();
	function TF_pict( fileName, lrPosition ) {
		// const align = args[  ]; 	// TODO: アラインメント設定を可能にする UL, UR, DL, DR, LOM(Left On Message), ROM(Right On Message)

		LEFT_GAME_PICTURE.show( fileName, ORIGN_TOPLEFT, 0, 0, 1, 1, 0xff, Graphics.BLEND_NORMAL );
	};


	// 出現条件(アイテム)
	Game_Interpreter.prototype.pluginCommandBook_TF_CONDITION_ITEM = function() {
		return $dataItems[ this.character( this.eventId() ).page().conditions.itemId ];
	};



	/*==== 音設定 ====*/
	/*--- Window_Options ---*/
	Window_Options.prototype.volumeOffset = () => VOLUME_OFFSET;


	/**
	 * 顔画像に名前を追加。
	 */
	const FACE_WIDTH = 208;
	const ALIGN_LEFT = 'left';
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
