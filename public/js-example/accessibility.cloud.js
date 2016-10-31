(function () {
  var formatName = function (name) {
    return name.replace(/([A-Z])/g, ' $1')
               .replace(/^./, function (str) { return str.toUpperCase(); })
               .replace(/^Rating /, '')
               ;   // uppercase the first character
  };

  var formatValue = function (value) {
    if (value === true) return 'Yes';
    if (value === false) return 'No';
    return value;
  };

  var formatRating = function (rating) {
    var between0and5 = Math.floor(Math.min(1, Math.max(0, rating)) * 5 );
    var stars = '*****'.slice(5 - between0and5);
    return '<span class="stars">' + stars + '</span> <span class="numeric">' + between0and5 + '/5</span>';
  };

  var recursivelyRenderProperties = function(element) {
    if ($.isArray(element)) {
      return '<ul class="ac-list">' + element.map(function (element) {
        return '<li>' + recursivelyRenderProperties(element) + '</li>';
      }).join('') + '</ul>';
    } else if ($.isPlainObject(element)) {
      return '<ul class="ac-group">' + $.map(element,
        function (value, key) {
          if ($.isArray(value) || $.isPlainObject(value)) {
            return '<li class="ac-group"><span>' + formatName(key) + '</span> ' + recursivelyRenderProperties(value) + '</li>';
          }
          if (key.startsWith('rating')) {
            return '<li class="ac-rating">' + formatName(key) + ': ' + formatRating(parseFloat(value)) + '</li>';  
          }
          return '<li>' + formatName(key) + ': ' + formatValue(value) + '</li>';
        }
      ).join('') + '</ul>';
    }
    return element;
  };

  window.AccessibilityCloud = {
    getPlacesAround: function (parameters) {
      return $.ajax({
        dataType: 'json',
        url: 'http://localhost:3000/place-infos?includeRelated=source',
        data: parameters,
        headers: {
          Accept: 'application/json',
          'X-Token': this.token,
        },
      });
    },

    resultsTemplate: function () {
      // eslint-disable-next-line no-multi-str
      return '<ul class="ac-result-list" role="treegrid"> \
        {{#places}} \
          <li class="ac-result" role="gridcell" aria-expanded="false"> \
            {{#properties}} \
              <img src="https://dl.dropboxusercontent.com/u/5503063/ac/icons/{{category}}.png" role="presentation"> \
              <header class="ac-result-name" role="heading">{{name}}</header> \
              <div class="ac-result-category">{{category}}</div> \
              <a href="{{detailsURL}}" class="ac-result-link">{{sourceName}}</a> \
              <div class="ac-result-distance">{{formattedDistance}}</div> \
              <div class="ac-result-accessibility">Accessibility: {{{formattedAccessibility}}}</div> \
            {{/properties}} \
          </li> \
        {{/places}} \
      </ul>';
    },

    renderPlaces: function (element, places, related) {
      var self = this;
      if (!$(element).length) {
        console.error('Could not render results, element not found.');
      }
      if (places && places.length) {
        $(element).html(Mustache.render(self.resultsTemplate(), {
          places: places,
          formattedDistance: function () {
            return Math.round(this.distance) + 'm';
          },
          formattedAccessibility: function () {
            return recursivelyRenderProperties(this.accessibility);
          },
          sourceName: function () {
            var source = related.Sources && related.Sources[this.sourceId];
            return source && source.name;
          },
        }));
      } else {
        $(element).html('<div class="ac-no-results">No results.</div>');
      }
    },

    loadAndRenderPlaces: function (element, parameters) {
      var self = this;

      return this.getPlacesAround(parameters)
        .done(function handleResponse(response) {
          self.renderPlaces(element, response.features, response.related);
        })
        .fail(function handleError(error) {
          var message = (error && error.message) || 'No error message';
          $(element)
            .append('<div class="ac-error"></div>')
            .text('Could not load data: ' + message);
        });
    },
  };
}());