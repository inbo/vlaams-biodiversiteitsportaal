import grails.util.Metadata

grails.project.groupId = 'au.org.ala'

grails.serverURL = 'https://regions.biodiversiteitsportaal.dev.svdev.be'

grails.cors.enabled = false

ignoreCookie = 'true'
security {
    cas {
        // appServerName is automatically set from grails.serverURL

        uriFilterPattern = "/alaAdmin/*"
        uriExclusionFilterPattern = '/assets/.*,/images/.*,/css/.*,/js/.*,/less/.*'

        //authenticateOnlyIfLoggedInPattern requires authenticateOnlyIfLoggedInPattern to identify 'logged in' when ignoreCookie='true'
        authenticateOnlyIfLoggedInPattern = '/*'
    }
}

appName = Metadata.current.'app.name' ?: "regions"

/******************************************************************************\
 *  CONFIG MANAGEMENT occurs in Application.groovy and uses 'config_dir'
 \******************************************************************************/
config_dir = "/data/${appName}/config/"

/******************************************************************************\
 *  SKINNING
 \******************************************************************************/
//ala.skin = 'ala'

/******************************************************************************\
 *  app specific config
 \******************************************************************************/

// switch this on to query hub specific data
hub.enableHubData = false
// add hub id here eg. "data_hub_uid:dh10"
hub.hubFilter = ""

// switch on query context
biocache.enableQueryContext = false
// add query context eg. 'cl2110:"Murray-Darling Basin Boundary"'
biocache.queryContext = ""

// show only regions that intersect with an ALA OBJECT
layers.enableObjectIntersection = false
layers.intersectObject = ""

// configuration to show a default layer on the map. This layer is on top of the layers selected from accordion.
// helpful for regions app implementation for a hub.
layers.showQueryContext = false
layers.queryContextName = ''
layers.queryContextShortName = ''
layers.queryContextDisplayName = ''
layers.queryContextFid = ''
layers.queryContextBieContext = ''
layers.queryContextOrder = ''
alertsResourceName = 'Atlas'
redirectDownloads = false

headerAndFooter.baseURL = 'https://branding.biodiversiteitsportaal.dev.svdev.be'

biocache.filter = "&fq=rank:(species%20OR%20subspecies)&fq=-occurrence_status_s:absent&fq=geospatial_kosher:true&fq=occurrence_year:*"

//google.apikey=

grails.cache.enabled = true
grails.cache.config = {
    cacheManager 'GrailsConcurrentLinkedMapCacheManager'

    cache {
        name 'metadata'
        maxCapacity = 100000
        timeToLiveSeconds 86400
        eternal false
        overflowToDisk false
        maxElementsOnDisk 0
    }

    defaultCache {
        maxCapacity = 1000
        timeToLiveSeconds 86400
        eternal false
        overflowToDisk false
        maxElementsOnDisk 0
    }

    defaults {
        maxCapacity = 1000
        timeToLiveSeconds 86400
        eternal false
        overflowToDisk false
        maxElementsOnDisk 0
    }
}

headerAndFooter.excludeApplicationJs = true
orgNameLong = 'Atlas of Living Australia'
breadcrumbParent = 'https://www.biodiversiteitsportaal.dev.svdev.be/explore-by-location/,Explore'

//google.apikey=

habitat.layerID = '10001'
