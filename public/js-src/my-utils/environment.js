const deltaComputation = 0.000001;
const deltaCollision = 0.01;
const fps = __windowConfig["fps"];

let env = {
    gravity : {
        x : __objectConfig["environment"]["gravity"][0],
        y : __objectConfig["environment"]["gravity"][1],
        z : __objectConfig["environment"]["gravity"][2]
    },
    air_fraction : __objectConfig["environment"]["air-fraction"]
}

const restartEnv = () => {
    env = {
        gravity : {
            x : __objectConfig["environment"]["gravity"][0],
            y : __objectConfig["environment"]["gravity"][1],
            z : __objectConfig["environment"]["gravity"][2]
        },
        air_fraction : __objectConfig["environment"]["air-fraction"]
    }
}