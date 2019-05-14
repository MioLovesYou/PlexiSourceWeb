const express = require("express");
const bodyParser = require("body-parser");
const mongoClient = require("mongodb").MongoClient;
const objectId = require("mongodb").ObjectID;
const app = express();
const uri = `mongodb+srv://MioLovesYou:${process.env.SECRET}@cluster0-aacxk.mongodb.net/test?retryWrites=true`;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var database, collection;

app.listen(8080, () => {
  console.log(`Website:\tOnline`)
  mongoClient.connect(uri, { useNewUrlParser: true }, (error, client) => {
    if (error) throw error;
    collection = client.db('data').collection("source");
    console.log(`Database:\tOnline`);
  });
});



// Set the view engine to ejs
app.set('view engine', 'ejs');
app.use(express.static('views'));

//   Pages

// Index page
app.get('/', function(req, res) {
  collection.find({}).toArray((error, result) => {
    if (error) res.render(error)
    res.render('pages/index', {
      data: result,
      req: req
  })
  });
});

// Index page
app.get('/submit', function(req, res) {
  collection.find({}).toArray((error, result) => {
    if (error) res.render(error)
    res.render('pages/submit', {
      data: result,
      req: req
  })
  });
});

app.post("/upload", (request, response) => {
  collection.insert(request.body, (error, result) => {
    if (!request.body.source || !request.body.tags || !request.body.APIKey) response.status.send(`Invalid. Missing some properties: ${request.body.source ? '' : 'Source'} ${request.body.tags ? '' : 'Tags'} ${request.body.APIKey ? '' : 'API Key'}`);
    if (error) return response.status(500).send(error);
    response.send(result.result);
  });
});

app.get("/info", (request, response) => {
  collection.find({}).toArray((error, result) => {
    if (error) return response.status(500).send(error);
    response.send(result);
  });
});

// 404 Page (Couldn't be found)
app.get('*', function(req, res) {
  res.sendFile(__dirname + '/views/pages/404.html', 404);
});
