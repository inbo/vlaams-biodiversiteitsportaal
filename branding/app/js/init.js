require('./settings.js').default;
require('./index-auth.js');
require('./i18next-config.js');
require('./mante.js');
require('./stats.js');
require('./autocomplete-conf.js');

document.addEventListener('DOMContentLoaded', () => {
  console.log('LA skin initialized');
});
