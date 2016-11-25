const express = require('express');
const router = express.Router();
const pgp = require('pg-promise')();
const xss = require('xss');

/* GET home page. */
router.get('/', function(req, res) {
  const title = 'Kálfsstaðir horse ranch'
  const firstparagr = "Amidst breathtaking landscape Óli and Systa have restored the previously deserted Kálfsstaðir and there raised...."
  const secondparagr = "Our horses enjoy the expert veterinary care of Systa, Iceland's leading horse veterinary. They grow up roaming free for most of the year..."
  const thirdparagr = "No hour of life is wasted that is spent in the saddle - Winston Churchill"
  const data = {title, firstparagr, secondparagr, thirdparagr}
  res.render('index', data);
});

const DATABASE = process.env.DATABASE_URL || 'postgres://postgres:vefrett@localhost/hestar';
const db = pgp(DATABASE);

router.get('/aboutUs', function(req, res) {
  res.render('aboutUs', { title: 'About us' });
})

router.get('/valmynd', (req, res, next) => {
  db.any('select * from hestar where forSale is TRUE')
    .then((data) => {
      const hestaFylki = [];
      data.forEach(row => {
        const hestur = {id: row.id, name: row.name, description: row.lysing, domur: row.domur, imgRef: `/images/${row.mynd_ref}` };
        hestaFylki.push(hestur);
      });
      res.render('valmynd', { title: 'Meet our horses', hestaFylki });
    })
    .catch((error) => {
      console.log('Error!', error);
      res.render('error', { title: 'Oh no!', error});
    });
});


/* GET horse page. */
router.get('/horse/:id', (req, res) => {
  const id = xss(req.params.id);
  db.one('select * from hestar where id=$1', [id])
    .then((horse) => {
      db.any(`SELECT * FROM komment where hestaid=$1 ORDER BY id DESC LIMIT 100 OFFSET 0`, [id])
        .then(comments => {
      // Hér ættum við að senda niðurstöður í template og vinna með HTML þar
          console.log(comments);
          res.render('horse', {horse, comments})
    })
        .catch((error) => {
			     console.log('Error!', error);
			     res.render('error', { title: 'Oh no!', error});
		});
      })
    .catch((error) => {
      console.log('Error!', error);
      res.render('error', {title: 'Oh no!', error})
    });
});

router.post('/horse/:id', (req, res) => {
  const id = xss(req.params.id);
  const name = xss(req.body.name || '');
  const data = xss(req.body.data || '');

  db.none(`INSERT INTO komment (hestaid, name, data) VALUES ($1, $2, $3)`, [id,name, data])
    .then(data => {
      console.log('Gögnum bætt við!');
      res.redirect(req.get('referer'));
    })
    .catch(error => {
      res.send(`<p>Gat ekki bætt gögnum við: ${error}</p>`);
    });
});

module.exports = router;
