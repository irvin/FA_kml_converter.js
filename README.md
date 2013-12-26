FlightAware kml converter
=========================

Convert KML file from FlightAware.com to GPX file format.

```
$ node fa_kml_converter FlightAware_x.kml 
$ file saved as FlightAware_x.gpx
```

### Requirement
```
$ npm install xml2js
$ npm install handlebars
```

### Arguments
```
-i Insert interpolation points between each 2 point
-s Separate output gpx files for each 150 points
```