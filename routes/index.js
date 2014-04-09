
/*
 * GET home page.
 */
var fs = require('fs');
var path = require('path');
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
        var img = fs.readFileSync(path.dirname(require.main.filename) + "/uploads/fullsize/" + req.params.file);
	res.writeHead(200, {'Content-Type': 'image' });
	res.end(img, 'binary');

    });

    app.get('/uploads/thumbs/:file', function (req, res) {
        var img = fs.readFileSync(path.dirname(require.main.filename) + "/uploads/thumbs/" + req.params.file);
	res.writeHead(200, {'Content-Type': 'image' });
	res.end(img, 'binary');

    });
}
