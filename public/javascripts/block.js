window._smartblocks.block = {
    loadBlock: () => {


        let mac = getParameter("b");

        $.get("/api/status/" + mac, (data) => {
            if (data.constructor === "".constructor) data = JSON.parse(data);

            document.getElementById("block-name").innerText = data.name;


            document.getElementById("block-mac").innerText = data.mac;

            logger.debug(data);


            if (new Date(data.lastactive) < (new Date() - 5 * 1000)) {


                document.querySelectorAll(".block-status-line,.block-status-line-small").forEach(value => {
                    if (!(value === undefined || value === null)) {
                        value.setAttribute("style", "border-top: 3px solid red;")
                    }
                })
            } else {

                document.querySelectorAll(".block-status-line,.block-status-line-small").forEach(value => {
                    if (!(value === undefined || value === null)) {
                        value.setAttribute("style", "border-top: 1px solid #00FF00;")
                    }
                })
            }

        });

    },

    populateJson: (html) => {
        let dropdown = html;
        dropdown.length = 0;

        let defaultOption = document.createElement('option');
        defaultOption.text = '-';

        dropdown.add(defaultOption);
        dropdown.selectedIndex = 0;

        let data = _smartblocks.lastdata;

        logger.info(data);

        logger.info(html);

        for (let block in Object.entries(data)) {
            let option;
            let keys = block.json === undefined ? false : Object.keys(block.json);

            for (let i = 0; i < block.json.length; i++) {
                option = document.createElement('option');
                // option.text = data[i].name;
                // option.value = data[i].abbreviation;
                option.text = keys[i];
                option.value = block.json[i];

                logger.info(option.text, option.value, option);

                dropdown.add(option);
            }
        }
    },

    changeName: () => {

        $.ajax({
            method: "POST",
            url: "/api/update/" + getParameter("b") + "/name",
            data: {name: document.getElementById("newName").value}
        })

    }


};


function getParameter(param) {
    let all = location.href.replace(location.origin + location.pathname + "?", "").split("&");
    for (let part in all) {
        part = all[part];

        let splitted = part.split("=");

        if (splitted[0] === param) return splitted[1];
    }
}


window.addEventListener("load", () => {

    if (location.pathname === "/block") {
        setInterval(() => _smartblocks.block.loadBlock(), 1000);
    }
});