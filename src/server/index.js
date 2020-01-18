const express = require('express');
const path = require("path");
const app = express();
const socketIO = require("./socket-io");
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

app.listen(process.env.PORT || 8080, () => console.log(`Listening on port ${process.env.PORT || 8080}!`));
