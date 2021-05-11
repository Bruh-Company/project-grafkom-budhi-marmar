const express = require('express');
const path = require('path');
const fs = require('fs');

const publicDirectory = path.join(__dirname, 'public');
const configDirectory = path.join(__dirname, 'config');
const portNumber = 6969;
const app = express();

/**
 * live reload (bwt pas developing) ===================================
 */
const livereload = require('livereload');
const connectLivereload = require('connect-livereload');

const liveReloadServer = livereload.createServer();
liveReloadServer.watch(publicDirectory);
liveReloadServer.watch(configDirectory);

app.use(connectLivereload());
/**
 * ====================================================================
 */

app.listen(portNumber, () => {
    console.log(`server started on port: ${portNumber}`);
});

app.engine('html', require('ejs').renderFile);

app.use(express.static('public/js'));

/**
 * request
 */
app.get('/', (req, res) => {
    console.log(`catch request to simulation with default constant`);

    //remove whitespace
    const __windowConfig = JSON.stringify(JSON.parse(fs.readFileSync('./config/win-config.json')));
    const __physicConfig = JSON.stringify(JSON.parse(fs.readFileSync('./config/physic-config.json')));

    res.render(publicDirectory + '/index.html',
    {
        window_config : __windowConfig,
        physic_config : __physicConfig,
        public_dir : publicDirectory
    });
});