//========================================
// TF_CharEx.js
// Version :0.0.0.0
// For : RPGツクールMV (RPG Maker MV)
// -----------------------------------------------
// Copyright : Tobishima-Factory 2020
// Website : http://tonbi.jp
//
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
//========================================
/*:ja
 * @plugindesc キャラのアニメを強化
 * @author とんび@鳶嶋工房
 * 
 * @help
 *
 *------------------------------
 * TF_SET_CHAR [イベントID] [画像ファイル名] [キャラ番号] [歩行パターン] [向き]
 * 　キャラパターンを設定(一度のコマンドで設定でき、歩行パターンも指定可能)。
 * 
 * 　例: TF_SET_CHAR 2 !Door2 2 0 2
 *------------------------------
 * TF_START_ANIME [イベントID]
 * 　アニメモードに変更(移動アニメ停止・[すり抜け]ON)。
 *------------------------------
 * TF_ANIME [イベントID] [dx] [dy] [ウエイト] [キャラ番号] [歩行パターン] [向き]
 * 　アニメの指定。
 *------------------------------
 * TF_END_ANIME [イベントID]
 * 　通常モードに戻る。
 *------------------------------
 * TF_V_ANIME [イベントID] [画像ファイル名] [キャラ番号] [歩行パターン] [ウエイト]
 * 　下→左→右→上 の順に向きを変えてアニメーションする。
 * 　宝箱や扉などに
 * 
 * 　例:TF_V_ANIME 2 !Door2 2 0
 *------------------------------
 *【引数の説明】
 * [イベントID] 0:このイベント、-1:プレイヤー、-2〜-4:隊列メンバー、1〜:イベントID
 * [画像ファイル名] .pngを除いた img/character/ フォルダのファイル名
 * [キャラ番号] 画像の上段左から 0,１, 2, 3 、下段目が 4, 5, 6, 7 となる番号
 * [歩行パターン] 3パターンアニメの左から 0, 1, 2(3以降を指定すると向き不要な[パターン]指定となる)
 * [向き] 4方向のキャラの向き、テンキーに対応した 2, 4, 6, 8 (規定値:2)
 * [パターン] [歩行パターン] と [向き] を一度に指定する番号。
 * 歩行グラフィックの位置だと以下並び。
 * 0, 1, 2		<= 下向き(テンキー2)
 * 3, 4, 5		<= 左向き(テンキー4)
 * 6, 7, 8		<= 右向き(テンキー6)
 * 9, 10, 11 <= 上向き(テンキー8)
 */

( function() {
	'use strict';
	const TF_START_ANIME = 'TF_START_ANIME';
	const TF_SET_CHAR = 'TF_SET_CHAR';
	const TF_ANIME = 'TF_ANIME';
	const TF_END_ANIME = 'TF_END_ANIME';
	const TF_V_ANIME = 'TF_V_ANIME';
	const PARAM_TRUE = 'true';

	/**
	 * @method parseIntStrict
	 * @param {String} value
	 * @return {Number} 数値に変換した結果
	 */
	function parseIntStrict( value ) {
		if( value === undefined || value === '' ) return 0;
		if( value[ 0 ] === 'V' || value[ 0 ] === 'v' ) {
			value = value.replace( /[Vv]\[([0-9]+)\]/, ( match, p1 ) => $gameVariables.value( parseInt( p1, 10 ) ) );
		}
		const result = parseInt( value, 10 );
		if( isNaN( result ) ) throw Error( '指定した値[' + value + ']が数値ではありません。' );
		return result;
	};

	/**
	 * character を拡張して隊列メンバーも指定できるようにしたもの。
	 * @param {Game_Interpreter} interpreter インタプリタ
	 * @param {Number} id 拡張イベントID
	 * @returns {Game_CharacterBase}
	 */
	function getEventById( interpreter, id ) {
		if( id < -1 ) {
			return $gamePlayer.followers().follower( -2 - id );			// 隊列メンバー(0〜2)
		} else {
			return interpreter.character( id );			// プレイヤーキャラおよびイベント
		}
	}


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
	 * setCharPattern
	 * @param {Number} eventId イベントID(規定値:0)
	 * @param {String} fileName 画像ファイル名(規定値:現在値)
	 * @param {Number} charaNo キャラ番号(規定値:現在値)
	 * @param {Number} patternNo 歩行パターン(あるいは パターン番号)(規定値:現在値)
	 * @param {Number} d 向き(規定値:2)
	 * @returns {Object} { id:{Number}, object:{Game_Character} }
	 */
	function setCharPattern( eventId, fileName, charaNo, patternNo, d ) {

		// キャラクタオブジェクト(Game_Character)
		const id = parseIntStrict( eventId );
		const targetEvent = getEventById( this, id );

		// 画像ファイル
		if( fileName === undefined ) {
			fileName = targetEvent.characterName();
		}

		// キャラ番号
		if( charaNo === undefined ) {
			charaNo = targetEvent.characterIndex();
		} else {
			charaNo = parseIntStrict( charaNo );
		}

		targetEvent.setImage( fileName, charaNo );

		// パターン番号
		if( patternNo !== undefined ) {
			patternNo = parseIntStrict( patternNo );
			if( 2 < patternNo ) {
				d = ( Math.floor( patternNo / 3 ) + 1 ) * 2;
				patternNo %= 3;
			} else {
				d = ( d === undefined ) ? 2 : parseIntStrict( d );
			}
			targetEvent.setPattern( patternNo );
			targetEvent._originalPattern = patternNo;

			// 向きを設定
			const tmp = targetEvent.isDirectionFixed();
			targetEvent.setDirectionFix( false );
			targetEvent.setDirection( d );
			targetEvent.setDirectionFix( tmp );
		}

		return { id: id, object: targetEvent };
	}


	/* ---------------- コマンド本体 ---------------- */
	/**
	 * イベントID　　 : -4〜-2 隊列メンバ、 -1:プレイヤーキャラ、0:このイベント、1〜:イベントID
	 * 画像ファイル名 : .pngを含まない img/characters/以下のファイル名
	 * キャラ番号　　 : 0〜7 の番号(開始左上から右へ進み、下の段へ左から右へ)
	 * パターン番号　 : 0〜2 の番号(0:左列 1:中央列 2:右列)
	 * 向き　　　　　 : テンキー対応(2:下 4:左 6:右 8:上)
	*/

	/*---- Game_Interpreter ----*/
	/**
	 * プラグインコマンドの実行
	 */
	const _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
	Game_Interpreter.prototype.pluginCommand = function( command, args ) {
		_Game_Interpreter_pluginCommand.apply( this, arguments );

		const commandStr = command.toUpperCase();
		if( commandStr === TF_SET_CHAR ) {
			setCharPattern.apply( this, args );

		} else if( commandStr === TF_START_ANIME ) {
			const targetEvent = getEventById( this, parseIntStrict( args[ 0 ] ) );
			targetEvent.setThrough( true );
			targetEvent.isAnimating = true;

		} else if( commandStr === TF_END_ANIME ) {
			const targetEvent = getEventById( this, parseIntStrict( args[ 0 ] ) );
			targetEvent.setThrough( false );
			targetEvent.isAnimating = false;

		} else if( commandStr === TF_ANIME ) {
			const result = setCharPattern.apply( this, [ args[ 0 ], , args[ 4 ], args[ 5 ], args[ 6 ] ] );
			result.object._realX += parseIntStrict( args[ 1 ] ) / $gameMap.tileWidth();
			result.object._realY += parseIntStrict( args[ 2 ] ) / $gameMap.tileHeight();
			const commandList = [
				{ indent: 0, code: WAIT_FOR, parameters: [ parseIntStrict( args[ 3 ] ) ] },
				{ indent: 0, code: COMMAND_END }
			];
			this.setupChild( commandList, result.id );

		} else if( commandStr === TF_V_ANIME ) {
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
		}
	};

	/**
	 *  コマンドリストから呼ばれた場合。
	 * @example { indent: 0, code: TF_PATTERN, parameters: [ 2, '!Door2', 2, 0, 2 ] },
	 */
	Game_Interpreter.prototype.commandTF_pattern = function() {
		setCharPattern.apply( this, this._params );
	}

	/**
	 * TF_START_ANIME, TF_END_ANIME 対応。
	 */
	const _Game_CharacterBase_isMoving = Game_CharacterBase.prototype.isMoving;
	Game_CharacterBase.prototype.isMoving = function() {
		if( this.isAnimating ) return false;
		return _Game_CharacterBase_isMoving.call( this );
	}

} )();
