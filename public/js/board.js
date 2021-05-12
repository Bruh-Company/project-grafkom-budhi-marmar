import * as THREE from '/three.module.js';

const sideLength = __objectConfig["board"]["side-length"];
const sideThickness = __objectConfig["board"]["thickness"]
const boardColor = __objectConfig["board"]["color"];
const boardRho = __objectConfig["board"]["rho"];

const geometry = new THREE.BoxGeometry(sideLength, sideThickness, sideLength);
const mesh = new THREE.MeshPhongMaterial( {color : boardColor/** , wireframe : true*/} );
const object = new THREE.Mesh(geometry, mesh);

const mass = boardRho * sideLength * sideLength * sideThickness;

object.position.set(0, - sideThickness / 2, 0);
object.receiveShadow = true;

let physic = {
    volume : sideLength * sideLength * sideThickness,
    mass : boardRho * sideLength * sideLength * sideThickness,
    velocity : new Vec3()
}

const showInfo = () => {
    console.log("Board : ");
    console.log(object.geometry);
}

const tick = () => {
    
}

export { object, showInfo, tick, mass };