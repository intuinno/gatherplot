angular.module('firebase.config', [])
  .constant('FBURL', 'https://gatherplot-dev.firebaseio.com')
  .constant('SIMPLE_LOGIN_PROVIDERS', ['password','anonymous','facebook','google','twitter'])
  .constant('loginRedirectPath', '/login');
