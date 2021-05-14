class Vec3{
    constructor(a = 0, b = 0, c = 0){
        this.x = a;
        this.y = b;
        this.z = c;
    }

    abs(){
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    sum(){
        return this.x + this.y + this.z;
    }
}

const times = (a, b) => {
    if(typeof(a) === "number" && b instanceof Vec3){
        return new Vec3(
            a * b.x,
            a * b.y,
            a * b.z
        );
    }else if(typeof(b) === "number" && a instanceof Vec3){
        return new Vec3(
            b * a.x,
            b * a.y,
            b * a.z
        );
    }else if(a instanceof Vec3 && b instanceof Vec3){
        return new Vec3(
            b.x * a.x,
            b.y * a.y,
            b.z * a.z
        );
    }
}

const add = (a, b) => {
    if(typeof(a) === "number" && b instanceof Vec3){
        return new Vec3(
            a + b.x,
            a + b.y,
            a + b.z
        );
    }else if(typeof(b) === "number" && a instanceof Vec3){
        return new Vec3(
            b + a.x,
            b + a.y,
            b + a.z
        );
    }else if(a instanceof Vec3 && b instanceof Vec3){
        return new Vec3(
            b.x + a.x,
            b.y + a.y,
            b.z + a.z
        );
    }
}

const divide = (a, b) => {
    if(typeof(a) === "number" && b instanceof Vec3){
        return new Vec3(
            a / b.x,
            a / b.y,
            a / b.z
        );
    }else if(typeof(b) === "number" && a instanceof Vec3){
        return new Vec3(
            a.x / b,
            a.y / b,
            a.z / b
        );
    }else if(a instanceof Vec3 && b instanceof Vec3){
        return new Vec3(
            a.x / b.x,
            a.y / b.y,
            a.z / b.z
        );
    }
}

const substract = (a, b) => {
    if(typeof(a) === "number" && b instanceof Vec3){
        return new Vec3(
            a - b.x,
            a - b.y,
            a - b.z
        );
    }else if(typeof(b) === "number" && a instanceof Vec3){
        return new Vec3(
            a.x - b,
            a.y - b,
            a.z - b
        );
    }else if(a instanceof Vec3 && b instanceof Vec3){
        return new Vec3(
            a.x - b.x,
            a.y - b.y,
            a.z - b.z
        );
    }
}

const dot = (a, b) => {
    if(a instanceof Vec3 && b instanceof Vec3){
        return times(a, b).sum();
    }
}

const trigono = (a, b) => {
    if(a instanceof Vec3 && b instanceof Vec3){
        let ang = dot(a, b) / (a.abs() * b.abs());
        return {
            angle : ang,
            cos : Math.cos(ang),
            sin : Math.cos(ang),
            tan : Math.tan(ang)
        }
    }
}