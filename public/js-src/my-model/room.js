import * as THREE from '../three-module/three.module.js';
import { BufferGeometryUtils } from '../three-module/bufferGeometryUtils.js';

const color = __objectConfig["room"]["color"];

const geometry1 = new THREE.BoxGeometry(100, 100, 1);
const geometry2 = new THREE.BoxGeometry(100, 100, 1);
const geometry3 = new THREE.BoxGeometry(1, 100, 100);
const geometry4 = new THREE.BoxGeometry(1, 100, 100);
const geometry5 = new THREE.BoxGeometry(100, 1, 100);
const geometry6 = new THREE.BoxGeometry(100, 1, 100);

geometry1.translate(0, 0, 50);
geometry2.translate(0, 0, -50);
geometry3.translate(50, 0, 0);
geometry4.translate(-50, 0, 0);
geometry5.translate(0, 50, 0);
geometry6.translate(0, -50, 0);

const material = new THREE.MeshPhongMaterial({color: color});

const geometry = BufferGeometryUtils.mergeBufferGeometries([
    geometry1,
    geometry2,
    geometry3,
    geometry4,
    geometry5,
    geometry6
]);

const object = new THREE.Mesh(geometry, material);

//object.receiveShadow = true;

const showInfo = () => {
    console.log("Room : ");
    console.log(object.geometry);
}

export { object, showInfo };