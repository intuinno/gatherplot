'use strict';

describe('Controller: InspectctrlCtrl', function () {

  // load the controller's module
  beforeEach(module('gatherplotApp'));

  var InspectctrlCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    InspectctrlCtrl = $controller('InspectctrlCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
