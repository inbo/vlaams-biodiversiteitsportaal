$(function () {
  if ($("#dropdown-lang").length) {
    var defaultLang =
      (typeof $SH === "undefined" ? undefined : $SH.i18n) || "nl";
    var currentLang = new URLSearchParams(document.location.search).get("lang");
    var lang = currentLang || defaultLang;
    console.log("Language set: " + lang);
    $("#lang-switch").html(lang.toUpperCase() + ' <span class="caret"></span>');
  }
});
