import * as THREE from '../three-module/three.module.js';

let sideLength;
let sideThickness;
let boardColor;
let boardRho;

let geometry;
let mesh;
let object;

let physic;


const initialize = (objectConfig) => {
    sideLength = objectConfig["side-length"];
    sideThickness = objectConfig["thickness"]
    boardColor = objectConfig["color"];
    boardRho = objectConfig["rho"];

    geometry = new THREE.BoxGeometry(sideLength, sideThickness, sideLength);
    mesh = new THREE.MeshPhongMaterial( {color : boardColor , /**wireframe : true*/} );
    object = new THREE.Mesh(geometry, mesh);

    object.position.set(0, - sideThickness / 2, 0);
    object.castShadow = true;
    object.receiveShadow = true;

    physic = {
        volume : sideLength * sideLength * sideThickness,
        mass : boardRho * sideLength * sideLength * sideThickness,
        angle : 0,
        angle_velocity : 0,
        vector_rotation : new THREE.Vector3(0, 1, 0)
    }

    //tester
    //object.quaternion.copy(new THREE.Quaternion().setFromAxisAngle(physic.vector_rotation.normalize(), physic.angle));
}

const showInfo = () => {
    console.log("Board : ");
    console.log(object.geometry);
}

const tick = () => {
    
}

//a -> angle
const rotateBoard = (a) => {
    if(physic.vector_rotation.equals(new THREE.Vector3(0, 1, 0))) return;

    let deltaAngle = a - physic.angle;
    physic.angle_velocity = deltaAngle * fps;
    physic.angle = a;
    
    object.quaternion.copy(new THREE.Quaternion().setFromAxisAngle(physic.vector_rotation.normalize(), physic.angle));
}

const getMomentumAt = (point, normal) => {
    let force = new THREE.Vector3().subVectors(point, object.position);
    //console.log(new THREE.Vector3().crossVectors(force, physic.vector_rotation));
    force = new THREE.Vector3().crossVectors(physic.vector_rotation, force);
    force.setLength(Math.abs(physic.angle_velocity)).projectOnVector(normal);
    if (physic.angle_velocity < 0) force.negate();

    let temp = new THREE.Vector3().addVectors(normal.setLength(physic.angle_velocity), force).length();
    if (temp < physic.angle_velocity) return new THREE.Vector3();
    return force;
}

const getQuaternion = () => {
    return object.quaternion;
}

const setVectorRotation = (vr) => {
    physic.vector_rotation.copy(vr);
}

const invertVectorRotation = () => {
    physic.vector_rotation.negate();
}

const boardPositioning = (e) => {
    if(e){
        if (Math.abs(physic.angle) <= deltaComputation){
            rotateBoard(0);
            return false;
        }

        rotateBoard(physic.angle * 9 / 10);
        return true;
    }
}

const randomMaze = () => {

}

export { object, initialize, showInfo, tick, getQuaternion, rotateBoard, getMomentumAt, setVectorRotation, invertVectorRotation, boardPositioning };