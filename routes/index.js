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
      path: path.relative(path.join(__dirname, '..', 'data'), path.join(srcpath, itm)),
      name: itm,
      config: getConfig(path.join(srcpath, itm))
    };
  });
}

// get the current state and target state for a binary output
function getState(srcpath) {
  var result = {};
  result.current = fs.readFileSync(path.join(srcpath, 'current.state'), 'utf8');
  result.desired = fs.readFileSync(path.join(srcpath, 'desired.state'), 'utf8');
  return result;
}

function setDesiredState(srcpath, val) {
  fs.writeFileSync(path.join(srcpath, 'desired.state'), val, 'utf8');
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

  var allData = fileData.split('\n').map(function (itm) {
    var tokens = itm.split(',');
    if (tokens.length != 2) return null;
    else return [
      moment(tokens[0]).toDate().getTime(), parseFloat(tokens[1])
    ];
  });

  var allData = allData.filter(function (val, idx) {
    // less than 30 days ago
    // compute hours, then compare to hours in 30 days
    return Math.floor((new Date().getTime() - val[0]) / 36e5) < 24 * 30; 
  });

  return allData;
}

// route handler
router.get('/:path(*)', function(req, res) {
  var sensorPath = path.join(__dirname, '..', 'data', req.path);
  var parentPath = path.relative(path.join(__dirname, '..', 'data'), path.join(sensorPath, '..'));
  var sensorConfig = getConfig(sensorPath);

  sensorConfig.name = req.path;
  sensorConfig.parent = '/' + parentPath;

  if (sensorConfig.view == 'list') {
    var sensors = getDirectories(sensorPath);

    res.render(sensorConfig.view, {
      config: sensorConfig,
      sensors: sensors
    });
  } else if (sensorConfig.view == 'chart') {
    res.render(sensorConfig.view, {
      config: sensorConfig,
      data: JSON.stringify(getData(sensorPath))
    });
  } else if (sensorConfig.view == 'onoff') {
    res.render(sensorConfig.view, {
      config: sensorConfig,
      state: getState(sensorPath)
    });
  }

});

// route handler
router.post('/:path(*)', function(req, res) {
  var sensorPath = path.join(__dirname, '..', 'data', req.path);
  var sensorConfig = getConfig(sensorPath);

  if (sensorConfig.view == 'onoff') {
    setDesiredState(sensorPath, req.body.val);
  }
  res.redirect(req.path);
});


module.exports = router;
