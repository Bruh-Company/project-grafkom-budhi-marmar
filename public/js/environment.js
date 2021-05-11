const deltaComputation = 0.001;
const deltaCollision = 0.01;
const fps = __windowConfig["fps"];

let env = {
    gravity : __objectConfig["environment"]["gravity"] / (fps * fps)
}

