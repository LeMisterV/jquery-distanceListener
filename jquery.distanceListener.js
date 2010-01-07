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
		center = {},
		dist,

		checkInterval,
		refreshCenterInterval,

		refreshCenter = function() {
			var offset = $elem.offset();
			center.X = offset.left + ($elem.outerWidth() / 2);
			center.Y = offset.top + ($elem.outerHeight() / 2);
		},

		checkDistance = function() {
			var offset = $elem.offset();
			offset.right = offset.left + $elem.outerWidth();
			offset.bottom = offset.top + $elem.outerHeight();
			distanceX = (pos.X < offset.left) ?
				distanceX = offset.left - pos.X :
				(pos.X > offset.right) ?
					distanceX = pos.X - offset.right :
					0;
			distanceY = (pos.Y < offset.top) ?
				offset.top - pos.Y :
				(pos.Y > offset.bottom) ?
					pos.Y - offset.bottom :
					0;

			var newDist = parseInt(Math.sqrt( Math.pow(distanceX, 2) + Math.pow(distanceY, 2)));

			if(!isNaN(dist) && !isNaN(newDist) && newDist !== dist) {
				event.type = (dist > newDist) ? 'mouseapproach' : 'mouseretreat';
				event.distance = newDist;
				$.event.handle.call(elem, event);
			}
			dist = newDist;
		},

		reload = function() {
			window.clearInterval(checkInterval);
			window.clearInterval(refreshCenterInterval);
			checkInterval = window.setInterval(checkDistance, options.checkInterval);
			refreshCenterInterval = window.setInterval(refreshCenter, options.refreshCenterInterval);
		},

		init = function() {
			options = $.extend({
				checkInterval			: 50,
				refreshCenterInterval	: 200
			}, options);

			$elem
				.data('DistanceListener', this);

			refreshCenter();
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
			window.clearInterval(refreshCenterInterval);
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