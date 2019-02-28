import {vec3, mat4, quat} from 'gl-matrix';

export default class Turtle {
  position: vec3 = vec3.create();
  forward: vec3 = vec3.create();
  up: vec3 = vec3.create();
  right: vec3 = vec3.create();
  quaternion: quat = quat.create();
  recursionDepth: number = 0;
  hasSplit: boolean;

  constructor(pos: vec3, forward: vec3, up: vec3, right: vec3, q: quat, rd: number, hasSplit: boolean) {
    this.position = pos;
    this.forward = forward;
    this.up = up;
    this.right = right;
    this.quaternion = q;
    this.recursionDepth = rd;
    hasSplit = hasSplit;
  }

  rotateByForwardAxis(degrees: number) {
    let q = quat.create();
    quat.setAxisAngle(q, this.forward, degrees * Math.PI / 180.0);

    let rotationMatrix = mat4.create();
    mat4.fromQuat(rotationMatrix, q);
    vec3.transformMat4(this.up, this.up, rotationMatrix);
    vec3.normalize(this.up, this.up);
    vec3.transformMat4(this.right, this.right, rotationMatrix);
    vec3.normalize(this.right, this.right);

    // Save the current rotation in our turtle's quaternion
    quat.rotationTo(this.quaternion, vec3.fromValues(0, 1, 0), this.forward);
  }

  rotateByUpAxis(degrees: number) {
    let q = quat.create();
    quat.setAxisAngle(q, this.up, degrees * Math.PI / 180.0);

    let rotationMatrix = mat4.create();
    mat4.fromQuat(rotationMatrix, q);
    vec3.transformMat4(this.forward, this.forward, rotationMatrix);
    vec3.normalize(this.forward, this.forward);
    vec3.transformMat4(this.right, this.right, rotationMatrix);
    vec3.normalize(this.right, this.right);

    // Save the current rotation in our turtle's quaternion
    quat.rotationTo(this.quaternion, vec3.fromValues(0, 1, 0), this.forward);
  }

  rotateByRightAxis(degrees: number) {
    let q = quat.create();
    quat.setAxisAngle(q, this.right, degrees * Math.PI / 180.0);

    let rotationMatrix = mat4.create();
    mat4.fromQuat(rotationMatrix, q);
    vec3.transformMat4(this.up, this.up, rotationMatrix);
    vec3.normalize(this.up, this.up);
    vec3.transformMat4(this.forward, this.forward, rotationMatrix);
    vec3.normalize(this.forward, this.forward);

    // Save the current rotation in our turtle's quaternion
    quat.rotationTo(this.quaternion, vec3.fromValues(0, 1, 0), this.forward);
  }

  randomizeAngle(angle: number) {
    let random: number = Math.random();
    let offset: number = angle * 0.15;
    return angle + offset * random;
  }

  rotate1() {
    let angle: number = 60;
    this.rotateByForwardAxis(this.randomizeAngle(angle));
  }

  rotate2() {
    let angle: number = 120;
    this.rotateByForwardAxis(this.randomizeAngle(angle));
  }

  rotate3() {
    let angle: number = 180;
    this.rotateByForwardAxis(this.randomizeAngle(angle));
  }

  rotate4() {
    let angle: number = 240;
    this.rotateByForwardAxis(this.randomizeAngle(angle));
  }

  rotate5() {
    let angle: number = 300;
    this.rotateByForwardAxis(this.randomizeAngle(angle));
  }

  rotatePlus() {
    let angle: number = 25;
    this.rotateByUpAxis(angle); 
  }

  rotateMinus() {
    let angle: number = -25;
    this.rotateByUpAxis(angle);
  }

  rotateOut() {
    let angle: number = 40;
    this.rotateByRightAxis(this.randomizeAngle(angle));
  }

  rotateReset() {
    let angle: number = 135;
    this.rotateByForwardAxis(this.randomizeAngle(angle));
  }

  getMatrix(scale: vec3) {
    let transform: mat4 = mat4.create();
    mat4.fromRotationTranslationScale(transform, this.quaternion, this.position, scale);
    return transform;
  }

  moveForward() {
    // move the turtle length 1 forward and returns the transformation
    vec3.add(this.position, this.position, this.forward);  
    let depthFactor: number = (6 - this.recursionDepth) / 6;
    depthFactor = !this.hasSplit ? depthFactor * 2 : depthFactor;
    return this.getMatrix(vec3.fromValues(1 * depthFactor, 1, 1 * depthFactor));
  }

  leaf() {
    // move the turtle length 1 forward and returns the transformation
    vec3.add(this.position, this.position, this.forward);  
    return this.getMatrix(vec3.fromValues(0.5, 0.5, 0.5));
  }

  // Creates a turtle instance to add to the turtle stack
  createTurtleInstance() {
    this.recursionDepth = this.recursionDepth + 1;
    this.hasSplit = true;

    let newPos: vec3 = vec3.create();
    vec3.copy(newPos, this.position);

    let newFor: vec3 = vec3.create();
    vec3.copy(newFor, this.forward);

    let newUp: vec3 = vec3.create();
    vec3.copy(newUp, this.up);

    let newRight: vec3 = vec3.create();
    vec3.copy(newRight, this.right);

    let newQuat: quat = quat.create();
    quat.copy(newQuat, this.quaternion);
 
    return new Turtle(newPos, newFor, newUp, newRight, newQuat, this.recursionDepth, this.hasSplit);
  }

  // Sets the current turtle to one popped off of the turtle stack
  setTurtleInstance(turtle: Turtle) {
    vec3.copy(this.position, turtle.position);
    vec3.copy(this.forward, turtle.forward);
    vec3.copy(this.up, turtle.up);
    vec3.copy(this.right, turtle.right);
    quat.copy(this.quaternion, turtle.quaternion);
    this.recursionDepth = turtle.recursionDepth - 1;
  }
}