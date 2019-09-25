var test_kanjis = [];
var selected_language = 'en';
var kanji_set = kanjis.map(a => Object.assign({}, a));
var mistake_count = 0;
 
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function getAllowedValues(meaning) {
  var allowed_values = $.map(meaning.toLowerCase().split(','), $.trim);
  allowed_values.forEach(function(allowed_value) {
    // Special case: bracket answers.
    if (allowed_value.indexOf('(') > -1) {
      allowed_values.push($.trim(allowed_value.replace(/ *\([^)]*\) */g, "")));
      allowed_values.push(allowed_value.replace(/[{()}]/g, ''));
    }

    // Special case: or.
    if (allowed_value.indexOf(' or ') > -1) {
      allowed_values = allowed_values.concat(allowed_value.split(' or '));
    }

    // Special case: answers containing a minus.
    if (allowed_value.indexOf('-') > -1) {
      allowed_values.push(allowed_value.replace(/-/g, ''));
    }
  });

  return allowed_values.filter(function (allowed_value) {
    return allowed_value !== "";
  });
}

 var kanji_selection_content = '';
 for (var kanji_count = 0; kanji_count < kanjis.length; kanji_count++) {
  if (kanji_count % 10 == 0) {
    if (kanji_count % 100 == 0) {
      if (kanji_selection_content.length > 0) {
        kanji_selection_content += '</div>';
      }
      kanji_selection_content += '<br /><input type="checkbox" class="kanji-mass-selection-checkbox" value="mass-' + kanji_count + '" /><span class="kanji-mass-selection-label">Kanji ' + (kanji_count + 1) + ' - ' + (((kanji_count + 100) < kanjis.length) ? (kanji_count + 100) : kanjis.length)  + '</span><div class="kanji-mass-selection-container">';
    }
    kanji_selection_content += '<input type="checkbox" class="kanji-selection-checkbox" value="' + kanji_count + '" />Kanji ' + (kanji_count + 1) + ' - ' + (((kanji_count + 10) < kanjis.length) ? (kanji_count + 10) : kanjis.length) + '<span class="learn-kanjis"></span><br />';
  }
 }
kanji_selection_content += '</div>';
$('.kanji-selection').append(kanji_selection_content);
 
 $('.kanji-mass-selection-checkbox').change(function() {
   $(this).nextAll('.kanji-mass-selection-container').first().children('.kanji-selection-checkbox').attr('checked', $(this).is(':checked'));
 });
 
 $('#start-test-button').click(function() {
  var selected_boxes = $('.kanji-selection-checkbox:checked');
  if (selected_boxes.length === 0) {
    alert('Please select at least one kanji-set on the right first.');
  }
  // Start the test.
  else {
    var selected_kanjis = [];
    selected_boxes.each(function() {
      var start_id = parseInt($(this).val());
      for (var kanji_count = start_id; kanji_count < (((start_id + 10) < kanji_set.length) ? (start_id + 10) : kanji_set.length); kanji_count++) {
        selected_kanjis.push(kanji_set[kanji_count]);
      }
    });
    test_kanjis = shuffle(selected_kanjis);

    // Clear the history.
    $('.kanji-history-list').empty();

    // Update the Kanji-counts.
    $('.remaining-kanji-max, .remaining-kanji-count').text(test_kanjis.length);

    // Unset the mistake count.
    mistake_count = 0;
    $('.remaining-kanji-mistakes-count').text(mistake_count);

    // Display the first item.
    $('.kanji-display').html(test_kanjis[0].kanji.replace('%u', '&#x') + ';');
  }
 });
 
 $("#answer-textbox").on('keyup', function (e) {
    if (e.keyCode == 13 && test_kanjis.length > 0) {
      var answer = $(this).val();
      $(this).val('');

      var old_kanji = test_kanjis.shift();

      var answer_trimmed = $.trim(answer.toLowerCase());
      var history_item_class = '';
      var history_item_suffix = '';
      var answer_correct = ($.inArray(answer_trimmed, getAllowedValues(old_kanji.meaning)) !== -1 || $.inArray(answer_trimmed, getAllowedValues(unescape(old_kanji.kun.length > 0 ? old_kanji.kun : old_kanji.on))) !== -1);
      // Correct answer.
      if (answer_correct) {
        $('.remaining-kanji-count').text(test_kanjis.length);
        history_item_class = 'kanji-history-item-correct';
      }
      // Wrong answer.
      else {
        history_item_class = 'kanji-history-item-wrong';
        // Add the wrong kanji again and shuffle the list.
        test_kanjis.push(old_kanji);
        test_kanjis = shuffle(test_kanjis);

        // Check for which kanji the user mistook the current one.
        for (var kanji_count = 0; kanji_count < kanji_set.length; kanji_count++) {
          if ($.inArray(answer_trimmed, getAllowedValues(kanji_set[kanji_count].meaning)) !== -1 || $.inArray(answer_trimmed, getAllowedValues(unescape(kanji_set[kanji_count].kun.length > 0 ? kanji_set[kanji_count].kun : kanji_set[kanji_count].on))) !== -1) {
            history_item_suffix = '<br /><span class="kanji-history-item-mistake">(mistaken for ' + kanji_set[kanji_count].kanji.replace('%u', '&#x') + '; - ' + kanji_set[kanji_count].meaning + ' &rarr; ' + (kanji_set[kanji_count].kun.length > 0 ? kanji_set[kanji_count].kun.replace(/%u/g, '&#x') : '<span class="kanji-on">' + kanji_set[kanji_count].on.replace(/%u/g, '&#x') + '</span>') + ')</span>';
            break;
          }
        }

        // Update the mistake count.
        mistake_count++;
        $('.remaining-kanji-mistakes-count').text(mistake_count);
      }
      $('#answer-status').attr('class', history_item_class.replace('kanji-history-item-', 'answer-'));

      // Create a new item for the history.
      var new_item = '<div class="kanji-history-item ' + history_item_class + '">' + old_kanji.kanji.replace('%u', '&#x') + '; - ' + old_kanji.meaning + ' &rarr; ' + (old_kanji.kun.length > 0 ? old_kanji.kun.replace(/%u/g, '&#x') : '<span class="kanji-on">' + old_kanji.on.replace(/%u/g, '&#x') + '</span>') + history_item_suffix + '</div>';

      // Add the history item to the start of the list.
      var history_items = $('#kanji-history-list-all .kanji-history-item');
      if (history_items.length >= 10) {
        history_items.last().remove();
      }
      $('#kanji-history-list-all').prepend(new_item);

      // On errors also add it to the error list.
      if (!answer_correct) {
        history_items = $('#kanji-history-list-errors .kanji-history-item');
        if (history_items.length >= 10) {
          history_items.last().remove();
        }
        $('#kanji-history-list-errors').prepend(new_item);
      }

      if (test_kanjis.length > 0) {
        $('.kanji-display').html(test_kanjis[0].kanji.replace('%u', '&#x') + ';');
      }
      else {
        alert('Test done!');
      }
    }
});

$('.language-switcher-lang').click(function() {
  if (!$(this).hasClass('active')) {
    $('.language-switcher-lang').toggleClass('active');
    selected_language = $(this).data('lang');
    if (selected_language === 'en') {
      kanji_set = kanjis.map(a => Object.assign({}, a));
    }
    // German.
    else {
      kanji_set = kanjis_de.map(a => Object.assign({}, a));
    }
  }
});

$('.learn-kanjis').click(function() {
  var learn_overlay = $('#learn-overlay');
  var start_id = parseInt($(this).prev().val());

  // Clear the table and add the new kanjis to the table.
  var table_body = $('#learn-overlay-table tbody');
  table_body.empty();
  for (var kanji_count = start_id; kanji_count < (((start_id + 10) < kanji_set.length) ? (start_id + 10) : kanji_set.length); kanji_count++) {
    table_body.append('<tr><td>' + kanji_set[kanji_count].kanji.replace('%u', '&#x') + ';</td><td>' + kanji_set[kanji_count].meaning + '</td><td>' + kanji_set[kanji_count].kun.replace(/%u/g, '&#x') + '</td><td>' + kanji_set[kanji_count].on.replace(/%u/g, '&#x') + '</td><td>' + kanji_set[kanji_count].number + '</td></tr>');
  }

  // Show the overlay.
  learn_overlay.show();
});

var search_ac = $('.kanji-search-box').autocomplete({
  minLength: 2,
  source: function(request, response) {
    var search_trimmed = $.trim(request.term.toLowerCase());

    var result_kanjis = [];
    if (search_trimmed.length > 0) {
      for (var kanji_count = 0; kanji_count < kanji_set.length; kanji_count++) {
        var allowed_values = [];
        allowed_values = allowed_values.concat(getAllowedValues(kanji_set[kanji_count].meaning));
        allowed_values = allowed_values.concat(getAllowedValues(unescape(kanji_set[kanji_count].kun)));
        allowed_values = allowed_values.concat(getAllowedValues(unescape(kanji_set[kanji_count].on)));
        for (var value_count = 0; value_count < allowed_values.length; value_count++) {
          if (allowed_values[value_count].includes(search_trimmed)) {
            result_kanjis.push(kanji_set[kanji_count]);
            break;
          }
        }
        if (result_kanjis.length >= 10) {
          break;
        }
      }
    }

    response(result_kanjis);
  },
  focus: function( event, ui ) {
    event.preventDefault();
    return false;
  },
  select: function( event, ui ) {
    event.preventDefault();
    return false;
  },
  open: function(event, ui) {
    $('.ui-autocomplete').off('menufocus hover mouseover mouseenter');
  }
}).autocomplete("instance");
search_ac._renderMenu = function(ul, items) {
  var self = this;
  //table definitions
  ul.append('<table class="kanji-search-table"><thead><tr><th>Kanji</th><th>Meaning</th><th>kun</th><th>on</th><th>#</th></tr></thead><tbody></tbody></table>');
  $.each( items, function( index, item ) {
    self._renderItemData(ul, ul.find("table tbody"), item );
  });
};
search_ac._renderItemData = function(ul, table, item) {
  return this._renderItem( table, item ).data( "ui-autocomplete-item", item );
};
search_ac._renderItem = function( table, item ) {
  var row_html ='<td>' + item.kanji.replace('%u', '&#x') + ';</td><td>' + item.meaning + '</td><td>' + item.kun.replace(/%u/g, '&#x') + '</td><td>' + item.on.replace(/%u/g, '&#x') + '</td><td>' + item.number + '</td>';
  return $( "<tr class='ui-menu-item' role='presentation'></tr>" )
    .append(row_html)
    .appendTo( table );
};

$('.history-area-tabs').tabs({
  'classes': {
    "ui-tabs": "ui-corner-all",
    "ui-tabs-nav": "ui-corner-all",
    "ui-tabs-tab": "ui-corner-all",
    "ui-tabs-panel": "ui-corner-all"
  }
});

// Hide the overlay on click.
$('body').delegate('#learn-overlay', 'click', function() {
  $(this).hide();
});
