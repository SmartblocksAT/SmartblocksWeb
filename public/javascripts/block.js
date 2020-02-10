window._smartblocks.block = {
    localBlock: undefined,

    loadBlock: () => {


        let mac = getParameter("b");

        $.get("/api/status/" + mac, (data) => {
            if (data.constructor === "".constructor) data = JSON.parse(data);

            document.getElementById("block-name").innerText = (data.name === "" ? "<NONAME>" : data.name);


            document.getElementById("block-mac").innerText = data.mac;

            if (data.json.constructor === "".constructor) {
                data.json = JSON.parse(data.json);
            }

            _smartblocks.block.localBlock = data;


            let lastactivedate = new Date(data.lastactive);

            // document.getElementById("block-lastactive").innerText = lastactivedate.getDate() + "." + (lastactivedate.getMonth() + 1) + "." + lastactivedate.getFullYear() + " @ " +
            //     (String(lastactivedate.getUTCHours()).length === 1 ? "0" + lastactivedate.getUTCHours() : lastactivedate.getUTCHours()) + ":" +
            //     (String(lastactivedate.getUTCMinutes()).length === 1 ? "0" + lastactivedate.getUTCMinutes() : lastactivedate.getUTCMinutes()) + ":" +
            //     (String(lastactivedate.getUTCSeconds()).length === 1 ? "0" + lastactivedate.getUTCSeconds() : lastactivedate.getUTCSeconds());

            document.getElementById("block-lastactive").innerText = lastactivedate.toLocaleDateString("de-AT", {day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'});

            if (lastactivedate < (new Date() - 5 * 1000)) {


                document.querySelectorAll(".block-status-line").forEach(value => {
                    if (!(value === undefined || value === null)) {
                        value.setAttribute("style", "border-top: 3px solid red;")
                    }
                })
            } else {

                document.querySelectorAll(".block-status-line").forEach(value => {
                    if (!(value === undefined || value === null)) {
                        value.setAttribute("style", "border-top: 1px solid #00FF00;")
                    }
                })
            }

        });

    },
    changeName: () => {

        $.ajax({
            method: "POST",
            url: "/api/update/" + getParameter("b") + "/name",
            data: {name: document.getElementById("newName").value}
        })

    },
    addDiagram: () => {

        _smartblocks.clearChild(document.getElementById("addContent"));

        let root = genElement("div", "", "", "", "");
        root.appendChild(genElement("h3", "", "", "", "Configure your diagram"));
        root.appendChild(genElement("p", "", "font-family: Arial ", "", "Theres not much to edit here, because this is just a simple graph per time."));

        let label = genElement("label");
        label.setAttribute("for", "id");

        label.innerText = "ID: ";

        root.appendChild(label);

        let input = genElement("input", "", "color: white; background-color: black; border-width: 0");
        input.setAttribute("name", "id");
        input.setAttribute("placeholder", "Insert ID here");


        root.appendChild(input);


        root.appendChild(genElementWithOnClick("button", "", "", "", "Add!", () => {

            //<div style="max-width: 200px; max-height: 80px;"><canvas id="myChart" width="400" height="400"></canvas></div>


            let dataendpoint = input.value;

            let random = genRandom(5);


            let root = document.getElementById("moduleContent");

            // let tmp = genElement("div","", "max-width: 500px; max-height: 200px;  margin: auto; padding: 5px", "" ,"");
            let tmp = genElement("div", "main" + random, "", "dataentry graph", "");

            let holderchart = genElement("div", "", "", "module-content graph-content", "");
            let holdername = genElementWithOnClick("div", "", "", "module-name", "" + dataendpoint + "<span class='pointy-cursor' style=\"padding-left: 10px; right:0; float:right\">&times;</span>", () => {document.getElementById("main" + random).remove();});

            let tmp2 = genElement("canvas", "chart" + random);
            tmp2.setAttribute("width", "500");
            tmp2.setAttribute("height", "200");
            holderchart.appendChild(tmp2);


            tmp.appendChild(holdername);
            tmp.appendChild(holderchart);

            root.appendChild(tmp);


            let ctx = document.getElementById('chart' + random).getContext('2d');
            let myChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: [-10, -9.5, -9, -8.5, -8, -7.5, -7, -6.5, -6, -5.5, -5, -4.5, -4, -3.5, -3, -2.5, -2, -1.5, -1, -.5, 0].reverse(),
                    datasets: [{
                        label: 'Data',
                        data: [0],
                        borderWidth: 0,
                        backgroundColor: 'rgba(17,202,212,.5)',
                        borderColor: 'rgba(17,202,212,1)',
                        fill: true,
                        // pointHitRadius: 10,
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    title: {
                        display: true,
                        position: "top",
                        fontColor: "#cecece",
                    },
                    legend: {
                        display: false
                    },
                    tooltips: {
                        // enabled: true
                        enabled: false // Buggy atm...
                    },

                    scales: {
                        xAxes: [{
                            display: true,
                            gridLines: {
                                display: true,
                                color: "#cecece"
                            },
                            ticks: {
                                stepSize: 0.5,
                                reverse: true,
                                fontColor: "#cecece",
                            }
                        }],
                        yAxes: [{
                            display: true,
                            gridLines: {
                                display: true,
                                color: "#cecece",
                                zeroLineColor: "#5c99c5",
                            },
                            ticks: {
                                fontColor: "#cecece",
                            }
                        }]
                    }
                }
            });


            setInterval(() => {
                let threshold = 24;


                myChart.data.datasets.forEach((dataset) => {
                    dataset.data.unshift(_smartblocks.block.localBlock.json[dataendpoint]);
                    myChart.options.title.text = "" + _smartblocks.block.localBlock.json[dataendpoint];


                    if (dataset.data.length > threshold) {
                        dataset.data.pop();
                    }
                });
                myChart.update();
            }, 500);

        }));

        document.getElementById("addContent").appendChild(root);

    },
    addState: () => {

        _smartblocks.clearChild(document.getElementById("addContent"));

        let root = genElement("div", "", "", "", "");
        root.appendChild(genElement("h3", "", "", "", "Configure your display"));
        root.appendChild(genElement("p", "", "font-family: Arial ", "", "Theres not much to edit here, because this is just 1 or 0."));


        let label = genElement("label");
        label.setAttribute("for", "id");

        label.innerHTML = "ID:&#160;";

        root.appendChild(label);

        let id = genRandom(5);

        let input = genElement("input", "", "color: white; background-color: black; border-width: 0; margin: 2px;", "", "");
        input.setAttribute("name", "id");
        input.setAttribute("placeholder", "Insert ID here");

        label = genElement("label", "lb" + id, "", "", "");
        label.setAttribute("for", "equasion");
        label.setAttribute("hidden", "");

        label.innerHTML = "Equasion:&#160;";


        let labelcb = genElement("label");
        labelcb.setAttribute("for", "ceckbox-advanced");

        labelcb.innerHTML = "Display advanced feature: &#160;";

        let checkbox = genElement("input", "cb" + id, "color: white; background-color: black; border-width: 0; margin: 2px;", "", "");
        checkbox.setAttribute("type", "checkbox");
        checkbox.setAttribute("name", "ceckbox-advanced");


        let equasion = genElement("input", "eq" + id, "color: white; background-color: black; border-width: 0; margin: 2px;", "", "");
        equasion.setAttribute("name", "equasion");
        equasion.setAttribute("hidden", "");
        equasion.value = "variable > 0";

        checkbox.addEventListener("click", () => {
            let label = document.getElementById("lb" + id);
            let checkbox = document.getElementById("cb" + id);
            let eq = document.getElementById("eq" + id);

            if (checkbox.checked) {
                label.removeAttribute("hidden");
                eq.removeAttribute("hidden");
            } else {
                label.setAttribute("hidden", "");
                eq.setAttribute("hidden", " ");
            }

        });

        root.appendChild(input);
        root.appendChild(genElement("br"));

        root.appendChild(labelcb);
        root.appendChild(checkbox);
        root.appendChild(genElement("br"));
        root.appendChild(label);
        root.appendChild(equasion);
        root.appendChild(genElement("br"));

        root.appendChild(genElementWithOnClick("button", "", "", "", "Add!", () => {
            let random = genRandom(5);

            let val = equasion.value;

            let root = document.getElementById("moduleContent");
            if (val.length > 40) {
                logger.error("Equasion is longer than 40 Characters! I am not evaluating this!");
                return;
            }
            let lbody = "function (variable) { return " + (val === "" ? "false;" : val.endsWith(";") ? val : val + ";") + "}";


            let lwrap = () => "{ return " + lbody + " };"; //return the block having function expression
            let lequasion = new Function(lwrap(lbody));

            let tmp = genElement("div", "main" + random, "", "dataentry state", "");
            let holdername = genElementWithOnClick("div", "", "", "module-name", input.value + "<span class='pointy-cursor' style=\"padding-left: 10px; right:0; float:right\">&times;</span>", () => {document.getElementById("main" + random).remove();});
            let holdercontent = genElement("div", "", "", "module-content state-content", "");
            tmp.appendChild(holdername);
            tmp.appendChild(holdercontent);

            let state =  genElement("div", "statusText"+random, "", "" ,"UNKOWN");
            let icon = document.createElement("div");

            icon.setAttribute("class", "unknownicon status-icon");
            icon.setAttribute("id", "statusIcon" + random);

            holdercontent.appendChild(state);
            holdercontent.appendChild(icon);


            root.appendChild(tmp);

            setInterval(() => {
                if (lequasion.call(null).call(null, _smartblocks.block.localBlock.json[input.value])) {
                    document.getElementById("statusIcon" + random).setAttribute("class", "greenicon status-icon");
                    document.getElementById("statusText" + random).innerText = "On";
                } else {
                    document.getElementById("statusIcon" + random).setAttribute("class", "redicon status-icon");
                    document.getElementById("statusText" + random).innerText = "Off";
                }


            }, 100);
        }));


        document.getElementById("addContent").appendChild(root);
    },
    addDOUT: () => {

        _smartblocks.clearChild(document.getElementById("addContent"));

        let root = genElement("div", "", "", "", "");
        root.appendChild(genElement("h3", "", "", "", "Configure your set option"));
        root.appendChild(genElement("p", "", "font-family: Arial ", "", "Theres not much to edit here, because this is just to set variables to specific value"));


        let label = genElement("label");
        label.setAttribute("for", "id");

        label.innerText = "ID: ";

        root.appendChild(label);

        let input = genElement("input", "", "color: white; background-color: black; border-width: 0", "", "");
        input.setAttribute("name", "id");
        input.setAttribute("placeholder", "Insert ID here");

        root.appendChild(input);

        root.appendChild(genElementWithOnClick("button", "", "", "", "Add!", () => {
            let random = genRandom(5);


            let root = document.getElementById("moduleContent");


            let holdercontent = genElement("div", "", "", "module-content setter-content", "");
            let holdername = genElementWithOnClick("div", "", "", "module-name", "" + input.value + "<span class='pointy-cursor' style=\"padding-left: 10px; right:0; float:right\">&times;</span>", () => {document.getElementById("main" + random).remove();});

            let tmp = genElement("div", "main" + random, "", "dataentry", "");


            let i = genElement("input", "value_out" + random, "", "", "");

            let setbutton = genElement("button", "setbutton" + random, "", "", "Set!");

            i.setAttribute("placeholder", "Value");

            setbutton.addEventListener("click", () => {
                $.ajax({
                    method: "POST",
                    url: "/api/update/" + _smartblocks.block.localBlock.mac + "/entry/" + input.value,
                    data: {value: i.value}
                })
            });

            holdercontent.appendChild(i);
            holdercontent.appendChild(setbutton);

            tmp.appendChild(holdername);
            tmp.appendChild(holdercontent);


            root.appendChild(tmp);
        }));


        document.getElementById("addContent").appendChild(root);
    },
};


function format(date) {
    return (date.getHours() < 10 ? "0" + date.getHours() : date.getHours()) + ":" + (date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()) + ":" + (date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds()) + "." + (date.getMilliseconds() < 10 ? "0" + date.getMilliseconds() : date.getMilliseconds());
}


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
        setInterval(() => _smartblocks.block.loadBlock(), _smartblocks.refreshtime);
    }
});

function genElement(type, id, style, classes, content) {
    let tmp = document.createElement(type);
    (classes !== undefined && classes !== "") ? tmp.setAttribute("class", classes) : false;
    (style !== undefined && style !== "") ? tmp.setAttribute("style", style) : false;
    (id !== undefined && id !== "") ? tmp.setAttribute("id", id) : false;
    (content !== undefined && content !== "") ? tmp.innerHTML = content : false;
    return tmp;
}

function genRandom(length) {
    let alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";

    let tmp = "";
    let i = 0;

    while (i <= length) {
        i++;
        tmp += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    }


    return tmp;
}


function genElementWithOnClick(type, id, style, classes, content, code) {
    let tmp = document.createElement(type);
    (classes !== undefined && classes !== "") ? tmp.setAttribute("class", classes) : false;
    (style !== undefined && style !== "") ? tmp.setAttribute("style", style) : false;
    (id !== undefined && id !== "") ? tmp.setAttribute("id", id) : false;
    (content !== undefined && content !== "") ? tmp.innerHTML = content : false;
    (code !== undefined && code !== "") ? tmp.onclick = code : false;
    return tmp;
}
