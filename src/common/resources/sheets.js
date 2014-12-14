angular.module('resources.sheets', ['security.service']);
angular.module('resources.sheets').factory('Sheets', ['$q', 'API_URL', function ($q, apiUrl) {
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
    },

    saveSheetData: function(docID, token, sheetID, row, col, inputValue) {
      var promise = $q.defer();
      $.ajax({
        url: apiUrl + "/doc/" + docID + "/worksheet/" + sheetID + "/cells?access_token=" + token,
        type: "POST",
        data: JSON.stringify({ inputValue: inputValue, row: row, col: col }),
        contentType: "application/json",
        success: function(data) {
          promise.resolve(data);
        },
        error: function(data) {
          promise.resolve($.parseJSON(data.responseText));
        }
      });

      return promise.promise;
    }
  };
  return Sheets;
}]);
