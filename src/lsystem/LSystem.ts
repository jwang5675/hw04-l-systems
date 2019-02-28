import {vec3, mat4, quat} from 'gl-matrix';
import ExpansionRules from '../lsystem/ExpansionRules';
import DrawingRules from '../lsystem/DrawingRules';
import Turtle from '../lsystem/Turtle';

export class LSystem {
  expansionRules: ExpansionRules;
  drawingRules: DrawingRules;
  controls: any;

  constructor(controls: any) {
    this.expansionRules = new ExpansionRules(controls);
    this.drawingRules = new DrawingRules(controls);
    this.controls = controls;
  }

  // Returns VBO Data to populate scene with
  getVBOData(iterations: number) {
    let expandedAxiom = this.expansionRules.expandAxiom(iterations);
    let dataObjs: any[] = this.drawingRules.draw(expandedAxiom);

    // Sets up schema for return values
    let returnVal: any = {};
    returnVal.cylinder = {};
    returnVal.cylinder.color = [];
    returnVal.cylinder.col1 = [];
    returnVal.cylinder.col2 = [];
    returnVal.cylinder.col3 = [];
    returnVal.cylinder.col4 = [];
    returnVal.sphere = {};
    returnVal.sphere.color = [];
    returnVal.sphere.col1 = [];
    returnVal.sphere.col2 = [];
    returnVal.sphere.col3 = [];
    returnVal.sphere.col4 = [];

    for (let i: number = 0; i < dataObjs.length; i++) {
      let data: any = dataObjs[i];
      let currChar: string = data.char;
      let currTransform: mat4 = data.transform;

      let shape = currChar == "Q" ? "sphere" : "cylinder";

      // Setup Column Vector VBOs
      returnVal[shape].col1.push(currTransform[0]);
      returnVal[shape].col1.push(currTransform[1]);
      returnVal[shape].col1.push(currTransform[2]);
      returnVal[shape].col1.push(currTransform[3]);

      returnVal[shape].col2.push(currTransform[4]);
      returnVal[shape].col2.push(currTransform[5]);
      returnVal[shape].col2.push(currTransform[6]);
      returnVal[shape].col2.push(currTransform[7]);

      returnVal[shape].col3.push(currTransform[8]);
      returnVal[shape].col3.push(currTransform[9]);
      returnVal[shape].col3.push(currTransform[10]);
      returnVal[shape].col3.push(currTransform[11]);

      returnVal[shape].col4.push(currTransform[12]);
      returnVal[shape].col4.push(currTransform[13]);
      returnVal[shape].col4.push(currTransform[14]);
      returnVal[shape].col4.push(currTransform[15]);

      // Setup Color VBOs
      if (currChar == "L") {
        // Leaf Color        
        returnVal[shape].color.push(this.controls["Leaf R"]);
        returnVal[shape].color.push(this.controls["Leaf G"]);
        returnVal[shape].color.push(this.controls["Leaf B"]);
        returnVal[shape].color.push(1);
      } else if(currChar == "Q") {
        // Fruit Color
        returnVal[shape].color.push(0.878);
        returnVal[shape].color.push(0.117);
        returnVal[shape].color.push(0);
        returnVal[shape].color.push(1);
      } else {
        // Tree Color
        returnVal[shape].color.push(this.controls["Bark R"]);
        returnVal[shape].color.push(this.controls["Bark G"]);
        returnVal[shape].color.push(this.controls["Bark B"]);
        returnVal[shape].color.push(1);
      }
    }

    return returnVal;
  }

}

export default LSystem;