import * as THREE from '/three.module.js';
import * as Ball from './ball.js';
import * as Board from './board.js';
import * as Room from './room.js';
import * as Lamp from './lamp.js';

//const innerWidth = __windowConfig["canvas-width"];
const innerWidth = document.getElementById('app').clientWidth;
const innerHeight = __windowConfig["canvas-height"];
const msPerFrame = 1000 / __windowConfig["fps"];

const camViewAngle = __windowConfig["view-angle"];
const camNearPlane = __windowConfig["near-plane"];
const camFarPlane = __windowConfig["far-plane"];

const scene = new THREE.Scene();
const directLight = new THREE.PointLight(0xffffff, 0.8, 100);
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
const pointLightHelper = new THREE.PointLightHelper(directLight);
const renderer = new THREE.WebGLRenderer();
const camera = new THREE.PerspectiveCamera(
    camViewAngle,
    innerWidth / innerHeight,
    camNearPlane,
    camFarPlane
);

let cameraPosition = {
    radius : __windowConfig["camera"]["initial-position"]["radius"],
    hAngle : __windowConfig["camera"]["initial-position"]["h-angle"] * Math.PI / 180,
    vAngle : __windowConfig["camera"]["initial-position"]["v-angle"] * Math.PI / 180
};
let isMouseDown = [false, false, false];
let initialMousePosition;
let initialCameraPosition;
let currentMousePosition;
let raycaster;

window.oncontextmenu = (e) => {
    e.preventDefault();
};

window.onmousedown = (e) => {
    if(e.which == 2) e.preventDefault();
};

document.body.onload = () => {
    Board.showInfo();
    Ball.showInfo();
    Room.showInfo();

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
    
    directLight.position.set(
        __windowConfig["light"]["position"]["x"],
        __windowConfig["light"]["position"]["y"],
        __windowConfig["light"]["position"]["z"]
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

    raycaster = new THREE.Raycaster();

    let dom = renderer.domElement;
    dom.oncontextmenu = (e) => {
        e.preventDefault();
    };
    dom.onmousemove = mouseMove;
    dom.onmousedown = mouseDown;
    dom.onmouseup = mouseUp;
    dom.onmouseout = mouseUp;
    document.getElementById("app").appendChild(dom);

    animate();

    setInterval(tick, msPerFrame);
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

function tick() {
    camera.updateMatrixWorld();

    mouseHandler();
    
    intersectCheck();

    Ball.tick();
    Board.tick();
}

function intersectCheck(){
    const brd = Board.object.geometry;
    const pos = brd.attributes.position.array;
    const idx = brd.index.array;
    const MxN = brd.index.count;

    let arr = [];
    let any = false;

    for(let i = 0; i < MxN; i += 3){
        let p = new THREE.Vector3(pos[idx[i] * 3], pos[idx[i] * 3 + 1], pos[idx[i] * 3 + 2]);
        let q = new THREE.Vector3(pos[idx[i + 1] * 3], pos[idx[i + 1] * 3 + 1], pos[idx[i + 1] * 3 + 2]);
        let r = new THREE.Vector3(pos[idx[i + 2] * 3], pos[idx[i + 2] * 3 + 1], pos[idx[i + 2] * 3 + 2]);
        
        const plane = new THREE.Plane().setFromCoplanarPoints(p, q, r);

        let fly = Ball.inAir(plane);
        any = any || !fly;
        if(!fly) arr.push(plane.normal);
        else arr.push(true);
    }

    if(any){
        Ball.collision();
    }
}

function mouseHandler(){
    vCamPositioning();
    setCamPosition();

    if(currentMousePosition == null) return;
    (() => {
        let t = 0;
        if(isMouseDown.some(b => b)) t = Math.sqrt(Math.abs(initialMousePosition.y - currentMousePosition.y)) * Math.PI / 180;

        if(isMouseDown[0]){
            raycaster.setFromCamera(new THREE.Vector2(
                (initialMousePosition.x / window.innerWidth) * 2 - 1,
                - (initialMousePosition.y / window.innerHeight) * 2 + 1), camera );

            const intersect = raycaster.intersectObjects( [Board.object] );

            if (intersect.length > 0){
                //Board.object.material.emissive = 0xffffff;
            }
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
    //console.log(canvas);
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
            isMouseDown[i] = true;
            initialMousePosition = getMousePos(event);
            initialCameraPosition = JSON.parse(JSON.stringify(cameraPosition));
        }
    }
}

function mouseMove(event){
    currentMousePosition = getMousePos(event);

    raycaster.setFromCamera(new THREE.Vector2(
        (currentMousePosition.x / window.innerWidth) * 2 - 1,
        - (currentMousePosition.y / window.innerHeight) * 2 + 1), camera );

    const intersect = raycaster.intersectObjects( [Board.object] );

    if (intersect.length > 0){
        Board.object.material.emissive.setHex(0xff0000);
    }else{
        Board.object.material.emissive.setHex(0x000000);
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