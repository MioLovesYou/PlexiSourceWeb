const express = require("express");
const cookies = require("cookie-parser");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
const mongoClient = require("mongodb").MongoClient;
const objectId = require("mongodb").ObjectID;
const app = express();
const FormData = require('form-data');
const uri = `mongodb+srv://MioLovesYou:${process.env.SECRET}@cluster0-aacxk.mongodb.net/test?retryWrites=true`;

app.use(bodyParser.json());
app.use(cookies());
app.use(bodyParser.urlencoded({ extended: true }));

var collection, tokens;

app.listen(8080, () => {
  console.log(`Website:\tOnline`)
  mongoClient.connect(uri, { useNewUrlParser: true }, (error, client) => {
    if (error) throw error;
    collection = client.db('data').collection("source");
    tokens = client.db('data').collection("tokens");
    console.log(`Database:\tOnline`);
  });
});


// Set the view engine to ejs
app.set('view engine', 'ejs');
app.use(express.static('views'));

//   Pages

// Index page
app.get('/', function(req, res) {
  console.log(req.cookies)
  collection.find({}).toArray((error, result) => {
    if (error) res.render(error)
    res.render('pages/index', {
      data: result,
      req: req
    });
  });
});

// Index page
app.get('/submit', function(req, res) {
  collection.find({}).toArray((error, result) => {
    if (error) res.render(error)
    res.render('pages/submit', {
      data: result,
      req: req
    });
  });
});

app.post("/upload", (request, response) => {
   // if (!request.body.source || !request.body.tags || !request.body.APIKey) response.send(`Invalid. Missing some properties: ${request.body.source ? '' : 'Source'} ${request.body.tags ? '' : 'Tags'} ${request.body.APIKey ? '' : 'API Key'}`);
  request.body.tags = request.body.tags.split(`,`);
  request.body.vote = 0;
  request.body.ID = ((Math.floor(Math.random() * 100000000) + Date.now()) * Math.random()).toString();
  console.log(request.body.source.includes(`\n`));
  console.log(request.body.source);
  
  collection.insert(request.body, (error, result) => {
    if (error) return response.status(500).send(error);
    response.send(result.result);
  });
});

app.post("/vote", (request, response) => {
  collection.find({ID: request.body.ID}).toArray((error, result) => {
    console.log(result)
    console.log(request.body)
    collection.updateOne({ID: request.body.ID}, { $set: { votes: result[0].votes + Number(request.body.score)}})
  });
});
                                             
                                            
app.get("/info", (request, response) => {
  collection.find({}).toArray((error, result) => {
    if (error) return response.status(500).send(error);
    response.send(result);
  });
});

app.get('/source/:id', function(req, res) {
  collection.find({}).toArray((error, result) => {
    console.log(result.map(i => console.log(i.ID === req.params.id.toString())));
  });
  collection.find({ID: req.params.id}).toArray((error, result) => {
    if (result.length === 0) res.send(`Invalid ID.`);
    console.log(result)
     res.render('pages/sourceCode', {
      data: result,
      collection: collection
    });
  });
});

app.post('/api', (request, response) => {
  var data = Object.keys(request.body).map(i => {
    {i:request.body[i]}
  });
});

app.get('/loggingIn', async function(req, res) {
  if (req.query.code) {
    const body = new FormData();
    body.append('client_id', '580040543451611184');
    body.append('client_secret', process.env.CLIENT_SECRET);
    body.append('grant_type', 'authorization_code');
    body.append('redirect_uri', 'https://plexisrc.glitch.me/loggingIn');
    body.append('scope', 'identify');
    body.append('code', req.query.code);
    console.log(body)
    var fetched = await fetch('https://discordapp.com/api/oauth2/token', {
      method: 'POST',
      body
    }); 
    fetched = await fetched.json();
    if (!fetched) res.send(`Big idiot man, no work!`);
    res.cookie('accessToken', fetched.access_token, {expire: fetched.expires_in * 1000});
    console.log(fetched);
    tokens.insertOne({accessToken: fetched.access_token, refreshToken: fetched.refresh_token}, (error, result) => {
      if (error) return res.send(`Something fricked up. Our tecniktians aw werkin wwery hard 2 fix thiz. soooo swworry.`);
    });
    res.redirect('/');
  } 
});

app.get('/login', function(req, res) {
//  if (!req.cookies.accessToken) 
  res.redirect('https://discordapp.com/oauth2/authorize?client_id=580040543451611184&redirect_uri=https%3A%2F%2Fplexisrc.glitch.me%2FloggingIn&response_type=code&scope=identify');
 // else res.redirect('/');
});

// 404 Page (Couldn't be found)
app.get('*', function(req, res) {
  res.sendFile(__dirname + '/views/pages/404.html', 404);
});