(function (window, Error, Math, $, undef) {
    if($ === undef) {
        throw new Error('Dépendence non satisfaite : jQuery');
    }

    var pos = {},
    event,
    following = false;

    function mousemove(e) {
        pos.X = e.pageX;
        pos.Y = e.pageY;
        event = e;
    }

    function followMouseMove(follow) {
//      if(follow !== false) {
            if(!following) {
                $(window).mousemove(mousemove);
                following = true;
            }
/*      }
        else {
            following = false;
            $window.unbind('mousemove', mousemove);
        }
*/  }

    function DistanceListener(elem, options) {
        var $elem = $(elem),
        infos = {},
        dist,

        checkInterval,
        refreshInfosInterval;

        function refreshInfos() {
            infos = $elem.offset();
            infos.width = $elem.outerWidth();
            infos.height = $elem.outerHeight();
            infos.right = infos.left + infos.width;
            infos.bottom = infos.top + infos.height;
        }

        function checkDistance() {
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
                newDist = parseInt(Math.sqrt(Math.pow(Xneg ? 0 : distanceX, 2) + Math.pow(Yneg ? 0 : distanceY, 2)));
                if(!Xneg) {
                    newDistR = newDist / (infos.width + (((infos.height - infos.width) * Math.acos(distanceX / newDist) * 2) / Math.PI));
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
        }

        function reload() {
            window.clearInterval(checkInterval);
            window.clearInterval(refreshInfosInterval);
            checkInterval = window.setInterval(checkDistance, options.checkInterval);
            if (options.refreshInfosInterval > 0) {
                refreshInfosInterval = window.setInterval(refreshInfos, options.refreshInfosInterval);
            }
        }

        function init() {
            options = $.extend({
                checkInterval         : 50,
                refreshInfosInterval  : 0
            }, options);

            refreshInfos();
            followMouseMove();
            reload();
        }

        this.changeOptions = function changeOptions(opt) {
            for(var i in opt) {
                if(typeof opt[i] === 'number') {
                    options[i] = opt[i];
                }
            }
            reload();
        };

        this.unbind = function unbind() {
            window.clearInterval(checkInterval);
            window.clearInterval(refreshInfosInterval);
            $elem.removeData('DistanceListener');
        };

        init();
    }

    $.event.special.mouseapproach = $.event.special.mouseretreat = {
        setup: function(options) {
            $(this)
                .each(function() {
                    var instance = $(this).data('DistanceListener');
                    if (instance && typeof instance.changeOptions === 'function') {
                        instance.changeOptions(options);
                    }
                    else {
                        $(this).data('DistanceListener', new DistanceListener(this, options));
                    }
                });
        },
        teardown: function() {
            var instance = $(this).data('DistanceListener');
            if (instance) {
                instance.unbind();
            }
        }
    };

    $.fn.mouseapproach = function mouseapproach(fn, options) {
        if(typeof options === 'number') {
            options = {checkInterval    : options};
        }
        return this.bind('mouseapproach', options, fn);
    };

    $.fn.mouseretreat = function mouseretreat(fn, options) {
        if(typeof options === 'number') {
            options = {checkInterval    : options};
        }
        return this.bind('mouseretreat', options, fn);
    };

}(this, this.Error, this.Math, this.jQuery));