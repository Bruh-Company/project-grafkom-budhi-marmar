import * as THREE from './../three-module/three.module.js';

const ballRadius = __objectConfig["ball"]["radius"];
const ballColor = __objectConfig["ball"]["color"];
const ballRho = __objectConfig["ball"]["rho"];

const geometry = new THREE.SphereGeometry(ballRadius, 32, 32);
const mesh = new THREE.MeshPhongMaterial( {color : ballColor, shininess: 40} );
const object = new THREE.Mesh(geometry, mesh);

let nextPosition = 10;

object.position.set(0, 10, 0);
object.receiveShadow = true;
object.castShadow = true;

let physic = {
    volume : 4 * Math.PI * ballRadius * ballRadius * ballRadius / 3,
    mass : ballRho * 4 * Math.PI * ballRadius * ballRadius * ballRadius / 3,
    velocity : new Vec3()
}

const showInfo = () => {

}

let v = 0;
const tick = () => {
    //if(Math.abs(v) < deltaComputation) v = 0;
    object.position.y -= v;
    v += env.gravity;
    nextPosition -= v;
}

const collision = () => {
    // 0 = mb * vb + mass * vel + mb * k * (vel - vb)
    // k = (mb * vb + mass * vel) / (mb * vb - mb * vel))

    
    // const momentum = times(physic.mass, physic.velocity);
    // //momentum conservation
    // const newMomentum = add(momentum, mom);
    // //new velocity
    // physic.velocity = divide(newMomentum, physic.mass);
    
    nextPosition += v;
    v *= -0.45;
    nextPosition -= v;
}

const inAir = (plane) => {
    let t = plane.distanceToPoint(new THREE.Vector3(0, nextPosition, 0));
//console.log(t);

    if(t < 0) return true;

    if(t - ballRadius <= 0){
        object.position.y = ballRadius;
        return false;
    }else return true;
}

export { object, showInfo, tick, collision, inAir };