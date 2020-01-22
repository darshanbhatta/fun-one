const express = require('express');
const path = require("path");
const app = express();
const socketIO = require("./socket-io");

const fs = require('fs');
var http = require('http');
const https = require('https');
const config = require("./config");

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

try {
	const privateKey  = fs.readFileSync(config.privateKey, 'utf8');
	const certificate = fs.readFileSync(config.certificate, 'utf8');
	const credentials = {key: privateKey, cert: certificate};
	const httpsServer = https.createServer(credentials, app);
	httpsServer.listen(config.httpsPort, () => console.log(`HTTPS Listening on port ${config.httpsPort}!`));
} catch {
	console.log("failed to listen to https")
	const httpServer = http.createServer(app);
	httpServer.listen(config.httpPort, () => console.log(`HTTP Listening on port ${config.httpsPort}!`));
}