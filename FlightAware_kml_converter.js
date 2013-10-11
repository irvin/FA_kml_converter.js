var fs = require('fs'),
    xml2js = require('xml2js'),
    handlebars = require("handlebars");

var xml = fs.readFileSync('./track.xml', 'utf-8');

//console.log('Source XML:');
//console.log(xml);

var name, when, coord, num;

xml2js.parseString(xml, function (err, result) {
    console.log('Parsed Json:');
    var data = result.kml.Document[0].Placemark[2]['gx:Track'];
    
    name = result.kml.Document[0].Placemark[2].name[0];    
    when = data[0].when;
    coord = data[0]['gx:coord'];
    num = when.length;
    
//    console.log(when, coord, num);
});


/* Prepare data for handlebar template */
var template = fs.readFileSync('./gpx.handlebars', 'utf-8');
template = handlebars.compile(template);

var data = {
    name: name,
    coor: []
};

for (i=0; i<num; i++){
    var coo = coord[i].split(' ');
    
    data.coor[i] = {
        time: when[i],
        lon: coo[0],
        lat: coo[1],
        height: coo[2]
    }
};

var buffer = template(data);
//console.log(buffer);

fs.writeFile('./track.gpx', buffer, function(err) {
    if (err) {
        console.log(err);
    } else {
        console.log("file saved");
    }
});
