//========================================
// TF_Utility.js
// Version :0.2.0.0
// For : RPGツクールMV (RPG Maker MV)
// -----------------------------------------------
// Copyright : Tobishima-Factory 2019
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

( function () {
	'use strict';
	const PLUGIN_NAME = 'TF_Utility';

	/**
	 * データベースにオリジナルのJSONを追加する
	 */
	// const $myJson;
	// DataManager._databaseFiles.push(
	// 	{ name: '$myJson', src: '$myJson.json' }
	// );

	/**
	 * @method parseIntStrict
	 * @param {Number} value
	 * @param {String} errorMessage
	 * @type Number
	 * @return {Number} 数値に変換した結果
	 */
	function parseIntStrict( value, errorMessage ) {
		const result = parseInt( value, 10 );
		if ( isNaN( result ) ) throw Error( '指定した値[' + value + ']が数値ではありません。' + errorMessage );
		return result;
	};

	// イベントコマンドの番号
	const COMMAND_END = 0;
	const TRANSFER_PLAYER = 201;
	const SET_MOVEMENT_ROUTE = 205;
	const CHANGE_PLAYER_FOLLOWERS = 216;
	const FADEOUT_SCREEN = 221;
	const FADEIN_SCREEN = 222;
	const PLAY_SE = 250;

	const PLAYER_CHARACTER = -1;
	const gc = Game_Character;

	/**
	 * setImagePattern
	 * 引数を指定しない(undefined)場合、規定値(主にコマンド実行してるイベントの現在値)が設定される
	 * @param {Number} eventId 対象イベントID( 0:それ自身, -1:プレイヤーキャラ, -2〜-4:隊列メンバー 1〜:イベントID )
	 * @param {String} fileName 画像ファイル名( .pngを除いた img/character/ フォルダのファイル名 )
	 * @param {Number} charaNo キャラ番号( 画像左上から 0,１, 2, 3 と続き2段目が 4, 5, 6, 7 となる番号 )
	 * @param {Number} patternNo パターン番号( 3パターンアニメの左から 0, 1, 2 )
	 * @param {Number} d 向き()
	 * @returns {Object} { id:{Number}, object:Game_Character }
	 */
	function setCharPattern( id, fileName, charaNo, patternNo, d ) {
		let targetEvent;
		// キャラクタオブジェクト(Game_Character)
		id = ( id === undefined ) ? 0 : parseIntStrict( id );
		if ( id < -1 ) {
			targetEvent = $gamePlayer.followers().follower( -id );			// 隊列メンバー
		} else {
			targetEvent = this.character( id );			// プレイヤーキャラおよびイベント
		}

		// 画像ファイル
		if ( fileName === undefined ) {
			fileName = targetEvent.characterName();
		}

		// キャラ番号
		if ( charaNo === undefined ) {
			charaNo = targetEvent.characterIndex();
		} else {
			charaNo = parseIntStrict( charaNo );
		}

		targetEvent.setImage( fileName, charaNo );

		// パターン番号
		if ( patternNo !== undefined ) {
			patternNo = parseIntStrict( patternNo );
			targetEvent.setPattern( patternNo );
			targetEvent._originalPattern = patternNo;
		}

		if ( d !== undefined ) {
			// 向きを設定
			const tmp = isDirectionFixed();
			targetEvent.setDirectionFix( false );
			targetEvent.setDirection( parseIntStrict( d ) );
			targetEvent.setDirectionFix( tmp );
		}

		return { id: id, object: targetEvent };
	}

	/** ---- コマンド本体 ---- **/
	/**
	 * TF_setCharPattern 対象イベントID 画像ファイル名 キャラ番号 パターン番号 向き
	 * TF_setCharPattern 2 !Door2 2 0
	 * すべて省略可。省略したパラメータは現在設定されているものが使われる。
	 */
	Game_Interpreter.prototype.pluginCommandBook_TF_setCharPattern = function ( args ) {
		setCharPattern( ...args );
	};
	/** ---- コマンド本体 ---- **/
	/**
	 * TF_verticalAnime 対象イベントID 画像ファイル名 キャラ番号 パターン番号 
	 * TF_verticalAnime 2 !Door2 2 0
	 * すべて省略可。省略したパラメータは現在設定されているものが使われる。
	 */
	Game_Interpreter.prototype.pluginCommandBook_TF_verticalAnime = function ( args ) {
		const result = setCharPattern.apply( this, args );
		result.object.setDirectionFix( false );
		this._params = [ result.id, {
			repeat: false, skippable: true, wait: true, list: [
				{ code: gc.ROUTE_TURN_LEFT },
				{ code: gc.ROUTE_WAIT, parameters: [ 3 ] },
				{ code: gc.ROUTE_TURN_RIGHT },
				{ code: gc.ROUTE_WAIT, parameters: [ 3 ] },
				{ code: gc.ROUTE_TURN_UP },
				{ code: gc.ROUTE_END }
			]
		} ];
		this.command205();	// SET_MOVEMENT_ROUTE
	};


	/**
	 * TF_moveBefore マップID x座標 y座標 向き
	 * 向きは省略可能で、規定値は現在の向き( 0 )が設定される。
	 */
	Game_Interpreter.prototype.pluginCommandBook_TF_moveBefore = function ( args ) {
		const l = args.length;
		const mapId = parseIntStrict( args[ 0 ] );
		const x = parseIntStrict( args[ 1 ] );
		const y = parseIntStrict( args[ 2 ] );
		const d = ( l < 4 ) ? 0 : parseIntStrict( args[ 3 ] );
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
			{ indent: 0, code: PLAY_SE, parameters: [ { name: 'Move1', volume: 50, pitch: 100, pan: 0 } ] },
			{ indent: 0, code: TRANSFER_PLAYER, parameters: [ 0, mapId, x, y, d, 2 ] },
			{ indent: 0, code: COMMAND_END }
		];
		this.setupChild( commandList, this._eventId );
	};

	/**
	 * TF_moveAfter
	 */
	Game_Interpreter.prototype.pluginCommandBook_TF_moveAfter = function () {
		// TODO: 下向きの際は、-0.5座標を移動する
		const targetEvent = this.character( PLAYER_CHARACTER );
		const d = targetEvent.direction();
		if ( d === 2 ) {
			targetEvent._realY = targetEvent._y -= 0.5;
		}

		const commandList = [
			{ indent: 0, code: CHANGE_PLAYER_FOLLOWERS, parameters: [ 0 ] },
			{ indent: 0, code: FADEIN_SCREEN },
			{
				indent: 0, code: SET_MOVEMENT_ROUTE, parameters: [ PLAYER_CHARACTER,
					{
						repeat: false, skippable: true, wait: true, list: [
							{ code: gc.ROUTE_THROUGH_OFF },
							{ code: gc.ROUTE_DIR_FIX_OFF },
							{ code: gc.ROUTE_MOVE_FORWARD },
							{ code: gc.ROUTE_MOVE_FORWARD },
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
	Game_Interpreter.prototype.pluginCommandBook_TF_pict = function ( args ) {
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
	Game_Interpreter.prototype.pluginCommandBook_TF_self = function () {
		return this.eventId();
	};

	/**
	 * 変数を名前の文字列で指定して値を ID1 の変数に代入
	 * args[ 0 ] | String | 変数名
	 */
	Game_Interpreter.prototype.pluginCommandBook_TF_variable = function () {
		$gameVariables.setValue( 1, $gameVariables.getValueByName( args[ 0 ] ) );
	};
	/**
	 * スイッチを名前の文字列で指定して値を ID1 のスイッチに代入
	 * args[ 0 ] | String | 変数名
	 */
	Game_Interpreter.prototype.pluginCommandBook_TF_switch = function () {
		$gameSwitches.setValue( 1, $gameSwitches.getValueByName( args[ 0 ] ) );
	};


	/**
	 * [セルフスイッチ] を設定します
	 * @param {String} type A・B・C・D いずれかの文字
	 */
	Game_Interpreter.prototype.pluginCommandBook_TF_setSelfSw = function ( args ) {
		const type = args[ 0 ];
		const isOn = args[ 1 ];
		$gameSelfSwitches.setValue( [ $gameMap.mapId(), this.eventId(), type ], isOn );
		return this;
	};
	Game_Interpreter.prototype.pluginCommandBook_TF_getSelfSw = function () {
		$gameSelfSwitches.setValue( [ $gameMap.mapId(), this.eventId(), "A" ], true );
		return this;
	};

	// 出現条件(アイテム)
	Game_Interpreter.prototype.pluginCommandBook_TF_conditionItem = function () {
		return $dataItems[ this.character( this.eventId() ).page().conditions.itemId ];
	};

	/*--- Game_Variables ---*/
	/**
	 * 変数を文字列で指定して返す
	 */
	Game_Variables.prototype.getValueByName = function ( name ) {
		const i = $dataSystem.variables.findIndex( i => i === name );
		if ( i === -1 ) throw new Error( `I can't find the variable '${name}'` );
		return this.value( i );
	};

	/*--- Game_Switches ---*/
	/**
	 * スイッチを文字列で指定して返す
	 */
	Game_Switches.prototype.getValueByName = function ( name ) {
		const i = $dataSystem.switches.findIndex( i => i === name );
		if ( i === -1 ) throw new Error( `I can't find the switch '${name}'` );
		return this.value( i );
	};

	/*--- Window_Options ---*/
	/**
	 * オプション: 音量の最小変更数を5に
	 */
	Window_Options.prototype.volumeOffset = function () {
		return 5;
	};


} )();