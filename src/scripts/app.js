import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FlyControls } from 'three/examples/jsm/controls/FlyControls.js';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { FontLoader, Font } from 'three/examples/jsm/loaders/FontLoader.js';
// import { RoughnessMipmapper } from 'three/examples/jsm/utils/RoughnessMipmapper.js';

import * as dat from 'dat.gui';
import VideoElement from './VideoElement';

import theFont from '../static/font3.json';
import metropolisModel from '../models/untitled.glb';

import environment from '../static/bg.hdr';

export default class Sketch {
  constructor( options ) {
    console.log( 'xxx', options );
    this.time = 0;
    this.prevTime = 0;
    this.container = options.dom;

    this.clock = new THREE.Clock();

    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;

    this.scene = new THREE.Scene();
    const color = 0xffffff;
    const near = 100;
    const far = 300;
    this.scene.background = new THREE.Color( 0xbb99cc );
    this.scene.background.opacity = 0.1;
    this.scene.opacity = 0.5;
    // this.scene.fog = new THREE.Fog(color, near, far);
    this.camera = new THREE.PerspectiveCamera( 100, this.width / this.height, 0.1, 1000 );
    this.camera.position.z = 30;
    this.camera.position.x = 0;
    this.camera.position.y = 10;

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
      antialias: false,
      alpha: true,
      autoClear: true,
      powerPreference: "high-performance",
      preserveDrawingBuffer: true,
    } );
    // this.renderer.autoClearColor = false;
    this.renderer.setSize( this.width, this.height );
    // this.renderer.setClearColor(0x000000, 0.1);
    // this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    // this.renderer.toneMappingExposure = 1;
    // this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.shadowMap.enabled = true;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.container.appendChild( this.renderer.domElement );

    // this.controls = new OrbitControls( this.camera, this.renderer.domElement );

    // this.controls = new PointerLockControls( this.camera, document.body );

    this.controls = new FlyControls( this.camera, this.renderer.domElement );

    this.controls.movementSpeed = 1000;
    this.controls.domElement = this.renderer.domElement;
    this.controls.rollSpeed = Math.PI / 24;
    this.controls.autoForward = false;
    this.controls.dragToLook = false;

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
    this.addScreens();
    this.addMovingText();
    this.addLights();
    this.addGui();
    this.render();
  }

  setupListeners() {
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
    const intensity = 0.5;
    this.light = new THREE.AmbientLight(color, intensity);
    this.scene.add(this.light);
    this.dirLight = new THREE.DirectionalLight(color, intensity );
    this.dirLight.position.set(0, 10, 0);
    this.scene.add(this.dirLight);

    this.scene.add( new THREE.AmbientLight( 0x222222 ) );

    const pointLight1 = new THREE.PointLight( 0x22ffff );
    pointLight1.position.set( 150, 10, 0 );
    pointLight1.castShadow = false;
    this.scene.add( pointLight1 );

    const pointLight2 = new THREE.PointLight( 0xff22ff );
    pointLight2.position.set( - 150, 0, 0 );
    this.scene.add( pointLight2 );

    const pointLight3 = new THREE.PointLight( 0xfff33f );
    pointLight3.position.set( 0, - 10, - 150 );
    this.scene.add( pointLight3 );

    const pointLight4 = new THREE.PointLight( 0xf2fff2 );
    pointLight4.position.set( 0, 0, 150 );
    this.scene.add( pointLight4 );
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
            child.material.metalness = 0.1;
            child.material.opacity = 1.0;
            child.material.reflectivity = 0.2;
            child.material.roughness = 0.7;
            child.material.refractionRatio = 0.5;
            // if ( child.material.color )
              // child.material.copy( that.mat );
            child.side = THREE.DoubleSide;
            // child.material.blending = THREE.MultiplyBlending;
            child.depthTest = false;
            // child.material.transparent = true;
            // child.material.color = 0xff22ff;
            child.material.needsUpdate = true;
            // child.material.map.needsUpdate = true;
          if ( child.isMesh ) {
            // roughnessMipmapper.generateMipmaps( child.material );
            child.rotation.x = -2 * 3.14;
          }
          }
        } );

        that.city = gltf.scene.children[5];
        that.city.geometry.center();

        that.scene.add( that.city );
        loader.style.display = 'none';
      },
      function ( xhr ) {
        loader.innerText = 'loading...';
      },
      // called when loading has errors
      function ( error ) {
        console.log( 'An error happened', error );
      });

    } );
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
    }

    this.scene.add( this.videoObjects );
  }

  render() {
    window.requestAnimationFrame( this.render.bind( this ) );
    this.time+= 0.05;

    this.controls.movementSpeed = 5.3;
    this.controls.update( this.clock.getDelta() );

    this.prevTime = this.time;
    // this.mesh.rotation.x = this.time / 10;
    // this.mesh.rotation.y = this.time / 30;

    if ( this.city ) {
      this.city.rotation.y = this.time / 50.0;
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

    this.renderer.render( this.scene, this.camera );

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