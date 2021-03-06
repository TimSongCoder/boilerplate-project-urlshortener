'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
const dns = require('dns');
const bodyParser = require('body-parser');
const urlValidator = require('valid-url');
const autoIncrementor = require('mongoose-auto-increment');

var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
const dbConnection = mongoose.connect(process.env.MONGO_URI);
autoIncrementor.initialize(dbConnection);
const mappingSchema = new mongoose.Schema({original_url: {type: String, required: true}, short_url: {type: Number, required: true}});
mappingSchema.plugin(autoIncrementor.plugin, {model: 'Mapping', field: 'short_url', startAt: 1});
const Mapping = dbConnection.model('Mapping', mappingSchema);
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
    Mapping.nextCount((err, count) => {
      if(err){
        console.log('Can not get next count.');
        res.json({error: 'Internal DB Error'});
        return;
      }
      console.log(`count: ${count}`);
      Mapping.create({original_url, short_url: count}, (err, doc) => {
        if(err) {
          console.log(err);
          res.json({error: 'Internal DB Error'});
        }else{
          res.json({original_url: doc.original_url, short_url: doc.short_url});
        }
      });
    });
  } else {
    res.json({error: 'invalid URL'});
  }
  
});

app.get('/api/shorturl/:url', (req, res) => {
  const shortUrl = req.params.url;
  if(/^\d+$/.test(shortUrl)){
    const queryUrl = Number.parseInt(shortUrl);
    Mapping.findOne({short_url: queryUrl}, (err, mapSite) => {
      if(err) {
        console.log(err);
        res.json({error: 'can not find a matching url'});
      } else {
        res.redirect(mapSite.original_url);
      }
    });
  }else{
    res.json({error: 'invalid short url'});
  }
});