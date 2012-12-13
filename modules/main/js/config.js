angular.module('wp').run(['routing', function(routing) {
	routing.register(function(url) {
		if( url == '' || url == '/' ) {
			routing.set('/dashboard');
		}
	});
}]);
