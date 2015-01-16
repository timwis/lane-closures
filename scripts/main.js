(function($) {
    var map = new L.Map('map'),
        baseMapUrl = 'http://gis.phila.gov/arcgis/rest/services/BaseMaps/GrayBase_WM/MapServer/tile/{z}/{y}/{x}',
        attribution = 'City of Philadelphia',
        layer = L.tileLayer(baseMapUrl, {maxZoom: 17, attribution: attribution, subdomains: 'abcd', detectRetina: true}).addTo(map);
    
    // Zoom to Philly, add basemap
    //map.setView([39.9524, -75.1636], 16).addLayer(layer);
    
    // Add feature layer
    var features = L.esri.featureLayer('http://gis.phila.gov/arcgis/rest/services/PhilaGov/Lane_Closures_Current/MapServer/0');
    
    // Wait 2 seconds and then zoom to GPS location
    setTimeout(function() {
        map.locate({setView: true, maxZoom: 16});
    }, 2000);
    
    // When location is found, load the data
    map.on('locationfound', function(e) {
        L.circle(e.latlng, e.accuracy / 2).addTo(map);
        features.addTo(map);
    });
    
    // When feature layer loads in the future, show loading indicator
    features.on('loading', function() {
        NProgress.start();
    });
    
    // When feature layer is fully loaded, end loading indicator
    features.on('load', function(e) {
        NProgress.done();
        fillPanel(features._layers);
    });
    
    // Register date format Handlebars helper
    Handlebars.registerHelper('relativeTime', function (context) {
        return moment ? moment(context).fromNow() : context;
    });
    
    // Compile templates
    var popupTemplate = Handlebars.compile($("#tmpl-popup").html()),
        panelTemplate = Handlebars.compile($("#tmpl-panel").html());
    
    // Add popup to features using template
    features.bindPopup(function(feature) {
        return popupTemplate(feature.properties);
    });
    
    // Fill panel with features using template
    var fillPanel = function(features) {
        $("#panel").empty().append(panelTemplate({features: features}));
    };
    
    // When document is fully loaded, bind the "Map View" / "List View" buttons
    $(document).ready(function() {
        $('[data-toggle]').on('click', function(e) {
            $('body').removeClass('viewing-map').removeClass('viewing-list').addClass('viewing-' + $(this).data('toggle'));
        });
        
        $("#panel").on('click', 'li a', function(e) {
            var feature = features.getFeature($(e.currentTarget).data('feature-id'));
            feature.openPopup();
            $(this).parent().parent().find('.focus').removeClass('focus').find('.list-group-item-detail').hide();
            $(this).parent().addClass('focus').find('.list-group-item-detail').show();
            e.preventDefault();
        });
    });
})(window.jQuery);
