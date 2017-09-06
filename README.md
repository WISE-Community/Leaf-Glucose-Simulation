# Leaf-Glucose-Simulation
A simulation that demonstrates what happens inside a leaf during Photosynthesis with emphasis on glucose production/storage/usage

## Screenshots

### Simulation Start
![Screenshot of Simulation State State](https://github.com/WISE-Community/Leaf-Glucose-Simulation/blob/master/resources/screenshot_initial.png?raw=true)

### Day 3 (light on)
![Screenshot of Simulation State State Day 3 Light On](https://github.com/WISE-Community/Leaf-Glucose-Simulation/blob/master/resources/screenshot_day3_light_on.png?raw=true)

### Day 15 (light off)
![Screenshot of Simulation State State Day 15 Light Off](https://github.com/WISE-Community/Leaf-Glucose-Simulation/blob/master/resources/screenshot_day15_light_off.png?raw=true)

## Development

You will need NPM (https://www.npmjs.com) and Git.

1. Checkout the project
```
$ git clone https://github.com/WISE-Community/Leaf-Glucose-Simulation.git
```

2. Install gulp globally
```
$ cd Leaf-Glucose-Simulation
Leaf-Glucose-Simulation$ npm install -g gulp-cli
```

3. Install dependencies
```
Leaf-Glucose-Simulation$ npm install
```

4. Start gulp task. This will start a running process to copy files and compile changes to typescript files.
```
Leaf-Glucose-Simulation$ gulp
```

5. See the model on the browser by going to path_to_Leaf-Glucose-Simulation/dist/index.html . (e.g. file:///Users/myusername/dev/Leaf-Glucose-Simulation/dist/index.html)

6. Make changes with your favorite IDE. Changes to typescript will be immediately compiled to the dist folder. If you make any other change, you will need to restart gulp for now.

## Resources
This is a good resource on using Gulp and TypeScript: https://www.typescriptlang.org/docs/handbook/gulp.html
