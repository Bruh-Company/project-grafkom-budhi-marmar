import * as THREE from '../three-module/three.module.js';

const geometry = new THREE.SphereGeometry(1, 32, 32);
geometry.translate(
    __windowConfig["light"]["position"]["x"],
    __windowConfig["light"]["position"]["y"],
    __windowConfig["light"]["position"]["z"]);
const material = new THREE.MeshPhongMaterial( {color : 0xFFFFFF, emissive : 0x7c9fff, wireframe : true} );
const object = new THREE.Mesh(geometry, material);

export { object };