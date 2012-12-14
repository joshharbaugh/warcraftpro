angular.module('wp').directive('wpRealmsTable', ['$compile','Realms', function($compile,Realms) {
	return {
		restrict:'A',
		templateUrl: '/modules/main/partials/main.html',
		controller: 'RealmCtrl',
		link:function(scope, element, attrs) {

			var realms = Realms.load();
			realms.then(function(resp) {

				scope.filteredData = resp;
				scope.selectedRows = [];

				scope.options = {
	    			data: 'filteredData',
	    			selectedItems: scope.selectedRows,
	    			selectWithCheckboxOnly: true,
	    			watchDataItems: true,
	    			enablePaging: true,
	    			showGroupPanel: false
	    		};

	    		/*if ( typeof scope.filteredData != 'undefined' ) {
		        	element.html('<table ng-grid="options" class="table table-striped table-hover"></table>');
		        	$compile(element.contents())(scope);
		        } else {
		        	element.html('<p>No data</p>');
		        }*/

			}, function(reason) {});

		}
	};
}]);
