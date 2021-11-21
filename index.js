const express = require('express');
const exphbs  = require('express-handlebars');

const app = express();
const PORT =  process.env.PORT || 3017;

const FruitBasket = require("./fruit-basket-service");
const pg = require("pg");
const Pool = pg.Pool;
require('dotenv').config()

const connectionString = process.env.DATABASE_URL || 'postgresql://codex:pg123@localhost:5432/the_fruit_basket';
const pool = new Pool({
    connectionString
});

const fruitBasket = FruitBasket(pool);

// enable the req.body object - to allow us to use HTML forms
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// enable the static folder...
app.use(express.static('public'));

// add more middleware to allow for templating support

// console.log(exphbs);
const hbs = exphbs.create();
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

let counter = 0;

app.get('/', async function(req, res) {

	const baskets = await fruitBasket.listBaskets();

	console.log(baskets)

	res.render('index', {
		baskets
	});
});

app.get('/basket/add', function(req, res) {
	res.render('basket/add');
});

app.get('/basket/edit/:id', async  function(req, res) {
	const busketId = req.params.id
	const busket = await fruitBasket.getBasket(busketId)
	const fruits = await fruitBasket.listFruits();
	res.render('basket/edit', {
		busket,
		fruits
	});
});

app.post('/basket/add', async function(req,res){
	console.log(req.body)
	 await fruitBasket.createBasket(req.body.basket_name)

	res.redirect('/');
})

// app.post('/count', function(req, res) {
// 	counter++;
// 	res.redirect('/')
// });


// start  the server and start listening for HTTP request on the PORT number specified...
app.listen(PORT, function() {
	console.log(`App started on port ${PORT}`)
});