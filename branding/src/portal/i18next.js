import settings from "../settings";

import i18n from "i18next";
import jqueryI18next from "jquery-i18next";
import backend from "i18next-http-backend";
import lngDetector from "i18next-browser-languagedetector";

const i18nOpts = {
  backend: {
    loadPath: "/locales/{{lng}}/{{ns}}",
    crossDomain: false,
    initImmediate: true,
  },
  supportedLngs: settings.enabledLangs,
  fallbackLng: "nl",
  sendMissingTo: "en",
  interpolation: {
    escapeValue: false,
    formatSeparator: ",",
    format: function f(value, format, lng) {
      // https://www.i18next.com/formatting.html
      // console.log(`Value: ${value} with format: ${format} to lang: ${lng}`);
      if (format === "uppercase") return value.toUpperCase();
      if (value instanceof Date) return moment(value).format(format);
      if (format === "number") return Intl.NumberFormat(lng).format(value);
      return value;
    },
  },
  whitelist: settings.enabledLangs,
  load: "languageOnly", // 'es' o 'en', previously: 'all', // es-ES -> es, en-US -> en
  debug: true,
  ns: "common",
  defaultNS: "common",
  saveMissing: true, // if true seems it's fails to getResourceBundle
  saveMissingTo: "en",
  keySeparator: "ß",
  nsSeparator: "ð",
  pluralSeparator: "đ",
};

const detectorOptions = {
  // order and from where user language should be detected
  order: ["querystring", "cookie"],

  // keys or params to lookup language from
  lookupQuerystring: "lang",
  lookupCookie: "vbp-lang",
  cookieMinutes: 525600, // a year
  cookiePath: "/",
  cookieOptions: {
    path: "/",
    sameSite: "strict",
    secure: window.location.protocol === "https:",
  },
  caches: ["cookie"],
  excludeCacheFor: ["cimode"],
};

i18nOpts.detection = detectorOptions;

i18nOpts.sendMissing = false;
i18nOpts.missingKeyHandler = function miss(lng, ns, key, defaultValue) {
  // call to some API here
  console.log(`"${key}": "${defaultValue}"`);
};

i18n.on("languageChanged", function (lng) {
  if (i18n.services.languageDetector) {
    console.log(`On lang changed ${lng}`);
    // Store in the cookie the selection
    i18n.services.languageDetector.cacheUserLanguage(lng);
  }
  // Use correct github issue template based on language
  $("#create-github-issue-link").attr("href", `https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/new?template=user_bug_report_${lng}.md`)
});

(function ($) {
  i18n.use(backend)
    .use(lngDetector)
    .init(i18nOpts, (err, t) => {
      // initialized and ready to
      if (err) {
        console.error(err);
        return;
      }
      console.log(`Language initialized: ${i18n.language}`);
      jqueryI18next.init(i18n, $, { i18nName: "i18next" });
      console.log("jquery i18next initialized");
      $("body").localize();

      $(".locale-link").on("click", function (e) {
        e.preventDefault();
        const lang = $(this).data("locale");
        console.log(`Lang clicked ${lang}`);

        i18n.changeLanguage(lang);

        // Change ?lang param and reload
        const url = new URL(window.location.href);
        url.searchParams.set("lang", lang);
        window.location.assign(url.href);
      });
      // used in clean theme
      if ($("#dropdown-lang").length) {
        $("#dropdown-lang").find(".dropdown-toggle").html(
          i18n.language + '<span class="caret"></span>',
        );
      }
    });
})(jQuery);
