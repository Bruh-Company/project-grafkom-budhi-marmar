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
let physic = {
    volume          : 0,
    mass            : 0,
    acceleration    : new THREE.Vector3(),
    velocity        : new THREE.Vector3(),
    shape_constant  : 0,
    mom_of_inertia  : 0,
    moi_per_r_sq    : 0,
    angle_velocity  : 0,
    vector_rotation : new THREE.Vector3(0, 1, 0)
}

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
        volume          : 4 * Math.PI * Math.pow(ballRadius, 3) / 3,
        mass            : ballRho * 4 * Math.PI * Math.pow(ballRadius, 3) / 3,
        acceleration    : new THREE.Vector3(),
        velocity        : new THREE.Vector3(),
        shape_constant  : (2 / 5) /** bola pejal*/,
        mom_of_inertia  : (2 / 5) /** bola pejal */ * ballRho * 4 * Math.PI * Math.pow(ballRadius, 5) / 3,
        moi_per_r_sq    : (2 / 5) /** bola pejal */ * ballRho * 4 * Math.PI * Math.pow(ballRadius, 3) / 3,
        angle_velocity  : 0,
        vector_rotation : new THREE.Vector3(0, 1, 0) //vector keluar dari jam, angle positive bakal muter berlawanan jarum jam
    }
}

const showInfo = () => {

}

const acceleration_analysis = () => {

}

const debug = () => {
    return ``;
}

const tick = () => {
    object.position.copy(nextPosition);

    //Translation
    let cst = - env.air_fraction / (physic.mass * fps);
    let exp = Math.exp(cst);

    physic.velocity.multiplyScalar(exp);
    physic.velocity.add(new THREE.Vector3().copy(physic.acceleration).multiplyScalar((exp - 1) / (cst * fps * fps)));
    if (Math.abs(physic.velocity.length()) < 0.0001) physic.velocity = new THREE.Vector3();

    //Rotation
    
    object.applyQuaternion(new THREE.Quaternion().setFromAxisAngle(physic.vector_rotation, physic.angle_velocity));

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

        if(t >= 0 && t - ballRadius <= 0.001){
            touched.push({
                distance: t,
                closestPoint: closest
            });
        }
    }

    if (touched.length == 0){
        physic.acceleration.copy(env.gravity);
    }else{
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
        momentum.divideScalar(physic.mass * 100);
        
        const difference = ballRadius - closestDistance;
        const reflectVector = new THREE.Vector3().copy(closestPoint).sub(nextPosition);   // ini vector arah bola ke papan
        
        const cosL = new THREE.Vector3().copy(physic.velocity).projectOnVector(reflectVector).length();
        const cos = new THREE.Vector3().copy(reflectVector).setLength(cosL);
        const sin = new THREE.Vector3().subVectors(physic.velocity, cos);
        cos.negate().multiplyScalar(0.45);
        const resultant = new THREE.Vector3().addVectors(cos, sin);
        resultant.add(momentum);

        let bendPart = Math.max(Math.min(2 * difference / physic.velocity.length(), 1), 0);
        nextPosition.sub(reflectVector.setLength(difference));
        const sinRes = new THREE.Vector3().copy(resultant).projectOnVector(sin);
        sinRes.divideScalar(physic.shape_constant + 1);
        if(new THREE.Vector3().copy(resultant).projectOnVector(cos).length() < 0.001){
            /**
             * a = g sin alpha / (k + 1)
             * disini aku ngeprojectin gravitasi ke vector antara pusat massa dengan bidang
             * trs cari hasil pengurangan ntar dapet g sin alpha
             */
            resultant.copy(sinRes);
            physic.vector_rotation = new THREE.Vector3().crossVectors(sinRes, reflectVector).normalize();
            physic.angle_velocity = sinRes.length() / ballRadius;
        }else{
            const temp = new THREE.Vector3().crossVectors(reflectVector, physic.vector_rotation).setLength(physic.angle_velocity * ballRadius);
            sin.add(temp).divideScalar(2);
            
            physic.vector_rotation = new THREE.Vector3().crossVectors(sin, reflectVector).normalize();
            physic.angle_velocity = sin.length() / ballRadius;
            physic.velocity.copy(resultant);
    
            resultant.multiplyScalar(bendPart);
            nextPosition.add(resultant);
        }
    }

    //     let closestDistance = Infinity;
    //     let closestPoint = new THREE.Vector3();
    //     for (let i = 0; i < touched.length; i++){
    //         if (touched[i].distance < closestDistance){
    //             closestDistance = touched[i].distance;
    //             closestPoint.copy(touched[i].closestPoint);
    //         }
    //     }

    //     //bounce
    //     const momentum = obj.getMomentumAt(closestPoint, new THREE.Vector3().subVectors(object.position, closestPoint));
    //     momentum.multiplyScalar(0.001);

    //     const difference = ballRadius - closestDistance;
    //     const reflectVector = new THREE.Vector3().copy(closestPoint).sub(nextPosition);
        
    //     const cosL = new THREE.Vector3().copy(physic.velocity).projectOnVector(reflectVector).length();
    //     const cos = new THREE.Vector3().copy(reflectVector).setLength(cosL);
    //     const sin = new THREE.Vector3().subVectors(physic.velocity, cos);
    //     cos.negate();
    //     const resultant = new THREE.Vector3().addVectors(cos, sin);
    //     resultant.multiplyScalar(0.45);
    //     resultant.add(momentum);

    //     let bendPart;
    //     if(resultant.length() < deltaComputation * 80){
    //         bendPart = Math.max(Math.min(difference / physic.velocity.length(), 1), 0);
            
    //         const proj = new THREE.Vector3().copy(env.gravity).projectOnVector(cos);
    //         if(physic.velocity.dot(cos) != 0){
    //             physic.velocity = new THREE.Vector3().subVectors(env.gravity, proj);
    //         }else{
    //             physic.velocity.add(new THREE.Vector3().subVectors(env.gravity, proj));
    //         }

            
    //     }else{
    //         bendPart = Math.max(Math.min(2 * difference / physic.velocity.length(), 1), 0);

    //         sin.multiplyScalar(0.1);
    //         const prev_vel = physic.angle_velocity * ballRadius;
    //         const prev_vec = new THREE.Vector3().crossVectors(physic.vector_rotation, cos).setLength(prev_vel);
    //         sin.add(prev_vec);
    //         physic.vector_rotation = new THREE.Vector3().crossVectors(cos, sin).normalize();
    //         const rot_fraction = sin.length();
    //         physic.angle_velocity = rot_fraction / ballRadius;

    //         physic.velocity.copy(resultant);
    //     }

    //     nextPosition.sub(reflectVector.setLength(difference));
    //     resultant.multiplyScalar(bendPart);
    //     nextPosition.add(resultant);
    // }
}

export { object, initialize, showInfo, tick, collision, debug };