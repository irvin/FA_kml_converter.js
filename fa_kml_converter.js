var fs = require('fs'),
    xml2js = require('xml2js'),
    handlebars = require("handlebars");

// command arguments
var filename = process.argv[2];
var filename_unext = filename.split('.')[0];

var opt_seg = false;    // Seperate each 150 node into single file.
var opt_ins = false;    // insert point in each point segment

if (process.argv.length > 3){
    opt_seg = (process.argv.indexOf('-s', 3) > -1)? true: false;
    opt_ins = (process.argv.indexOf('-i', 3) > -1)? true: false;
};


var xml = fs.readFileSync(filename, 'utf-8');

//console.log('Source XML:');
//console.log(xml);


var data = {};
var when, coord, num;

xml2js.parseString(xml, function (err, result) {
    var dat = result.kml.Document[0].Placemark[2]['gx:Track'];
    
    data = {
        name: result.kml.Document[0].Placemark[2].name[0],
        desc: result.kml.Document[0].name[0],
        minlat: 90.0,
        minlon: 180.0,
        maxlat: -90.0,
        maxlon: -180.0, 
        coor: []
    };

    when = dat[0].when;
    coord = dat[0]['gx:coord'];
    num = when.length;
    
//    console.log(when, coord, num);
});


/* Prepare data for handlebar template */
var template = fs.readFileSync('./gpx.handlebars', 'utf-8');
template = handlebars.compile(template);

for (i=0; i<num; i++){
    var coo = coord[i].split(' ');
    var lon = coo[0];
    var lat = coo[1];
    
    data.coor[i] = {
        time: when[i],
        lon: lon,
        lat: lat,
        height: coo[2]
    }
    
    if (lat < data.minlat) data.minlat = lat;
    if (lon > data.maxlat) data.maxlat = lat;
    if (lon < data.minlon) data.minlon = lon;
    if (lon > data.maxlon) data.maxlon = lon;
};

/* Use interpolation to insert points between each point */
if (opt_ins){
    var tmp = [], pre = null;
    
    for (pt in data.coor){
        var cur = data.coor[pt];
        if (pre){
            var time_1 = new Date(pre.time);
            var time_2 = new Date(cur.time);
            var mid = new Date((time_1.getTime() + time_2.getTime()) / 2);
            
            tmp.push({ 
                time: mid.toISOString().slice(0, 19),
                lon: ((pre.lon * 1 + cur.lon * 1) / 2).toFixed(5),
                lat: ((pre.lat * 1 + cur.lat * 1) / 2).toFixed(5),
                height: ((pre.height * 1 + cur.height * 1) / 2).toFixed(5),
            })
        }
        
        tmp.push(cur)
        pre = cur;
    };
    data.coor = tmp;
};


// Seperate segment output
var coor_all = data.coor.slice(0, data.coor.length);
var totalnum = coor_all.length - 1;
var begin = 0;
var end = (opt_seg == true && totalnum > 150)? 150 : totalnum;
var i = (opt_seg)? 1 : null;

console.log('node numbers:', totalnum);

while (end <= totalnum) {
//    console.log('data_range', begin, end);
    data.coor = coor_all.slice(begin, end);
    
    var buffer = template(data);
    var serial = (i)? '_' + i : '';
    var fn = filename_unext + serial + '.gpx';
    
    var err = fs.writeFileSync(fn, buffer);
    if (err)
        console.log(err);
    else
        console.log("file saved as " + fn);
    
    i += 1;
    if (end == totalnum) break;

    begin = end + 1;
    end += 150;
    if (end > totalnum) end = totalnum;
};
