



window._smartblocks = {


    waves: [],
    lastdata: [],
    debug: true,

    loadScript: (url) => {
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


        $.get("/api/status/all/", (data) => {

            if (data.constructor === "".constructor) data = JSON.parse(data);


            let newblocks = [];
            let delblocks = [];


            for (let block in data) {
                block = data[block];

                let contains = false;


                for (let blocktocheck in _smartblocks.lastdata) {
                    blocktocheck = _smartblocks.lastdata[blocktocheck];
                    if (block.uuid === blocktocheck.uuid) {
                        contains = true;
                        break;
                    }
                }
                if (contains) {

                    // console.log(block);


                    if (new Date(block.lastactive) < (new Date() - 5 * 1000)) {


                        let b = document.querySelector("div[block-id='" + block.uuid + "'] div");
                        if (!(b === undefined || b === null)) {
                            b.setAttribute("class", "redicon status-icon")
                        }
                    } else {

                        let b = document.querySelector("div[block-id='" + block.uuid + "'] div");
                        if (!(b === undefined || b === null)) {
                            b.setAttribute("class", "greenicon status-icon")
                        }
                    }


                } else {
                    newblocks.push(block);
                }

            }

            for (let blocktocheck in _smartblocks.lastdata) {
                blocktocheck = _smartblocks.lastdata[blocktocheck];

                let contains = false;

                for (let block in data) {
                    block = data[block];
                    if (block.uuid === blocktocheck.uuid) {
                        contains = true;
                        break;
                    }
                }

                if (contains) {

                } else {
                    delblocks.push(blocktocheck);
                }

            }

            for (let block in delblocks) {
                block = delblocks[block];

                for (let wave in  _smartblocks.waves) {
                    wave = _smartblocks.waves[wave];
                    if (wave.id === block.uuid) {
                        wave.wave.destroy();
                    }
                }
                // _smartblocks.genBlock(block.name ? block.name : "Unknown", block.uuid);


                document.querySelectorAll("div[block-id]").forEach((value) => {
                    if (value.getAttribute("block-id") === block.uuid) value.remove();
                })
            }

            for (let block in newblocks) {
                block = newblocks[block];

                let html = _smartblocks.genBlock(block.name ? block.name : "Unknown", block.uuid);

                if (!(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))) {
                    try {
                        if (VANTA === undefined) {
                            setTimeout(() => {

                                _smartblocks.waves.push(
                                    {
                                        id: block.uuid,
                                        wave: VANTA.WAVES({
                                            el: html, // element id or DOM object reference
                                            color: 0x121212,
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
                                    id: block.uuid,
                                    wave: VANTA.WAVES({
                                        el: html, // element id or DOM object reference
                                        color: 0x121212,
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
                                    id: block.uuid,
                                    wave: VANTA.WAVES({
                                        el: html, // element id or DOM object reference
                                        color: 0x121212,
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
        let root = document.createElement("div");
        let icon = document.createElement("div");
        let img = document.createElement("img");
        let text = document.createElement("p");
        let button = document.createElement("button");


        root.setAttribute("class", "card");

        icon.setAttribute("class", "unknownicon status-icon");

        img.setAttribute("src", "/images/Block.svg");

        text.setAttribute("class", "text");

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


    _smartblocks.loadBlocks();
    setInterval(() => _smartblocks.loadBlocks(), 2500);

    if (location.pathname === "/") {
        _smartblocks.loadScript("/javascripts/libs/three.min.js")
            .then(() => {
                _smartblocks.loadScript("/javascripts/libs/vanta.waves.min.js")
                    .then(() => {
                        $(".card").each((var1, var2) => {

                            if (!(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))) {
                                _smartblocks.waves.push(VANTA.WAVES({
                                    el: var2,
                                    color: 0x121212,
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

    $.get("https://api.ipify.org/", (data) => {
        document.getElementById("ip").innerText = " - " + data;
        document.getElementById("ip").setAttribute("class", "text footertext")
    })

});