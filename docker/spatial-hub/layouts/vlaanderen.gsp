<!DOCTYPE html>
<html lang="nl-BE">
<head>
    <g:if test="${config == null}">
        <g:set var="config" value="${grailsApplication.config}"/>
    </g:if>

    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
    <meta name="app.version" content="${g.meta(name: 'info.app.version')}"/>
    <meta name="app.build" content="${g.meta(name: 'info.app.build')}"/>
    <meta name="description" content="${config.skin?.orgNameLong ?: 'Atlas of Living Australia'}"/>
    <meta name="author" content="${config.skin?.orgNameLong ?: 'Atlas of Living Australia'}">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!-- Favicon -->
    <link href="${config.skin.favicon}" rel="shortcut icon" type="image/x-icon"/>

    <title>
        <g:layoutTitle/>
    </title>
    <g:layoutHead/>
    <asset:stylesheet href="application.css"/>
    <g:if test="${config.fathomId != null && config.fathomId != ''}">
        <script src="https://cdn.usefathom.com/script.js" data-site="${config.fathomId}" defer></script>
    </g:if>
    <!--    Custom Vlaanderen styling -->
    <style>
        #wrapper-navbar .navbar {
          background-color: #a83d7a !important;
        }

        #wrapper-navbar .navbar > .header-logo-menu .navbar-brand {
          height: 3em;
        }

        #wrapper-navbar .navbar {
          padding: 0;
        }

        #wrapper-navbar .container-fluid {
          padding-right: 0px;
          padding-left: 0px;
        }
        @media (max-width: 991.98px) {
            #wrapper-navbar .navbar > .header-logo-menu .navbar-brand {
                height: ;
            }
        }
        .collapse.in, .collapsing, .header-collapse {
            height: ;
            padding-top: 10px;
            padding-bottom: 10px;
            padding-left: 10px;
        }
        #right-panel {
            border-left: 2px solid #a83d7a;
        }
    </style>
</head>

<body class="${pageProperty(name: 'body.class')}" id="${pageProperty(name: 'body.id')}"
      onload="${pageProperty(name: 'body.onload')}">
<g:set var="fluidLayout" value="${pageProperty(name: 'meta.fluidLayout') ?: config.skin.fluidLayout}"/>
<g:set var="loginStatus" value="${request.userPrincipal ? 'signedIn' : 'signedOut'}"/>
<g:set var="hideLoggedOut" value="${request.userPrincipal ? '' : 'hidden'}"/>

<!-- Header -->
<g:set var="headerVisiblity" value="${(config.skin.header && config.spApp.header) ? '' : 'hidden'}"/>

<div id="wrapper-navbar" itemscope="" itemtype="http://schema.org/WebSite" class="${headerVisiblity}">
    <a class="skip-link sr-only sr-only-focusable" href="#INSERT_CONTENT_ID_HERE">Skip to content</a>

    <nav class="navbar navbar-inverse navbar-expand-md">
        <div class="container-fluid header-logo-menu">
            <!-- Your site title as branding in the menu -->
            <div class="navbar-header">
                <div>
                    <a href="${grailsApplication.config.ala.baseURL}" class="custom-logo-link navbar-brand" itemprop="url">
                        <!-- Logo INBO -->
                        <!--                        <img width="1005" height="150"-->
                        <!--                             class="custom-logo" alt="Vlaams biodiversiteitsportaal" itemprop="image"-->
                        <!--                             src="https://assets.vlaanderen.be/image/upload/c_scale,q_auto:eco,w_1000/inbo_zcond9"-->
                        <!--                             srcset="https://assets.vlaanderen.be/image/upload/c_scale,q_auto:eco,w_320/inbo_zcond9 320w, https://assets.vlaanderen.be/image/upload/c_scale,q_auto:eco,w_480/inbo_zcond9 480w, https://assets.vlaanderen.be/image/upload/c_scale,q_auto:eco,w_960/inbo_zcond9 960w, https://assets.vlaanderen.be/image/upload/c_scale,q_auto:eco,w_1420/inbo_zcond9 1420w, https://assets.vlaanderen.be/image/upload/c_scale,q_auto:eco,w_1920/inbo_zcond9 1920w"-->
                        <!--                             sizes="(max-width:500px) 100vw, (max-width:767px) 50vw, 25vw" />-->
                        <!-- Logo Vlaanderen -->
                        <img width="1005" height="150"
                             class="custom-logo" alt="Vlaams biodiversiteitsportaal" itemprop="image"
                             src="https://assets.vlaanderen.be/image/upload/c_scale,q_auto:eco,w_1000/Vlaanderen_is_wetenschap_vol_xnbdq2"
                             srcset="https://assets.vlaanderen.be/image/upload/c_scale,q_auto:eco,w_320/Vlaanderen_is_wetenschap_vol_xnbdq2 320w, https://assets.vlaanderen.be/image/upload/c_scale,q_auto:eco,w_480/Vlaanderen_is_wetenschap_vol_xnbdq2 480w, https://assets.vlaanderen.be/image/upload/c_scale,q_auto:eco,w_960/Vlaanderen_is_wetenschap_vol_xnbdq2 960w, https://assets.vlaanderen.be/image/upload/c_scale,q_auto:eco,w_1420/Vlaanderen_is_wetenschap_vol_xnbdq2 1420w, https://assets.vlaanderen.be/image/upload/c_scale,q_auto:eco,w_1920/Vlaanderen_is_wetenschap_vol_xnbdq2 1920w"
                             sizes="(max-width:500px) 100vw, (max-width:767px) 50vw, 25vw"/>
                    </a>

                    <!-- end custom logo -->
                </div>

                <div class="display-flex ${loginStatus}">
                    <ul class="nav navbar-nav language-selection">
                        <li id="dropdown-lang" class="dropdown">
                            <a id="lang-switch" href="#" class="save-load" data-toggle="dropdown" role="button" aria-haspopup="true"
                               aria-expanded="false">Change language<span class="caret"></span></a>
                            <ul class="locale-switcher dropdown-menu dropdown-lang-menu">
                                <li class="locale-link" data-locale="nl"><a class="nl-locale-link" href="?lang=nl"><span
                                        class="lang_link_nl">Nederlands</span></a></li>
                                <!-- <li class="locale-link" data-locale="fr"><a class="fr-locale-link" href="#"><span class="lang_link_fr">Français</span></a></li> -->
                                <li class="locale-link" data-locale="en"><a class="en-locale-link" href="?lang=en"><span
                                        class="lang_link_en">English</span></a></li>
                            </ul>
                        </li>
                    </ul>
                    <g:if test="${request.userPrincipal != null}">
                        <a href="#" class="save-load"
                           onclick="$('#saveSessionButton')[0].click()"
                           data-toggle="dropdown" role="button"
                           aria-expanded="false">Save</a>
                        <a href="#" class="save-load"
                           onclick="$('#sessionsButton')[0].click()"
                           data-toggle="dropdown" role="button"
                           aria-expanded="false">Load</a>
                        <g:if test="config.workflow.enabled">
                            <a href="#" class="save-load"
                               onclick="$('#workflowsButton')[0].click()"
                               data-toggle="dropdown" role="button"
                               aria-expanded="false">Workflows</a>
                        </g:if>
                    </g:if>
                    <button class="display-flex search-trigger hidden-md hidden-lg collapsed collapse-trigger-button"
                            title="Open search dialog"
                            data-toggle="collapse" data-target="#autocompleteSearchALA"
                            onclick="focusOnClickSearchButton()">
                        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="18" viewBox="0 0 22 22">
                            <defs>
                                <style>
                                    .search-icon {
                                        fill: #fff;
                                        fill-rule: evenodd;
                                    }
                                </style>
                            </defs>
                            <path class="search-icon"
                                  d="M1524.33,60v1.151a7.183,7.183,0,1,1-2.69.523,7.213,7.213,0,0,1,2.69-.523V60m0,0a8.333,8.333,0,1,0,7.72,5.217A8.323,8.323,0,0,0,1524.33,60h0Zm6.25,13.772-0.82.813,7.25,7.254a0.583,0.583,0,0,0,.82,0,0.583,0.583,0,0,0,0-.812l-7.25-7.254h0Zm-0.69-7.684,0.01,0c0-.006-0.01-0.012-0.01-0.018s-0.01-.015-0.01-0.024a6,6,0,0,0-7.75-3.3l-0.03.009-0.02.006v0a0.6,0.6,0,0,0-.29.293,0.585,0.585,0,0,0,.31.756,0.566,0.566,0,0,0,.41.01V63.83a4.858,4.858,0,0,1,6.32,2.688l0.01,0a0.559,0.559,0,0,0,.29.29,0.57,0.57,0,0,0,.75-0.305A0.534,0.534,0,0,0,1529.89,66.089Z"
                                  transform="translate(-1516 -60)"></path>
                        </svg>
                        <span class="collapse visible-on-show" aria-hidden="true">&times;</span>
                    </button>
                    <g:if test="${request.userPrincipal == null}">
                        <hf:loginLogout role="button"
                                        class="account-mobile hidden-md hidden-lg loginBtn mobile-login-btn"/>
                    </g:if>
                    <g:if test="${request.userPrincipal != null}">
                        <a href="/my-profile.html" role="button"
                           class="account-mobile hidden-md hidden-lg myProfileBtn hideLoggedOut" title="My Account">
                            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="18" viewBox="0 0 37 41">
                                <defs>
                                    <style>
                                        .account-icon {
                                            fill: #212121;
                                            fill-rule: evenodd;
                                        }
                                    </style>
                                </defs>
                                <path id="Account" class="account-icon"
                                      d="M614.5,107.1a11.549,11.549,0,1,0-11.459-11.549A11.516,11.516,0,0,0,614.5,107.1Zm0-21.288a9.739,9.739,0,1,1-9.664,9.739A9.711,9.711,0,0,1,614.5,85.81Zm9.621,23.452H604.874a8.927,8.927,0,0,0-8.881,8.949V125h37v-6.785A8.925,8.925,0,0,0,624.118,109.262Zm7.084,13.924H597.789v-4.975a7.12,7.12,0,0,1,7.085-7.139h19.244a7.119,7.119,0,0,1,7.084,7.139v4.975Z"
                                      transform="translate(-596 -84)"></path>
                            </svg>
                        </a>

                        <g:link url="${grailsApplication.config.grails.serverURL}/logout" role="button"
                                class="account-mobile hidden-md hidden-lg logoutBtn mobile-logout-btn"
                                title="Logout link">
                            <i class="fas fa-sign-out"></i>
                        </g:link>

                    </g:if>
                </div>
            </div>


        </div><!-- .container -->
        <div class="container-fluid">
            <div id="autocompleteSearchALA" class="collapse">
                <form method="get" action="${config.bie.baseURL}${config.bie.searchPath}" class="search-form">
                    <div class="space-between">
                        <input id="autocompleteHeader" type="text" name="q"
                               placeholder="Search species, datasets, and more..." class="search-input"
                               autocomplete="off"/>
                        <button class="search-submit" title="submit">
                            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 22 22">
                                <defs>
                                    <style>
                                        .search-icon {
                                            fill: #fff;
                                            fill-rule: evenodd;
                                        }
                                    </style>
                                </defs>
                                <path class="search-icon"
                                      d="M1524.33,60v1.151a7.183,7.183,0,1,1-2.69.523,7.213,7.213,0,0,1,2.69-.523V60m0,0a8.333,8.333,0,1,0,7.72,5.217A8.323,8.323,0,0,0,1524.33,60h0Zm6.25,13.772-0.82.813,7.25,7.254a0.583,0.583,0,0,0,.82,0,0.583,0.583,0,0,0,0-.812l-7.25-7.254h0Zm-0.69-7.684,0.01,0c0-.006-0.01-0.012-0.01-0.018s-0.01-.015-0.01-0.024a6,6,0,0,0-7.75-3.3l-0.03.009-0.02.006v0a0.6,0.6,0,0,0-.29.293,0.585,0.585,0,0,0,.31.756,0.566,0.566,0,0,0,.41.01V63.83a4.858,4.858,0,0,1,6.32,2.688l0.01,0a0.559,0.559,0,0,0,.29.29,0.57,0.57,0,0,0,.75-0.305A0.534,0.534,0,0,0,1529.89,66.089Z"
                                      transform="translate(-1516 -60)"></path>
                            </svg>
                        </button>
                    </div>
                </form>
            </div>
        </div>

    </nav><!-- .site-navigation -->


</div>
<script type="text/html" id="autoCompleteTemplate">
    <li class="autocomplete-item striped">
        <div class="content-spacing">
            <div class="autocomplete-heading">
                ${'<% if (commonNameMatches.length > 0) { %><%=commonNameMatches[0]%><% } else if (scientificNameMatches.length > 0) { %><%=scientificNameMatches[0]%><% } else { %><%=matchedNames[0]%><% } %>'.encodeAsRaw()}
            </div>
        </div>
    </li>
</script>

<!-- End header -->
<!-- end banner message -->
<ala:systemMessage/>
<!-- Container -->
<div class="${fluidLayout ? 'container-fluid' : 'container'}" id="main">
    <g:layoutBody/>
</div><!-- End container #main col -->

<asset:deferredScripts/>

<asset:javascript src="commonui-bs3-2019/js/application.min.js"/>
<asset:javascript src="commonui-bs3-2019.js"/>
<asset:javascript src="i18n.js"/>

<!-- End Google Analytics -->
</body>
</html>