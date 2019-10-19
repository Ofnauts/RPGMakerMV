//========================================
// TF_LayeredMap.js
// Version :0.9.9.0
// For : RPGツクールMV (RPG Maker MV)
// -----------------------------------------------
// Copyright : Tobishima-Factory 2018 - 2019
// Website : http://tonbi.jp
//
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
//========================================
/*:
 * @plugindesc Upper[☆]tile display like billboard.
 * @author Tonbi@Tobishima-Factory
 * 
 * 
 * @param BillboardPriority
 * @type select
 * @option Put it front
 * @value front
 * @option Put it back
 * @value back
 * @desc Put billboard in front or back.
 * @default back
 * 
 * 
 * @param Autotile
 * 
 * @param FillWithNeighborTile
 * @type boolean
 * @desc ON(true) | DefaultLowerTile : OFF(false)
 * Fill with neighbor tile.It is function for A3 or A4 tile.
 * @default true
 * @parent Autotile
 * 
 * @param DefaultLowerTile
 * @desc If FillWithNorthTile option is OFF, fill with this tile.
 * Start with 0 at upper left A5 to right.
 * @default 16
 * @parent Autotile
 * 
 * @param UseLayeredCounter
 * @type boolean
 * @desc ON(true) | Normal : OFF(false)
 * Counter becomes layered.
 * A2 counter tile can layered like billboard.
 *  (HalfMove.js is needed)
 * @default true
 * @parent Autotile
 * 
 * @param IsA2FullCollision
 * @type boolean
 * @desc Full collision : ON(true) | Closed and inside is accessible : OFF(false)
 * Entire tile on the ground(A2) collision to activate.
 * @default true
 * @parent Autotile
 * 
 * @param IsA3UpperOpen
 * @type boolean
 * @desc Open : ON(true) | Close : OFF(false)
 * Remove the south collision of the roof(A3)?
 * @default false
 * @parent Autotile
 * 
 * @param IsA4UpperOpen
 * @type boolean
 * @desc Open : ON(true) | Close : OFF(false)
 * Remove the south collision of the wall top(A4)?
 * @default true
 * @parent Autotile
 * 
 * 
 * @param Overpass
 * 
 * @param OverpassTerrainTag
 * @desc Terraing tag for overpass tile.
 * @default 3
 * @parent Overpass
 * 
 * @param UseTallSizeCharacter
 * @desc 2tile size : ON(true) | default 1 tile size : OFF(false)
 * Change collision of overpass for 2 tile size character.
 * @default false
 * @parent Overpass
 * 
 * 
 * @help
 * Change tile behavior by use no effect option at default.
 * 
 * 1. Set following options for A3・A4 tile.
 *      [counter][○] : Behavior like[☆]   ※
 *      [counter][×] : Hide only north tiles.
 *      [counter][ladder][×] : Behavior like [☆] only north tiles.Other tiles can't enter.
 * 
 * ※ A3, A4 wall tile floor height set automaticaly.
 * 
 * 2. set [☆] to BCDE tile, and set 4 direction setting.
 *      0x0 ↑→←↓ : [☆]  Same as no plugin.
 *      0x1 ↑→←・ : billboard, ↑　←→ pass, ground (for fence)
 *      0x2 ↑→・↓ : billboard, ↑↓　→ pass, ground (left side of fence)┃
 *      0x3 ↑→・・ : billboard, ↑　　→ pass, ground (bottom left)┗
 *      0x4 ↑・←↓ : billboard, ↑↓←　 pass, ground (right)   ┃
 *      0x5 ↑・←・ : billboard, ↑　←　 pass, ground (bottom right)   ┛
 *      0x6 ↑・・↓ : billboard, ↑↓　　 pass, ground (both side)┃┃
 *      0x7 ↑・・・ : billboard, ↑　　　 pass, ground (like bartizan)┗┛
 *      0x8 ・→←↓ : billboard,  all directtion , ground (for bush)
 *      0x9 ・→←・ : billboard,  all directtion , 2nd floor
 *      0xA ・→・↓ : billboard,  all directtion , 3rd floor
 *      0xB ・→・・ : Same as [○] and north half blocked (for lower shelf) (HalfMove.js is needed)
 *      0xC ・・←↓ : Same as 0x1 and south half blocked (for Barrel) (HalfMove.js is needed)
 *      0xD ・・←・ : Same as 0xB and collision is half (for lower tree) (HalfMove.js is needed)
 *      0xE ・・・↓ : Same as 0xC and collision is half  (for chair) (HalfMove.js is needed)
 *      0xF ・・・・ : Same as 0x1 and collision is half (for peg)(HalfMove.js is needed)
 * 
 * 3. Set TerrainTag to 3(default)
 *      If you enter from blocke direction, you can move under the tile.
 *      If you enter from pass direction, you can move over the tile.
 * 
 * Released under the MIT License.
 */
/*:ja
 * @plugindesc 高層[☆]タイルを書き割り風に配置する
 * @author とんび@鳶嶋工房
 * 
 * 
 * @param BillboardPriority
 * @type select
 * @option 手前
 * @value front
 * @option 奥(規定値)
 * @value back
 * @text 奥行き優先度
 * @desc  書き割りの奥・手前配置の設定
 * @default back
 * 
 * 
 * @param Autotile
 * @text オートタイル
 * 
 * @param FillWithNeighborTile
 * @type boolean
 * @text 周辺のタイルでの補完
 * @desc 周辺のタイル ON(true) | [補完用タイル番号] : OFF(false)
 * 低層(地面)を北(画面上では上)のタイルで補完するか
 * @default true
 * @parent Autotile
 * 
 * @param DefaultLowerTile
 * @text 補完用タイル番号
 * @desc [北のタイルでの補完]がOFFの場合に使うタイル
 * 番号はA5左上を0として右への順。規定値:16(草原)
 * @default 16
 * @parent Autotile
 * 
 * @param UseLayeredCounter
 * @type boolean
 * @text カウンター回り込み
 * @desc 回り込み : ON(true) | 通常 : OFF(false)
 * A2のカウンターの後ろに回り込めるようにするか
 * (HalfMove.js が必要)
 * @default true
 * @parent Autotile
 * 
 * @param IsA2FullCollision
 * @type boolean
 * @text タイル全体を通行不可にするか
 * @desc 通行止め : ON(true) | 閉じて内側は通行可 : OFF(false)
 * 地面(A2)のタイル全体を通行不可にするか
 * @default true
 * @parent Autotile
 * 
 * @param IsA3UpperOpen
 * @type boolean
 * @text 屋根南を開くか
 * @desc 開く : ON(true) | 閉じて内側は通行可 : OFF(false)
 * 屋根(A3)の南の衝突判定をなくすか
 * @default false
 * @parent Autotile
 * 
 * @param IsA4UpperOpen
 * @type boolean
 * @text 壁の上面南を開くか
 * @desc 開く : ON(true) | 閉じて内側は通行可 : OFF(false)
 * 壁の上(A4)の南の衝突判定をなくすか
 * @default true
 * @parent Autotile
 * 
 * 
 * @param Overpass
 * @text 立体交差
 * 
 * @param OverpassTerrainTag
 * @text 立体交差の地形タグ
 * @desc 立体交差不使用 : 0
 * 立体交差をさせたいタイルに指定する地形タグ
 * @default 3
 * @parent Overpass
 * 
 * @param UseTallSizeCharacter
 * @text 2タイルサイズのキャラ
 * @desc 2タイルサイズ : ON(true) | 標準1タイル : OFF(false)
 * 2タイルサイズのキャラ用に立体交差の衝突判定を変更
 * @default false
 * @parent Overpass
 * 
 * 
 * @help 
 * RPGツクールMVで未使用の設定で、タイルの重なりが変化します。
 * 
 * 1. A3・A4タイルに以下を設定
 *      [カウンター][○] 下を通れる(ほぼ[☆]の状態) ※1
 *      [カウンター][×] 北端タイルのみ後ろに回り込める
 *      [カウンター][梯子][×] 北端タイルのみ[☆]で他は侵入不可
 * 
 * ※1 壁の高さは自動で調整されます。
 * 
 * 2. BCDEタイルに[☆]を指定したあと、通行設定(4方向)
 *      0x0 ↑→←↓ : [☆] 設定、全方向に 通行可(プラグインなしと同じ)
 *      0x1 ↑→←・ : 書き割り、北　西東 通行可、1階 【基本、柵とか】
 *      0x2 ↑→・↓ : 書き割り、北南　東 通行可、1階 （柵の西側とか）┃
 *      0x3 ↑→・・ : 書き割り、北　　東 通行可、1階 （柵の西南とか）┗
 *      0x4 ↑・←↓ : 書き割り、北南西　 通行可、1階 （柵の東側とか）   ┃
 *      0x5 ↑・←・ : 書き割り、北　西　 通行可、1階 （柵の東南とか）   ┛
 *      0x6 ↑・・↓ : 書き割り、北南　　 通行可、1階 （両脇に木とか）┃┃
 *      0x7 ↑・・・ : 書き割り、北　　　 通行可、1階 （張り出し的な）┗┛
 *      0x8 ・→←↓ : 書き割り、全方向に 通行可、1階 （草むらなどに）
 *      0x9 ・→←・ : 書き割り、全方向に 通行可、2階
 *      0xA ・→・↓ : 書き割り、全方向に 通行可、3階
 *      0xB ・→・・ : 地面[○] 設定かつ北半分通行不可 （棚などに）(HalfMove.js が必要)
 *      0xC ・・←↓ : 0x1 と同じだが南半分が通行不可 （机などに）(HalfMove.js が必要)
 *      0xD ・・←・ : 0xB と同じだが北の両脇が通行可 （根元とか）(HalfMove.js が必要)
 *      0xE ・・・↓ : 0xC と同じだが南の両脇が通行可 （椅子とか）(HalfMove.js が必要)
 *      0xF ・・・・ : 0x1 と同じだが南の両脇が通行可 （杭などに）(HalfMove.js が必要)
 * 
 * 3. 地形タグを3(規定値)に設定
 *      通行設定で侵入可の方向から入ると上を、侵入不可の方向から入ると下を通るようになります。
 * 
 * 利用規約 : MITライセンス
 */
(function(){'use strict';
// flag用定数
const FLAG_NORTH_DIR = 0x08 // 北の通行設定
const FLAG_UPPER = 0x10; // 高層[☆]
const FLAG_LADDER = 0x20; // 梯子
const FLAG_COUNTER = 0x80; // カウンター
const MASK_CLIF = 0xFE0; // 方向と高層[☆]と地形タグを除いたもの用マスク
const MASK_WITHOUT_DIR_UPPER = 0xFFE0; // 方向と高層[☆]を除いたもの用マスク
const MASK_WITHOUT_DIR_UPPER_LADDER = 0xFFC0; // 方向と高層[☆]と梯子を除いたもの用マスク

// 書割り設定
const MASK_ALL_DIR = 0xF; // 通行設定用マスク
const FLOOR2_BOARD = 0x19; // 09 書き割り、全方向に 通行可、2階
const FLOOR3_BOARD = 0x1A; // 10 書き割り、全方向に 通行可、3階

const MASK_UPPER_DIR = 0x1F; // 高層[☆]と通行設定用マスク
const FLOOR1_N_FULL = 0x1B; // 11 棚
const FLOOR1_S_FULL = 0x1C; // 12 机
const FLOOR1_N_HALF = 0x1D; // 13 椅子(北)
const FLOOR1_S_HALF = 0x1E; // 14 椅子(南)
const FLOOR1_S_FLAT = 0x1F; // 15 杭

const AUTOTILE_BLOCK = 48; // オートタイル1ブロック分のパターン数

/**
 * パラメータを受け取る
 */
const pluginParams = PluginManager.parameters( 'TF_LayeredMap' );
/**
 * 指定したパラメータの真偽値を返す。
 * @param {String} paramName パラメータ名
 * @param {Number} defaultParam 規定値
 * @returns {Boolean}
 */
const getBooleanParam = ( paramName, defaultParam )=>{
    return pluginParams[ paramName ] ? ( pluginParams[ paramName ].toLowerCase() == 'true' ) : defaultParam;
}; 

/**
 * 指定したパラメータの数値を返す。
 * @param {String} paramName パラメータ名
 * @param {Number} defaultParam 規定値
 * @returns {Number}
 */
const getNumberParam = ( paramName, defaultParam )=>{
    return parseInt( pluginParams[ paramName ] || defaultParam, 10 );
};

/**
 * 指定したパラメータが、指定した値と同じか。
 * @param {String} paramName パラメータ名
 * @param {String} param 比較する値(小文字)
 * @param {Boolean} defaultParam 規定値
 * @returns {Boolean}
 */
const conpairPluginParam = ( paramName, param, defaultParam )=>{
    if( pluginParams[ paramName ] ){
        return pluginParams[ paramName ].toLowerCase() === param;
    }else{
        return defaultParam;
    }
};

const _FillWithNeighborTile = getBooleanParam( 'FillWithNeighborTile', true );
const _DefaultLowerTileId = Tilemap.TILE_ID_A5 + getNumberParam( 'DefaultLowerTile', 16 );
const _UseLayeredCounter = getBooleanParam( 'UseLayeredCounter', true );
const _BillboardPriority = conpairPluginParam( 'BillboardPriority', 'front', false ) ? Infinity : -Infinity;
const _IsA2FullCollision = getBooleanParam( 'IsA2FullCollision', true );
const _IsA3UpperOpen = getBooleanParam( 'IsA3UpperOpen', false );
const _IsA4UpperOpen = getBooleanParam( 'IsA4UpperOpen', true );
const _OverpassTerrainTag = getNumberParam( 'OverpassTerrainTag', 3 );
const _UseTallSizeCharacter = getNumberParam( 'UseTallSizeCharacter', 3 );


/*---- Game_Interpreter ----*/
/**
 * プラグインコマンドの実行
 */
const _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function ( command, args ){
    _Game_Interpreter_pluginCommand.apply( this, arguments );

    // TODO: プラグインコマンドで何か挙動を変えるものがあれば
    //if( command.toUpperCase() !== PLUGIN_COMMAND ) return;

    //_SomeParameter = ( args[0].toLowerCase() === PLUGIN_PARAM_TRUE );
};

 
/*---- Tilemap ----*/
/**
 * その位置が立体交差であるかチェック(地形タグで決定)
 */
const _Tilemap_isOverpassPosition = Tilemap.prototype._isOverpassPosition;
Tilemap.prototype._isOverpassPosition = function( x, y ) {
    if( _OverpassTerrainTag !== 0 && $gameMap.terrainTag( x, y ) === _OverpassTerrainTag ) return true;
    return _Tilemap_isOverpassPosition.apply( this, arguments );
};


/*---- ShaderTilemap ----*/
/**
 * タイルセットの画像を設定する。
 * マップ開始時に呼ばれる。
 */
const _ShaderTilemap_refreshTileset = ShaderTilemap.prototype.refreshTileset;
ShaderTilemap.prototype.refreshTileset = function(){
    _ShaderTilemap_refreshTileset.call( this );

    // BitmapをPIXI.Textureにコンバート
    const bitmaps = this.bitmaps.map( function( x ){
        return x._baseTexture ? new PIXI.Texture( x._baseTexture ) : x;
   } );

   // 書き割りのタイルセットの画像をアップデート
   for( let curItem of this.TF_billboards ){
        curItem.children[0].setBitmaps( bitmaps );
   }
}


/**
 * 書き割りレイヤーの生成と追加。
 */
const _ShaderTilemap_createLayers = ShaderTilemap.prototype._createLayers;
ShaderTilemap.prototype._createLayers = function(){
    _ShaderTilemap_createLayers.call( this );

    // 書き割り風オブジェクトを生成
    // +3 はスクロールの際にはみ出す部分と2・3階用
    const th = this._tileHeight;
    const tileRows = Math.ceil( this._height / th ) + 3;

    if( !this.hasOwnProperty( 'TF_billboards' ) ){
        this.TF_billboards = [];
    }

    for( let i = 0; i < tileRows; i++ ){
        const billboard = new PIXI.tilemap.ZLayer( this, 3 );
        billboard.spriteId = _BillboardPriority;
        this.addChild( billboard );
        this.TF_billboards.push( billboard );
        const layer = new PIXI.tilemap.CompositeRectTileLayer( 0, [], 0 );
        billboard.addChild( layer );
    }
};

/**
 * 描画前に書き割りの中を空にしておく。
 */
const _ShaderTilemap_paintAllTiles = ShaderTilemap.prototype._paintAllTiles;
ShaderTilemap.prototype._paintAllTiles = function( startX, startY ){
    for( let curItem of this.TF_billboards ){
        curItem.clear();
    }

    _ShaderTilemap_paintAllTiles.apply( this, arguments );
}

/**
 * タイルマップと書き割りの描画。
 * 関数をまるっと書き換えているので
 * 他のプラグインとコンフリクトを起こしてしまうので注意。
 * @param {Number} startX 開始 マップ x座標(タイル数)
 * @param {Number} startY 開始 マップ y座標(タイル数)
 * @param {Number} x 画面上の x座標(タイル数)
 * @param {Number} y 画面上の y座標(タイル数)
 */
ShaderTilemap.prototype._paintTiles = function( startX, startY, x, y ){
    const mx = startX + x; //  描画対象のマップ x座標(タイル数)
    const my = startY + y; //  描画対象のマップ y座標(タイル数)
    const dx = x * this._tileWidth; //  描画位置の x座標(ピクセル)
    const dy = y * this._tileHeight; //  描画位置の y座標(ピクセル)
    const tileId0 = this._readMapData( mx, my, 0 ); // 低層タイルA
    const tileId1 = this._readMapData( mx, my, 1 ); // 低層タイルA2右側など
    const tileId2 = this._readMapData( mx, my, 2 ); // B 〜 E タイル
    const tileId3 = this._readMapData( mx, my, 3 ); // B 〜 E タイル
    const shadowBits = this._readMapData( mx, my, 4 ); // 影ペン
    const northTileId1 = this._readMapData( mx, my - 1, 1 ); // 北位置の低層タイルA
    const lowerLayer = this.lowerLayer.children[ 0 ];     // 低層レイヤ( z: 0 )
    const upperLayer = this.upperLayer.children[ 0 ];   // 高層レイヤ( z: 4 )

    /**
     * タイルを描画(upperLayer,lowerLayer,dx,dy は親の変数を使う)
     * @param {Number} tileId タイルID
     */
    const drawTile = ( tileId ) => {
        if ( !this._isHigherTile( tileId )
        || ( this.flags[ tileId ] & MASK_UPPER_DIR ) === FLOOR1_N_FULL
        || ( this.flags[ tileId ] & MASK_UPPER_DIR ) === FLOOR1_N_HALF ){
            // 高層タイルではない
            this._drawTile( lowerLayer, tileId, dx, dy );
            return;
        }
        
        // 優先階(priorityFloor)を設定
        let priorityFloor;
        if( ( this.flags[ tileId ] & MASK_UPPER_DIR ) === FLOOR2_BOARD ){
            priorityFloor = 2;
        }else if( ( this.flags[ tileId ] & MASK_UPPER_DIR ) === FLOOR3_BOARD ){
            priorityFloor = 3;
        }else{
            priorityFloor = 1;
        }

        let floorNumber = 1;
        if( priorityFloor === 2 ||  priorityFloor === 3 ){
            const wallSideType = getWallSideType( this._readMapData( mx, my + 1, 1 ) );
            
            if( wallSideType === 1 ){
                floorNumber = 2; 
            }else if( wallSideType === 2 ){
                floorNumber = 3; 
            }else if( wallSideType === 3 ){
                floorNumber = priorityFloor;
            }else{
                // 壁ではない場合
                floorNumber = priorityFloor;
                // TODO : B〜E タイルのオート位置設定を行う…か?
            }
        }

        if( floorNumber === 2 ){
            // 2階設定は、ひとつ下の書き割りに書き込む
            this._drawTile( this.TF_billboards[ y + 1 ].children[ 0 ].children[ 0 ], tileId, dx, -this._tileHeight * 2 );

        }else if( floorNumber === 3 ){
            // 3階設定は、ふたつ下の書き割りに書き込む
            this._drawTile( this.TF_billboards[ y + 2 ].children[ 0 ].children[ 0 ], tileId, dx, -this._tileHeight * 3 );

        }else if( this.flags[ tileId ] & MASK_ALL_DIR ){
            // 通行不可設定のどれかがONだと書き割り
            this._drawTile( this.TF_billboards[ y ].children[ 0 ].children[ 0 ], tileId, dx, -this._tileHeight );

        }else{
            // 全方向通行可の場合は通常の高層[☆]表示
            this._drawTile( upperLayer, tileId, dx, dy );
        }
    }

    drawTile( tileId0 );
    drawTile( tileId1 );

    // 影の描画
    this._drawShadow( lowerLayer, shadowBits, dx, dy );

    // テーブルの描画
    if ( this._isTableTile( northTileId1 ) && !this._isTableTile( tileId1 ) ){
        if ( !Tilemap.isShadowingTile( tileId0 ) ){
            this._drawTableEdge( lowerLayer, northTileId1, dx, dy );
        }
    }

    // 立体交差の描画
    if ( this._isOverpassPosition( mx, my ) ){
        this._drawTile( upperLayer, tileId2, dx, dy );
        this._drawTile( upperLayer, tileId3, dx, dy );
    } else {
        drawTile( tileId2 );
        drawTile( tileId3 );
    }

    /**
     * 指定位置の壁の状態を調べる
     * @param {Number} tileId タイルID
     * @returns {Number}  0:壁ではない, 1:下端, 2:上下に接続した壁, 3:上端
     */
    function getWallSideType( tileId ){
        if( !Tilemap.isWallSideTile( tileId ) ) return 0; // 壁タイルではない

        // autotileShape のビットは 下右上左 に対応しているので、それで判定
        const autotileShape = Tilemap.getAutotileShape( tileId );
        if( autotileShape & 2 ) return 3;
        if( autotileShape & 8 ) return 1;
        return 2;
    }
};

/**
 * (スクロールに合わせて)書き割りの表示位置を変更
 * @param {Number} startX
 * @param {Number} startY
 */
const _ShaderTilemap_updateLayerPositions = ShaderTilemap.prototype._updateLayerPositions;
ShaderTilemap.prototype._updateLayerPositions = function( startX, startY ){
    _ShaderTilemap_updateLayerPositions.apply( this, arguments );

    let ox,oy;
    if (this.roundPixels){
        ox = Math.floor(this.origin.x);
        oy = Math.floor(this.origin.y);
    } else {
        ox = this.origin.x;
        oy = this.origin.y;
    }
    const th = this._tileHeight;
    const tw = this._tileWidth;
    const posX = startX * tw - ox;
    const posY = startY * th - oy
    const l = this.TF_billboards.length;
    for( let i = 0; i < l; i++ ){
        const curItem = this.TF_billboards[ i ];
        curItem.position.x = posX;
        curItem.position.y = posY + ( i + 1) * th;
    };
};

/*---- DataManager ---*/
// オートタイル通行flag
// 通行不可設定 1:下  2:左  4:右  8:上
// 16:高層に表示[☆]
// A2カウンター
const COUNTER_PASS = [
    15, 15, 15, 15, 15, 15, 15, 15, 
    15, 15, 15, 15, 15, 15, 15, 15, 
    15, 15, 15, 15, 28, 28, 28, 28, 
    15, 15, 15, 15, 15, 15, 15, 15, 
    15, 28, 28, 28, 28, 28, 15, 15, 
    15, 15, 28, 28, 15, 28, 28, 28, 
];
const AUTO_TILE_EMPTY_PASS = [
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0,
    2, 2, 2, 2, 8, 8, 8, 8,
    4, 4, 4, 4, 1, 1, 1, 1,
    6, 9, 10, 10, 12, 12, 5, 5,
    3, 3, 14, 11, 7, 13, 15, 15
];

const OPTT = ( _OverpassTerrainTag << 12 ); // 立体交差地形タグ

// 屋根 A3 奇数列(立体交差)
const A3_UPPER_OVERPASS = _IsA3UpperOpen ? [
    0, 2, OPTT + 8, OPTT + 10,
    4, 6, OPTT + 12, OPTT + 14,
    0, 2, OPTT + 8, OPTT + 10,
    4, 6, OPTT + 12, OPTT + 14,
] : [
    0, 2, OPTT + 8, OPTT + 10,
    4, 6, OPTT + 12, OPTT + 14,
    1, 3, OPTT + 9, OPTT + 11,
    5, 7, OPTT + 15, OPTT + 13,
];

// 屋根 A3 奇数列
const A3_UPPER_PASS =_IsA3UpperOpen ? [
    0, 2, 17, 17,
    4, 6, 17, 17,
    0, 2, 17, 17,
    4, 6, 17, 17,
] : [
    0, 2, 17, 17,
    4, 6, 17, 17,
    1, 3, 17, 17,
    5, 7, 17, 17,
];

// 屋根 A3 奇数列(地面)
const A3_BOTTOM_PASS =_IsA3UpperOpen ? [
    0, 2, 8, 10, 
    4, 6, 12, 14, 
    0, 2, 8, 10, 
    4, 6, 12, 14, 
]: [
    0, 2, 8, 10, 
    4, 6, 12, 14, 
    1, 3, 9, 11, 
    5, 7, 13, 15, 
];

// 壁(上面) A4 奇数列
const A4_UPPER_PASS = _IsA4UpperOpen ? [
    0, 2, 4, 6, 0, 2, 4, 6,
    0, 2, 4, 6, 0, 2, 4, 6,
    2, 6, 2, 6, 17, 17, 17, 17,
    4, 4, 6, 6, 0, 2, 4, 6,
    6, 17, 17, 17, 17, 17, 4, 6,
    2, 6, 17, 17, 6, 17, 17, 17
] : [
    0, 2, 4, 6, 0, 2, 4, 6,
    0, 2, 4, 6, 0, 2, 4, 6,
    2, 6, 2, 6, 17, 17, 17, 17,
    4, 4, 6, 6, 1, 3, 5, 7,
    6, 17, 17, 17, 17, 17, 5, 7,
    3, 7, 17, 17, 7, 17, 17, 17
];

// 壁(上面) A4 奇数列、北が[☆]設定、他は全通行不可
const A4_UPPER_STAR_PASS = [
    15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 16, 16, 16, 16,
    15, 15, 15, 15, 15, 15, 15, 15,
    15, 16, 16, 16, 16, 16,15, 15,
    15, 15, 16, 16, 15, 16, 16, 16
];

// 壁(側面) A3・A4 偶数列 [○]
const WALL_SIDE_PASS_EDGE = [
    15, 15, 17, 17, 
    15, 15, 17, 17, 
    15, 15, 17, 17, 
    15, 15, 17, 17, 
];
// 壁(側面) A3・A4 偶数列[×]
const WALL_SIDE_PASS = [
    25, 25, 26, 26, 
    25, 25, 26, 26, 
    17, 17, 17, 17, 
    17, 17, 17, 17, 
];


/**
 * 読み込み直後に、タイルセットデータを書き換える
 * @param {Object} object 読み込んだデータ
 */
const _DataManager_onLoad = DataManager.onLoad;
DataManager.onLoad = function( object ){
    _DataManager_onLoad.apply( this, arguments );

    if( object === $dataTilesets ) treatDataTilesets();
    // end: onLoad

    /**
     * カウンター設定しているA2・A3・A4オートタイルを回り込みに設定
     */
    function treatDataTilesets(){
        // 全タイルセットに対して設定
        for( const curTileset of $dataTilesets ){
            if( !curTileset ) continue;
            const flags = curTileset.flags;

            if( _UseLayeredCounter ){
                // カウンタータイル(A2)を走査
                for( let tileId = Tilemap.TILE_ID_A2; tileId < Tilemap.TILE_ID_A3; tileId += AUTOTILE_BLOCK ){
                    if( isCounterTile( flags[ tileId ] ) ) counter2UpperLayer( flags, tileId );
                }
            }

            if( !_IsA2FullCollision ){
                // 地面タイル(A2)を走査し[×]判定の中を通行可に変更
                for( let tileId = Tilemap.TILE_ID_A2; tileId < Tilemap.TILE_ID_A3; tileId += AUTOTILE_BLOCK ){
                    if( flags[ tileId + 15 ] & MASK_ALL_DIR  ){
                        ground2Empty( flags, tileId );
                    }
                }
            }

            // 屋根タイル(A3)を走査
            for( let tileId = Tilemap.TILE_ID_A3; tileId < Tilemap.TILE_ID_A4; tileId += AUTOTILE_BLOCK ){
                if( isCounterTile( flags[ tileId ] ) ){
                    if( Tilemap.isRoofTile( tileId ) ){
                        roof2UpperLayer( flags, tileId );
                    }else{
                        wallSide2UpperLayer( flags, tileId );
                    }
                }else if( Tilemap.isRoofTile( tileId ) ){
                    roof2Bottom( flags, tileId );
                }
            }

            // 壁タイル(A4)を走査
            for( let tileId = Tilemap.TILE_ID_A4; tileId < Tilemap.TILE_ID_MAX; tileId += AUTOTILE_BLOCK ){
                if( isCounterTile( flags[ tileId ] ) ){
                    if( Tilemap.isWallTopTile( tileId ) ){
                        wallTop2UpperLayer( flags, tileId );
                    }else{
                        wallSide2UpperLayer( flags, tileId );
                    }
                }else if( !_IsA4UpperOpen && Tilemap.isWallTopTile( tileId ) ){
                    wallTop2Close( flags, tileId );
                }
            }
        }

    }

    // カウンターの通行設定
    function counter2UpperLayer( flags, tileId ){
        for( let i = 0; i < 47; i++ ){
            flags[ tileId + i  ] = flags[ tileId + i ] & MASK_WITHOUT_DIR_UPPER | COUNTER_PASS[ i ];
        }
    }

    // 内側を空にする。
    function ground2Empty( flags, tileId ){
        for( let i = 0; i < 47; i++ ){
            flags[ tileId + i  ] = flags[ tileId + i ] & MASK_WITHOUT_DIR_UPPER | AUTO_TILE_EMPTY_PASS[ i ];
        }
    }
    
    //  屋根の通行設定(カウンターON)
    function roof2UpperLayer( flags, tileId ){
        const flag = flags[ tileId + 15 ];
        if( flag & MASK_ALL_DIR ){  // [×] 
            if( _OverpassTerrainTag !== 0 && flag >> 12 === _OverpassTerrainTag ){
                // 上端を立体交差表示、適宜通行不可[・]
                for( let i = 0; i < 16; i++ ){
                    flags[ tileId + i ] = flags[ tileId + i ] & MASK_CLIF | A3_UPPER_OVERPASS[ i ];
                }
            }else{
                // 上端を書き割り表示[☆]、適宜通行不可[・]
                for( let i = 0; i < 16; i++ ){
                    flags[ tileId + i ] = flags[ tileId + i ] & MASK_WITHOUT_DIR_UPPER | A3_UPPER_PASS[ i ];
                }
            }
        }else{  // [○] : 全体を高層表示[☆]かつ通行可
            for( let i = 0; i < 16; i++ ){
                flags[ tileId + i ] = flags[ tileId + i ] & MASK_WITHOUT_DIR_UPPER | FLAG_UPPER;
            }
        }
    }

    //  屋根の通行設定(カウンターOFF)
    function roof2Bottom( flags, tileId ){
        if( !( flags[ tileId + 15 ] & MASK_ALL_DIR ) ) return;
        // [×] : 全体を閉じる
        for( let i = 0; i < 16; i++ ){
            flags[ tileId + i ] = flags[ tileId + i ] & MASK_WITHOUT_DIR_UPPER | A3_BOTTOM_PASS[ i ];
        }
    }

    //  壁(上面)の通行設定
    function wallTop2UpperLayer( flags, tileId ){
        if( flags[ tileId + 46 ] & MASK_ALL_DIR  ){
            if( isLadderTile() ){
                // [×] : 北端を高層表示[☆]、適宜通行不可[・]
                for( let i = 0; i < 47; i++ ){
                    flags[ tileId + i ] = flags[ tileId + i ] & MASK_WITHOUT_DIR_UPPER | A4_UPPER_PASS[ i ];
                }
            }else{
                    // [×] : 北端を高層表示[☆]、適宜通行不可[・]
                    for( let i = 0; i < 47; i++ ){
                        flags[ tileId + i ] = flags[ tileId + i ] & MASK_WITHOUT_DIR_UPPER_LADDER | A4_UPPER_STAR_PASS[ i ];
                    }
            }        
        }else{
            // [○] : 全体を高層表示[☆]かつ通行可
            for( let i = 0; i < 47; i++ ){
                flags[ tileId + i ] = flags[ tileId + i ] & MASK_WITHOUT_DIR_UPPER | FLAG_UPPER;
            }
        }
    }
    //  壁(上面)の通行設定(地面)
    function wallTop2Close( flags, tileId ){
        if( !( flags[ tileId + 46 ] & MASK_ALL_DIR  ) ) return;
        // [×] : 全体を閉じる
        for( let i = 0; i < 47; i++ ){
            flags[ tileId + i ] = flags[ tileId + i ] & MASK_WITHOUT_DIR_UPPER | AUTO_TILE_EMPTY_PASS[ i ];
        }
    }

    //  壁(側面)の通行設定
    function wallSide2UpperLayer( flags, tileId ){
        if( flags[ tileId + 15 ] & MASK_ALL_DIR  ){
            // [×] : 上端を高層表示[☆]、適宜通行不可[・]
            for( let i = 0; i < 16; i++ ){
                flags[ tileId + i ] = flags[ tileId + i ] & MASK_WITHOUT_DIR_UPPER | WALL_SIDE_PASS_EDGE[ i ];
            }
        }else{
            // [○] : 全体を高層表示[☆]かつ通行可(一番下のみ通行不可)
            for( let i = 0; i < 16; i++ ){
                flags[ tileId + i ] = flags[ tileId + i ] & MASK_WITHOUT_DIR_UPPER | WALL_SIDE_PASS[ i ];
            }
        }
    }
}



/*---- Scene_Map ---*/
/**
 * シーン表示前に、マップデータを書き換える
 */
const _Scene_Map_onMapLoaded = Scene_Map.prototype.onMapLoaded;
Scene_Map.prototype.onMapLoaded = function( ){
    treatDataMap();
    _Scene_Map_onMapLoaded.call( this );
    // end: onMapLoaded

    /**
     * カウンター設定のA3・A4オートタイルの箇所に、低層の補完タイルを設定
     */
    function treatDataMap(){
        for( let y = 0; y < $dataMap.height; y++ ){
            for( let x = 0; x < $dataMap.width; x++ ){
                const tileId = getMapData( x, y, 0 );
                if( !isA3A4Tile( tileId ) ) continue;

                // タイルを補完
                //setMapData( x, y, 1, tileId );
                setMapData( x, y, 2, tileId ); // TODO : 立体交差地形タグ表示レイヤー変更

                if( _FillWithNeighborTile ){
                    // 北タイルで補完ただし、一番南は南で補完
                    const southTileId = getMapData( x, $gameMap.roundY( y + 1 ) , 0 );
                    if( isA3A4Tile( southTileId ) ){
                        const northTileId = getMapData( x, $gameMap.roundY( y - 1 ), 0 );
                        setMapData( x, y, 0, northTileId ? northTileId : _DefaultLowerTileId );
                    }else{
                        setMapData( x, y, 0, southTileId ? southTileId : _DefaultLowerTileId );
                    }
                } else {
                    // 指定タイルで補完
                    setMapData( x, y, 0, _DefaultLowerTileId );
                }
            }
        }

        /**
         * A3・A4タイルか。
         * @param {Number} tileId タイルID
         * @returns {Boolean} 
         */
        function isA3A4Tile( tileId ){
            return ( Tilemap.isTileA3( tileId ) || Tilemap.isTileA4( tileId ) );
        }
        /**
         * 指定位置のタイルIDを返す。
         * @param {Number} x x座標(タイル数)
         * @param {Number} y y座標(タイル数)
         * @param {*} z レイヤー位置
         * @returns {Number} タイルID
         */
        function getMapData( x, y, z ){
            return $dataMap.data[ x + ( $gameMap.roundY( y ) + z * $dataMap.height ) * $dataMap.width ];
        }
        /**
         * マップデータにタイルIDを書き込む。
         * @param {Number} x x座標(タイル数)
         * @param {Number} y y座標(タイル数)
         * @param {Number} z レイヤー位置
         * @param {Number} tileId タイルID
         */
        function setMapData( x, y, z, tileId ){
            $dataMap.data[ x + ( $gameMap.roundY( y ) + z * $dataMap.height ) * $dataMap.width ] = tileId;
        }

    }
}



/*---- Game_CharacterBase ----*/
/**
 * レイヤー位置を返す。
 * @returns {Number} レイヤー位置(立体交差上5、その他3)
 */
const _Game_CharacterBase_screenZ = Game_CharacterBase.prototype.screenZ;
Game_CharacterBase.prototype.screenZ = function() {
    return this._higherLevel ? 5: _Game_CharacterBase_screenZ.call( this );
};

/**
 * 指定方向への移動が可能か
 * キャラクタ半分の位置が関係するものは、ここで判定。
 * @param {Number} x タイル数
 * @param {Number} y タイル数
 * @param {Number} d 向き(テンキー対応)
 * @returns {Boolean} 移動可能か
 */
const _Game_CharacterBase_isMapPassable = Game_CharacterBase.prototype.isMapPassable;
Game_CharacterBase.prototype.isMapPassable = function( x, y, d ){
    x = Math.floor( this._realX + 0.5 );
    y = Math.floor( this._realY + 0.5 );
    const halfPos = getHalfPos( this._realX, this._realY );

    /**
     * 指定位置に指定flagがあるか
     * @param {Number} x タイル数
     * @param {Number} y タイル数
     * @param {Number} collisionType 調べるタイルのflag(高層[☆]と通行)
     * @returns {Boolean} 
     */
    const checkCollision = ( x, y, collisionType )=>{
        const flags = $gameMap.tilesetFlags();
        const tiles = $gameMap.allTiles( Math.floor( x ), Math.floor( y ) );
        
        for ( let i = 0; i < tiles.length; i++ ){
            if( ( flags[ tiles[ i ] ] & MASK_UPPER_DIR ) === collisionType ) return true;
        }
        return false;
    }

    // FLOOR1_N_FULL
    if( d === 2 ){
        if( ( halfPos === 2 || halfPos === 3 ) && checkCollision( x,  y + 1, FLOOR1_N_FULL ) ) return false;
        if( halfPos === 2 && checkCollision( x - 1,  y + 1, FLOOR1_N_FULL ) ) return false;
    }else if( d === 8 ){
        if( ( halfPos === 2 || halfPos === 3 ) && checkCollision( x,  y, FLOOR1_N_FULL ) ) return false;
        if( ( halfPos === 2 ) && checkCollision( x - 1,  y, FLOOR1_N_FULL ) ) return false;
    }else if( d === 4 ){
        if( halfPos === 1 && checkCollision( x - 1, y, FLOOR1_N_FULL ) ) return false;
    }else if( d === 6 ){
        if( halfPos === 1 && checkCollision( x + 1, y, FLOOR1_N_FULL ) ) return false;
     }

    //FLOOR1_S_FULL
    if( d === 2 ){
        if( ( halfPos === 0 || halfPos === 1 ) && checkCollision( x,  y, FLOOR1_S_FULL ) ) return false;
        if( halfPos === 0 && checkCollision( x - 1,  y, FLOOR1_S_FULL ) ) return false;
    }else if( d === 8 ){
        if( ( halfPos === 0 || halfPos === 1 ) && checkCollision( x,  y - 1, FLOOR1_S_FULL ) ) return false;
        if( halfPos === 0 && checkCollision( x - 1,  y - 1, FLOOR1_S_FULL ) ) return false;
    }else if( d === 4 ){
        if( halfPos === 3 && checkCollision( x - 1, y, FLOOR1_S_FULL ) ) return false;
    }else if( d === 6 ){
        if( halfPos === 3 && checkCollision( x + 1, y, FLOOR1_S_FULL ) ) return false;
     }

    // FLOOR1_N_HALF
    if( d === 2 ){
        if( halfPos === 3 && checkCollision( x, y + 1, FLOOR1_N_HALF ) ) return false;
    }else if( d === 8 ){
        if( halfPos === 3 && checkCollision( x, y, FLOOR1_N_HALF ) ) return false;
    }else if( d === 4 ){
        if( halfPos === 0 && checkCollision( x - 1, y, FLOOR1_N_HALF ) ) return false;
    }else if( d === 6 ){
        if( halfPos === 0 && checkCollision( x, y, FLOOR1_N_HALF ) ) return false;
     }

    // FLOOR1_S_HALF
    if( d === 2 ){
        if( halfPos === 1 && checkCollision( x, y, FLOOR1_S_HALF ) ) return false;
    }else if( d === 8 ){
        if( halfPos === 1 && checkCollision( x, y - 1, FLOOR1_S_HALF ) ) return false;
    }else if( d === 4 ){
        if( halfPos === 2 && checkCollision( x - 1, y, FLOOR1_S_HALF ) ) return false;
    }else if( d === 6 ){
        if( halfPos === 2 && checkCollision( x, y, FLOOR1_S_HALF ) ) return false;
     }

    // FLOOR1_S_FLAT
    if( d === 2 ){
        if( halfPos === 3 && checkCollision( x, y, FLOOR1_S_FLAT ) ) return false;
    }else if( d === 8 ){
        if( halfPos === 1 && checkCollision( x, y - 1, FLOOR1_S_FLAT ) ) return false;
    }

    // Overpass 用のプログラム
    const isMapPassable = _Game_CharacterBase_isMapPassable.apply( this, arguments );
    if( _OverpassTerrainTag === 0 ) return isMapPassable;

    if( this._higherLevel ){
        if( isDownFromUpperTile( x, y, d, halfPos ) ) this._higherLevel = false;
        return isMapPassable;
    }


    // 下を潜っている状態は端の通行判定を逆転
    if( isOverpassTile( x, y ) ){
        if( halfPos === 0 || halfPos === 1 ){
            if( d === 8 ){
                if( !isOverpassTile( x, y - 2 ) && checkOverpassCollision( x, y - 1, 2 ) === false ) return false;
            }
        }else{
            if( d === 2 ){
                if( !isOverpassTile( x, y + 1 ) && checkOverpassCollision( x, y, 2 ) === false ) return false;
            }
        }
        if( halfPos === 1 || halfPos === 3 ){
            if( d === 4 ){
                if( !isOverpassTile( x - 1, y ) && checkOverpassCollision( x, y, 4 ) === false ) return false;
            }else if( d === 6 ){
                if( !isOverpassTile( x + 1, y ) && checkOverpassCollision( x, y, 6 ) === false ) return false;
            }
        }
        return true;
    }else{
        // 東の境界
        if( halfPos === 0 ){
            if( d === 8 && isOverpassTile( x - 1, y ) ){
                return !( !isOverpassTile( x - 1, y - 2 ) && checkOverpassCollision( x - 1, y - 1, 2 ) === false );
            }
        }else if( halfPos === 2 ){
            if( d === 2 ){
                if( isOverpassTile( x - 1, y ) ){
                    return !( !isOverpassTile( x - 1, y + 1 ) && checkOverpassCollision( x - 1, y, 2 ) === false );
                }
                if( checkOverpassCollision( x - 1, y + 1, 8 ) && checkOverpassCollision( x - 1, y + 1, 6 ) ) return true;
                // 西の境界
                if( checkOverpassCollision( x, y + 1, 8 ) && checkOverpassCollision( x, y + 1, 4 ) ) return true;
            }
        }
    }

    // 潜る
    if( halfPos === 0 ){
        if( d === 8 &&
            checkOverpassCollision( x, y - 1, 2 ) &&
            checkOverpassCollision( x - 1, y - 1, 2 )
        ) return true;
    }else if( halfPos === 1 ){
        if( d === 4 ){
            if( checkOverpassCollision( x - 1,  y, 6 ) ){
                if( checkOverpassCollision( x - 1,  y, 8 ) ){
                    return true;
                }else{
                    if( checkOverpassCollision( x - 1, y - 1, 6 ) ) return true;
                }
            }
            if( checkOverpassCollision(  x - 1, y, 6 ) &&
                 checkOverpassCollision(  x - 1, y - 1, 6 )
            ) return true;
        }else if( d === 6 ){
            if( checkOverpassCollision( x + 1,  y, 4 ) ){
                if( checkOverpassCollision( x + 1,  y, 8 ) ){
                    return true;
                }else{
                    if( checkOverpassCollision( x + 1, y - 1, 4 ) ) return true;
                }
            }
        }else if( d === 8 ){
            if( checkOverpassCollision( x, y - 1, 2 ) ) return true;
        }
    }else if( halfPos === 2 ){
        if( d === 2 ){
            if( checkOverpassCollision( x, y + 1, 8 ) &&
                checkOverpassCollision( x - 1, y + 1, 8 )
            ) return true;
        }
    }else if( halfPos === 3 ){
        if( d === 2 ){
            if( checkOverpassCollision( x, y + 1, 8 ) ) return true;
        }else if( d === 4 ){
            if( checkOverpassCollision( x - 1,  y, 6 ) ){
                if( checkOverpassCollision( x - 1,  y, 8 ) ){
                    return true;
                }else{
                    if( _UseTallSizeCharacter ){
                                if( checkOverpassCollision( x - 1, y - 1, 6 ) ) return true;
                    }else{
                        return true;
                    }
                }
            }
        }else if( d === 6 ){
            if( checkOverpassCollision( x + 1,  y, 4 ) ){
                if( checkOverpassCollision( x + 1,  y, 8 ) ){
                    return true;
                }else{
                    if( _UseTallSizeCharacter ){
                                if( checkOverpassCollision( x + 1, y - 1, 4 ) ) return true;
                    }else{
                        return true;
                    }
                }
            }
        } 
    }


    // 境界の北の衝突判定
    if( halfPos === 3 ){
        if( d === 4 ){
            if( !isOverpassTile( x - 1, y ) &&  !isOverpassTile( x - 1, y + 1 ) &&
            checkOverpassCollision( x, y + 1, 4 ) === false &&
            checkOverpassCollision( x, y + 1, 8 ) ) return false;
            if( !isOverpassTile( x - 1, y ) &&  !isOverpassTile( x, y + 1 ) &&
            checkOverpassCollision( x - 1, y + 1, 6 ) === false &&
            checkOverpassCollision( x - 1, y + 1, 8 ) ) return false;
        }else if( d === 6 ){
            if( !isOverpassTile( x + 1, y ) &&  !isOverpassTile( x + 1, y + 1 ) &&
            checkOverpassCollision( x, y + 1, 6 ) === false &&
            checkOverpassCollision( x, y + 1, 8 ) ) return false;
            if( !isOverpassTile( x + 1, y ) &&  !isOverpassTile( x, y + 1 ) &&
            checkOverpassCollision( x + 1, y + 1, 4 ) === false &&
            checkOverpassCollision( x + 1, y + 1, 8 ) ) return false;
        }
    }else{
        if( halfPos === 2 && d === 2 ){
            if( !isOverpassTile( x, y + 1 ) &&  !isOverpassTile( x - 1, y + 1 ) ){
                if( !isOverpassTile( x - 1, y + 2 ) &&
                checkOverpassCollision( x, y + 2, 4 ) === false &&
                checkOverpassCollision( x, y + 2, 2 ) ) return false;
                if( !isOverpassTile( x, y + 2 ) &&
                checkOverpassCollision( x - 1, y + 2, 6 ) === false &&
                checkOverpassCollision( x - 1, y + 2, 2 ) ) return false;
            }
        }
    }

    // 境界の南の衝突判定
    if( halfPos === 1 || ( _UseTallSizeCharacter && halfPos === 3 ) ){
        if( d === 4 ){
            if( !isOverpassTile( x - 1, y ) &&  !isOverpassTile( x - 1, y - 1 ) &&
            checkOverpassCollision( x, y - 1, 4 ) === false &&
            checkOverpassCollision( x, y - 1, 2 ) ) return false;
            if( !isOverpassTile( x - 1, y ) &&  !isOverpassTile( x, y - 1 ) &&
            checkOverpassCollision( x - 1, y - 1, 6 ) === false &&
            checkOverpassCollision( x - 1, y - 1, 2 ) ) return false;
        }else if( d === 6 ){
            if( !isOverpassTile( x + 1, y ) &&  !isOverpassTile( x + 1, y - 1 ) &&
            checkOverpassCollision( x, y - 1, 6 ) === false &&
            checkOverpassCollision( x, y - 1, 2 ) ) return false;
            if( !isOverpassTile( x + 1, y ) &&  !isOverpassTile( x, y - 1 ) &&
            checkOverpassCollision( x + 1, y - 1, 4 ) === false &&
            checkOverpassCollision( x + 1, y - 1, 2 ) ) return false;
        }
    }else if( _UseTallSizeCharacter ){
        if( halfPos === 0 && d === 8 ){
            if( !isOverpassTile( x, y - 1 ) &&  !isOverpassTile( x - 1, y - 1 ) ){
                if( !isOverpassTile( x - 1, y - 2 ) &&
                checkOverpassCollision( x, y - 2, 4 ) === false &&
                checkOverpassCollision( x, y - 2, 2 ) ) return false;
                if( !isOverpassTile( x, y - 2 ) &&
                checkOverpassCollision( x - 1, y - 2, 6 ) === false &&
                checkOverpassCollision( x - 1, y - 2, 2 ) ) return false;
            }
        }
    }else{
        if( halfPos === 2 && d === 8 ){
            if( !isOverpassTile( x, y ) &&  !isOverpassTile( x - 1, y ) ){
                if( !isOverpassTile( x - 1, y - 1 ) &&
                checkOverpassCollision( x, y - 1, 4 ) === false &&
                checkOverpassCollision( x, y - 1, 2 ) ) return false;
                if( !isOverpassTile( x, y - 1 ) &&
                checkOverpassCollision( x - 1, y - 1, 6 ) === false &&
                checkOverpassCollision( x - 1, y - 1, 2 ) ) return false;
            }
        }
    }

    // 乗る
    if( isUp2Higher( x, y, d, halfPos ) ) this._higherLevel = true;

    return isMapPassable;
}

/*---- Game_Follower ----*/
/**
 * 指定位置の指定フラグビットが通行可か。
 * @param {Number} character 追うキャラクタ
 */
const _Game_Follower_chaseCharacter      = Game_Follower.prototype.chaseCharacter;
Game_Follower.prototype.chaseCharacter = function( character ){
    if( _OverpassTerrainTag === 0 ){
        _Game_Follower_chaseCharacter.apply( this, arguments );
        return;
    }

    const sx = this.deltaXFrom( character.x );
    const sy = this.deltaYFrom( character.y );
    const d = 5 - Math.sign( sx ) + ( ( sx === 0 ) ? Math.sign( sy ) * 3 : 0 );
    if( d === 5 ){
        _Game_Follower_chaseCharacter.apply( this, arguments );
        return;
    }

    const x = Math.floor( this.x + 0.5 );
    const y = Math.floor( this.y + 0.5 );
    const halfPos = getHalfPos( this.x, this.x );
    if( this._higherLevel ){
        if( isDownFromUpperTile( x, y, d, halfPos ) ) this._higherLevel = false;
    }else{
        if( isUp2Higher( x, y, d, halfPos ) ) this._higherLevel = true;
    }

    _Game_Follower_chaseCharacter.apply( this, arguments );
}

/*---- Game_Map ----*/
/**
 * 指定位置の指定フラグビットが通行可か。
 * @param {Number} x タイル数
 * @param {Number} y タイル数
 * @param {Number} bit {@link RPG.Tileset}の flagsチェック用ビット
 * @returns {Boolean} 高層表示[☆]の4方向の通行設定については@helpを参照
 */
const _Game_Map_checkPassage = Game_Map.prototype.checkPassage;
Game_Map.prototype.checkPassage = function( x, y, bit ){
    const flags = this.tilesetFlags();
    const tiles = this.allTiles( x, y );
    for ( let i = 0; i < tiles.length; i++ ){
        const tileId = tiles[ i ];
        const flag = flags[ tileId ];

        // ここでは高層[☆]タイルのみ判定するので他は無視
        if( !(flag & FLAG_UPPER ) ) continue;

        // 上通行不可[・]は特殊設定用のビットに使う
        // そのため通行判定として無視
        if( flag & FLAG_NORTH_DIR ) continue;

        // 高層[☆]の通行不可[・]設定は
        // 他の重なったタイルによらず通行不可
        if(  ( flag & bit ) === bit ) return false;
    }
    return _Game_Map_checkPassage.apply( this, arguments );
};


/**
 * カウンター設定か。
 * @param {Number} tileFlag タイルのフラグ情報
 */
function isCounterTile( tileFlag ){
    return ( tileFlag  & FLAG_COUNTER ) === FLAG_COUNTER;
}

/**
 * 梯子設定か。
 * @param {Number} tileFlag タイルのフラグ情報
 */
function isLadderTile( tileFlag ){
   return ( tileFlag  & FLAG_LADDER ) === FLAG_LADDER;
}

/**
 * タイル内の位置を返す( 0:左上, 1:上, 2:左下, 3:下 )
 * @param {Number} x x座標(タイル数)
 * @param {Number} y y座標(タイル数)
 */
function getHalfPos( x, y ){
    return ( ( ( x % 1 ) === 0 ) ? 1 : 0 ) + ( ( ( y % 1 ) === 0 ) ? 2 : 0 );
}

function isRoofTile( x, y ){
    const tiles = $gameMap.allTiles( Math.floor( $gameMap.roundX( x ) ), Math.floor( $gameMap.roundY( y ) ) );

    for ( let i = 0; i < tiles.length; i++ ){
        if( Tilemap.isRoofTile( tiles[ i ] ) ) return true;
    }
    return false;
}
/**
 * 指定位置の立体交差地形タグを持つタイルの通行判定(4方向)チェック
 * @param {Number} ax タイル数
 * @param {Number} ay タイル数
 * @param {Number} d 通行設定(テンキー方向)
 * @returns {Boolean} 立体交差タイルでない場合nullを返す
 */
function checkOverpassCollision( x, y, d ){
    const flags = $gameMap.tilesetFlags();
    const tiles = $gameMap.allTiles( Math.floor( $gameMap.roundX( x ) ), Math.floor( $gameMap.roundY( y ) ) );

    for ( let i = 0; i < tiles.length; i++ ){
        const flag = flags[ tiles[ i ] ];
        if( flag >> 12  === _OverpassTerrainTag ){
            return 0 < ( flag & ( 1 << ( d / 2 - 1 ) ) );
        }
    }
    return null;
}

/**
 * 指定位置の立体交差地形タグを持つタイルの通行判定(4方向)チェック
 * @param {Number} x タイル数
 * @param {Number} y タイル数
 * @returns {Boolean} 立体交差タイルでない場合nullを返す
 */
function isOverpassTile( x, y ){
    return $gameMap.terrainTag( $gameMap.roundX( x ), $gameMap.roundY( y ) ) === _OverpassTerrainTag;
}

/**
 * 高層へ上がるタイミングか
 * @param {Number} x タイル数
 * @param {Number} y タイル数
 * @param {Number} d 通行設定(テンキー方向)
 * @param {Number} halfPos タイル内での位置
 * @returns {Boolean} 
 */
function isUp2Higher( x, y, d, halfPos ){
    if( halfPos === 0 || halfPos === 2 ){
        if( !isOverpassTile( x - 1, y ) && checkOverpassCollision( x, y, 4 ) === false ) return true;   // 西出入口境界
    }
    if( isOverpassTile( x, y ) ) return false;   // 立体交差タイルの上は帰す

    return (
        checkOverpassCollision( x - 1, y, 6 ) === false ||  // 東出入口
        checkOverpassCollision( x + 1, y, 4 ) === false ||  // 西出入口
        checkOverpassCollision( x, y + 1, 8 ) === false ||  // 北入り口↓
        ( !isOverpassTile( x - 1, y ) && checkOverpassCollision( x - 1, y + 1, 8 ) === false ) ||
        checkOverpassCollision( x, y - 2, 2 ) === false ||  // 南入口↓
       ( !isOverpassTile( x - 1, y ) && (
            checkOverpassCollision( x - 1, y - 2, 2 ) === false ||
            checkOverpassCollision( x - 1, y - 1, 2 ) === false )
        ) ||
       ( !isOverpassTile( x + 1, y ) && checkOverpassCollision( x + 1, y - 1, 2 ) === false )
    );
}

/**
 * 高層から降りるタイミングか
 * @param {Number} x タイル数
 * @param {Number} y タイル数
 * @param {Number} d 通行設定(テンキー方向)
 * @param {Number} halfPos タイル内での位置
 * @returns {Boolean} 
 */
function isDownFromUpperTile( x, y, d, halfPos ){
    if( isOverpassTile( x, y ) ) return false;  // 立体交差タイルの上は帰す
    if( checkOverpassCollision( x, y - 1, 2 ) === false ) return false;  // 南入り口タイルは帰す
    if( ( halfPos === 0 || halfPos === 2 ) && checkOverpassCollision( x -1, y - 1, 2 ) === false ) return false;

    // 全周に立体交差タイルの入り口がない
    return checkOverpassCollision( x + 1, y, 4 ) !== false &&   // 東
                  checkOverpassCollision( x - 1, y, 6 ) !== false &&    // 西
                  checkOverpassCollision( x, y + 1, 8 ) !== false &&    // 南
                  checkOverpassCollision( x - 1, y + 1, 8 ) !== false &&  // 南西
                  checkOverpassCollision( x, y - 2, 2 ) !== false;  // ふたつ北
}

})();