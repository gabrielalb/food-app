angular.module('dashboard', ['security.authorization', 'security.service', 'resources.sheets', 'ui.bootstrap.typeahead'])

.config(['$routeProvider', 'securityAuthorizationProvider', function ($routeProvider, securityAuthorizationProvider) {
  $routeProvider.when('/dashboard', {
    templateUrl:'dashboard/dashboard.tpl.html',
    controller:'DashboardCtrl',
    resolve:{
      authenticatedUser: securityAuthorizationProvider.requireAuthenticatedUser,
      worksheets:['Sheets', 'security', 'DOC_ID', function (Sheets, security, docID) {
          return security.requestCurrentUser().then(function(userInfo) {
              return Sheets.getSheets(docID, userInfo.access_token);
          });
      }]
    }
  });
}])

.directive('selectFood', function () {
    return {
        restrict: 'A',
        scope: {
          dayId: "@"
        },

        controller: function($scope, $element, $attrs) {
          $scope.ctrlData = [ { text: 'Felu 1', children: [] }, { text: 'Felu 2', children: [] }, { text: 'Salata/Prajitura', children: [] } ];
          for (var i in $scope.$parent.allData.feed.entry) {
            if (parseInt($scope.$parent.allData.feed.entry[i].gs$cell.row, 10) === (3 + parseInt($scope.dayId, 10)) && parseInt($scope.$parent.allData.feed.entry[i].gs$cell.col, 10) > 7 && parseInt($scope.$parent.allData.feed.entry[i].gs$cell.col, 10) < 10) {
              $scope.ctrlData[0].children.push({ id: "fel1", text: $.trim($scope.$parent.allData.feed.entry[i].content.$t) });
            }
            if (parseInt($scope.$parent.allData.feed.entry[i].gs$cell.row, 10) === (3 + parseInt($scope.dayId, 10)) && parseInt($scope.$parent.allData.feed.entry[i].gs$cell.col, 10) > 9 && parseInt($scope.$parent.allData.feed.entry[i].gs$cell.col, 10) < 13) {
              $scope.ctrlData[1].children.push({ id: "fel2", text: $.trim($scope.$parent.allData.feed.entry[i].content.$t) });
            }
            if (parseInt($scope.$parent.allData.feed.entry[i].gs$cell.row, 10) === (3 + parseInt($scope.dayId, 10)) && parseInt($scope.$parent.allData.feed.entry[i].gs$cell.col, 10) > 12 && parseInt($scope.$parent.allData.feed.entry[i].gs$cell.col, 10) < 15) {
              $scope.ctrlData[2].children.push({ id: "fel3", text: $.trim($scope.$parent.allData.feed.entry[i].content.$t) });
            }
          }
        },

        link: function (scope, element, attrs, ngModelCtrl) {
          element.select2({
            placeholder: "Select...", 
            data: scope.ctrlData,
            multiple: true,
            width: '95%',
            initSelection: function(element, callback) {
              var preselection = [];
              var selection = null;

              for (var k = 0; k < scope.$parent.selectedFood.length; k++) {
                if ((parseInt(scope.$parent.selectedFood[k].col, 10) - 2) === parseInt(scope.dayId, 10)) {
                  selection = scope.$parent.selectedFood[k];
                  break;
                }
              }

              for (var i = 0; i < scope.ctrlData.length; i++) {
                for (var j = 0; j < scope.ctrlData[i].children.length; j++) {
                  if ((selection.title.toUpperCase()).indexOf(scope.ctrlData[i].children[j].text.toUpperCase()) >= 0) {
                    preselection.push(scope.ctrlData[i].children[j]);
                  }
                }
              }
              callback(preselection);
            }
          });
        }
    };
})

.controller('DashboardCtrl', ['$scope', '$log', '$location', 'DOC_ID', 'authenticatedUser', 'worksheets', 'Sheets', function ($scope, $log, $location, docID, authenticatedUser, worksheets, sheetsService) {
  $scope.sheets = null;
  $scope.loadingSheet = false;
  $scope.worksheets = [ { id : null, title: '-- Select --' } ];
  $scope.currentSheet = $scope.worksheets[0];
  $scope.selectedPerson = null;
  $scope.selectedFood = [];
  $scope.allData = null;
  $scope.focusDay = null;
  $scope.$log = $log;

  for (var i in worksheets.feed.entry) {
    if (worksheets.feed.entry[i].content.$t.indexOf("bonjour") >= 0) {
      var tmpObj = {};
      tmpObj["id"] = worksheets.feed.entry[i].id.$t.split("/").pop();
      tmpObj["title"] = worksheets.feed.entry[i].content.$t;
      $scope.worksheets.push(tmpObj);
    }
  }

  $scope.people = [];

  $scope.$watch('currentSheet', function() {
    if ($scope.currentSheet.id !== null) {
      $scope.loadingSheet = true;
      $scope.selectedPerson = null;
      $scope.people = [];
      sheetsService.getSheetData(docID, authenticatedUser.access_token, $scope.currentSheet.id).then(function(data) {
        $scope.loadingSheet = false;
        $scope.allData = data;
        for (var i in data.feed.entry) {
          if (data.feed.entry[i].gs$cell.col === "1" && parseInt(data.feed.entry[i].gs$cell.row, 10) > 2) {
            var tmpObj = {};
            tmpObj["row"] = data.feed.entry[i].gs$cell.row;
            tmpObj["title"] = $.trim(data.feed.entry[i].content.$t);
            $scope.people.push(tmpObj);
          }
        }
      });  
    }
  });
    
  $scope.$watch('selectedPerson', function() {
    if ($.isPlainObject($scope.selectedPerson)) {
      // selection
      var tmpObj = {};
      var day = "";
      $scope.selectedFood = [];
      for (var i in $scope.allData.feed.entry) {
          if ($scope.allData.feed.entry[i].gs$cell.row === $scope.selectedPerson.row && parseInt($scope.allData.feed.entry[i].gs$cell.col, 10) > 1 && parseInt($scope.allData.feed.entry[i].gs$cell.col, 10) < 7) {
            tmpObj = {};
            tmpObj["row"] = $scope.allData.feed.entry[i].gs$cell.row;
            tmpObj["col"] = $scope.allData.feed.entry[i].gs$cell.col;

            day = "";
            switch ($scope.allData.feed.entry[i].gs$cell.col) {
              case '2':
                day = "Luni";
                break;
              case '3':
                day = "Marti";
                break;
              case '4':
                day = "Miercuri";
                break;
              case '5':
                day = "Joi";
                break;
              case '6':
                day = "Vineri";
                break;
            }

            tmpObj["day"] = day;
            tmpObj["title"] = $.trim($scope.allData.feed.entry[i].content.$t);
            $scope.selectedFood.push(tmpObj);
          }
      }

      var found = false;
      // add the empty days since they don't exist in the feed
      for (var j = 2; j <= 6; j++) {
        found = false;
        for (var k = 0; k < $scope.selectedFood.length; k++) {  
          if (parseInt($scope.selectedFood[k].col, 10) === j) {
            found = true;
            break;
          }
        }

        if (! found) {
          tmpObj = {};
          tmpObj["row"] = $scope.selectedPerson.row;
          tmpObj["col"] = j.toString();

          day = "";
          switch (j.toString()) {
            case '2':
              day = "Luni";
              break;
            case '3':
              day = "Marti";
              break;
            case '4':
              day = "Miercuri";
              break;
            case '5':
              day = "Joi";
              break;
            case '6':
              day = "Vineri";
              break;
          }

          tmpObj["day"] = day;
          tmpObj["title"] = "-";

          $scope.selectedFood.push(tmpObj);
        }
      }
    }
  });
  
  $scope.setFocusDay = function (focusDay) {
    $scope.focusDay = focusDay;
  };

  $scope.submitSelection = function (idx) {
    $scope.focusDay = null;
  };

}]);