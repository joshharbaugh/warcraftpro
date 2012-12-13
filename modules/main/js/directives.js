/**
 * Loads and shows a partial within the element containing the wp-partial directive.
 */
angular.module('wp').directive('wpPartial', ['partials','$compile', function(partials,$compile) {
	var wpPartialDirective = {
		restrict:'A',
		link:function(scope, element, attrs) {
			var partial = attrs.wpPartial;
			if( partial != '' ) {
				partials.load(partial).then(function(content) {
					element.html(content);
					$compile(element.contents())(scope);
				});
			}
		}
	};
	return wpPartialDirective;
}]);
