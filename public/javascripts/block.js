
window._smartblocks.block = {
    localBlock: undefined,


    loadBlock: () => {


        let mac = getParameter("b");

        $.get("/api/status/" + mac, (data) => {
            if (data.constructor === "".constructor) data = JSON.parse(data);

            document.getElementById("block-name").innerText = (data.name === "" ? "<NONAME>" : data.name);


            document.getElementById("block-mac").innerText = data.mac;

            if(data.json.constructor === "".constructor){
                data.json = JSON.parse(data.json);
            }

            // logger.debug(data);

            _smartblocks.block.localBlock = data;


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
        root.appendChild(genElement("h3", "","", "","Configure your diagram"));
        root.appendChild(genElement("p", "","font-family: Arial ", "","Theres not much to edit here, because this is just a simple graph per time."));

        let label = genElement("label");
        label.setAttribute("for", "id");

        label.innerText = "ID: ";

        root.appendChild(label);

        let input = genElement("input", "" ,"color: white; background-color: black; border-width: 0");
        input.setAttribute("name", "id");
        input.setAttribute("placeholder", "Insert ID here");


        root.appendChild(input);


        root.appendChild(genElementWithOnClick("button", "", "", "", "Add!", () => {

            //<div style="max-width: 200px; max-height: 80px;"><canvas id="myChart" width="400" height="400"></canvas></div>


            let dataendpoint = input.value;

            let random = genRandom(5);


            let root = document.getElementById("moduleContent");

            let tmp = genElement("div","", "max-width: 500px; max-height: 200px;  margin: auto; padding: 5px", "" ,"");
            let tmp2 = genElement("canvas", "chart" + random);
            tmp2.setAttribute("width", "500");
            tmp2.setAttribute("height", "200");
            tmp.appendChild(tmp2);

            root.appendChild(tmp);


            let ctx = document.getElementById('chart' + random).getContext('2d');
            let myChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: [-10, -9.5, -9, -8.5, -8 ,-7 ,-7.5, -7 ,-6.5 ,-6, -5.5, -5, -4.5, -4, -3.5, -3 ,-2.5 ,-2 ,-1.5 ,-1 ,-.5, 0],
                    datasets: [{
                        label: '-',
                        data: [0],
                        backgroundColor: [
                            'rgba(17,202,212,0.2)'
                        ],
                        borderColor: [
                            'rgba(17,202,212,1)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    title: {
                        display: true,
                        position: "top"
                    },
                    legend: {
                        display: false
                    },
                    tooltips: {
                        enabled: false
                    },

                    scales: {
                        xAxes: [{
                            display: true,
                            gridLines: {
                                display: true,
                                color: "#4b4b4b"
                            },
                            ticks: {
                                stepSize: 0.5,
                            }
                        }],
                        yAxes: [{
                            display: true,
                            gridLines: {
                                display: true,
                                color: "#4b4b4b"
                            }
                        }]
                    }
                }
            });



            setInterval(() => {
                let threshold = 22;


                myChart.data.datasets.forEach((dataset) => {
                    dataset.data.push(_smartblocks.block.localBlock.json[dataendpoint]);
                    myChart.options.title.text = dataendpoint + ": " + _smartblocks.block.localBlock.json[dataendpoint];


                    if(dataset.data.length > threshold){
                        dataset.data.shift();
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
        root.appendChild(genElement("h3", "","", "","Configure your display"));
        root.appendChild(genElement("p", "","font-family: Arial ", "","Theres not much to edit here, because this is just 1 or 0."));



        let label = genElement("label");
        label.setAttribute("for", "id");

        label.innerHTML = "ID:&#160;";

        root.appendChild(label);

        let id = genRandom(5);

        let input = genElement("input", "" ,"color: white; background-color: black; border-width: 0; margin: 2px;", "", "");
        input.setAttribute("name", "id");
        input.setAttribute("placeholder", "Insert ID here");

        label = genElement("label", "lb" + id, "", "", "");
        label.setAttribute("for", "equasion");
        label.setAttribute("hidden", "");

        label.innerHTML = "Equasion:&#160;";


        let labelcb = genElement("label");
        labelcb.setAttribute("for", "ceckbox-advanced");

        labelcb.innerHTML = "Display advanced feature: &#160;";

        let checkbox = genElement("input", "cb" + id ,"color: white; background-color: black; border-width: 0; margin: 2px;", "", "");
        checkbox.setAttribute("type", "checkbox");
        checkbox.setAttribute("name", "ceckbox-advanced");


        let equasion = genElement("input", "eq" + id  ,"color: white; background-color: black; border-width: 0; margin: 2px;", "", "");
        equasion.setAttribute("name", "equasion");
        equasion.setAttribute("hidden", "");
        equasion.value = "variable > 0";

        checkbox.addEventListener("click", () => {
            let label = document.getElementById("lb" + id);
            let checkbox = document.getElementById("cb" + id);
            let eq = document.getElementById("eq" + id);

            if(checkbox.checked){
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
            if(val.length > 40){
                logger.error("Equasion is longer than 40 Characters! I am not evaluating this!");
                return;
            }
            let lbody = "function (variable) { return " + (val === "" ? "false;" : val.endsWith(";") ? val : val + ";") + "}";


            let lwrap = ()  => "{ return " + lbody + " };"; //return the block having function expression
            let lequasion = new Function( lwrap(lbody) );

            let tmp = genElement("div","", "max-width: 400px; max-height: 200px; margin: auto; border: solid #535353 1px; background: black; padding: 5px 20px 5px 20px;", "" ,"");
            tmp.appendChild(genElement("div", "digitalin_text" + random, "" , "" ,input.value ));
            // tmp.appendChild(genElement("span", "digitalin" + random, "" , "" ,"N/A"));

            let icon = document.createElement("div");

            icon.setAttribute("class", "unknownicon status-icon");
            icon.setAttribute("id", "statusIcon" + random);

            tmp.appendChild(icon);


            root.appendChild(tmp);

            setInterval(() =>{
                document.getElementById("statusIcon" + random).setAttribute("class", (lequasion.call(null).call(null, _smartblocks.block.localBlock.json[input.value]) ? "greenicon status-icon" : "redicon status-icon"));

            }, 100);
        }));


        document.getElementById("addContent").appendChild(root);
    },

    addDOUT: () => {

        _smartblocks.clearChild(document.getElementById("addContent"));

        let root = genElement("div", "", "", "", "");
        root.appendChild(genElement("h3", "","", "","Configure your set option"));
        root.appendChild(genElement("p", "","font-family: Arial ", "","Theres not much to edit here, because this is just outputs 1 or 0."));



        let label = genElement("label");
        label.setAttribute("for", "id");

        label.innerText = "ID: ";

        root.appendChild(label);

        let input = genElement("input", "" ,"color: white; background-color: black; border-width: 0", "", "");
        input.setAttribute("name", "id");
        input.setAttribute("placeholder", "Insert ID here");

        root.appendChild(input);

        root.appendChild(genElementWithOnClick("button", "", "", "", "Add!", () => {
            let random = genRandom(5);


            let root = document.getElementById("moduleContent");

            let tmp = genElement("div","", "max-width: 400px; max-height: 200px; margin: auto; border: solid #535353 1px; background: black; padding: 5px 20px 5px 20px;", "" ,"");

            let text = genElement("span", "", "", "", "Set the value of " + input.value + " to ");

            let i = genElement("input", "value_out" + random, "", "", "");

            let setbutton = genElement("button", "setbutton"+random, "" ,"", "Set!");

            i.setAttribute("placeholder", "Value");

            setbutton.addEventListener("click", () => {
                // $.get("/api/update/" + _smartblocks.block.localBlock.mac + "/entry/" + input.value + "/" + i.value);
                // alert("test")
                $.ajax({
                    method: "POST",
                    url: "/api/update/" + _smartblocks.block.localBlock.mac + "/entry/" + input.value,
                    data: {value: i.value}
                })

            });



            text.appendChild(i);
            text.appendChild(setbutton);

            tmp.appendChild(text);


            root.appendChild(tmp);
            // root.appendChild(setbutton);






        }));


        document.getElementById("addContent").appendChild(root);
    },


};



function format(date){
    return (date.getHours() < 10 ? "0" + date.getHours() : date.getHours()) +":"+ (date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes())  +":"+ (date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds()) +"."+ (date.getMilliseconds() < 10 ? "0" + date.getMilliseconds() : date.getMilliseconds());
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
        setInterval(() => _smartblocks.block.loadBlock(), 1000);
    }
});

function genElement(type, id, style, classes, content) {
    let tmp = document.createElement(type);
    (classes !== undefined && classes !== "") ? tmp.setAttribute("class", classes) : false;
    (style !== undefined && style !== "") ? tmp.setAttribute("style", style) : false;
    (id !== undefined && id !== "") ? tmp.setAttribute("id", id) : false;
    (content !== undefined && content !== "") ? tmp.innerText = content : false;
    return tmp;
}
function genRandom(length) {
    let alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";

    let tmp = "";
    let i = 0;

    while(i <= length){
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
    (content !== undefined && content !== "") ? tmp.innerText = content : false;
    (code !== undefined && code !== "") ? tmp.onclick = code : false;
    return tmp;
}
