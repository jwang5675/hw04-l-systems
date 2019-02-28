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
    this.rotate(vec3.fromValues(0, 0, 1), -40);  
  }

  rotatePlus() {
    this.rotate(vec3.fromValues(0, 0, 1), 40);    
  }

  rotateLB() {
    this.rotate(vec3.fromValues(1, 0, 0), -40);  
  }

  rotateRB() {
    this.rotate(vec3.fromValues(1, 0, 0), 40);    
  }

  rotate1() {
    this.rotate(vec3.fromValues(1, 0, 1), 30);    
  }

  rotate2() {
    this.rotate(vec3.fromValues(1, 0, 1), -30);    
  }

  getMatrix(scale: vec3) {
    let transform: mat4 = mat4.create();
    mat4.fromRotationTranslationScale(transform, this.quaternion, this.position, scale);
    return transform;
  }

  moveForward() {
    // move the turtle length 1 forward and returns the transformation
    vec3.add(this.position, this.position, this.orientation);  
    let depthFactor: number = (6 - this.recursionDepth) / 6;
    return this.getMatrix(vec3.fromValues(1 * depthFactor, 1, 1 * depthFactor));
  }

  leaf() {
    // move the turtle length 1 forward and returns the transformation
    vec3.add(this.position, this.position, this.orientation);  
    return this.getMatrix(vec3.fromValues(0.5, 0.5, 0.5));
  }

  randomRot() {
    this.rotate(vec3.fromValues(0, 0, 1), 5);  
  }

  orientUp() {
    this.orientation = vec3.fromValues(0, 1, 0);
    // Save the current rotation in our turtle's quaternion
    quat.rotationTo(this.quaternion, vec3.fromValues(0, 1, 0), this.orientation);
  }

  // Creates a turtle instance to add to the turtle stack
  createTurtleInstance() {
    this.recursionDepth = this.recursionDepth + 1;

    let newPos: vec3 = vec3.create();
    vec3.copy(newPos, this.position);

    let newOri: vec3 = vec3.create();
    vec3.copy(newOri, this.orientation);

    let newQuat: quat = quat.create();
    quat.copy(newQuat, this.quaternion);
 
    return new Turtle(newPos, newOri, newQuat, this.recursionDepth);
  }

  // Sets the current turtle to one popped off of the turtle stack
  setTurtleInstance(turtle: Turtle) {
    vec3.copy(this.position, turtle.position);
    vec3.copy(this.orientation, turtle.orientation);
    quat.copy(this.quaternion, turtle.quaternion);
    this.recursionDepth = turtle.recursionDepth - 1;
  }
}