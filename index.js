const express = require('express');
var exphbs = require('express-handlebars');
const app = express();
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
app.use(express.static('static'));
const fs = require('fs');

app.get('/', (req, res) => {
	if(req.query.pass == process.env.PASS) {
		fs.readdir('filesystem', (err, files) => {
  		res.render('home', {
				files: files,
				pass: process.env.PASS
			});
		});
	} else {
		res.render('noauth');
	}
});

app.get('/:file', (req, res) => {
	if(req.query.pass == process.env.PASS) {
		fs.readFile('filesystem/' + req.params.file, (err, data) => {
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