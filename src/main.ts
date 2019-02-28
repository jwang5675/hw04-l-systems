import {vec3, mat4} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Square from './geometry/Square';
import ScreenQuad from './geometry/ScreenQuad';
import Mesh from './geometry/Mesh';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';
import LSystem from './lsystem/LSystem';
import {readTextFile} from './globals';

let changed: boolean = true;

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
  iterations: 5,
  'Bark R': 0.176,
  'Bark G': 0.039,
  'Bark B': 0.039,
  'Leaf R': 0.035,
  'Leaf G': 0.262,
  'Leaf B': 0.121,
  'Randomness': 0.1,
};

let square: Square;
let screenQuad: ScreenQuad;
let cylinder: Mesh;
let sphere: Mesh;
let pot: Mesh;
let dirt: Mesh;
let time: number = 0.0;

function loadScene() {
  square = new Square();
  square.create();
  screenQuad = new ScreenQuad();
  screenQuad.create();

  // LOAD FROM OBJ FILE
  let cylinderString: string = readTextFile("../resources/obj/cylinder.obj");
  cylinder = new Mesh(cylinderString, vec3.fromValues(0, 0, 0));
  cylinder.create();

  let sphereString: string = readTextFile("../resources/obj/sphere.obj");
  sphere = new Mesh(sphereString, vec3.fromValues(0, 0, 0));
  sphere.create();

  // Setup Pot VBO
  let potString: string = readTextFile("../resources/obj/pot.obj");
  pot = new Mesh(potString, vec3.fromValues(0, 0, 0));
  pot.create();
  let colorsArray: number[] = [1, 1, 1, 1];
  let col1Array: number[] = [10, 0, 0, 0];
  let col2Array: number[] = [0, 10, 0, 0];
  let col3Array: number[] = [0, 0, 10, 0];
  let col4Array: number[] = [6, -8.5, 0, 1];
  let col1: Float32Array = new Float32Array(col1Array);
  let col2: Float32Array = new Float32Array(col2Array);
  let col3: Float32Array = new Float32Array(col3Array);
  let col4: Float32Array = new Float32Array(col4Array);
  let colors: Float32Array = new Float32Array(colorsArray);
  pot.setInstanceVBOsTransform(col1, col2, col3, col4, colors);
  pot.setNumInstances(1);

  // Setup dirt VBO
  let dirtString: string = readTextFile("../resources/obj/dirt.obj");
  dirt = new Mesh(dirtString, vec3.fromValues(0, 0, 0));
  dirt.create();
  let dirtColorArray: number[] = [0.484, 0.367, 0.258, 1];
  colors = new Float32Array(dirtColorArray);
  dirt.setInstanceVBOsTransform(col1, col2, col3, col4, colors);
  dirt.setNumInstances(1);
}

function setupLSystem() {
  if (changed) {
    changed = false;

    let ls: LSystem = new LSystem(controls);
    let data = ls.getVBOData(controls.iterations);
    cylinder.setInstanceVBOsTransform(new Float32Array(data["cylinder"].col1),
                                      new Float32Array(data["cylinder"].col2), 
                                      new Float32Array(data["cylinder"].col3),
                                      new Float32Array(data["cylinder"].col4), 
                                      new Float32Array(data["cylinder"].color));
    cylinder.setNumInstances(data["cylinder"].col1.length / 4);
    sphere.setInstanceVBOsTransform(new Float32Array(data["sphere"].col1),
                                    new Float32Array(data["sphere"].col2), 
                                    new Float32Array(data["sphere"].col3),
                                    new Float32Array(data["sphere"].col4), 
                                    new Float32Array(data["sphere"].color));
    sphere.setNumInstances(data["sphere"].col1.length / 4);
  }
}

function main() {
  // Initial display for framerate
  const stats = Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.body.appendChild(stats.domElement);

  // Add controls to the gui
  const gui = new DAT.GUI();
  gui.add(controls, 'iterations', 0, 5).step(1).onChange(
    function() {
      changed = true;
    }.bind(this));
  gui.add(controls, 'Bark R', 0, 1).step(0.01).onChange(
    function() {
      changed = true;
    }.bind(this));
  gui.add(controls, 'Bark G', 0, 1).step(0.01).onChange(
    function() {
      changed = true;
    }.bind(this));
  gui.add(controls, 'Bark B', 0, 1).step(0.01).onChange(
    function() {
      changed = true;
    }.bind(this));
  gui.add(controls, 'Leaf R', 0, 1).step(0.01).onChange(
    function() {
      changed = true;
    }.bind(this));
  gui.add(controls, 'Leaf G', 0, 1).step(0.01).onChange(
    function() {
      changed = true;
    }.bind(this));
  gui.add(controls, 'Leaf B', 0, 1).step(0.01).onChange(
    function() {
      changed = true;
    }.bind(this));
  gui.add(controls, 'Randomness', 0, 1).step(0.01).onChange(
    function() {
      changed = true;
  }.bind(this));

  // get canvas and webgl context
  const canvas = < HTMLCanvasElement > document.getElementById('canvas');
  const gl = < WebGL2RenderingContext > canvas.getContext('webgl2');
  if (!gl) {
    alert('WebGL 2 not supported!');
  }
  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);

  // Initial call to load scene
  loadScene();

  const camera = new Camera(vec3.fromValues(15, 20, 100), vec3.fromValues(15, 25, 0));

  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(0.2, 0.2, 0.2, 1);
  gl.enable(gl.DEPTH_TEST);
  // gl.enable(gl.BLEND);
  // gl.blendFunc(gl.ONE, gl.ONE); // Additive blending

  const instancedShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/instanced-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/instanced-frag.glsl')),
  ]);

  const flat = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/flat-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/flat-frag.glsl')),
  ]);

  // This function will be called every frame
  function tick() {
    camera.update();
    stats.begin();
    instancedShader.setTime(time);
    flat.setTime(time++);
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    setupLSystem();
    renderer.clear();
    renderer.render(camera, flat, [screenQuad]);
    renderer.render(camera, instancedShader, [
      square,
      cylinder,
      sphere,
      pot,
      dirt,
    ]);
    stats.end();

    // Tell the browser to call `tick` again whenever it renders a new frame
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.setAspectRatio(window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();
    flat.setDimensions(window.innerWidth, window.innerHeight);
  }, false);

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();
  flat.setDimensions(window.innerWidth, window.innerHeight);

  // Start the render loop
  tick();
}

main();