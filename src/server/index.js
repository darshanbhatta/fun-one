const express = require('express');
const path = require("path");
const app = express();
const socketIO = require("./socket-io");

const fs = require('fs');
var http = require('http');
const https = require('https');

socketIO(app);

app.use(express.static('dist'));
app.use ("/img", express.static(__dirname + '/img'));
app.get("/*", (req, res) => {
	// starts React
	res.sendFile(path.join(__dirname, "../../dist/index.html"), (err) => {
		if (err) {
			res.status(500).send(err);
		}
	});
});


const httpServer = http.createServer(app);

try {
	const privateKey  = fs.readFileSync('sslcert/server.key', 'utf8');
	const certificate = fs.readFileSync('sslcert/server.crt', 'utf8');
	const credentials = {key: privateKey, cert: certificate};
	const httpsServer = https.createServer(credentials, app);
	httpsServer.listen(process.env.SPORT || 8080, () => console.log(`HTTPS Listening on port ${process.env.SPORT || 8080}!`));
} catch {
	console.log("failed to listen to https")
}

httpServer.listen(process.env.PORT || 8080, () => console.log(`HTTP Listening on port ${process.env.PORT || 8080}!`));
