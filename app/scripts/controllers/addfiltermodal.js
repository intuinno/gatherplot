'use strict';

/**
 * @ngdoc function
 * @name gatherplotApp.controller:AddfiltermodalCtrl
 * @description
 * # AddfiltermodalCtrl
 * Controller of the gatherplotApp
 */
angular.module('myApp.controllers')
  .controller('AddfiltermodalCtrl', function($scope, $modalInstance, headers) {

  $scope.newFilter = {};

  $scope.headers = headers;
  
  $scope.ok = function () {
    $modalInstance.close($scope.newFilter);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
});