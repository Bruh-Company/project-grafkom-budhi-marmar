//#region include

import * as THREE from './three-module/three.module.js';
import Stats from './three-module/stats.module.js';
import * as Ball from './my-model/ball.js';
import * as Board from './my-model/board.js';
import * as Room from './my-model/room.js';
import * as Lamp from './my-model/lamp.js';
import * as OP from './my-utils/operator.js';

//#endregion include

//#region variables

const container = document.getElementById('app');

let innerWidth;
let innerHeight;
let msPerFrame;

let camViewAngle;
let camNearPlane;
let camFarPlane;

let scene;
let directLight;
let ambientLight;
let pointLightHelper;
let renderer;
let raycaster;
let camera;
let composer;

let stats;
let cameraPosition;
let isMouseDown;
let playSimulation;
let initialMousePosition;
let initialCameraPosition;
let currentMousePosition;
let boardInProgress;
let intersectBoard;
let circleSelection;
let prevCoord;
let firstIntersectPoint;
let firstIntersect;

let idRequestAnimationFrame;
let tickIntval;

//#endregion variables

//#region shader_setting

let shader = THREE.ShaderChunk.shadowmap_pars_fragment;
shader = shader.replace(
    '#ifdef USE_SHADOWMAP',
    '#ifdef USE_SHADOWMAP' +
    document.getElementById( 'PCSS' ).textContent
);
shader = shader.replace(
    '#if defined( SHADOWMAP_TYPE_PCF )',
    document.getElementById( 'PCSSGetShadow' ).textContent +
    '#if defined( SHADOWMAP_TYPE_PCF )'
);
THREE.ShaderChunk.shadowmap_pars_fragment = shader;

//#endregion shader_setting

//#region event_handler

window.oncontextmenu = (e) => {
    e.preventDefault();
};

window.onmousedown = (e) => {
    if(e.which == 2) e.preventDefault();
};

const startSimul = (windowConfig, physicConfig) => {
    init();
    console.clear();

    //initialize variable
    boardInProgress     = false;
    intersectBoard      = false;
    prevCoord           = new THREE.Vector3();
    firstIntersectPoint = new THREE.Vector3();

    innerWidth    = container.clientWidth;
    innerHeight   = container.clientHeight;
    msPerFrame    = 1000 / windowConfig["fps"];

    camViewAngle  = windowConfig["view-angle"];
    camNearPlane  = windowConfig["near-plane"];
    camFarPlane   = windowConfig["far-plane"];

    scene             = new THREE.Scene();
    directLight       = new THREE.PointLight(0xffffff, 0.8, 100);
    ambientLight      = new THREE.AmbientLight(0xffffff, 0.2);
    pointLightHelper  = new THREE.PointLightHelper(directLight);
    renderer          = new THREE.WebGLRenderer({ antialias: true });
    raycaster         = new THREE.Raycaster();
    camera            = new THREE.PerspectiveCamera(
        camViewAngle,
        innerWidth / innerHeight,
        camNearPlane,
        camFarPlane
    );

    cameraPosition = {
        radius : windowConfig["camera"]["initial-position"]["radius"],
        hAngle : windowConfig["camera"]["initial-position"]["h-angle"] * Math.PI / 180,
        vAngle : windowConfig["camera"]["initial-position"]["v-angle"] * Math.PI / 180
    };

    isMouseDown     = [false, false, false];
    playSimulation  = document.getElementById("is-play").checked;

    //auto scroll
    let tmp = container.offsetTop;
    window.scrollTo(0, tmp);

    //initialize
    Ball.initialize(physicConfig["ball"]);
    Board.initialize(physicConfig["board"]);

    //get info (for debug)
    Board.showInfo();
    Ball.showInfo();
    Room.showInfo();

    //initialize variables
    directLight.position.set(
        windowConfig["light"]["position"]["x"],
        windowConfig["light"]["position"]["y"],
        windowConfig["light"]["position"]["z"]
    );
    directLight.castShadow = true;
    directLight.shadow.camera.near = 0.1;
    directLight.shadow.camera.far = 500;
    directLight.shadow.radius = 10;
    directLight.shadow.mapSize.width = 1024 * 2;
    directLight.shadow.mapSize.height = 1024 * 2;

    scene.add(pointLightHelper);
    scene.add(directLight);

    scene.add(ambientLight);
    scene.add(Ball.object);
    scene.add(Board.object);
    scene.add(Room.object);
    scene.add(Lamp.object);
    scene.add(camera);
    scene.background = new THREE.Color(0x222222);

    renderer.setSize(innerWidth, innerHeight);
    renderer.setPixelRatio(devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.outputEncoding = THREE.sRGBEncoding;

    stats = new Stats();

    let dom = renderer.domElement;
    dom.oncontextmenu = (e) => {
        e.preventDefault();
    };
    dom.onmousemove = mouseMove;
    dom.onmousedown = mouseDown;
    dom.onmouseup = mouseUp;
    dom.onmouseout = mouseUp;
    dom.id = "3d-canvas";

    const elem = document.getElementById("3d-canvas");
    if (elem !== null) container.removeChild(elem);
    container.appendChild(dom);
    container.appendChild(stats.dom);

    stats.dom.style.position = 'absolute';

    //stop all request before start new request
    cancelAnimationFrame(idRequestAnimationFrame);
    if (tickIntval) tickIntval.clear();
    
    animate();
    tickIntval = OP.setAsyncInterval(tick, msPerFrame);
}

let funres;
window.onresize = () => {
    clearTimeout(funres);
    funres = setTimeout(() => {
        container.style.width   = '100vw';
        container.style.height  = '100vh';

        innerWidth    = container.clientWidth;
        innerHeight   = container.clientHeight;

        renderer.setSize(innerWidth, innerHeight);
        camera        = new THREE.PerspectiveCamera(
            camViewAngle,
            innerWidth / innerHeight,
            camNearPlane,
            camFarPlane
        );

        const tmp = container.offsetTop;
        window.scrollTo(0, tmp);
    }, 300);
}

window.StartSimulation = startSimul;

//#endregion event_handler

function animate() {
    idRequestAnimationFrame = requestAnimationFrame(animate);
    renderer.render(scene, camera);
    stats.update();
}

function tick() {
    playSimulation = document.getElementById("is-play").checked;

    camera.updateMatrixWorld();

    mouseHandler();
    
    if (playSimulation){
        intersectCheck();

        Ball.tick();
        Board.tick();
    }
}

function intersectCheck(){
    Ball.collision(Board);
}

function mouseHandler(){
    vCamPositioning();
    setCamPosition();
    boardInProgress = Board.boardPositioning(!isMouseDown[0]);

    if(currentMousePosition == null) return;
    (() => {
        let t = 0;
        const a = 25;
        if(isMouseDown.some(b => b)) t = (- a * a / (Math.abs(initialMousePosition.y - currentMousePosition.y) * 0.7 + a) + a) * Math.PI / 360;

        if(isMouseDown[0]){
            if(!playSimulation) return;
            if(boardInProgress) return;

            //t = Math.pow(t * 180 / Math.PI, 0.75) * Math.PI / 180;
            if(initialMousePosition.y < currentMousePosition.y) t *= -1;
            Board.rotateBoard(t);
        }else if(isMouseDown[1]){
            //zoom
            t = 20 * t;
            if(initialMousePosition.y >= currentMousePosition.y) cameraPosition.radius = initialCameraPosition.radius - t;
            else cameraPosition.radius = initialCameraPosition.radius + t;
        }else if(isMouseDown[2]){
            //horizontalMoving
            cameraPosition.hAngle = initialCameraPosition.hAngle + (initialMousePosition.x - currentMousePosition.x) * Math.PI / 180 / 5;
            //verticalMoving
            if(initialMousePosition.y >= currentMousePosition.y) cameraPosition.vAngle = initialCameraPosition.vAngle - t;
            else cameraPosition.vAngle = initialCameraPosition.vAngle + t;
        }
    })();
}

function getMousePos(event){
    const canvas = document.getElementById("app").children[0];
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    return {
        x : x,
        y : y
    }
}

function mouseDown(event){
    if(event.which <= 3 && event.which > 0){
        let i = event.which - 1;
        if(isMouseDown.some(b => b)) return;
        if(!isMouseDown[i]){
            if(i == 0 && !boardInProgress){
                isMouseDown[i] = true;
                initialMousePosition = getMousePos(event);
                initialCameraPosition = JSON.parse(JSON.stringify(cameraPosition));

                raycaster.setFromCamera(new THREE.Vector2(
                    (initialMousePosition.x / window.innerWidth) * 2 - 1,
                    - (initialMousePosition.y / window.innerHeight) * 2 + 1), camera );
                    
                const intersect = raycaster.intersectObjects( [Board.object] );
                
                if (intersect.length > 0){
                    const point = intersect[0].point.add(Board.object.position);
                    const vector = new THREE.Vector3().subVectors(point, Board.object.position);
                    vector.applyQuaternion(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), - Math.PI / 2)).normalize();
                    Board.setVectorRotation(vector);
                }else{
                    Board.setVectorRotation(new THREE.Vector3(0, 1, 0));
                }
            }else if(i > 0){
                isMouseDown[i] = true;
                initialMousePosition = getMousePos(event);
                initialCameraPosition = JSON.parse(JSON.stringify(cameraPosition));
            }
        }
    }
}

function mouseMove(event){
    currentMousePosition = getMousePos(event);

    checkInnerMouse();
}

function checkInnerMouse(){
    if (boardInProgress){
        intersectBoard = false;
        prevCoord = new THREE.Vector3();
        scene.remove(circleSelection);
        return;
    }

    raycaster.setFromCamera(new THREE.Vector2(
        (currentMousePosition.x / window.innerWidth) * 2 - 1,
        - (currentMousePosition.y / window.innerHeight) * 2 + 1), camera );

    const intersect = raycaster.intersectObjects( [Board.object] );

    if (intersect.length > 0){
        if (!intersectBoard){
            intersectBoard = true;
            circleSelection = new THREE.PointLight( 0x00ffff, 1, 2);
            scene.add(circleSelection);
        }
        //const translateOffset = new THREE.Vector3().subVectors(intersect[0].point, prevCoord);
        //circleSelection.geometry.translate(translateOffset.x, translateOffset.y, translateOffset.z);
        //prevCoord.copy(intersect[0].point);
        let basePoint;
        if(!isMouseDown[0]){
            basePoint = intersect[0].point;
            firstIntersectPoint = new THREE.Vector3().copy(basePoint);
            firstIntersect = JSON.parse(JSON.stringify(intersect));
            basePoint.applyQuaternion(Board.getQuaternion());
            circleSelection.position.copy(basePoint.add(intersect[0].face.normal));
            document.body.style.cursor = 'grab';
        }
        else{
            basePoint = new THREE.Vector3().copy(firstIntersectPoint);
            basePoint.applyQuaternion(Board.getQuaternion());
            circleSelection.position.copy(basePoint.add(firstIntersect[0].face.normal));
            document.body.style.cursor = 'grabbing';
        }
        circleSelection.quaternion.copy(Board.getQuaternion());
    }else if (isMouseDown[0]){
        const basePoint = new THREE.Vector3().copy(firstIntersectPoint);
        basePoint.applyQuaternion(Board.getQuaternion());
        circleSelection.position.copy(basePoint.add(firstIntersect[0].face.normal));
        circleSelection.quaternion.copy(Board.getQuaternion());
        document.body.style.cursor = 'grabbing';
    }else{
        intersectBoard = false;
        prevCoord = new THREE.Vector3();
        scene.remove(circleSelection);
        document.body.style.cursor = 'default';
    }
}

function mouseUp(event){
    if(event.which <= 3 && event.which > 0){
        let i = event.which - 1;
        isMouseDown[i] = false;
        initialCameraPosition = JSON.parse(JSON.stringify(cameraPosition));
    }
}

function setCamPosition(){
    while(cameraPosition.vAngle < -2 * Math.PI) cameraPosition.vAngle += Math.PI * 2;
    while(cameraPosition.vAngle > 2 * Math.PI) cameraPosition.vAngle -= Math.PI * 2;
    while(cameraPosition.hAngle < -2 * Math.PI) cameraPosition.hAngle += Math.PI * 2;
    while(cameraPosition.hAngle > 2 * Math.PI) cameraPosition.hAngle -= Math.PI * 2;
    camera.position.set(
        cameraPosition.radius * Math.cos(cameraPosition.vAngle) * Math.sin(cameraPosition.hAngle),
        cameraPosition.radius * Math.sin(cameraPosition.vAngle),
        cameraPosition.radius * Math.cos(cameraPosition.vAngle) * Math.cos(cameraPosition.hAngle)
    );

    // let a = new THREE.Vector3(cameraPosition.radius * Math.cos(-cameraPosition.vAngle) * Math.sin(cameraPosition.hAngle),
    // cameraPosition.radius * Math.sin(-cameraPosition.vAngle),
    // cameraPosition.radius * Math.cos(-cameraPosition.vAngle) * Math.cos(cameraPosition.hAngle)).add(camera.position);
    // camera.lookAt(a.x, a.y, a.z);

    camera.lookAt(0, 0, 0);
}

function vCamPositioning(){
    if(!isMouseDown[2]){
        const t = __windowConfig["camera"]["initial-position"]["v-angle"] * Math.PI / 180;
        if(Math.abs(cameraPosition.vAngle - t) < deltaComputation) cameraPosition.vAngle = t;
        else cameraPosition.vAngle = (cameraPosition.vAngle * 9 + t) / 10;
    }
    if(!isMouseDown[1]){
        const t = __windowConfig["camera"]["initial-position"]["radius"];
        if(Math.abs(cameraPosition.radius - t) < deltaComputation) cameraPosition.radius = t;
        else cameraPosition.radius = (cameraPosition.radius * 9 + t) / 10;
    }
}
