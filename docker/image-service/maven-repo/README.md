# Local maven repository for the image-service build

Upstream image-service depends on `au.org.ala.plugins.grails:images-client-plugin:1.6-SNAPSHOT`, a moving snapshot
without a release. To keep the build reproducible the jar and pom are kept here (the jar in git lfs) and the build
only resolves that module from this directory (see `../vbp.init.gradle`).

Current copy: build `1.6-20260722.012005-6` from
<https://nexus.ala.org.au/content/repositories/snapshots/au/org/ala/plugins/grails/images-client-plugin/1.6-SNAPSHOT/>,
built from <https://github.com/AtlasOfLivingAustralia/images-client-plugin> commit `f8c2cd7` (develop).

To update: download the new `.jar` and `.pom` into a directory named after the version image-service requests,
named `images-client-plugin-<version>.jar` / `.pom`, and remove the old one.
