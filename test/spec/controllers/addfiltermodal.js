'use strict';

describe('Controller: AddfiltermodalCtrl', function () {

  // load the controller's module
  beforeEach(module('gatherplotApp'));

  var AddfiltermodalCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    AddfiltermodalCtrl = $controller('AddfiltermodalCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
