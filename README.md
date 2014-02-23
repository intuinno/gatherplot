Gatherplot
==========================
This is an extension of scatterplot to handle nominal variables better. 

Demo 
----------
You can see demo [HERE][1]!


How to make d3 work with dependency injection
----------------------------------------------
If you want do not want to use dependency injection you can add d3.js to your index.html file as normal and skip this section.

In order to avoid the global d3 variable and use the dependecy injection in Angular we need to create a factory containing the d3 code.  We need to declare the d3 variable before coping the d3 source in order to prevent the creation of a global variable.

File: `app/scripts/services/d3.js`
```
angular.module('d3')
  .factory('d3',[function(){
    var d3;
    //d3 code here
    return d3;
  }]);
```


  [1]: http://gatherplot.herokuapp.com