import * as THREE from '../three-module/three.module.js';

let ballRadius;
let ballColor;
let ballRho;

let loader;
let ballTexture;

let geometry;
let mesh;
let object;

let nextPosition = new THREE.Vector3(0, 10, 0);
let physic

const initialize = (objectConfig) => {
    ballRadius = objectConfig["radius"];
    ballColor = objectConfig["color"];
    ballRho = objectConfig["rho"];

    loader = new THREE.TextureLoader();
    ballTexture = loader.load('./../resource/watermelon_pattern.jpg');
    ballTexture.wrapS = ballTexture.wrapT = THREE.RepeatWrapping;
    ballTexture.anisotropy = 16;
    ballTexture.encoding = THREE.sRGBEncoding;

    geometry = new THREE.SphereGeometry(ballRadius, 32, 32);
    mesh = new THREE.MeshPhongMaterial( {shininess: 40, map: ballTexture} );
    object = new THREE.Mesh(geometry, mesh);

    nextPosition = new THREE.Vector3(0, 10, 0);

    object.position.set(0, 10, 0);
    object.receiveShadow = true;
    object.castShadow = true;

    physic = {
        volume : 4 * Math.PI * ballRadius * ballRadius * ballRadius / 3,
        mass : ballRho * 4 * Math.PI * ballRadius * ballRadius * ballRadius / 3,
        velocity : new THREE.Vector3()
    }
}

const showInfo = () => {

}

const tick = () => {
    object.position.copy(nextPosition);

    //GJB
    let cst = - env.air_fraction / (physic.mass * fps);
    let exp = Math.exp(cst);

    let xVel = physic.velocity.x;
    let yVel = physic.velocity.y;
    let zVel = physic.velocity.z;
    
    //gravity
    xVel = xVel * exp + env.gravity.x * (exp - 1) / cst;
    yVel = yVel * exp + env.gravity.y * (exp - 1) / cst;
    zVel = zVel * exp + env.gravity.z * (exp - 1) / cst;

    //horizontal move
    xVel = xVel * exp;
    zVel = zVel * exp;

    physic.velocity.set(xVel, yVel, zVel);

    //update next position
    nextPosition.add(physic.velocity);
}

const collision = (obj) => {
    const brd = obj.object.geometry;
    const pos = brd.attributes.position.array;
    const idx = brd.index.array;
    const MxN = brd.index.count;
    const mother = obj.object.position;

    let touched = [];

    for(let i = 0; i < MxN; i += 3){
        //get respective points
        new THREE.Vector3()
        let p = new THREE.Vector3().fromArray(pos, idx[i] * 3).add(mother);
        let q = new THREE.Vector3().fromArray(pos, idx[i + 1] * 3).add(mother);
        let r = new THREE.Vector3().fromArray(pos, idx[i + 2] * 3).add(mother);

        //apply side rotation
        let quaternion = obj.getQuaternion();
        p.applyQuaternion(quaternion);
        q.applyQuaternion(quaternion);
        r.applyQuaternion(quaternion);
        
        //construct triangle for computation
        const triangle = new THREE.Triangle(p, q, r);

        const closest = new THREE.Vector3();
        triangle.closestPointToPoint(nextPosition, closest);

        let t = closest.distanceTo(nextPosition);
        
        if(t >= 0 && t - ballRadius <= deltaComputation){
            //console.log(closest);
            // let cop = new THREE.Vector3().copy(closest);
            // cop.sub(nextPosition);
            // cop.setLength(ballRadius - t);
    
            // let offset = physic.velocity.clone();
            // let k = cop.dot(cop) / cop.dot(offset);
            // offset.multiplyScalar(k);
    
            // nextPosition.add(offset);
            // object.position.copy(nextPosition);

            touched.push({
                distance: t,
                closestPoint: closest
            });
        }
    }

    if (touched.length > 0){
        let closestDistance = Infinity;
        let closestPoint = new THREE.Vector3();
        for (let i = 0; i < touched.length; i++){
            if (touched[i].distance < closestDistance){
                closestDistance = touched[i].distance;
                closestPoint.copy(touched[i].closestPoint);
            }
        }

        //bounce
        const momentum = obj.getMomentumAt(closestPoint, new THREE.Vector3().subVectors(object.position, closestPoint));
        momentum.multiplyScalar(0.001);

        const difference = ballRadius - closestDistance;
        const bendPart = Math.min(2 * difference / physic.velocity.length(), 1);
        const reflectVector = new THREE.Vector3().copy(closestPoint).sub(nextPosition);

        const cosL = new THREE.Vector3().copy(physic.velocity).projectOnVector(reflectVector).length();
        const cos = new THREE.Vector3().copy(reflectVector).setLength(cosL);
        cos.negate().multiplyScalar(2);
        const resultant = new THREE.Vector3().addVectors(cos, physic.velocity);
        resultant.multiplyScalar(0.45);

        resultant.add(momentum);

        physic.velocity.copy(resultant);
        nextPosition.sub(reflectVector.setLength(difference));
        resultant.multiplyScalar(bendPart);
        nextPosition.add(resultant);
    }
}

export { object, initialize, showInfo, tick, collision };