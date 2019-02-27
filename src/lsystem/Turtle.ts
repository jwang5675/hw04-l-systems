import {vec3, mat4, quat} from 'gl-matrix';

export default class Turtle {
	position: vec3 = vec3.create();
  orientation: vec3 = vec3.create(); // Ensure that orientation is normalized;
  quaternion: quat = quat.create();
  recursionDepth: number = 0;

  constructor(pos: vec3, orient: vec3, q: quat, rd: number) {
    this.position = pos;
    this.orientation = orient;
    this.quaternion = q;
    this.recursionDepth = rd;
  }

  rotate(axis: vec3, degrees: number) {
    // Set up a rotation quaternion
    let q: quat = quat.create();
    vec3.normalize(axis, axis);
    quat.setAxisAngle(q, axis, degrees * Math.PI / 180.0);
    quat.normalize(q, q);

    // Update the orientation direction of our turtle
    this.orientation = vec3.transformQuat(this.orientation, this.orientation, q);
    vec3.normalize(this.orientation, this.orientation);

    // Save the current rotation in our turtle's quaternion
    quat.rotationTo(this.quaternion, vec3.fromValues(0, 1, 0), this.orientation);
  }

  rotateMinus() {
    this.rotate(vec3.fromValues(0, 0, 1), -50);    
  }

  rotatePlus() {
    this.rotate(vec3.fromValues(0, 0, 1), 50);    
  }

  getMatrix() {
    let transform: mat4 = mat4.create();

    // Cannot use mat4.fromRotationTranslationScale(transform, this.quaternion, this.position, scale);
    // Since this transformation is the reverse order of transformtions of the one we want
    // let scaleMatrix: mat4 = mat4.create();
    // let rotationMatrix: mat4 = mat4.create();
    // let translateMatrix: mat4 = mat4.create();

    // let scale: vec3 = vec3.fromValues(0.1, 1, 1);
    // mat4.fromScaling(scaleMatrix, scale);
    // mat4.fromQuat(rotationMatrix, this.quaternion);
    // mat4.fromTranslation(translateMatrix, this.position);
    // mat4.multiply(transform, rotationMatrix, scaleMatrix);
    // mat4.multiply(transform, translateMatrix, transform);

    mat4.fromRotationTranslationScale(transform, this.quaternion, this.position, vec3.fromValues(0.1, 1, 1));
    return transform;
  }

  moveForward() {
    // move the turtle length 1 forward and returns the transformation
    vec3.add(this.position, this.position, this.orientation);  
    return this.getMatrix();
  }

  // Creates a turtle instance to add to the turtle stack
  createTurtleInstance() {
    let newPos: vec3 = vec3.create();
    vec3.copy(newPos, this.position);

    let newOri: vec3 = vec3.create();
    vec3.copy(newOri, this.orientation);

    let newQuat: quat = quat.create();
    quat.copy(newQuat, this.quaternion);
 
    return new Turtle(newPos, newOri, newQuat, this.recursionDepth + 1);
  }

  // Sets the current turtle to one popped off of the turtle stack
  setTurtleInstance(turtle: Turtle) {
    vec3.copy(this.position, turtle.position);
    vec3.copy(this.orientation, turtle.orientation);
    quat.copy(this.quaternion, turtle.quaternion);
    this.recursionDepth = turtle.recursionDepth - 1;
  }
}