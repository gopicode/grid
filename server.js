const fs = require('fs');
const path = require('path');
const http = require('http')

const sampleHead = fs.readFileSync(path.join(__dirname, 'src/sample/head.json')).toString();
const sampleBody = fs.readFileSync(path.join(__dirname, 'src/sample/body.json')).toString();
const sampleFields = fs.readFileSync(path.join(__dirname, 'src/sample/fields.json')).toString();
const scriptBlock = [
	'<script>',
	'var sampleFields = ' + sampleFields + ';',
	'var sampleHead = ' + sampleHead + ';',
	'var sampleBody = ' + sampleBody + ';',
	'</script>'
].join('\n');

function handler(req, res) {
	// console.log('req', req.url, req.headers);
	const accept = req.headers.accept;
	if (req.url === '/') {
		const content = fs.readFileSync(path.join(__dirname, 'src/index.html'))
			.toString()
			.replace('<!--data-->', scriptBlock);
		res.writeHead(200, {
			'Content-Type': 'text/html'
		});
		res.write(content);
	}
	else if (/\.(js|css)$/.test(req.url)) {
		const fpath = __dirname + '/src' + req.url;
		if (fs.existsSync(fpath)) {
			const content = fs.readFileSync(fpath);
			const contentType = /\.js$/.test(req.url) ? 'application/javascript' : 'text/css';
			res.writeHead(200, {
				'Content-Type': contentType
			});
			res.write(content);
		}
		else {
			res.writeHead(404);
			res.write('Page not found');
		}
	}
	else {
		res.writeHead(404);
		res.write('Page not found');
	}
	res.end();
}

const port = process.env.NODE_PORT || 4000;
const server = http.createServer(handler);
server.on('error', function(err) {
	console.error(err);
	process.exit(1);
});
server.listen(port, function (err) {
	if (err) return console.error(err);
	console.log('[server] is running on port %d', port)
});
