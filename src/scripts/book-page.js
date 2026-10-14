// On /book/, a link like /book/?for=nic puts that adviser first and marks them as suggested.
(function () {
  var list = document.querySelector('.book--page .book__list');
  if (!list) return;

  var wanted = '';
  try {
    wanted = (new URLSearchParams(window.location.search).get('for') || '').toLowerCase();
  } catch (e) {
    return;
  }
  if (!wanted) return;

  var rows = Array.prototype.slice.call(list.querySelectorAll('.book__row'));
  var match = null;
  rows.forEach(function (row) {
    var button = row.querySelector('[data-book-host]');
    var slug = button ? button.getAttribute('data-book-host') : '';
    if (!match && slug.indexOf(wanted) === 0) match = row;
  });
  if (!match) return;

  rows.forEach(function (row) {
    row.classList.remove('book__row--flagged');
    var flag = row.querySelector('.book__flag');
    if (flag) flag.remove();
  });

  match.classList.add('book__row--flagged');
  var who = match.querySelector('.book__who');
  if (who) {
    var label = document.createElement('p');
    label.className = 'book__flag';
    label.textContent = 'Suggested for you';
    who.insertBefore(label, who.firstChild);
  }
  list.insertBefore(match, list.firstChild);
})();
