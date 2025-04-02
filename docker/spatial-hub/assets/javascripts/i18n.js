$(function () {
  if ($('#dropdown-lang').length) {
    var defaultLang = 'EN';//todo should come from config value
    var currentLang = new URLSearchParams(document.location.search).get("lang");
    var lang = currentLang || defaultLang
    console.log('Language set: ' + lang);
    $('#lang-switch').html(lang.toUpperCase() + ' <span class="caret"></span>');
  }
});

