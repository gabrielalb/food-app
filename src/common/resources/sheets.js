angular.module('resources.sheets', ['security.service']);
angular.module('resources.sheets').factory('Sheets', ['$q', function ($q) {
  var Sheets = {
    getSheets: function(docID, token) {
      var promise = $q.defer();
      $.getJSON("https://spreadsheets.google.com/feeds/worksheets/" + docID + "/private/full?alt=json&access_token=" + token, function(data) {
        promise.resolve(data);
      });

      return promise.promise;
    },

    getSheetData: function(docID, token, sheetID) {
      var promise = $q.defer();
      $.getJSON("https://spreadsheets.google.com/feeds/cells/" + docID + "/" + sheetID +  "/private/full?alt=json&access_token=" + token, function(data) {
          promise.resolve(data);
      });

      return promise.promise;
    }
  };
  return Sheets;
}]);
