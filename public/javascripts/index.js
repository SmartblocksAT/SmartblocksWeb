window._smartblocks = {


    waves: [],
    lastdata: [],
    debug: false,

    loadScript: (url) => {
        logger.debug("Trying to load a script from " + url);
        return new Promise((resolve) => {

            let script = document.createElement("script");
            script.setAttribute("src", url);
            script.type = "text/javascript";
            script.addEventListener("load", () => {
                resolve();
            });
            document.getElementById("head").appendChild(script);
        })
    },
    loadBlocks: () => {

        logger.debug("Trying to load blocks!");

        $.get("/api/status/all/", (data) => {

            if (data.constructor === "".constructor) data = JSON.parse(data);


            let newblocks = [];
            let delblocks = [];


            logger.debug("Trying to figure out if any blocks were added or removed from the database.");
            for (let block in data) {
                block = data[block];

                let contains = false;


                for (let blocktocheck in _smartblocks.lastdata) {
                    blocktocheck = _smartblocks.lastdata[blocktocheck];
                    if (block.mac === blocktocheck.mac) {
                        contains = true;
                        break;
                    }
                }
                if (contains) {
                    if (new Date(block.lastactive) < (new Date() - 5 * 1000)) {


                        let b = document.querySelector("div[block-id='" + block.mac + "'] div");
                        if (!(b === undefined || b === null)) {
                            b.setAttribute("class", "redicon status-icon");
                            logger.debug("Block " + block.mac + " probably went offline...");
                        }
                    } else {

                        let b = document.querySelector("div[block-id='" + block.mac + "'] div");
                        if (!(b === undefined || b === null)) {
                            b.setAttribute("class", "greenicon status-icon");
                            logger.debug("Block " + block.mac + " went online...");
                        }
                    }


                } else {
                    logger.debug("New block " + block.mac + " detected! Adding it to the list.");
                    newblocks.push(block);
                }

            }

            for (let blocktocheck in _smartblocks.lastdata) {
                blocktocheck = _smartblocks.lastdata[blocktocheck];

                let contains = false;

                for (let block in data) {
                    block = data[block];
                    if (block.mac === blocktocheck.mac) {
                        contains = true;
                        break;
                    }
                }

                if (contains) {

                } else {
                    logger.debug("Deleted block " + block.mac + " detected! Removing it from the list.");
                    delblocks.push(blocktocheck);
                }

            }

            for (let block in delblocks) {
                block = delblocks[block];

                for (let wave in  _smartblocks.waves) {
                    wave = _smartblocks.waves[wave];
                    if (wave.id === block.mac) {
                        wave.wave.destroy();

                        logger.debug("Destroy vanta from block " + block.mac);
                    }
                }


                document.querySelectorAll("div[block-id]").forEach((value) => {
                    if (value.getAttribute("block-id") === block.mac) value.remove();
                })
            }

            for (let block in newblocks) {
                block = newblocks[block];

                let html = _smartblocks.genBlock(block.name ? block.name : "Unknown", block.mac);

                if (!(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))) {
                    logger.debug("Adding the Vantawaves to block entries.");
                    try {
                        if (VANTA === undefined) {
                            setTimeout(() => {

                                _smartblocks.waves.push(
                                    {
                                        id: block.mac,
                                        wave: VANTA.WAVES({
                                            el: html, // element id or DOM object reference
                                            color: 0x171f2b,
                                            waveHeight: 10,
                                            shininess: 50,
                                            waveSpeed: .75,
                                            zoom: 1
                                        })
                                    }
                                );

                            }, 20);
                        } else {
                            _smartblocks.waves.push(
                                {
                                    id: block.mac,
                                    wave: VANTA.WAVES({
                                        el: html, // element id or DOM object reference
                                        color: 0x171f2b,
                                        waveHeight: 10,
                                        shininess: 50,
                                        waveSpeed: .75,
                                        zoom: 1
                                    })
                                }
                            );
                        }
                    } catch (e) {
                        setTimeout(() => {

                            _smartblocks.waves.push(
                                {
                                    id: block.mac,
                                    wave: VANTA.WAVES({
                                        el: html, // element id or DOM object reference
                                        color: 0x171f2b,
                                        waveHeight: 10,
                                        shininess: 50,
                                        waveSpeed: .75,
                                        zoom: 1
                                    })
                                }
                            );

                        }, 20);
                    }
                }

            }

            _smartblocks.lastdata = data;

        })
    },
    genBlock: (blockname, blockid) => {
        logger.debug("Generating a block for " + blockname + " [" + blockid + "]");
        let root = document.createElement("div");
        let icon = document.createElement("div");
        let img = document.createElement("img");
        let text = document.createElement("p");
        let button = document.createElement("button");


        root.setAttribute("class", "card");

        icon.setAttribute("class", "unknownicon status-icon");

        img.setAttribute("src", "/images/Block.svg");
        img.setAttribute("alt", "Block");

        text.setAttribute("class", "text");
        text.setAttribute("style", "font-size: 120% !important;");

        text.innerText = blockname;

        button.innerText = "Connect";

        button.setAttribute("block-id", blockid);
        button.setAttribute("style", "margin-top: 0px;");
        button.setAttribute("onclick", "location.href = '/block?b=" + blockid + "';");
        root.setAttribute("block-id", blockid);
        button.addEventListener("click", (element) => {
            console.log(element);

        });

        root.appendChild(icon);
        root.appendChild(img);
        root.appendChild(text);
        root.appendChild(button);

        document.getElementById("blocks").appendChild(root);
        return root;
    },
    clearChild: (e) => {
        if (e === null || e === undefined || e === "undefined") return;
        while (e.lastElementChild) {
            e.removeChild(e.lastElementChild)
        }
    }

};





window.addEventListener("load", () => {
    //
    // _smartblocks.loadBlocks();
    // setInterval(() => _smartblocks.loadBlocks(), 2500);

    logger.info("Page loaded! Adding content...");

    if (location.pathname === "/") {
        document.getElementById("loading").remove();
        _smartblocks.loadScript("/javascripts/libs/three.min.js")
            .then(() => {
                _smartblocks.loadScript("/javascripts/libs/vanta.waves.min.js")
                    .then(() => {
                        $(".card").each((var1, var2) => {

                            if (!(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))) {
                                _smartblocks.waves.push(VANTA.WAVES({
                                    el: var2,
                                    color: 0x171f2b,
                                    waveHeight: 10,
                                    shininess: 50,
                                    waveSpeed: .75,
                                    zoom: 1
                                }));
                            }
                        });

                        _smartblocks.loadBlocks();
                    })
            });

        setInterval(() => _smartblocks.loadBlocks(), 2500);

    }

    if (!(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))) particlesJS.load('body', 'assets/particles-mobile.json');
    else particlesJS.load('body', 'assets/particles-desktop.json');

    $.get("/api/clientinfo", (data) => {
        logger.info("Got some info about the client.");
        logger.debug(data);
        document.getElementById("ip").innerHTML = "<img alt='" + data.country + "' src='https://www.countryflags.io/" + data.country + "/flat/32.png'> " + data.ip;
        document.getElementById("ip").setAttribute("class", "text footertext")
    });

    let redirection = getParameter("r");
    if(redirection !== undefined){
        if(redirection === "R_OLD"){
            document.getElementById("errtext").innerText = "You were on the old site! You have been automatically redirected!";
            document.getElementById("errtext").removeAttribute("hidden");
        }
    }

});


function getParameter(param) {
    let all = location.href.replace(location.origin + location.pathname + "?", "").split("&");
    for (let part in all) {
        part = all[part];

        let splitted = part.split("=");

        if (splitted[0] === param) return splitted[1];
    }
    return undefined;
}
