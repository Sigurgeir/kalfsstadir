var express = require('express');
var router = express.Router();


// Vil gera fylki af hesta hlutum sem eg populera ur database.
// thetta er bara temporary
const hestur = {name:"Hátíð", id:"1", picture:"testpic.jpg"};
const geiri = {name:"Geiri", id:"2", picture:"testpic.jpg"};
hestaFylki = [];
hestaFylki.push(hestur);
hestaFylki.push(geiri);

/* GET users listing. */
router.get('/valmynd/', function(req, res) {
  //res.send('print some stuff');
  const title = 'Meet our horses'
  const picPath = '/images/' + hestur.picture;
  const data = {title, hestaFylki, picPath}
  res.render('valmynd', data);
  //res.render('valmynd', { title: 'Hestarnir okkar', hestaFylki});
});

module.exports = router;
