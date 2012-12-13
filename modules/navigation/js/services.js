/**
 * Defines the navigation module
 *
 * @module navigation
 *
 */

/**
 * Used for notifications when the url changes.
 *
 * Call register(obj) to register a url listener.
 *
 * @class routing
 * @uses $rootScope
 * @uses $location
 * @uses $timeout
 * @namespace wp.navigation
 */
angular.module('wp.navigation').service('routing', ['$rootScope', '$location', '$timeout', function($rootScope, $location, $timeout) {
	var current = null;
	$rootScope.$watch(function() { return $location.url(); }, function() {
		processUrl($location.url());
	});

	function processUrl(url) {
		var split = url.split('?');
		if( split[0][split[0].length-1] != '/' ) {
			split[0] += '/';
		}
		var path = split.shift();
		var query = '';
		while( split.length > 0 ) {
			var piece = split.shift();
			if( piece.length > 0 ) {
				if( query.length > 0 ) {
					query += '&';
				}
				query += piece;
			}
		}
		url = path + (query.length > 0 ? '?'+query : '');
		if( url != current ) {
			current = url;

			// Process the query parameters
			var params = {};
			var querySplit = query.split('&');
			while( querySplit.length > 0 ) {
				var queryPiece = querySplit.shift();
				if( jQuery.trim(queryPiece).length == 0 ) continue;
				var queryPieceSplit = queryPiece.split('=');
				var name = queryPieceSplit[0];
				var value = queryPieceSplit.length > 0 ? queryPieceSplit.join('=') : null;
				params[name] = value;
			}

			for( var i=0; i < registrants.length; i++ ) {
				var match = url.match(registrants[i].pattern);
				if( match && match[0] == url ) {
					try {
						registrants[i].callback.call(registrants[i], path, params);
					} catch(e) {
						console && console.error && console.error('URL Listener Error:', e.message);
						console && console.error && console.error('Listener: ', registrants[i]);
					}
				}
			}
		}
	}

	var registrants = [];
	var navigationService = {
		/**
         * Register a route
         *
         * @method register
         * @for routing
         * @namespace wp.navigation
         * @param {Object} obj
         */
		register:function(obj) {
			if( angular.isFunction(obj) ) {
				navigationService.register({pattern:/.*/,callback:obj});
				return;
			}
			if( angular.isArray(obj) ) {
				for( var i=0; i < obj.length; i++ ) {
					navigationService.register(obj[i]);
				}
				return;
			}
			if( typeof obj.pattern == 'undefined' || typeof obj.callback == 'undefined' ) {
				for( var pattern in obj ) {
					if( typeof pattern.match != 'undefined' && angular.isFunction(obj[pattern]) ) {
						navigationService.register({pattern:new RegExp(pattern),callback:obj[pattern]});
					}
				}
				return;
			}

			if( angular.isFunction(obj.callback) ) {
				registrants.push(obj);
			}
		},
		/**
         * Set a route
         *
         * @method set
         * @for routing
         * @namespace wp.navigation
         * @param {String} url
         */
		set:function(url) {
			function attempt() {
				$location.url(url);
			}
			$timeout(attempt);
		},
		/**
         * Get a route
         *
         * @method get
         * @for routing
         * @namespace wp.navigation
         */
		get:function() {
			return $location.url();
		}
	};
	return navigationService;
}]);
// Initialize the routing service
angular.module('wp.navigation').run(['routing',function(routing) {}]);


/**
 * Used for managing the breadcrumb trail.
 *
 * @class breadcrumbs
 * @uses routing
 */
angular.module('wp.navigation').service('breadcrumbs', ['routing', function(routing) {
    var breadcrumbs = [];
    var listeners = [];

    // Listen for url changes
	routing.register(function(url) {
		for( var i=breadcrumbs.length-1; i >= 0; i-- ) {
			var match = url.match(breadcrumbs[i].pattern);
			if( !match || match[0] != url ) {
				var evt = {cancel:false, url:url};
				try {
					if( angular.isFunction(breadcrumbs[i].removing) ) {
						breadcrumbs[i].removing.call(breadcrumbs[i], evt);
					}
				} catch(e) {
				}
				if( !evt.cancel ) {
					breadcrumbs.splice(i, 1);
				}
			}
		}
	});

	function notify() {
		for( var i=0; i < listeners.length; i++ ) {
			try {
				listeners[i].call({});
			} catch(e) {
				console && console.error && console.error('Breadcrumb listener failed:',e);
			}
		}
	}

	var _silent = false;
	var bc = {
		/**
         * Make a copy so it doesn't change behind our back
         *
         * @method get
         * @for breadcrumbs
         * @namespace wp.navigation
         */
		get : function() {
			return jQuery.merge([], breadcrumbs);
		},
		/**
         * Set the breadcrumb
         *
         * @method set
         * @for breadcrumbs
         * @namespace wp.navigation
         * @param {Object} newcrumbs
         */
		set : function(newcrumbs) {
			breadcrumbs = [];
			_silent = true;
			bc.push(newcrumbs);
			_silent = false;
			notify();
		},
		/**
         * Push to the crumb array
         *
         * @method push
         * @for breadcrumbs
         * @namespace wp.navigation
         * @param {Array} crumb
         */
		push : function(crumb) {
			if( angular.isArray(crumb) ) {
				for( var i=0; i < crumb.length; i++ ) {
					bc.push(crumb[i]);
				}
				return;
			}

			if( typeof crumb.match != 'undefined' ) {
				crumb = { label:crumb };
			}

			// Make a copy so it doesn't change behind our back
			crumb = jQuery.extend({}, crumb);

			if( typeof crumb.pattern == 'undefined' ) {
				crumb.pattern = /.*/;
			}
			if( typeof crumb.label == 'undefined' ) {
				if( typeof crumb.link != 'undefined' ) {
					crumb.label = crumb.link;
				} else {
					return;
				}
			}
			breadcrumbs.push(crumb);
			if( !_silent ) {
				notify();
			}
		},
		/**
         * Remove the last element of the breadcrumbs array
         * and return the element
         *
         * @method pop
         * @for breadcrumbs
         * @namespace wp.navigation
         */
		pop : function() {
			if( breadcrumbs.length > 0 ) {
				var last = breadcrumbs.pop();
				notify();
				return last;
			}
			return null;
		},
		/**
         * Listen for changes to the breadcrumbs
         *
         * @method listen
         * @for breadcrumbs
         * @namespace wp.navigation
         * @param {Object} listener
         */
		listen : function(listener) {
			listeners.push(listener);
		}

	}; 
	return bc;
}]);
// Initialize the breadcrumb service
angular.module('wp.navigation').run(['breadcrumbs',function(breadcrumbs) {}]);


/**
 * Used for managing the sidebar navigation.
 *
 * @class navigation
 * @uses routing
 */
angular.module('wp.navigation').service('navigation', ['routing', function(routing) {
	var items = [];
	var nav = {
		/**
         * Return an array of navigation items
         *
         * @method register
         * @for navigation
         * @namespace wp.navigation
         * @param {Array} item
         */
		register:function(item) {
			if( angular.isArray(item) ) {
				for( var i=0; i < item.length; i++ ) {
					nav.register(item[i]);
				}
				return;
			}

			if( typeof item.match != 'undefined' ) {
				item = {label:item};
			}

			// Make a copy so it doesn't change behind our back
			item = jQuery.extend({}, item);

			if( typeof item.label == 'undefined' ) {
				if( typeof item.url == 'undefined' ) {
					return;
				}
				item.label = item.url;
			}
			items.push(item);
		}
	};
	return nav;
}]);
// Initialize the navigation service
angular.module('wp.navigation').run(['navigation',function(navigation) {}]);
