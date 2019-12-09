window.addEventListener("load", () => {

    // if (!(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))) particlesJS.load('body', 'assets/particles-mobile.json');
    // else particlesJS.load('body', 'assets/particles-desktop.json');

    $.get("https://api.ipify.org/", (data) => {
        document.getElementById("ip").innerText = " - " + data;
        document.getElementById("ip").setAttribute("class", "text footertext")
    })

});