# TF_VectorWindow の作り

* ウィンドウの画像をベクター描画する。
* 種類の変更は Window_Message の方でしか基本やらない。
* 


### [Window](https://katai5plate.github.io/RPGMV-CoreScript-Reference/jsdoc/Window.html) で書き換えているメソッド

* initialize	
* _refreshFrame	SceneCustomMenu.jsへの対応 / 基本的に、こっちは何もしてない。
* _refreshBack  SceneCustomMenu.jsへの対応 / こちらで全体のウィンドウ描画を呼んでいる。


### [Window_Base](https://katai5plate.github.io/RPGMV-CoreScript-Reference/jsdoc/Window_Base.html) で書き換えているメソッド

* standardFontSize
* standardPadding
* textPadding
* lineHeight
* calcTextHeight


### [Window_Message](https://katai5plate.github.io/RPGMV-CoreScript-Reference/jsdoc/Window_Message.html) で書き換えているメソッド

* standardFontSize
* numVisibleRows
* textPadding
* lineHeight
* initialize
* startMessage
* _refreshBack
* updatePlacement
* _refreshContents
* windowHeight

### 関数

* refreshWindowFrame
* array2CssColor
* cssColor2Array
* drawWindow
* tintColor
* setShadowParam
* setBorderParam
* drawBalloon
* drawRoundrect
* drawOctagon
* drawSpike


### 変数

* TF_refleshWindow