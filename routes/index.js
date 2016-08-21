var express = require('express');
var path = require('path');
var fs = require('fs');
var router = express.Router();

/* GET home page. */
function isEmpty(str) {
    return (!str || 0 === str.length);
}

function getConfig(srcpath) {
  try {
    return JSON.parse(fs.readFileSync(path.join(srcpath, 'config.json'), 'utf8'));
  } catch (e) {
    return {};
  }
}

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

router.get('/:path(*)', function(req, res) {
  var sensorPath = path.join('.', 'data', req.path);
  var sensors = getDirectories(sensorPath);
  res.render('index', {
    config: getConfig(sensorPath),
    name: req.path, 
    sensors: sensors
  });
});

module.exports = router;
