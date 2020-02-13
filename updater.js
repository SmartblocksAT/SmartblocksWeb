let shell = require("shelljs");
let fs = require("fs");
let axios = require("axios");
let pm2 = require("pm2");


module.exports.init = function () {
    return new Promise((resolve, reject) => {
        axios.get('https://smartblocks.dev/updater/latest')
            .then(dat => {
                dat = dat.data;

                if (!fs.existsSync("version")) fs.writeFileSync("version", "-20");
                let version = fs.readFileSync("version");

                if (dat.constructor === "".constructor)
                    dat = JSON.parse(dat);


                console.info(`Latest update is ${dat.latest} your version is ${version}`);

                if (fs.existsSync("UPDATES.DISABLED")) {
                    console.info("Updating is disabled!");
                    resolve();
                }

                if (isNaN(version) || isNaN(dat.latest)) {
                    reject(`UNABLE TO UPDATE!  ${version} ${isNaN(version)}  ${dat.latest} ${isNaN(dat.latest)}`);

                }

                fs.writeFileSync("version", dat.latest);

                if (Number(version) < Number(dat.latest)) {
                    shell.cd("/opt/Node/SmartblocksWeb/");
                    shell.echo('Removing old process from pm2');
                    shell.exec("pm2 stop Smartblocks-API");
                    shell.exec("pm2 delete Smartblocks-API");
                    shell.echo("Fetching new data from repository");
                    shell.exec("git fetch --all");
                    shell.echo("Resetting to new data");
                    shell.exec("git reset --hard origin/development");
                    shell.echo("Installing dependencys");
                    shell.exec("npm install");
                    shell.echo("Smartblocks deployed successfully");
                    pm2.restart("Smartblocks-API", () => {
                    });
                    process.exit(0);
                    resolve();
                }
            });
    })

};