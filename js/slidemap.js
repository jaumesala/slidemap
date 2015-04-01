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
			controls 		: '<div class="slmp-controls btn-group"><a data-action="prev" class="btn btn-sm btn-link slmp-c slmp-prev" href="#"><i class="fa fa-fw fa-backward"></i></a><a data-action="play-pause" class="btn btn-sm btn-link slmp-c slmp-play-pause" href="#"><span class="play"><i class="fa fa-fw fa-play"></i></span><span class="pause"><i class="fa fa-fw fa-pause"></span></i></a><a data-action="next" class="btn btn-sm btn-link slmp-c slmp-next" href="#"><i class="fa fa-fw fa-forward"></i></a></div>',
			animSpeed 		: 4000, 	// delay between transitions
			automatic 		: false, 	// enable/disable automatic slide rotation
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


		var init = function() {
			// test
			// $wrapper.css('background-color', '#000');

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

		var initMap = function(){
			
			initAreas();
			if(settings.showShadow) initShadow();
		};

		var initAreas = function() {
			
			$areas.each(function(){
				var coords = $(this).data("coords").split(',');
				
				$(this).css({
					left: coords[0]+settings.units, 		//x
					top: coords[1]+settings.units,			//y
					width: coords[2]+settings.units,		//w
					height: coords[3]+settings.units		//h
				});

			});

			$map.on("click", ".slmp-area", function(e){
				var coords = $(this).data("coords").split(',');
				
				e.preventDefault();
				$areas.not($(this)).removeClass('active');
				$(this).addClass('active');
					
				if(settings.showShadow) moveShadow(coords);
				moveImage(coords);
				toggleCaptions($areas.index($(this)));	
			});

		};

		var initShadow = function() {
			
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
			
			
			var activeArea 	= $areas.filter('.active').first();
			
			if(activeArea.length > 0){
				moveShadow(activeArea.data('coords').split(','));
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

				var activeArea 	= $areas.filter('.active').first();
				if(activeArea.length > 0){
					moveImage(activeArea.data('coords').split(','));
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
			var activeArea 	= $areas.filter('.active').first();
			toggleCaptions(activeArea.index($areas));	
		};

		var toggleCaptions = function(index) {
			$captions.removeClass('active');
			$captions.eq(index).addClass('active');
		};

		var initControls = function() {
			controls.wrapper 	= $(settings.controls);
			controls.cPlayPause = controls.wrapper.find('.slmp-play-pause'); 
			controls.cNext 		= controls.wrapper.find('.slmp-next'); 
			controls.cPrev 		= controls.wrapper.find('.slmp-prev'); 
			
			$map.after(controls.wrapper);

			controls.wrapper.addClass('pause');

			controls.wrapper.on("click", ".slmp-c", function(e){
				e.preventDefault();
				var action = $(this).attr('data-action');

				if(action === 'next'){
					clog('Control Next clicked');

					var $activeArea = $areas.filter('.active').first();
					
					if($activeArea.next('.slmp-area').length){
						$activeArea.next('.slmp-area').trigger('click');
					} else {
						$areas.first().trigger('click');
					}
				}

				if(action === 'prev'){
					clog('Control Prev clicked');

					var $activeArea = $areas.filter('.active').first();
					
					if($activeArea.prev('.slmp-area').length){
						$activeArea.prev('.slmp-area').trigger('click');
					} else {
						$areas.last().trigger('click');
					}
					
				}

				if(action === 'play-pause'){
					clog('Control playPause clicked');

					if(controls.wrapper.hasClass('play')){
						//stop
						setAnimation(false);
					} else {
						//start
						setAnimation(true);
					}
				}

			});

			if(settings.automatic){
				setAnimation(true);
			}

		};

		var setAnimation = function(start) {
			controls.wrapper.toggleClass('play pause');
						
			if(start){
				timer = setInterval(function(){	
					controls.cNext.trigger('click');
				}, settings.animSpeed);
			} else {
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