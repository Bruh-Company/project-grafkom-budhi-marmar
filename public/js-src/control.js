function init(){
    rangeSlide(document.getElementById('sliderGravityControl').value,'rangeGravity');
    rangeSlide(document.getElementById('sliderBallSize').value,'rangeBallSize');
    rangeSlide(document.getElementById('sliderBallWeight').value,'rangeBallWeight');
}


function rangeSlide(value,id) {
    // alert(value);
    document.getElementById(id).innerHTML = value;
}
function gravity(e) { 
    // alert("Jalan");
    // alert(e.value);
    __objectConfig["environment"]["gravity"][1] = e.value;
    // console.log(__objectConfig["environment"]["gravity"]);
    // __objectConfig["ball"]["radius"] = e.value;
    // let __objectConfig = Object.freeze(JSON.parse(`<%- physic_config %>`));
}
function ballSize(e) { 
    // alert("Jalan");
    // alert(e.value);
    // __objectConfig["environment"]["gravity"][1] = e.value;
    // console.log(__objectConfig["environment"]["gravity"]);
    __objectConfig["ball"]["radius"] = e.value;
    // let __objectConfig = Object.freeze(JSON.parse(`<%- physic_config %>`));
}
function ballWeight(e) {  
    __objectConfig["ball"]["rho"] = e.value;
}