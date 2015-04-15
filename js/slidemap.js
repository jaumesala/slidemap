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

(function($) {

	"use strict";

	$.fn.slideMap = function(options) {

		// slider default settings
		var defaults = {
			debug 			: false,
			units			: 'px',
			showShadow 		: true,
			useMaskShadow 	: true,
			shadow 			: '<div class="slmp-shadow"><span class="slmp-s t"></span><span class="slmp-s b"></span><span class="slmp-s l"></span><span class="slmp-s r"></span></div>',
			mask 			: '<img class="slmp-thumbnail-mask">',
			grid 			: '<div class="slmp-grid"></div>',
			offsetX 		: 0,
			offsetY 		: 0,
			showControls 	: false,
			controls 		: '<div class="slmp-controls"><a data-action="prev" class="slmp-btn slmp-btn-prev" href="#">←</a><a data-action="play-pause" class="slmp-btn slmp-btn-play-pause" href="#"><span class="play">►</span><span class="pause">■</span></a><a data-action="next" class="slmp-btn slmp-btn-next" href="#">→</a></div>',
			animSpeed 		: 4000,
			automatic		: false,

			onMoveToArea 	: function(){},
			onAreaClicked 	: function(){},
			onControlNext 	: function(){},
			onControlPrev 	: function(){},
			onControlPlay 	: function(){},
			onControlPause 	: function(){},
			

		};

		// create settings from defaults and user options
		var settings = $.extend({}, defaults, options);

		// slideMap elements
		var $wrapper 		= this,
			$slide 			= $wrapper.find('.slmp-slide'),
			$image 			= $slide.find('.slmp-image'),
			grid 			= { image:{ natural:{}, scaled:{} }, map:{} },
			$captions		= $slide.find('.slmp-caption'),
			$map 			= $wrapper.find('.slmp-map'),
			shadow 			= {},
			$areas 			= $map.find('.slmp-area'),
			$thumbnail		= $map.find('.slmp-thumbnail'),
			$mask 			= $(settings.mask),
			controls 		= {},
			timer 			= undefined;


		// init all the components
		var init = function() {
			
			initMap();
			initSlide();

			if(settings.showControls) initControls();

			// setTimeout(function(){
			// 	$image.css({
			// 		opacity: 1
			// 	})
			// },1000);
			
		};
		
		var clog = function(action, content) {
			if(settings.debug){
				switch(action){
					case "start":
						console.group(content);
						break;
					case "stop":
						if(typeof content !== 'undefined') console.log(content);
						console.groupEnd();
						break;
					default:
						console.log(action);
				}
			}
		};

		// init Map components
		var initMap = function(){
			
			initAreas();
			if(settings.showShadow) initShadow();

		};

		// init Areas
		var initAreas = function() {
			
			$areas.each(function(){
				
				// get coords from data-coords attribute
				var coords = getCoords(this);
				
				// set the css position of the element
				$(this).css({
					left: coords[0]+settings.units, 		//x
					top: coords[1]+settings.units,			//y
					width: coords[2]+settings.units,		//w
					height: coords[3]+settings.units		//h
				});

			});

			// bind click
			$map.on("click", ".slmp-area", function(e){
				
				e.preventDefault();
				
				settings.onAreaClicked.call(this);
				
				moveToArea(this);

				setAnimation(false);

			});

		};

		var moveToArea = function(area) {
			
			setActiveArea(area);
			
			var coords = getCoords(area);
			
			if(settings.showShadow) moveShadow(coords);
			
			moveImage(coords);
			
			toggleCaptions($areas.index($(area)));

		};

		var getCoords = function(elem) {
			return $(elem).data("coords").split(',');
		};

		var getActiveArea = function() {
			var aa = $areas.filter('.active').first();

			return (aa.length > 0 ) ? aa : undefined;
		};

		var setActiveArea = function(elem) {
			$areas.not($(elem)).removeClass('active');
			$(elem).addClass('active');
		};

		//init shadow
		var initShadow = function() {
			
			// check if we have to use the css clip property or not
			if(settings.useMaskShadow){
				
				$mask.attr('src', $thumbnail.attr('src'));
				
				$thumbnail.after($mask);

			} else {
				
				shadow.wrapper 		= $(settings.shadow);
				shadow.sTop 		= shadow.wrapper.find('.slmp-s.t'); 
				shadow.sBottom 		= shadow.wrapper.find('.slmp-s.b'); 
				shadow.sLeft 		= shadow.wrapper.find('.slmp-s.l'); 
				shadow.sRight 		= shadow.wrapper.find('.slmp-s.r'); 

				$map.prepend(shadow.wrapper);
			}
			
			//move shadow to active area
			var activeArea = getActiveArea();

			if(activeArea){
				moveShadow(getCoords(activeArea));
			}
		};

		var moveShadow = function(coords) {

			if(settings.useMaskShadow){
				
				var top 	= parseInt(coords[1]),
					right 	= parseInt(coords[0])+parseInt(coords[2]),
					bottom 	= parseInt(coords[1])+parseInt(coords[3]),
					left 	= parseInt(coords[0]);
			
				$mask.css('clip', 'rect('+top+'px, '+right+'px, '+bottom+'px, '+left+'px)');

				// $mask.animate({
				// 	clip: 'rect('+top+'px, '+right+'px, '+bottom+'px, '+left+'px)'
				// });

			} else {
				
				shadow.sTop.css({
					left: coords[0]+settings.units,
					// top: 0,
					width: coords[2]+settings.units,
					height: coords[1]+settings.units
				});

				shadow.sBottom.css({
					left: coords[0]+settings.units,
					// bottom: 0,
					width: coords[2]+settings.units,
					height: $map.height() - coords[1] - coords[3]+settings.units,
				});

				shadow.sLeft.css({
					// left: 0+settings.units,
					// top: 0+settings.units,
					width: coords[0]+settings.units,
					// height: '100%'
				});

				shadow.sRight.css({
					// left: 0,
					// top: 0,
					width: $map.width() - coords[0] - coords[2] +settings.units,
					// height: '100%'
				});
			}
							
		};

		var initSlide = function() {
			initImage();
			initCaptions();
		};

		var initImage = function() {
			
			clog("start","initImage");

			$image.one('load', function () {
				
				grid.width 					= $slide.width();
				grid.height 				= $slide.height();
				grid.image.natural.width 	= $image.width();
				grid.image.natural.height 	= $image.height();
				grid.image.scaled.width 	= (grid.height * grid.image.natural.width) / grid.image.natural.height;
				grid.image.scaled.height 	= grid.height;
				grid.map.width 				= $map.width();
				grid.map.height 			= $map.height();
				
				clog("Get slide and image properties:")
				clog(grid);
				
				$image.css({
					width: 'auto',
					height: grid.image.scaled.height
				});

				var activeArea 	= getActiveArea();
				if(activeArea){
					moveImage(getCoords(activeArea));
				}

			}).each(function () {
				if (this.complete) $(this).load();
			});

			clog("stop");
		};


		var moveImage = function(coordsArea) {
			
			clog("start", "moveImage");
			clog("coordsArea");
			clog(coordsArea);

			var coordsTarget = [
				Math.round((grid.image.scaled.width * coordsArea[0]) / grid.map.width),
				Math.round((grid.image.scaled.height * coordsArea[1]) / grid.map.height),
				Math.round((grid.image.scaled.width * coordsArea[2]) / grid.map.width),
				Math.round((grid.image.scaled.height * coordsArea[3]) / grid.map.height),
				Math.round(coordsArea[4])
			];

			clog("coordsTarget");
			clog(coordsTarget);

			settings.onMoveToArea.call( $image, coordsArea, coordsTarget );

			var targetX = -Math.abs(coordsTarget[0]);
			var targetY = -Math.abs(coordsTarget[1]);
			var targetZ = 0;
			
			var hOverflow = coordsTarget[2] > grid.width ? true : false;
			var vOverflow = coordsTarget[3] > grid.height ? true : false;

			if(!hOverflow && !vOverflow){
				clog("Overflow: No");

				targetX += settings.offsetX + ((grid.width - coordsTarget[2]) / 2);
				
				targetY += settings.offsetY + ((grid.height - coordsTarget[3]) / 2);
				
				targetZ	+= coordsTarget[4];
				
			} else if(hOverflow && !vOverflow){
				clog("Overflow: H");
				
				targetX += settings.offsetX - ((coordsTarget[2] - grid.width) / 2);
				
				targetY += settings.offsetY + ((grid.height - coordsTarget[3]) / 2);
				
				targetZ	+= -Math.abs(coordsTarget[4] - ((coordsTarget[2] - grid.width)));
				
			} else if(!hOverflow && vOverflow){
				clog("Overflow: V");

				targetX += settings.offsetX + ((grid.width - coordsTarget[2]) / 2);
				
				targetY += settings.offsetY + ((coordsTarget[3] - grid.height) / 2);
				
				targetZ	+= -Math.abs(coordsTarget[4] - ((coordsTarget[3] - grid.height)));
				
			} else { // (hOverflow && vOverflow)
				clog("Overflow: H V");

				targetX += settings.offsetX - ((coordsTarget[2] - grid.width) / 2);
				
				targetY += settings.offsetY + ((coordsTarget[3] - grid.height) / 2);
				
				var zX = -Math.abs(coordsTarget[4] - ((coordsTarget[2] - grid.width)));
				var zY = -Math.abs(coordsTarget[4] - ((coordsTarget[3] - grid.height)));
				targetZ	+= Math.min(zX,zY);
				
			}

			targetX += settings.units;
			targetY += settings.units;
			targetZ += settings.units;

			$image.css({
				'transform': 'translate3d(' + targetX + ',' + targetY + ', ' + targetZ + ')'
			});
			clog("stop");
		};

		var initCaptions = function(){
			var activeArea 	= getActiveArea();
			if(activeArea){
				toggleCaptions(activeArea.index($areas));
			}
		};

		var toggleCaptions = function(index) {
			$captions.removeClass('active');
			$captions.eq(index).addClass('active');
		};

		var initControls = function() {
			controls.wrapper 	= $(settings.controls);
			controls.cPlayPause = controls.wrapper.find('.slmp-btn-play-pause'); 
			controls.cNext 		= controls.wrapper.find('.slmp-btn-next'); 
			controls.cPrev 		= controls.wrapper.find('.slmp-btn-prev'); 
			
			$map.after(controls.wrapper);

			controls.wrapper.addClass('pause');

			controls.wrapper.on("click", ".slmp-btn", function(e){
				e.preventDefault();
				var action = $(this).attr('data-action');

				if(action === 'next'){
					
					clog('Control Next clicked');

					var $activeArea = getActiveArea();

					settings.onControlNext.call();
					
					setAnimation(false);

					if($activeArea.next('.slmp-area').length){
					
						moveToArea($activeArea.next('.slmp-area'));

					} else {
					
						moveToArea($areas.first());

					}
				}

				if(action === 'prev'){
					
					clog('Control Prev clicked');

					var $activeArea = getActiveArea();
					
					settings.onControlPrev.call();

					setAnimation(false);

					if($activeArea.prev('.slmp-area').length){
					
						moveToArea($activeArea.prev('.slmp-area'));

					} else {
					
						moveToArea($areas.last());

					}
					
				}

				if(action === 'play-pause'){
					
					clog('Control playPause clicked');

					if(controls.wrapper.hasClass('play')){
						
						//stop
						
						settings.onControlPause.call();

						setAnimation(false);

					} else {
						
						//start
						
						settings.onControlPlay.call();

						setAnimation(true);

					}

				}

			});

			if(settings.automatic){
				
				setAnimation(true);
			
			}

		};

		var setAnimation = function(start) {
			
			if(start){
				
				if(settings.showControls){
					controls.wrapper.addClass('play').removeClass('pause');
				}
			
				timer = setInterval(function(){	

					var $activeArea = getActiveArea();

					if($activeArea.next('.slmp-area').length){
					
						moveToArea($activeArea.next('.slmp-area'));

					} else {
					
						moveToArea($areas.first());

					}

				}, settings.animSpeed);

			} else {
				
				if(settings.showControls){
					controls.wrapper.addClass('pause').removeClass('play');
				}
			
				clearInterval(timer);
			}
			

		};

		init();

	};

	$.fx.step.clip = function (fx) {
		console.log(fx);
		if (fx.pos === 0) {
			
			var clipRegex = /rect\(([0-9\.]{1,})(px|em)[,]?\s+([0-9\.]{1,})(px|em)[,]?\s+([0-9\.]{1,})(px|em)[,]?\s+([0-9\.]{1,})(px|em)\)/;
			
			var clipCss = ($(fx.elem).css('clip') || '').replace(/,/g, ' ');
			
			fx.start = clipRegex.exec(clipCss);
			
			if (typeof fx.end === 'string') {
				fx.end = clipRegex.exec(fx.end.replace(/,/g, ' '));
			}

		}

		if (fx.start && fx.end) {
			var sarr 		= new Array(), 
				earr 		= new Array(), 
				spos 		= fx.start.length, 
				epos 		= fx.end.length,
				emOffset 	= fx.start[ss + 1] == 'em' ? (parseInt($(fx.elem).css('fontSize')) * 1.333 * parseInt(fx.start[ss])) : 1;
				
				for (var ss = 1; ss < spos; ss += 2) { 
					sarr.push(parseInt(emOffset * fx.start[ss])); 
				}
				
				for (var es = 1; es < epos; es += 2) { 
					earr.push(parseInt(emOffset * fx.end[es])); 
				}
				
				fx.elem.style.clip = 'rect(' +
					parseInt((fx.pos * (earr[0] - sarr[0])) + sarr[0]) + 'px ' +
					parseInt((fx.pos * (earr[1] - sarr[1])) + sarr[1]) + 'px ' +
					parseInt((fx.pos * (earr[2] - sarr[2])) + sarr[2]) + 'px ' +
					parseInt((fx.pos * (earr[3] - sarr[3])) + sarr[3]) + 'px)';
		}
	};

}( jQuery ));