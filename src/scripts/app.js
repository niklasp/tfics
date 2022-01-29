import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FlyControls } from 'three/examples/jsm/controls/FlyControls.js';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { LuminosityShader } from 'three/examples/jsm/shaders/LuminosityShader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { FontLoader, Font } from 'three/examples/jsm/loaders/FontLoader.js';
// import { RoughnessMipmapper } from 'three/examples/jsm/utils/RoughnessMipmapper.js';

import * as dat from 'dat.gui';
import VideoElement from './VideoElement';

import vid1ph from '../models/raumschiff_erde.jpeg';

import theFont from '../static/font3.json';
import metropolisModel from '../models/assembled17.glb';
import krabbe from '../models/krabbe.glb';

//import shaders
import vertexShader from '../shaders/vertex.glsl';
import fragmentShader from '../shaders/fragment.glsl';
import shiftShader from '../shaders/shiftShader.glsl';

import environment from '../static/bg.hdr';

const DAMPENING_FACTOR = 0.01;

export default class Sketch {
  constructor( options ) {
    console.log( 'xxx', options );
    this.time = 0;
    this.prevTime = 0;
    this.container = options.dom;

    this.clock = new THREE.Clock();

    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;

    this.mouse = new THREE.Vector2( 0.0, 0.0 );
    this.mouseSpeed = new THREE.Vector2( 0.0, 0.0 );
    this.oldMouseSpeed = new THREE.Vector2( 0.0, 0.0 );
    this.mouseAcc = new THREE.Vector2( 0.0, 0.0 );
    this.lMouseSpeed = new THREE.Vector2( 0.0, 0.0 );
    this.lMouse = new THREE.Vector2( 0.0, 0.0 );

    this.scene = new THREE.Scene();
    const color = 0xffffff;
    const near = 100;
    const far = 300;
    this.scene.background = new THREE.Color( 0xbb99cc );
    this.scene.background.opacity = 0.1;
    this.scene.opacity = 0.5;
    // this.scene.fog = new THREE.Fog(color, near, far);
    this.camera = new THREE.PerspectiveCamera( 100, this.width / this.height, 0.1, 1000 );
    this.camera.position.set( 20, 30, 40 );

    this.videoIds = [
      'iItaoaRG0NU',
      'aUwTFRghE-8',
      'GtvX_GIR1Kc',
      'yk9XWlgm5dU',
      'A3GJuPcvde4',
      '9pw6_Mg6E_c',
    ];

    this.videoObjects = new THREE.Group();

    this.matMetalness = 1;
    this.matColor = new THREE.Color( 0xff22ff );
    this.matOpacity = 0.5;
    this.matRoughness = 0.1;
    this.matReflectivity = 0.5;

    this.renderer = new THREE.WebGLRenderer( {
      antialias: true,
      alpha: true,
      // autoClear: true,
      powerPreference: "high-performance",
      // preserveDrawingBuffer: true,
    } );
    // this.renderer.autoClearColor = false;
    this.renderer.setSize( this.width, this.height );
    // this.renderer.setClearColor(0x000000, 0.1);
    // this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    // this.renderer.toneMappingExposure = 1;
    // this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    this.container.appendChild( this.renderer.domElement );

    this.composer = new EffectComposer( this.renderer );
    const renderPass = new RenderPass( this.scene, this.camera );
    this.composer.addPass( renderPass );
    this.composer.setSize ( this.width, this.height );

    this.materialUniforms = {
      u_time: { value: 0.0 },
      tDiffuse: { value: null },
      pixelSize: { value: 10 },
      resolution: { value: new THREE.Vector2( this.width, this.height ) },
      u_mouse: { value: new THREE.Vector2( this.width / 2.0, this.height / 2.0 ) },
      u_mouseDampened: { value: new THREE.Vector2( this.width / 2.0, this.height / 2.0 ) },
      u_dMouse: { value: new THREE.Vector2( 0, 0 ) },
      opacity: { value: 1.0 },
      u_moveVector: { value: new THREE.Vector3( 0, 0, 0) },
      u_viewport: { value: new THREE.Vector2( this.width, this.height ) },
      u_mouseSpeed: { value: new THREE.Vector2( this.width / 2.0, this.height / 2.0 ) },
    };


    // this.shader = {
    //   uniforms: this.materialUniforms,
    //   vertexShader,
    //   fragmentShader: shiftShader,
    // };
    // this.shaderPass = new ShaderPass( this.shader );
    // this.composer.addPass( this.shaderPass );


    this.controls = new OrbitControls( this.camera, this.renderer.domElement );
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.2;
    // this.controls.enablePan = false;
    // this.controls.minPolarAngle = 0;
    // this.controls.maxPolarAngle = Math.PI;
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 0.1;
    this.controls.rotateSpeed = 0.4;
    this.controls.minDistance = 10;
    this.controls.maxDistance = 2000;
    this.controls.zoomSpeed = 0.3;

    // this.controls = new PointerLockControls( this.camera, document.body );

    // this.controls = new FlyControls( this.camera, this.renderer.domElement );

    // this.controls.movementSpeed = 1000;
    // this.controls.domElement = this.renderer.domElement;
    // this.controls.rollSpeed = Math.PI / 24;
    // this.controls.autoForward = false;
    // this.controls.dragToLook = false;

    this.mat = new THREE.MeshPhysicalMaterial( {
      // color: this.matColor,
      metalness: this.matMetalness,
      roughness: this.matRoughness,
      opacity: this.matOpacity,
      side: THREE.BackSide,
      transparent: true,
      envMapIntensity: 5,
      premultipliedAlpha: true
      // TODO: Add custom blend mode that modulates background color by this materials color.
    } );

    // this.mat = new THREE.MeshBasicMaterial({
    //   side: THREE.DoubleSide,
    //   blending: THREE.AdditiveBlending,
    //   depthTest: false,
    //   transparent: true,
    //   color: this.matColor,
    //   metalness: 1.0,
    //   roughness: 0.1,
    // });

    this.resize();
    this.setupListeners();
    this.addObjects();
    // this.addScreens();
    this.addMovingText();
    this.addLights();
    this.addGui();
    this.render();
  }

  onMouseMove( e ) {
    this.oldMouse = this.mouse;
    this.mouse = new THREE.Vector2( e.clientX / this.width , ( this.height - e.clientY ) / this.height );
    this.oldMouseSpeed = this.mouseSpeed;
    this.mouseSpeed = new THREE.Vector2( Math.abs(Math.min((this.mouse.x - this.oldMouse.x) * 10, 1)), Math.abs(Math.min((this.mouse.y - this.oldMouse.y) * 10), 1));
    this.mouseAcc = new THREE.Vector2( (this.mouse.x - e.clientX) - this.mouseSpeed.x , (this.mouse.y - this.height + e.clientY) - this.mouseSpeed.y );
    // this.shaderPass.uniforms.u_mouse.value = this.mouse;
  }

  setupListeners() {
    document.addEventListener( 'mousemove', this.onMouseMove.bind( this ) );
    window.addEventListener( 'resize', this.resize.bind( this ) );
  }

  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer.setSize( this.width, this.height );
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
  }

  addLights() {
    const color = new THREE.Color( 0xFFFFFF );
    const intensity = 1.0;
    this.light = new THREE.AmbientLight(color, intensity);
    this.scene.add(this.light);
    this.dirLight = new THREE.DirectionalLight(color, intensity );
    this.dirLight.position.set(0, -10, 0);

    this.scene.add(this.dirLight);

    this.scene.add( new THREE.AmbientLight( 0xffffff, 1.0 ) );

    // const pointLight1 = new THREE.PointLight( 0x22ffff );
    // pointLight1.position.set( 150, 10, 0 );
    // pointLight1.castShadow = false;
    // this.scene.add( pointLight1 );

    // const pointLight2 = new THREE.PointLight( 0xff22ff );
    // pointLight2.position.set( - 150, 0, 0 );
    // this.scene.add( pointLight2 );

    // const pointLight3 = new THREE.PointLight( 0xfff33f );
    // pointLight3.position.set( 0, - 10, - 150 );
    // this.scene.add( pointLight3 );

    // const pointLight4 = new THREE.PointLight( 0xf2fff2 );
    // pointLight4.position.set( 0, 0, 150 );
    // this.scene.add( pointLight4 );
  }

  addGui() {
    const gui = new dat.GUI();
    gui.addColor(new ColorGUIHelper(this.light, 'color'), 'value').name('color');
    gui.add(this.light, 'intensity', 0, 2, 0.01);
    // gui.add(this, 'matMetalness', 0, 2, 0.01 );
    // gui.add(this.mat, 'roughness', 0, 2, 0.01 );
    // gui.add(this.mat, 'reflectivity', 0, 2, 0.01 );
    // gui.add(this.mat, 'roughness', 0, 2, 0.01 );
    // gui.add(this.mat, 'opacity', 0, 2, 0.01 );
  }

  addObjects() {

    const that = this;

    const font = new Font( theFont );

    const textToShow = 'the future is coming soon';
    this.fontGeometries = [];
    this.meshes = [];
    for ( let i = 0; i<textToShow.length; i++) {
      const glyphMaterial = new THREE.MeshStandardMaterial( {
        color: 0xff00ff,
        emissive: 0x000033,
        metalness: 1,
        roughness: 0,
      } );
  
      const glyphGeometry = new TextGeometry( textToShow[ i ], {
        font: font,
        size: 10,
        height: 1,
        curveSegments: 3,
        // bevelEnabled: true,
        // bevelThickness: 3,
        // bevelSize: 2,
        // bevelOffset: 0,
        // bevelSegments: 2
      } );

      this.fontGeometries.push( glyphGeometry );
      const theMesh = new THREE.Mesh( glyphGeometry, glyphMaterial );
      this.meshes.push( theMesh );
      this.scene.add( theMesh );
    }
    // fontLoader.load( fontLoader.parse( theFont ), function ( font ) {
      // this.geometry = 
    // } );

    // this.geometry = new THREE.BoxGeometry( 20, 20, 20 );



    new RGBELoader()
    .setDataType( THREE.UnsignedByteType )
    .load( environment, function ( texture ) {

      const pmremGenerator = new THREE.PMREMGenerator( that.renderer );
      pmremGenerator.compileEquirectangularShader();
      const envMap = pmremGenerator.fromEquirectangular( texture ).texture;
      // console.log( envMap.mesh, envMap.material );
      that.scene.background = envMap;
      that.scene.environment = envMap;
      // that.scene.environment.
      // console.log( that.scene, that.scene.environment, that.scene.material, that.scene.environment.material, that.scene.background.mesh );

      texture.dispose();
      pmremGenerator.dispose();

      that.render();
      const dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderConfig({ type: 'js' });
      dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
      const loader = document.getElementById('loader');
      that.loader = new GLTFLoader();
      that.loader.setDRACOLoader( dracoLoader );
      that.loader.load( metropolisModel,
        function ( gltf ) {
          console.log( gltf );
          gltf.scene.scale.set(3,3,3);
          gltf.scene.traverse( function ( child ) {
          if ( child.material ) {
            // console.log( child.material );
            child.material.metalness = 0.5;
            // child.material.opacity = 1.0;
            child.material.reflectivity = 0.7;
            // child.material.roughness = 0.7;
            // child.material.refractionRatio = 0.5;
            // if ( child.material.color )
              // child.material.copy( that.mat );
            // child.side = THREE.DoubleSide;
            // child.material.blending = THREE.MultiplyBlending;
            // child.depthTest = false;
            // child.material.transparent = true;
            // child.material.color = 0xff22ff;
            // child.material.needsUpdate = true;
            // child.material.map.needsUpdate = true;
          // if ( child.isMesh ) {
            // roughnessMipmapper.generateMipmaps( child.material );
            // child.rotation.x = -2 * 3.14;
          // }
          }
        } );

        // that.city = gltf.scene.children[5];
        // that.city.geometry.center();
        gltf.scene.position.x = -0.05;
        gltf.scene.position.y = -22.13;
        gltf.scene.position.z = -0.16;
        that.city = gltf.scene;
        that.scene.add( that.city );
        loader.style.display = 'none';
      },
      function ( xhr ) {
        loader.innerText = 'loading...';
      },
      function ( error ) {
        console.log( 'An error happened', error );
      });

      // that.loader.load( krabbe,
      //   function ( gltf ) {
      //     console.log( 'krabbe', gltf );
      //     that.scene.add( gltf.scene );
      //   }
      // );

    });
  }

  addMovingText() {
    const randomPoints = [];
    // for ( let i = 0; i < 100; i ++ ) {
    //   randomPoints.push(
    //     new THREE.Vector3(Math.random() * 200 - 100, Math.random() * 200 - 100, Math.random() * 300 - 150)
    //   );
    // }
    randomPoints.push( new THREE.Vector3(-18,18,18) );
    randomPoints.push( new THREE.Vector3(18,18,18) );
    randomPoints.push( new THREE.Vector3(18,-18,18) );
    randomPoints.push( new THREE.Vector3(18,-18,-18) );
    randomPoints.push( new THREE.Vector3(-18,18,-18) );
    
    this.curve = new THREE.CatmullRomCurve3(randomPoints);
    const points = this.curve.getPoints( 50 );
    const geometry = new THREE.BufferGeometry().setFromPoints( points );
    
    const material = new THREE.LineBasicMaterial( { color : 0xff33cc } );
    // const splineObject = new THREE.Line( geometry, material );
    // this.scene.add( splineObject );

  }


  addScreens( ) {
    const rotation = Math.PI / 6;

    const count = 6;
    for ( let i = 0; i < count; i ++ ) {
      let mesh;
      const t = i / count * 2 * Math.PI - Math.PI / count;

      const posX = Math.cos( t ) * 45;
      const posZ = Math.sin( t ) * 45;
      // mesh.lookAt(0,0,0);
      console.log( 'xxx', this.videoIds[ i ] );
      const el = new VideoElement( this.videoIds[ i ], posX, 0, posZ, rotation, `video-${ i }` );
      
      // var player = new Player( el.domEl );

      // this.videos.push( player );

      el.object.lookAt( 0, 0, 0 );
      this.videoObjects.add( el.object );
      this.videoObjects.rotation.z = 0.4;
    }

    this.scene.add( this.videoObjects );
  }

  updateMouse() {
    this.lMouse.x -= ( this.lMouse.x - this.mouse.x) * 0.05;
    this.lMouse.y -= ( this.lMouse.y - this.mouse.y ) * 0.05;
    this.lMouseSpeed.x = this.lMouse.x - this.mouse.x;
    this.lMouseSpeed.y = this.lMouse.y - this.mouse.y;
  }

  render() {
    window.requestAnimationFrame( this.render.bind( this ) );
    this.time+= 0.05;
    this.updateMouse();

    // this.shaderPass.uniforms.u_mouse.value = this.mouse;
    // this.shaderPass.uniforms.u_mouseSpeed.value = this.lMouseSpeed;

    // this.controls.movementSpeed = 8.3;
    this.controls.update( this.clock.getDelta() );

    this.prevTime = this.time;
    // this.mesh.rotation.x = this.time / 10;
    // this.mesh.rotation.y = this.time / 30;

    if ( Math.abs( this.dampenedMouseX - this.targetX ) > 0.0001 ) {
      this.dampenedMouseX += ( this.targetX - this.dampenedMouseX ) * DAMPENING_FACTOR;
    }

    if ( Math.abs( this.dampenedMouseY - this.targetY ) > 0.0001 ) {
      this.dampenedMouseY += ( this.targetY - this.dampenedMouseY ) * DAMPENING_FACTOR;
    }

    if ( this.city ) {
      this.city.rotation.y = -this.time / 70.0;
    }

    this.videoObjects.rotation.y = - this.time / 60.0;
    
    // let camRot = this.cugetTangent(this.time / 10000);
    // this.mesh.position = camPos;
    // console.log( camPos );
    this.meshes.forEach(( mesh, idx ) => {
      const camPos = this.curve.getPoint( (this.time / 5.0 + idx * 1.7) / 50);
      mesh.position.set( camPos.x, camPos.y, camPos.z);
      // mesh.position.set( camPos.x + Math.sin( this.time / 5.0 ) * 20 + idx * 40 - 440, camPos.y + 50 - idx * 8.0, camPos.z - 100 );
    });
    // this.mesh.position.set(  );
    // this.shaderPass.uniforms.u_time.value = this.time / 10.0;

    this.composer.render();

    // console.log( this.camera.rotation );
  }
}

class ColorGUIHelper {
  constructor(object, prop) {
    this.object = object;
    this.prop = prop;
  }
  get value() {
    return `#${this.object[this.prop].getHexString()}`;
  }
  set value(hexString) {
    this.object[this.prop].set(hexString);
  }
}