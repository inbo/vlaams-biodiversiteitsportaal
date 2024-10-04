var settings = require('./settings');

$(function(){
  if (settings.inMante) {
    console.log("Setting manteinance banner");

    var manteDiv = `<div class="row">
    <div class="col-md-6">
      <div class="error-template">
        <h1 data-i18n="error.title"></h1>
        <h2 data-i18n="error.subtitle"></h2>
        <div>
          <p data-i18n="error.description"></p>
        </div>
        <div class="error-actions">
          <a data-i18n="error.button" href="${settings.mainLAUrl}" style="margin-top: 10px;" class="btn btn-primary btn-lg"></a>
        </div>
      </div>
    </div>
    <div class="col-md-6">
      <img src="images/error.svg" alt="Error Image" onerror="this.onerror=null; this.src='images/error.png'">
    </div>
  </div>`;
    $("#mante-container").html(manteDiv);
    $("#mante-container").show();
  }
});
