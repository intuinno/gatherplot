angular.module('firebase.config', [])
  .constant('FBURL', 'https://habit3.firebaseio.com')
  .constant('SIMPLE_LOGIN_PROVIDERS', ['password','anonymous','facebook','google','twitter'])
  .constant('loginRedirectPath', '/login');
