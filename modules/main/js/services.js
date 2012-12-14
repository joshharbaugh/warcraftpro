angular.module('wp').service('Realms', ['$http','$q','$timeout', function($http,$q,$timeout) {

	var realms = [];

	var service = {
		load : function() {
			var deferred = null;
			var url = 'https://us.battle.net/api/wow/realm/status?jsonp=JSON_CALLBACK';
			deferred = $q.defer();
			
			$http({method:'JSONP',url:url})
				.success(function(data,status,headers,config) {
					deferred.resolve(data.realms);
				})
				.error(function(data,status,headers,config) {
					deferred.reject(status);
				});
			return deferred.promise;
		}
	};
	return service;

}]);

angular.module('wp').service('Auctions', ['$http','$q','$timeout', function($http,$q,$timeout) {

	var auctions = [];

	var service = {
		loadFile : function(realmName) {
			var deferred = null;
			var url = 'https://us.battle.net/api/wow/auction/data/' + realmName;
			deferred = $q.defer();
			
			$http({method:'JSONP',params:{jsonp:'JSON_CALLBACK'},url:url})
				.success(function(data,status,headers,config) {
					deferred.resolve(data.files);
				})
				.error(function(data,status,headers,config) {
					deferred.reject(status);
				});
			return deferred.promise;
		},
		saveFile : function(url) {
			var deferred = null;
			deferred = $q.defer();
			try {
				$http({method:'POST',params:{file:url},url:'/'})
					.success(function(data,status,headers,config) {
						deferred.resolve(data);
					})
					.error(function(data,status,headers,config) {
						deferred.reject(status);
					});
				return deferred.promise;
			} catch(e) {}
		},
		getAuctions : function(url) {
			var deferred = null;
			var url = url.replace('http://', 'https://');
			console.log("Fetching URL: "+url);
			deferred = $q.defer();

			$http({method:'GET',params:{file:url},url:'/save.php'})
				.success(function(data,status,headers,config) {
					deferred.resolve(data);
				})
				.error(function(data,status,headers,config) {
					deferred.reject(status);
				});
			return deferred.promise;
		}
	};
	return service;

}]);