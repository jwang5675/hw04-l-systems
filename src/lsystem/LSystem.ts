import {vec3, mat4, quat} from 'gl-matrix';
import ExpansionRules from '../lsystem/ExpansionRules';
import Turtle from '../lsystem/Turtle';

export class LSystem {
  myTurtle: Turtle;
  expansionRules: ExpansionRules;
  drawingRules: Map<string, any>;
  turtleStack: Turtle[];

  constructor(eRule: ExpansionRules) {
    this.myTurtle = new Turtle(vec3.fromValues(0, 0, 0), 
                               vec3.fromValues(0, 1, 0), 
                               quat.fromValues(0, 0, 0, 1), 0);
    this.expansionRules = eRule;
    this.drawingRules = new Map();
    this.drawingRules.set("F", this.myTurtle.moveForward.bind(this.myTurtle));
    this.drawingRules.set("X", this.myTurtle.moveForward.bind(this.myTurtle));
    this.drawingRules.set("-", this.myTurtle.rotateMinus.bind(this.myTurtle));
    this.drawingRules.set("+", this.myTurtle.rotatePlus.bind(this.myTurtle));
    this.turtleStack = [];
  }

  expandAxiom(iterations: number) {
    let resultAxiom: string = this.expansionRules.axiom;

    for (let i: number = 0; i < iterations; i++) {
      let newAxiom: string = "";
      for (let j: number = 0; j < resultAxiom.length; j++) {
        let currentChar: string = resultAxiom[j];
        let expansionFunc: any = this.expansionRules.grammar.get(currentChar);
        if (expansionFunc) {
          newAxiom = newAxiom + expansionFunc();
        } else {
          newAxiom = newAxiom + currentChar;
        }        
      }
      resultAxiom = newAxiom;
    }

    return resultAxiom;
  }

  // Returns an array of mat4s for the main function to draw
  draw(iterations: number) {
    let returnTransformations: mat4[] = [];
    let expandedAxiom: string = this.expandAxiom(iterations);
    console.log(expandedAxiom);

    for (let i: number = 0; i < expandedAxiom.length; i++) {
      let currentChar: string = expandedAxiom[i];
      let drawingFunc: any = this.drawingRules.get(currentChar);

      // If there is a drawing rule present at the current string
      if (drawingFunc) {
        // Function is either movement or rotation
        // Movement functons return a matrix to draw, rotation returns nothing
        let possibleMatrix: any = drawingFunc();
        if (possibleMatrix) {
          returnTransformations.push(possibleMatrix);
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

    return returnTransformations;
  }

}

export default LSystem;