(function() {
    'use strict';

    angular.module('myApp.controllers')
        .controller('UploadCtrl', ['$scope', '$location',  '$routeParams', 'user', 'fbutil', 'Chart',
            function($scope, $location, $routeParams, user, fbutil, Chart) {

                if (!user) {

                    $location.path('/login').replace();

                }

                $scope.user = user;
                var profile;
                loadProfile(user);

                $scope.uploadData = function(customCSV) {

                    // var ref = new Firebase(FBURL + '/csv');
                    // var sync = $firebase(ref);

                    // sync.$push({
                    //     url: customCSV,
                    //     name: $scope.dataName,
                    //     uploader: user.uid,
                    //     uploaderName: user.name;
                    // }).then(function(ref) {

                    //     console.log(ref.key());
                    //     $location.path('/load/' + ref.key()).replace();

                    // }, function(error) {
                    //     console.log("Error:", error);
                    // });

                    var newChart = {

                        url: customCSV,
                        name: $scope.dataName,
                        uploader: user.uid,
                        uploaderName: profile.name
                    };

                    Chart.create(newChart).then(function(ref) {

                        console.log(ref.key());
                        $location.path('/load/' + ref.key()).replace();

                    }, function(error) {
                        console.log("Error:", error);
                    });

                };


                function loadProfile(user) {
                    if (profile) {
                        profile.$destroy();
                    }
                    profile = fbutil.syncObject('users/' + user.uid);
                    profile.$bindTo($scope, 'profile');
                }


            }


        ]);

}());
