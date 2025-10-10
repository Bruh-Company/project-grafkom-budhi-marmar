const express = require('express');
const path = require('path');
const fs = require('fs');

const publicDirectory = path.join(__dirname, 'public');
const configDirectory = path.join(__dirname, 'config');
const portNumber = process.env.PORT || 3100;
const app = express();

/**
 * live reload (bwt pas developing) ===================================
 */
// const livereload = require('livereload');
// const connectLivereload = require('connect-livereload');

// const liveReloadServer = livereload.createServer();
// liveReloadServer.watch(publicDirectory);
// liveReloadServer.watch(configDirectory);
// liveReloadServer.off();

// app.use(connectLivereload());
/**
 * ====================================================================
 */

app.listen(portNumber, () => {
    console.log(`server started on port: ${portNumber}`);
    console.log(`open our project on \x1b[31m\x1b[47m\x1b[1mhttp://localhost:${portNumber}/computer-graphics\x1b[0m\n`);
});


/**
 * request
 */
app.get('/', (req, res) => {
    app.engine('html', require('ejs').renderFile);
    
    app.use(express.static('public/js-src'));

    const current = new Date();
    const now = `${current.getHours().toString().padStart(2,'0')}:${current.getMinutes().toString().padStart(2,'0')}:${current.getSeconds().toString().padStart(2,'0')}`;
    console.log(`\x1b[31m${now} \x1b[32mreload-log\x1b[31m \u25b6\x1b[0m catch request to simulation with default constant`);

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