const express = require('express');
var exphbs = require('express-handlebars');
var bodyParser = require('body-parser');
var formidable = require('formidable');
var mv = require('mv');
const fs = require('fs');

const app = express();

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
app.use(express.static('static'));
app.use(bodyParser.text());

app.get('/', (req, res) => {
	var config = require('./filesystem/config/os.json');
	if(req.query.pass == process.env.PASS) {
			fs.readdir('filesystem', (err, files) => {
			res.render('home', {
					files: files,
					pass: process.env.PASS,
					wallpaper: config.wallpaper,
					apps: config.apps,
					games: config.games
				});
			});
	} else {
		res.render('noauth', {
			wallpaper: config.loginscreen || config.wallpaper
		});
	}
});

app.get('/folder/:name', (req, res) => {
	var config = require('./filesystem/config/os.json');
	if(req.query.pass == process.env.PASS) {
			fs.readdir('filesystem/' + req.params.name, (err, files) => {
				res.render('listing', {
					files: files,
					pass: process.env.PASS,
					layout: 'editor',
					folder: req.params.name
				});
			});
	} else {
		res.render('noauth', {
			wallpaper: config.loginscreen || config.wallpaper
		});
	}
});

app.get('/samuelos', (req, res) => {
	res.send("Hey robot!")
});

app.get('/public', (req, res) => {
	fs.readFile('filesystem/hosting/index.html', 'utf8', (err, data) => {
		if (err) {
			res.send(err);
		} else {
			res.send(data);
		}
	});
});

app.get('/public/:file', (req, res) => {
	fs.readFile('filesystem/hosting/' + req.params.file, 'utf8', (err, data) => {
		if (err) {
			res.send(err);
		} else {
			res.send(data);
		}
	});
});

app.get('/app/:pkg', (req, res) => {
	if(req.query.pass == process.env.PASS) {
		res.render('app/' + req.params.pkg, {
			pass: process.env.PASS,
			layout: 'editor'
		});
	} else {
		res.render('noauth');
	}
});

app.get('/api/create', (req, res) => {
	if(req.query.pass == process.env.PASS) {
		fs.writeFile('filesystem/' + req.query.folder + '/' + req.query.filename, '', (err) => {
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

app.get('/api/folder', (req, res) => {
	if(req.query.pass == process.env.PASS) {
		fs.mkdir('filesystem/' + req.query.folder, (err) => {
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

app.post('/api/upload', (req, res) => {
	if(req.query.pass == process.env.PASS) {
		var form = new formidable.IncomingForm();
		form.parse(req, function (err, fields, files) {
			var oldpath = files.file.path;
			var newpath = './filesystem/' + req.query.folder + '/' + files.file.name;
			mv(oldpath, newpath, function (err) {
				if (err) throw err;
				res.redirect('/' + req.query.folder + '?pass=' + process.env.PASS);
			});
		});
	} else {
		res.render('noauth');
	}
});

app.post('/api/edit', (req, res) => {
	if (req.query.pass == process.env.PASS) {
		fs.writeFile('filesystem/' + req.query.folder + '/' + req.query.file, req.body, (err) => {
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

app.get('/:folder/:file', (req, res) => {
	if(req.query.pass == process.env.PASS) {
		fs.readFile('filesystem/' + req.params.folder + '/' + req.params.file, 'utf8', (err, data) => {
			if (err) {
				res.render('file', {
					content: err,
					pass: process.env.PASS,
					theme: require('./filesystem/config/os.json').theme || 'monokai',
					layout: 'editor'
				});
			} else {
				res.render('file', {
					content: data,
					pass: process.env.PASS,
					theme: require('./filesystem/config/os.json').theme || 'monokai',
					layout: 'editor'
				});
			}
		});
	} else {
		res.render('noauth');
	}
});

app.listen(3000);