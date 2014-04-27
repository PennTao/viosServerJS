
/*
 * GET home page.
 */
var fs = require('fs');
var path = require('path');
var util = require('util');
var crypto = require('crypto');
var User = require('../models/User.js');
module.exports = function (app) {
    app.get('/', function (req, res) {
        res.render('index', {
            title:'Main Page'
        })
    })
    app.post('/upload', function (req, res) {

        fs.readFile(req.files.image.path, function (err, data) {
	
            var imageName = req.files.image.name
	    console.log(req.files.image.path+imageName);
            /// If there's an error
            if (!imageName) {

                console.log("There was an error")
                res.redirect("/");
                res.end();

            } else {

                var newPath = path.dirname(require.main.filename) + "/uploads/fullsize/" + imageName;
                fs.writeFile(newPath, data, function () {
                    res.redirect("/uploads/fullsize/" + imageName);

                });
            }
        });
    });
    app.get('/uploads/fullsize/:file', function (req, res) {
	var fileext = req.params.file.split('.').pop();
	if(fileext == 'jpg' || fileext == 'png' ){
		var img = fs.readFileSync(path.dirname(require.main.filename) + "/uploads/fullsize/" + req.params.file);
		var type = 'image/' + fileext;
		res.writeHead(200, {'Content-Type': type });
		res.end(img, 'binary');
	}else if(fileext == 'mp4'){
		var filepath = path.dirname(require.main.filename) + "/uploads/fullsize/" + req.params.file;
		var stat= fs.statSync(filepath);
		var total = stat.size;
		if (req.headers['range']) {
		    var range = req.headers.range;
		    var parts = range.replace(/bytes=/, "").split("-");
		    var partialstart = parts[0];
		    var partialend = parts[1];
		 
		    var start = parseInt(partialstart, 10);
		    var end = partialend ? parseInt(partialend, 10) : total-1;
		    var chunksize = (end-start)+1;
		    console.log('RANGE: ' + start + ' - ' + end + ' = ' + chunksize);
		 
		    var file = fs.createReadStream(filepath, {start: start, end: end});
		    res.writeHead(206, { 'Content-Range': 'bytes ' + start + '-' + end + '/' + total, 'Accept-Ranges': 'bytes', 'Content-Length': chunksize, 'Content-Type': 'video/mp4' });
		    file.pipe(res);
		  } else {
		    console.log('ALL: ' + total);
		    res.writeHead(200, { 'Content-Length': total, 'Content-Type': 'video/mp4' });
		    fs.createReadStream(filepath).pipe(res);
		 }
		
	}else if(fileext =='json' || fileext =='txt'){
		var jsonfile = fs.readFileSync(path.dirname(require.main.filename) + "/uploads/fullsize/" + req.params.file);
		res.writeHead(200, {'Content-Type': 'text' });
		res.end(jsonfile, 'binary');
			
	}
	

    });

    app.get('/uploads/thumbs/:file', function (req, res) {
        var img = fs.readFileSync(path.dirname(require.main.filename) + "/uploads/thumbs/" + req.params.file);
	res.writeHead(200, {'Content-Type': 'image' });
	res.end(img, 'binary');

    });

    app.get('/reg', checkNLogin);
    app.get('/reg', function (req, res) {
        res.render('reg', {
            title: 'User Signup'
        });
    });

    app.get('/reg', checkNLogin);
    app.post('/reg', function (req, res) {
        if (req.body['password-repeat'] != req.body['password']) {
            req.flash('error', 'Two passwords are different');
            return res.redirect('/reg');
        }
        var md5 = crypto.createHash('md5');
        var password = md5.update(req.body.password).digest('base64');

        var newUser = new User({
            name: req.body.username,
            password: password,
        });
        User.get(newUser.name, function (err, user) {
            if (user)
                err = 'Username already exists.';
            if (err) {
                req.flash('error', err);
                return res.redirect('/reg');
            }
            newUser.save(function (err) {
                if (err) {
                    req.flash('error', err);
                    return res.redirect('/reg');
                }
        
                console.log(req.session.user);
                req.flash('success', 'Register success');
                res.redirect('/reg');
            });
        });
    });

	app.get('/login', checkNLogin);
    app.get('/login', function (req, res) {
        res.render('login', {
            title: 'User Login',
        });
    });

    app.get('/login', checkNLogin);
    app.post('/login', function (req, res) {
        var md5 = crypto.createHash('md5');
        var password = md5.update(req.body.password).digest('base64');

        User.get(req.body.username, function (err, user) {
            if (!user) {
                req.flash('error', 'user does not exist');
                return res.redirect('/login');
            }
            if (user.password != password) {
                req.flash('error', 'Wrong password!');
                return res.redirect('/login');
            }
            req.session.user = user;
            console.log(req.session.user);
            req.flash('success', 'Log in successfully');
            res.redirect('/u/' + req.session.user.name + '/profile');
        });
    });

	app.get('/logout', checkLogin);
    app.get('/logout', function (req, res) {
        req.session.user = null;
        req.flash('success', 'Log out successfully');
        res.redirect('/');
    });

    app.get('/u/:user/profile',function(req,res){
    	res.render('userpage', {
            username: req.params.user
        })


    })
    function checkLogin(req, res, next) {
	    if (!req.session.user) {
	        req.flash('error', 'Please log in first');
	        return res.redirect('/login');
	    }
	    next();
	};
	function checkNLogin(req, res, next) {
	    if (req.session.user) {
	        req.flash('error', 'logged in already');
	        return res.redirect('/u/' + req.session.user.name + '/page/1');
	    }
	    next();
	};
}
