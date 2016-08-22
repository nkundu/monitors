var express = require('express');
var path = require('path');
var fs = require('fs');
var moment = require('moment');
var router = express.Router();

/* GET home page. */
function isEmpty(str) {
    return (!str || 0 === str.length);
}

// gets a config, or a deafult if one is not set
function getConfig(srcpath) {
  try {
    return JSON.parse(fs.readFileSync(path.join(srcpath, 'config.json'), 'utf8'));
  } catch (e) {
    return { view: 'list' };
  }
}

// gets the sub-sensors, and the config for each one
function getDirectories(srcpath) {
  return fs.readdirSync(srcpath).filter(function(file) {
    return fs.statSync(path.join(srcpath, file)).isDirectory()
  }).map(function(itm) {
    return {
      path: path.relative(path.join('.', 'data'), path.join(srcpath, itm)),
      name: itm,
      config: getConfig(path.join(srcpath, itm))
    };
  });
}

// gets the raw data for the sensor
function getData(srcpath) {
  var fileData = '';
  
  fs.readdirSync(srcpath).filter(function(file) {
    return path.extname(file) == '.csv'
  }).forEach(function(itm) {
    try {
      fileData += fs.readFileSync(path.join(srcpath, itm), 'utf8');
    } catch (e) {
    }
  });  

  return fileData.split('\n').map(function (itm) {
    var tokens = itm.split(',');
    if (tokens.length != 2) return null;
    else return [
      moment(tokens[0]).toDate().getTime(), parseFloat(tokens[1])
    ];
  });
}

// route handler
router.get('/:path(*)', function(req, res) {
  var sensorPath = path.join(__dirname, '..', 'data', req.path);
  var sensorConfig = getConfig(sensorPath);

  if (sensorConfig.view == 'list') {
    var sensors = getDirectories(sensorPath);

    res.render(sensorConfig.view, {
      config: sensorConfig,
      name: req.path, 
      sensors: sensors
    });
  } else if (sensorConfig.view == 'chart') {
    res.render(sensorConfig.view, {
      config: sensorConfig,
      name: req.path, 
      data: JSON.stringify(getData(sensorPath))
    });
  }

});

module.exports = router;
