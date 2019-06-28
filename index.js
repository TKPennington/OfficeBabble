const express = require('express');
const cors = require('cors');
const monk = require('monk');
const rateLimit = require('express-rate-limit');
const MongoClient = require(‘mongodb’).MongoClient;
const uri = "";
const client = new MongoClient(uri, { useNewUrlParser: true });
client.connect(err => {
  const collection = client.db("test").collection("devices");
  // perform actions on the collection object
  client.close();
});

const app = express();
const db = monk('localhost/meower');
const mews = db.get('mews');


app.use(cors());
app.use(express.json());

app.get("/", (req,res) => {
	res.json({
		message: 'Meower!'
	});
});

app.get('/mews', (req, res) =>{
	mews
		.find()
		.then(mews =>{
			res.json(mews);
		});
});


function isValidMew(mew){
	return mew.name && mew.name.toString().trim() !== '' &&
		mew.content && mew.content.toString().trim() !== '';
}

app.use(rateLimit({
	windowMs: 1 * 30 * 1000,
  	max: 10
}));

app.post('/mews', (req, res) => {
	if (isValidMew(req.body)) {
		const mew={
			name: req.body.name.toString(),
			content: req.body.content.toString(),
			created: new Date()
		};

		mews
			.insert(mew)
			.then(createdMew => {
				res.json(createdMew);
		});
	}else{
		res.status(422);
		res.json({
			message: 'Hey! Name and Content are required!'
		});
	}
});

app.listen(8080, () => {
	console.log("listening on http://localhost:8080");
});