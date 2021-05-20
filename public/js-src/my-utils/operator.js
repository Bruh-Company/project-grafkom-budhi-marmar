import {Vector3} from '../three-module/three.module.js';

const trigono = (a, b) => {
    if(a instanceof Vector3 && b instanceof Vector3){
        let ang = a.dot(b) / (abs(a) * abs(b));
        return {
            angle : ang,
            cos : Math.cos(ang),
            sin : Math.cos(ang),
            tan : Math.tan(ang)
        }
    }
}

const abs = (a) => {
    if(a instanceof Vector3){
        return Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z);
    }
}

const sum = (a) => {
    if(a instanceof Vector3){
        return a.x + a.y + a.z;
    }
}

export { trigono, abs, sum };