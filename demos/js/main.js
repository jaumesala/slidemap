/*!
 * Slidemap jQuery plug-in v.0.1.0
 *
 * https://github.com/jaumesala/slidemap
 *
 * Authored by Jaume Sala
 * http://jaumesala.net
 *
 * Copyright 2015, Jaume Sala
 * License: MIT License (MIT)
 * http://opensource.org/licenses/MIT
 *
 */

$(function(){


	$("#slidemap-horizontal").slideMap();

	
	$("#slidemap-3d").slideMap({
		useMaskShadow 	: true,
	});

	
	$("#slidemap-captions").slideMap({
		showControls 	: true,
	});

	
	$("#slidemap-callbacks").slideMap({
		showControls 	: true,
		onMoveToArea 	: function(cm, cs){ log("Map: "+cm+" - Slide: "+cs)},
		onAreaClicked 	: function(){ log("Area Clicked [Coords: "+ $(this).data('coords') +"]")},
		onControlNext 	: function(){ log("Control - Next clicked")},
		onControlPrev 	: function(){ log("Control - Prev clicked")},
		onControlPlay 	: function(){ log("Control - Play clicked")},
		onControlPause 	: function(){ log("Control - Pause Clicked")},
	});


});


function log(message){
	$t = $('#slidemap-callbacks-console');
	
	$t	.append(message + "\n")
		.scrollTop($t[0].scrollHeight);

}