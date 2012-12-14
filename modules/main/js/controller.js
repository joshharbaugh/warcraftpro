angular.module('wp').controller('RealmCtrl', ['$scope','Auctions', function($scope,Auctions) {

	$scope.getAuctions = function(realmName) {
		console.log("Realm slug: " + realmName);
		$scope.realmAuctions = [];

		Auctions.loadFile(realmName).then(function(response) {
			
			var auctionUrl = response[0].url;

			Auctions.saveFile(auctionUrl).then(function(response) {

				Auctions.getAuctions(auctionUrl).then(function(data) {

					$scope.realmAuctions = data;
					console.log("Auctions", $scope.realmAuctions);

				}, function(reason) {});

			}, function(reason) {});
		
		}, function(reason) {});
	};

}]);