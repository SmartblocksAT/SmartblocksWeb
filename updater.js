let shell = require("shelljs");
let fs = require("fs");
let axios = require("axios");
let pm2 = require("pm2");

module.exports.init = () => {
    if(!fs.existsSync("UPDATES.DISABLED")) fs.writeFileSync("version", "N/A");
    let version = fs.readFileSync("version");

    axios.get("https://smartblocks.dev/updater/latest")
        .then(dat => {
            if(dat.constructor === "".constructor)
                dat = JSON.parse(dat);

            console.info(`Latest update is ${dat.latest} your version is ${version}`);

            if(fs.existsSync("UPDATES.DISABLED")){
                console.info("Updating is disabled!"); return;
            }

            shell.cd("/opt/Node/SmartblocksWeb/");
            shell.echo('Removing old process from pm2');
            shell.exec("pm2 stop Smartblocks-API");
            shell.exec("pm2 delete Smartblocks-API");
            shell.echo("Fetching new data from repository");
            shell.exec("git fetch --all");
            shell.echo("Resetting to new data" );
            shell.exec("pm2 reset --hard origin/development");
            shell.echo("Installing dependencys");
            shell.exec("npm install");
            shell.echo("Starting from ecosystem config");
            shell.exec("pm2 start ecosystem.config.js");
            shell.echo("Smartblocks deployed successfully");

            fs.writeFileSync("version", dat.latest);

            pm2.restart("Smartblocks-API");

        });



};