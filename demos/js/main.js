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