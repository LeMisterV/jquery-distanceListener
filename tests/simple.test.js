/** Exemple d'impl�mentation simple

*/

$('head')
	.append(
		'<style type="text/css">' +
			'#zoneTest { background: blue; width: 400px; height: 300px; border: 5px solid red; }' +
			'#zoneTest.approach { border-color: lime; }' +
		'</style>'
	);

$(document.body)
	.append(
		'<div id="zoneTest"></div>' +
		'<p>distance : <span class="distance"></span></p>' +
		'<p>distance% : <span class="distanceR"></span></p>' +
		'<p>eventType : <span class="eventtype"></span></p>'
	);

/** Quelques bouts de code que j'utilise pour la d�mo.
 * Une partie de ce code est tir� de jQuery.color
 */

var colors = {
	aqua:[0,255,255], azure:[240,255,255], beige:[245,245,220], black:[0,0,0], blue:[0,0,255], brown:[165,42,42],
	cyan:[0,255,255], darkblue:[0,0,139], darkcyan:[0,139,139], darkgrey:[169,169,169], darkgreen:[0,100,0],
	darkkhaki:[189,183,107], darkmagenta:[139,0,139], darkolivegreen:[85,107,47], darkorange:[255,140,0],
	darkorchid:[153,50,204], darkred:[139,0,0], darksalmon:[233,150,122], darkviolet:[148,0,211],
	fuchsia:[255,0,255], gold:[255,215,0], green:[0,128,0], indigo:[75,0,130], khaki:[240,230,140],
	lightblue:[173,216,230], lightcyan:[224,255,255], lightgreen:[144,238,144], lightgrey:[211,211,211],
	lightpink:[255,182,193], lightyellow:[255,255,224], lime:[0,255,0], magenta:[255,0,255], maroon:[128,0,0],
	navy:[0,0,128], olive:[128,128,0], orange:[255,165,0], pink:[255,192,203], purple:[128,0,128],
	violet:[128,0,128], red:[255,0,0], silver:[192,192,192], white:[255,255,255], yellow:[255,255,0]
};

function getRGB(color) {
	var result;
	if ( color && color.constructor == Array && color.length == 3 )
		return color;
	if (result = /rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/.exec(color))
		return [parseInt(result[1]), parseInt(result[2]), parseInt(result[3])];
	if (result = /rgb\(\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*\)/.exec(color))
		return [parseFloat(result[1])*2.55, parseFloat(result[2])*2.55, parseFloat(result[3])*2.55];
	if (result = /#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/.exec(color))
		return [parseInt(result[1],16), parseInt(result[2],16), parseInt(result[3],16)];
	if (result = /#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/.exec(color))
		return [parseInt(result[1]+result[1],16), parseInt(result[2]+result[2],16), parseInt(result[3]+result[3],16)];
	return colors[jQuery.trim(color).toLowerCase()];
}

function getColor(elem, attr) {
	var color;
	do {
		color = jQuery.curCSS(elem, attr);
		if ( color != '' && color != 'transparent' || jQuery.nodeName(elem, "body") )
			break; 
		attr = "backgroundColor";
	} while ( elem = elem.parentNode );
	return getRGB(color);
};

// Un plugin vite fait mal cod� et moche pour animer la couleur de fond d'un �l�ment suivant la distance de la souris
$.fn.bgproxanimate = function(color, options) {
	var start = getColor(this[0], 'backgroundColor'),
	end = getRGB(color);

	return this
		.bind('mouseapproach mouseretreat', function(e) {
			if(e.distanceR < options.in) {
				this.style['backgroundColor'] = 'rgb(' + [end[0], end[1], end[2]].join(',') + ')';
				return;
			}
			else if(e.distanceR > options.out) {
				this.style['backgroundColor'] = 'rgb(' + [start[0], start[1], start[2]].join(',') + ')';
				return;
			}

			var pos = 1 - ((e.distanceR - options.in) / (options.out - options.in));

			this.style['backgroundColor'] = "rgb(" + [
				Math.max(Math.min( parseInt((pos * (end[0] - start[0])) + start[0]), 255), 0),
				Math.max(Math.min( parseInt((pos * (end[1] - start[1])) + start[1]), 255), 0),
				Math.max(Math.min( parseInt((pos * (end[2] - start[2])) + start[2]), 255), 0)
			].join(",") + ")";
		});
};



var distance = $('.distance'),
distanceR = $('.distanceR'),
eventType = $('.eventtype');

$('#zoneTest')
	.bind('mouseapproach mouseretreat', function(e) {
		distance.text(e.distance);
		distanceR.text(e.distanceR);
		eventType.text(e.type);
		this.className = (e.type === 'mouseapproach') ? 'approach' : '';
	})
	.bgproxanimate('red', { out : 200, 'in' : -40 });
