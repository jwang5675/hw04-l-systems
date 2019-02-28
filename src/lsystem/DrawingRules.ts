import {vec3, mat4, quat} from 'gl-matrix';
import Turtle from '../lsystem/Turtle';

class DrawingRules {
  drawingRules: Map<string, any> = new Map();
  myTurtle: Turtle;
  turtleStack: Turtle[];
  controls: any;

  constructor(controls: any) {
    this.myTurtle = new Turtle(vec3.fromValues(0, 0, 0), // position 
                               vec3.fromValues(0, 1, 0), // foward
                               vec3.fromValues(0, 0, 1), // up
                               vec3.fromValues(1, 0, 0), // right
                               quat.fromValues(0, 0, 0, 1), 
                               0, false, controls);

    this.drawingRules = new Map();
    this.drawingRules.set("F", this.myTurtle.moveForward.bind(this.myTurtle));
    this.drawingRules.set("X", this.myTurtle.moveForward.bind(this.myTurtle));
    this.drawingRules.set("B", this.myTurtle.moveForward.bind(this.myTurtle));
    this.drawingRules.set("L", this.myTurtle.leaf.bind(this.myTurtle));
    this.drawingRules.set("Q", this.myTurtle.fruit.bind(this.myTurtle));

    this.drawingRules.set("1", this.myTurtle.rotate1.bind(this.myTurtle));
    this.drawingRules.set("2", this.myTurtle.rotate2.bind(this.myTurtle));
    this.drawingRules.set("3", this.myTurtle.rotate3.bind(this.myTurtle));
    this.drawingRules.set("4", this.myTurtle.rotate4.bind(this.myTurtle));
    this.drawingRules.set("5", this.myTurtle.rotate5.bind(this.myTurtle));

    this.drawingRules.set("+", this.myTurtle.rotatePlus.bind(this.myTurtle));
    this.drawingRules.set("-", this.myTurtle.rotateMinus.bind(this.myTurtle));
    this.drawingRules.set("~", this.myTurtle.rotateOut.bind(this.myTurtle));
    this.drawingRules.set("*", this.myTurtle.rotateMore.bind(this.myTurtle));

    this.turtleStack = [];
  }

  // Returns an array of objects and mat4s for the main function to draw
  draw(expandedAxiom: string) {
    let returnData: any = [];

    for (let i: number = 0; i < expandedAxiom.length; i++) {
      let currentChar: string = expandedAxiom[i];
      let drawingFunc: any = this.drawingRules.get(currentChar);
      let data: any = {};

      // If there is a drawing rule present at the current string
      if (drawingFunc) {
        // Function is either movement or rotation
        // Movement functons return a matrix to draw
        // Rotation functions returns nothing
        let possibleMatrix: any = drawingFunc();
        if (possibleMatrix) {
          data.transform = possibleMatrix;
          data.char = currentChar;
          returnData.push(data);
        }
      }

      if (currentChar == "[") {
        // Add to stack case
        this.turtleStack.push(this.myTurtle.createTurtleInstance());
      }

      if (currentChar == "]") {
        // Remove from stack case
        let removedTurtle: Turtle = this.turtleStack.pop();
        if (removedTurtle) {
          this.myTurtle.setTurtleInstance(removedTurtle);
        } else {
          console.log("Grammer brackets not well defined...");
        }
      }
    }

    return returnData;
  }

}

export default DrawingRules;