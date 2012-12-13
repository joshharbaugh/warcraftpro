(function($, window) {
	var dependencies = {};
	var wp = window.wp || {};
	wp.require = function(module, dep) {
		if( typeof dep == 'undefined' ) {
			if( typeof dependencies[module] == 'undefined' ) {
				dependencies[module] = [];
			}
			return dependencies[module];
		} else {
			if( $.isArray(dep) ) {
				for( var i=0; i < dep.length; i++ ) {
					wp.require(module, dep[i]);
				}
			} else {
				var requirements = wp.require(module);
				var found = dep == module;
				for( var i=0; i < requirements.length && !found; i++ ) {
					if( requirements[i] == dep )
						found = true;
				}
				if( !found ) {
					wp.require(module).push(dep);
				}
			}
			return wp;
		}
	};


	window.wp = wp;
})(jQuery, window);