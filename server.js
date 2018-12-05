'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
const dns = require('dns');
const bodyParser = require('body-parser');
const urlValidator = require('valid-url');
const autoIncrementor = require('');

var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
mongoose.connect(process.env.MONGO_URI);
const mappingSchema = new mongoose.Schema({original_url: {type: String, required: true}, short_url: {type: Number, required: true}});
const Mapping = mongoose.model('SiteMap', mappingSchema);
app.use(cors());


/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(bodyParser({extended: false}));
app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});


app.listen(port, function () {
  console.log('Node.js listening ...');
});

app.post('/api/shorturl/new', (req, res) => {
  const original_url = req.body.url;
  console.log(original_url);
  if(urlValidator.isUri(original_url)) {
    res.json({original_url, short_url: 999});
    app.get('/api/shorturl/' + 999, (req, res) => {
      res.redirect(original_url);
    });
  } else {
    res.json({error: 'invalid URL'});
  }
  
});

app.get('/api/shorturl/:');