(function($) {
    var map = new L.Map('map'),
        url = 'http://gis.phila.gov/arcgis/rest/services/BaseMaps/GrayBase_WM/MapServer/tile/{z}/{y}/{x}',
        attribution = 'City of Philadelphia',
        layer = L.tileLayer(url, {maxZoom: 17, attribution: attribution, subdomains: 'abcd', detectRetina: true});
    
    // Zoom to Philly, add basemap
    map.setView([39.9524, -75.1636], 12).addLayer(layer);
    
    // Loading indicator
    //NProgress.start();
    
    // Add feature layer
    var features = L.esri.featureLayer('http://gis.phila.gov/arcgis/rest/services/PhilaGov/Lane_Closures_Current/MapServer/0').addTo(map);
    
    // Zoom to GPS location
    map.locate({setView: true, maxZoom: 16});
    
    // When location is found, load the data
    map.on('locationfound', function(e) {
        L.circle(e.latlng, e.accuracy / 2).addTo(map);
    });
    
    // Add popup to features
    features.bindPopup(function(feature) {
        return L.Util.template('<b>{PURPOSE}</b><br>{OCCUPANCYTYPE}<br>Expires {EXPIRATIONDATE}', feature.properties);
    });
    
    // When feature layer loads in the future, show loading indicator
    features.on('loading', function() {
        NProgress.start();
    });
    
    // When feature layer is fully loaded, end loading indicator
    features.on('load', function() {
        NProgress.done();
        fillPanel(features._layers);
    });
    
    // Compile template
    var template = Handlebars.compile($("#tmpl-panel").html());
    
    // Fill panel with features using template
    var fillPanel = function(features) {
        $("#panel").empty().append(template({features: features}));
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
