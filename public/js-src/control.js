function init(){
    rangeSlide(document.getElementById('sliderGravityControl').value,'rangeGravity');
    rangeSlide(document.getElementById('sliderBallSize').value,'rangeBallSize');
    rangeSlide(document.getElementById('sliderBallWeight').value,'rangeBallWeight');
}


function rangeSlide(value,id) {
    document.getElementById(id).innerHTML = value;
}
function gravity(e) {
    // __objectConfig["environment"]["gravity"][1] = e.value;
}
function ballSize(e) {
    // __objectConfig["ball"]["radius"] = e.value;
}
function ballWeight(e) {  
    // __objectConfig["ball"]["rho"] = e.value;
}

function saveVar(){
    document.getElementById("sliderGravityControl").value = __objectConfig["environment"]["gravity"][1];
    document.getElementById("sliderBallSize").value = __objectConfig["ball"]["radius"];
    document.getElementById("sliderBallWeight").value = __objectConfig["ball"]["rho"];
    init();
    document.getElementById("gravityBefore").value  = document.getElementById("sliderGravityControl").value;
    document.getElementById("sizeBefore").value     = document.getElementById("sliderBallSize").value;
    document.getElementById("weightBefore").value   = document.getElementById("sliderBallWeight").value;
}

function saveChanges(){

    __objectConfig["environment"]["gravity"][1] = document.getElementById("sliderGravityControl").value;
    __objectConfig["ball"]["radius"] = document.getElementById("sliderBallSize").value;
    __objectConfig["ball"]["rho"] = document.getElementById("sliderBallWeight").value;
}