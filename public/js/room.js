import * as THREE from '/three.module.js';

const color = __objectConfig["room"]["color"];

const geometry1 = new THREE.BoxGeometry(100, 100, 1);
const geometry2 = new THREE.BoxGeometry(100, 100, 1);
const geometry3 = new THREE.BoxGeometry(1, 100, 100);
const geometry4 = new THREE.BoxGeometry(1, 100, 100);
const geometry5 = new THREE.BoxGeometry(100, 1, 100);
const geometry6 = new THREE.BoxGeometry(100, 1, 100);
const object1 = new THREE.Mesh(geometry1);
const object2 = new THREE.Mesh(geometry2);
const object3 = new THREE.Mesh(geometry3);
const object4 = new THREE.Mesh(geometry4);
const object5 = new THREE.Mesh(geometry5);
const object6 = new THREE.Mesh(geometry6);
object1.updateMatrix();
object2.updateMatrix();
object3.updateMatrix();
object4.updateMatrix();
object5.updateMatrix();
object6.updateMatrix();

const geometry = new THREE.BoxGeometry(0, 0, 0);

geometry.merge(object1.geometry, object1.matrix);
geometry.merge(object2.geometry, object2.matrix);
geometry.merge(object3.geometry, object3.matrix);
geometry.merge(object4.geometry, object4.matrix);
geometry.merge(object5.geometry, object5.matrix);
geometry.merge(object6.geometry, object6.matrix);

const mesh = new THREE.MeshPhongMaterial({color: color});
const object = new THREE.Mesh(geometry, mesh);

//object.receiveShadow = true;

export { object };