// See http://brunch.io for documentation.

// For a different structure than /app/ see:
// https://github.com/brunch/brunch/issues/1676

const fs = require('fs');
const settings = require('./app/js/settings.js');

// Add your theme in app/themes and select it in app/js/settings.js theme property
//
// Currently we have serveral themes:
// - clean
// - material
// - flatly (based in clean + custom bootstrap)
//
const theme = settings.theme;
const cleanBased = theme == 'flatly' || theme == 'superhero' || theme == 'yeti' || theme == 'cosmo' || theme == 'darkly' || theme == 'paper' || theme == 'sandstone' || theme == 'simplex' || theme == 'slate';
const themeAssets = cleanBased || theme == 'clean' ? 'clean' : theme;

const toReplace = [
  /index\.html$/,      // index can be used as your main LA page
  /pagesLayout\.html$/,      // index can be used as your main LA page
  /errorPage\.html/,   // An error page that can be used in your infrastructure
  /testPage\.html$/,   // testPate is just for text some headings, buttons, etc
  /testSmall\.html$/]; // testSmall is for test the footer with small contents

const toReplaceOthers = [
  /banner\.html$/,
  /footer\.html$/,
  /index\.html$/,      // index can be used as your main LA page
  /errorPage\.html/,   // An error page that can be used in your infrastructure
  /testPage\.html$/,   // testPate is just for text some headings, buttons, etc
  /testSmall\.html$/,  // testSmall is for test the footer with small contents
]; 

// Don't add head.html above because this replacement is done by ala-boostrap
exports.files = {
  javascripts: {
    joinTo: {
      'js/vendor.js': [ // Files that are not in `app/js` dir.
        /^(?!app)/
      ],
      'js/app.js': [
        'app/js/*js',
        ...(cleanBased ? ['app/themes/clean/js/*.js'] : []),
        `app/themes/${theme}/js/*.js`
      ]
    }
  },
  stylesheets: {
    joinTo: {
      'css/app.css': [
        'app/css/*css',
        ...(cleanBased ? ['app/themes/clean/css/*.css'] : []),
        `app/themes/${theme}/css/*.css`
      ]
    }
  }
};

exports.plugins = {
  // TODO add eslint
  // This do some var substition in js code:
//  jscc: {
//    values: {
//      _LOCALES_URL: process.env.NODE_ENV === 'development' ? 'http://localhost:3333' : settings.baseFooterUrl
//    }
//  },
  babel: { presets: ['latest'] },
  copycat: {
    // just copy ALA default builded files to our build
    // These are loaded by ala-bootstrap3 library, so we need to load manually in our development testPage
    'js': ['commonui-bs3-2019/build/js/'],
    ...(theme == 'material' ? { 'material-lite': ['app/themes/material/material-lite'] } : {}),
    ...(theme == 'material' ? { 'custom-bootstrap': ['app/themes/material/custom-bootstrap'] } : {}),
    'css': ['commonui-bs3-2019/build/css/'],
    'fonts': 'commonui-bs3-2019/build/fonts/',
    verbose: false, // shows each file that is copied to the destination directory
    onlyChanged: true // only copy a file if it's modified time has changed (only effective when using brunch watch)
  },
  static: {
    partials: 'app/themes/vlaanderen/assets/*.html',
    // partials: 'public/*.html',
    processors: [
      require('html-brunch-static')({
        processors: [
          require('marked-brunch-static') ({
            fileMatch: 'app/pages/**/*.md',
            fileTransform: (filename) => filename.replace(/\.md$/, '.html').replace(/^app\/pages\//, 'pages/'),
          })
        ]
      })
    ]
  },
  // Maybe replace this plugin by: https://github.com/bmatcuk/html-brunch-static
  replacement: {
    replacements: [
      // Right now this file replacements are only done with `brunch build` and not via the watcher
      // So if you edit them, exec `brunch build` later
      {
        files: toReplace, match: {
          find: 'INDEX_BODY', replace: () => {
            return fs.readFileSync(`app/themes/${themeAssets}/assets/indexBody.html`, 'utf8');
          }
        }
      },
      {
        files: toReplace, match: {
          find: 'TEST_BODY', replace: () => {
            return fs.readFileSync(`app/themes/${themeAssets}/assets/testBody.html`, 'utf8');
          }
        }
      },
      {
        files: toReplace, match: {
          find: 'HEADLOCAL_HERE', replace: () => {
            return fs.readFileSync(`app/themes/${themeAssets}/assets/headLocal.html`, 'utf8');
          }
        }
      },
      {
        files: toReplace, match: {
          find: 'HEAD_HERE', replace: () => {
            return fs.readFileSync(`app/themes/${themeAssets}/assets/head.html`, 'utf8');
          }
        }
      },
      {
        files: toReplace, match: {
          find: 'BANNER_HERE', replace: () => {
            return fs.readFileSync(`app/themes/${themeAssets}/assets/banner.html`, 'utf8');
          }
        }
      },
      {
        files: toReplace, match: {
          find: 'FOOTER_HERE', replace: () => {
            return fs.readFileSync(`app/themes/${themeAssets}/assets/footer.html`, 'utf8');
          }
        }
      },

      // These replacements are done by
      // https://github.com/AtlasOfLivingAustralia/ala-bootstrap3/blob/grails2/grails-app/taglib/au/org/ala/bootstrap3/HeaderFooterTagLib.groovy#L208
      // in the ALA modules that uses it (most of them)

      { files: toReplace, match: { find: '::containerClass::', replace: 'container' } },
      {
        files: toReplace, match: {
          find: '::headerFooterServer::', replace:
            process.env.NODE_ENV === 'development' ?
              'http://localhost:3333' :
              settings.baseFooterUrl
        }
      },
      { files: toReplace, match: { find: '::loginURL::', replace: settings.loginUrl } },
      { files: toReplace, match: { find: '::logoutURL::', replace: settings.logoutUrl } },
      { files: toReplace, match: { find: '::searchServer::', replace: settings.services.bie.url } },
      { files: toReplace, match: { find: '::searchPath::', replace: '/search' } },
      { files: toReplace, match: { find: '::centralServer::', replace: settings.mainLAUrl } },
      { files: toReplace, match: { find: '::bugSVG::', replace: fs.readFileSync(`app/assets/images/bug.svg`, 'utf8') } },


      // These other replacements are only done during build time (and are specific for this skin), so see toReplaceOthers var.
      // Also edit app/js/settings.js before build

      { files: toReplaceOthers, match: { find: '::spatialURL::', replace: settings.services.spatial.url }},
      { files: toReplaceOthers, match: { find: '::collectoryURL::', replace: settings.services.collectory.url } },
      {
        files: toReplaceOthers, match: {
          find: '::datasetsURL::', replace: `${settings.services.collectory.url}/datasets`
        }
      },
      { files: toReplaceOthers, match: { find: '::biocacheURL::', replace: settings.services.biocache.url } },
      { files: toReplaceOthers, match: { find: '::bieURL::', replace: settings.services.bie.url } },
      { files: toReplaceOthers, match: { find: '::regionsURL::', replace: settings.services.regions.url } },
      { files: toReplaceOthers, match: { find: '::listsURL::', replace: settings.services.lists.url } },
      { files: toReplaceOthers, match: { find: '::spatialURL::', replace: settings.services.spatial.url } },
      { files: toReplaceOthers, match: { find: '::casURL::', replace: settings.services.cas.url } },
      { files: toReplaceOthers, match: { find: '::imagesURL::', replace: settings.services.images.url } },
      { files: toReplaceOthers, match: { find: '::bugSVG::', replace: fs.readFileSync(`app/assets/images/bug.svg`, 'utf8') } },

      // And just for testing:
      { files: toReplace, match: { find: '::loginStatus::', replace: process.env.NODE_ENV === 'development' ? 'signedIn' : '::loginStatus::' } }

    ]
  },
  // Using:
  // https://github.com/ocombe/browser-sync-brunch
  // instead of auto-reload-brunch and just `brunch watch`
  // We can return to auto-reload in the future
  browserSync: {
    port: 3333,
    // logLevel: "debug"
    // Don't open a browser tab on each modification (this was working in another browser-sync plugin)
    // open: false
  }
  // Also:
  // https://github.com/mikefarah/git-digest-brunch
};

exports.conventions = {
  // file won't be compiled and will be just moved to public directory instead
  ignored: [
    ...(theme == 'material' ? [/^app\/material-lite/] : []),
    ...(theme == 'material' ? [/^app\/custom-bootstrap/] : [])
  ]
};

exports.server = {
  noPushState: true // returns 404 when file not found
  // If you want to test other html page during development
  // indexPath: 'testPage.html'
};

// FIXME, document this
exports.paths = {
  watched: ['app/js', 'app/css', 'app/assets', `app/themes/${theme}/assets`, `app/themes/${theme}/css`,
    `app/themes/${themeAssets}/assets`, `app/themes/${themeAssets}/css`, 
    'app/pages'
  ]
};



// https://brunch.io/docs/troubleshooting
exports.watcher = {
  awaitWriteFinish: true,
  usePolling: true
}

// exports.optimize = true; // same like brunch build --production
