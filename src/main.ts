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

// L-System specific imports
import ExpansionRules from './lsystem/ExpansionRules';
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
};

let square: Square;
let screenQuad: ScreenQuad;
let cylinder: Mesh;
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
}

function createLSystem() {
  // Start of L System
  if (changed) {
    changed = false;
    let ls: LSystem = new LSystem(new ExpansionRules());
    let data = ls.draw(controls.iterations);
    let colorsArray = [];
    let col1Array = [];
    let col2Array = [];
    let col3Array = [];
    let col4Array = [];
    for (let i = 0; i < data.length; i++) {
      let currData = data[i];
      let currTransform = currData.transform;

      // push column vectors back
      col1Array.push(currTransform[0]);
      col1Array.push(currTransform[1]);
      col1Array.push(currTransform[2]);
      col1Array.push(currTransform[3]);

      col2Array.push(currTransform[4]);
      col2Array.push(currTransform[5]);
      col2Array.push(currTransform[6]);
      col2Array.push(currTransform[7]);

      col3Array.push(currTransform[8]);
      col3Array.push(currTransform[9]);
      col3Array.push(currTransform[10]);
      col3Array.push(currTransform[11]);

      col4Array.push(currTransform[12]);
      col4Array.push(currTransform[13]);
      col4Array.push(currTransform[14]);
      col4Array.push(currTransform[15]);

      // push colors back
      if (currData.char == "L") {
        // Leaf Color        
        colorsArray.push(controls["Leaf R"]);
        colorsArray.push(controls["Leaf G"]);
        colorsArray.push(controls["Leaf B"]);
        colorsArray.push(1);
      } else {
        // Tree Color
        colorsArray.push(controls["Bark R"]);
        colorsArray.push(controls["Bark G"]);
        colorsArray.push(controls["Bark B"]);
        colorsArray.push(1);
      }
    }

    let col1: Float32Array = new Float32Array(col1Array);
    let col2: Float32Array = new Float32Array(col2Array);
    let col3: Float32Array = new Float32Array(col3Array);
    let col4: Float32Array = new Float32Array(col4Array);
    let colors: Float32Array = new Float32Array(colorsArray);
    cylinder.setInstanceVBOsTransform(col1, col2, col3, col4, colors);
    cylinder.setNumInstances(data.length);
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

  const camera = new Camera(vec3.fromValues(0, 35, 70), vec3.fromValues(0, 35, 0));

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
    createLSystem();
    renderer.clear();
    renderer.render(camera, flat, [screenQuad]);
    renderer.render(camera, instancedShader, [
      square,
      cylinder,
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