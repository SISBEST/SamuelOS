const express = require('express');
var exphbs = require('express-handlebars');
var bodyParser = require('body-parser');
const app = express();
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
app.use(express.static('static'));
app.use(bodyParser.text());
const fs = require('fs');

app.get('/', (req, res) => {
	if(req.query.pass == process.env.PASS) {
		fs.readFile('filesystem/osconfig.json', 'utf8', (err, data) => {
			var config = JSON.parse(data);
			fs.readdir('filesystem', (err, files) => {
  		res.render('home', {
					files: files,
					pass: process.env.PASS,
					wallpaper: config.wallpaper
				});
			});
			});
	} else {
		res.render('noauth');
	}
});

app.get('/api/create', (req, res) => {
	if(req.query.pass == process.env.PASS) {
		fs.writeFile('filesystem/' + req.query.filename, '', (err) => {
			if (err) {
				res.status(500).send(err);
			} else {
				res.redirect('/?pass=' + process.env.PASS);
			}
		});
	} else {
		res.render('noauth');
	}
});

app.post('/api/edit', (req, res) => {
	if (req.query.pass == process.env.PASS) {
		fs.writeFile('filesystem/' + req.query.filename, req.body, (err) => {
			if (err) {
				res.status(500).send(err);
			} else {
				res.send("OK");
			}
		});
	} else {
		res.status(401).send('AUTH MISSING');
	}
});

app.get('/:file', (req, res) => {
	if(req.query.pass == process.env.PASS) {
		fs.readFile('filesystem/' + req.params.file, 'utf8', (err, data) => {
			if (err) {
				res.render('file', {
					content: err,
					pass: process.env.PASS
				});
			} else {
				res.render('file', {
					content: data,
					pass: process.env.PASS
				});
			}
		});
	} else {
		res.render('noauth');
	}
});

app.listen(3000);