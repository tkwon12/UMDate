const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const config = require('./config');
const routes = require('./routes');


const app = express();

app.set('views', path.resolve(__dirname, 'templates'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')))
app.use((req, res, next) => {
    req.signedIn = false;
    next();
});
app.use(routes);

const server = app.listen(config.portNumber, () => {
    console.log(`Web server is running at http://localhost:${config.portNumber}\n`);
});


process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
    });
});

const prompt="Stop to shutdown the server: \n";

process.stdin.setEncoding("utf8");

process.stdout.write(prompt);

process.stdin.on('readable', () => {
	let dataInput = process.stdin.read();
	if (dataInput !== null) {
		let command = dataInput.trim();
		if (command === "stop") {
            console.log("Shutting down the server");
            process.exit(0);
        }
         else {
			console.log(`Invalid command: ${command}`);
		}
        process.stdout.write(prompt);
        process.stdin.resume();
    }
});