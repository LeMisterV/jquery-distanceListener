(function(window, $, undef) {
	if($ === undef) {
		throw 'Dépendence non satisfaite : jQuery';
	}

	var pos = {},
	event,

	mousemove = function(e) {
		pos.X = e.pageX;
		pos.Y = e.pageY;
		event = e;
	},

	followMouseMove = (function() {
		var following = false;

		return function(follow) {
//			if(follow !== false) {
				if(!following) {
					$(window).mousemove(mousemove);
					following = true;
				}
/*			}
			else {
				following = false;
				$window.unbind('mousemove', mousemove);
			}
*/		};
	})(),

	DistanceListener = function(elem, options) {
		var $elem = $(elem),
		$this = $elem.data('DistanceListener'),
		infos = {},
		dist,

		checkInterval,
		refreshInfosInterval,

		refreshInfos = function() {
			infos = $elem.offset();
			infos.width = $elem.outerWidth();
			infos.height = $elem.outerHeight();
			infos.right = infos.left + infos.width;
			infos.bottom = infos.top + infos.height;
		},

		checkDistance = function() {
			var newDist, newDistR, distanceX, distanceY, Xneg, Yneg, distanceXR, distanceYR;

			distanceX = Math.max( infos.left - pos.X, pos.X - infos.right );
			distanceY = Math.max( infos.top - pos.Y, pos.Y - infos.bottom );

			distanceXR = distanceX / infos.width;
			distanceYR = distanceY / infos.height;

			Xneg = distanceX <= 0;
			Yneg = distanceY <= 0;

			if(Xneg && Yneg) {
				newDist = Math.max(
							distanceX,
							distanceY
						);
				newDistR = Math.max(
							distanceXR,
							distanceYR
						);
			}
			else {
				newDist = parseInt(Math.sqrt( Math.pow(Xneg ? 0 : distanceX, 2) + Math.pow(Yneg ? 0 : distanceY, 2)));
				if(!Xneg) {
					newDistR = newDist / (infos.width + ( ((infos.height - infos.width) * Math.acos(distanceX / newDist) * 2) / Math.PI));
				}
				else {
					newDistR = newDist / infos.height;
				}
			}

			newDist = parseInt(newDist);
			newDistR = parseInt(newDistR * 100);

			if(!isNaN(dist) && !isNaN(newDist) && newDist !== dist) {
				event.type = (dist > newDist) ? 'mouseapproach' : 'mouseretreat';
				event.distance = newDist;
				event.distanceR = newDistR;
				$.event.handle.call(elem, event);
			}
			dist = newDist;
		},

		reload = function() {
			window.clearInterval(checkInterval);
			window.clearInterval(refreshInfosInterval);
			checkInterval = window.setInterval(checkDistance, options.checkInterval);
			if(options.refreshInfosInterval > 0) {
				refreshInfosInterval = window.setInterval(refreshInfos, options.refreshInfosInterval);
			}
		},

		init = function() {
			options = $.extend({
				checkInterval			: 50,
				refreshInfosInterval	: 0
			}, options);

			$elem
				.data('DistanceListener', this);

			refreshInfos();
			followMouseMove();
			reload();
		};

		this.changeOptions = function(opt) {
			for(var i in opt) {
				if(typeof opt[i] === 'number') {
					options[i] = opt[i];
				}
			}
			reload();
		};

		this.unbind = function() {
			window.clearInterval(checkInterval);
			window.clearInterval(refreshInfosInterval);
			$elem.removeData('DistanceListener');
		};

		// If an instance already exists for this element, we don't create a new one, we just adapt options if needed
		if($this && typeof $this.changeOptions === 'function') {
			$this.changeOptions(options);
			return $this;
		}

		init.call(this);
	};

	$.event.special.mouseapproach = $.event.special.mouseretreat = {
		setup: function(data, namespaces) {
			$(this)
				.each(function() {
					new DistanceListener(this, data);
				});
		},

		teardown: function(namespaces) {
			$(this).data('DistanceListener').unbind();
		}
	};

	$.fn.mouseapproach = function(fn, options) {
		if(typeof options === 'number') {
			options = {checkInterval	: options};
		}
		return this.bind('mouseapproach', options, fn);
	};

	$.fn.mouseretreat = function(fn, options) {
		if(typeof options === 'number') {
			options = {checkInterval	: options};
		}
		return this.bind('mouseretreat', options, fn);
	};

})(this, this.jQuery);