import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js';

import { monitorScroll } from './util';

import djset from '../models/djset/model.glb';

export default class Sketch {
  constructor( options ) {

    this.loadModels.bind( this );
    this.time = 0;
    this.container = options.dom;
    this.scrollPercentage = 0.0;

    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;

    console.log( this.width, this.height );

    const fov = 40;
    const near = 0.01;
    const far = 100;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera( fov, this.width / this.height, near, far );
    this.camera.position.z = 1;

    const gridHelper = new THREE.GridHelper( 100, 100 );
    // this.scene.add( gridHelper );

    this.renderer = new THREE.WebGLRenderer( {
      antialias: false,
      // alpha: true,
      autoClear: true,
      powerPreference: "high-performance",
      // preserveDrawingBuffer: true,
    } );

    this.renderer.setSize( this.width, this.height );
    this.container.appendChild( this.renderer.domElement );

    // this.controls = new OrbitControls( this.camera, this.renderer.domElement );

    this.setupListeners();
    this.loadModels();
    this.addLights();
    this.addObjects();
    this.render();
    this.resize();
  }

  setupListeners() {
    window.addEventListener( 'resize', this.resize.bind( this ) );
    monitorScroll(ratio => {
      this.scrollPercentage = (ratio).toFixed(3);
    });
  }

  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer.setSize( this.width, this.height );
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
  }

  loadModels() {
    const that = this;
    this.loader = new GLTFLoader();
    this.loader.load(
      // resource URL
      djset,
      // called when the resource is loaded
      function ( gltf ) {

        console.log( gltf.scene );

        gltf.scene.rotateY( Math.PI );
        gltf.scene.position.set( -3, -1.1, -5 );

        that.scene.add( gltf.scene );

        gltf.animations; // Array<THREE.AnimationClip>
        gltf.scene; // THREE.Group
        gltf.scenes; // Array<THREE.Group>
        gltf.cameras; // Array<THREE.Camera>
        gltf.asset; // Object

      },
      // called while loading is progressing
      function ( xhr ) {
        // console.log( xhr );
        // console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
      },
      // called when loading has errors
      function ( error ) {
        console.log( 'An error happened', error );
      }
    );
  }

  addLights() {
    const color = new THREE.Color( 0x7777FF );
    const intensity = 0.1;

    const l1color = 0x22ffff;
    const l2color = 0xff22ff;
    const l3color = 0xccccff;

    this.light = new THREE.AmbientLight(color, intensity);
    this.scene.add( this.light );

    this.light1pos = new THREE.Vector3( 0, 2, 0 );
    this.light2pos = new THREE.Vector3( -3, 2, -3 );

    this.pointLight1 = new THREE.PointLight( l1color );
    this.pointLight1.castShadow = true;
    this.scene.add( this.pointLight1 );

    this.pointLight2 = new THREE.PointLight( l2color );
    this.pointLight2.castShadow = true;
    this.scene.add( this.pointLight2 );

    this.pointLight3 = new THREE.PointLight( l3color );
    this.pointLight3.castShadow = true;
    this.pointLight3.position.copy( new THREE.Vector3( 0, 3, -15 ) );
    this.scene.add( this.pointLight3 );

    const lightCurve = [];
    lightCurve.push( new THREE.Vector3(5,0,0) );
    lightCurve.push( new THREE.Vector3(0,0,5) );
    lightCurve.push( new THREE.Vector3(-5,0,0) );
    lightCurve.push( new THREE.Vector3(0,0,-5) );

    this.curve = new THREE.CatmullRomCurve3( lightCurve );
    this.curve.closed = true;

    const l1geom = new THREE.ConeGeometry( 0.5, 2, 3 );
    const l1mat = new THREE.MeshBasicMaterial( { color: l1color } );
    this.l1sphere = new THREE.Mesh( l1geom, l1mat );
    this.scene.add( this.l1sphere );

    let l2geom = new THREE.ConeGeometry( 0.5, 2, 3 );
    l2geom = new THREE.WireframeGeometry( l2geom );
    const l2mat = new THREE.MeshBasicMaterial( { color: l2color } );
    this.l2sphere = new THREE.Mesh( l2geom, l2mat );
    this.scene.add( this.l2sphere );
  }

  addObjects() {
    this.geometry = new THREE.BoxGeometry( 0.4, 0.4, 0.4 );
    this.material = new THREE.MeshNormalMaterial();

    this.material = new THREE.ShaderMaterial({
      fragmentShader: `
        void main() {
          gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0);
        }
      `,
      vertexShader: `
        void main() {
          gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }
      `,
    });

    // this.mesh = new THREE.Mesh( this.geometry, this.material );
    // this.scene.add( this.mesh );

    const matFloor = new THREE.MeshPhongMaterial();
    const geoFloor = new THREE.PlaneGeometry( 2000, 2000 );
    const mshFloor = new THREE.Mesh( geoFloor, matFloor );
		mshFloor.rotation.x = - Math.PI * 0.5;
    mshFloor.receiveShadow = true;
    mshFloor.position.set( 0, - 0.05, 0 );
    this.scene.add( mshFloor );

    const camCurve = [];
    camCurve.push( new THREE.Vector3(0,3,17) );
    camCurve.push( new THREE.Vector3(0,3,7) );
    camCurve.push( new THREE.Vector3(6,3,-8) );
    camCurve.push( new THREE.Vector3(4,3,-10) );
    camCurve.push( new THREE.Vector3(0,2,-12) );

    this.camCurve = new THREE.CatmullRomCurve3( camCurve ); 

    const points = this.camCurve.getPoints( 50 );
    const geometry = new THREE.BufferGeometry().setFromPoints( points );
    const material = new THREE.LineBasicMaterial( { color : 0xff33cc } );
    const splineObject = new THREE.Line( geometry, material );
    this.scene.add( splineObject );

    const positionToLookAt = new THREE.Vector3(-1, -5.1, 10);
    this.camStartQuat = this.camera.quaternion.clone(); //set initial angle
    this.camera.lookAt(positionToLookAt);
    this.camEndQuat = this.camera.quaternion.clone(); //set destination angle
    this.camera.quaternion.copy(this.camStartQuat);

  }

  render() {
    this.time += 0.05;

    const camPos = this.camCurve.getPoint( this.scrollPercentage );
    // new TWEEN.Tween( this.camera.position ).to( {
    //   x: camPos.x,
    //   y: camPos.y,
    //   z: camPos.z,
    // }, 100 )
    //   .easing( TWEEN.Easing.Quadratic.Out ).start();
    // TWEEN.update();
    // this.mesh.rotation.x = this.time / 20;
    // this.mesh.rotation.y = this.time / 10;

    // this.pointLight1.position.z = Math.sin( this.time ) * 100;
    this.pointLight2.position.z = Math.sin( this.time ) * 100;

    const light1pos = this.curve.getPoint( this.time / 10 );
    this.pointLight1.position.set( this.light1pos.x + light1pos.x, this.light1pos.y + light1pos.y, this.light1pos.z + light1pos.z );

    const light2pos = this.curve.getPoint( this.time / 20 );
    this.pointLight2.position.set( this.light2pos.x + light2pos.x, this.light2pos.y + light2pos.y, this.light2pos.z + light2pos.z );
    
    this.l1sphere.position.set(  this.light1pos.x + light1pos.x, this.light1pos.y + light1pos.y, this.light1pos.z + light1pos.z );
    this.l2sphere.position.set( this.light2pos.x + light2pos.x, this.light2pos.y + light2pos.y, this.light2pos.z + light2pos.z );

    this.pointLight2.power = (Math.sin( this.time * 3 ) + 1) * 12;

    
    // this.camera.lookAt( new THREE.Vector3( 1, 1.1, -10 ) );
    this.camera.position.set( camPos.x, camPos.y, camPos.z );
    this.camera.quaternion.slerpQuaternions(this.camStartQuat, this.camEndQuat, this.scrollPercentage * this.scrollPercentage );
    
    this.renderer.render( this.scene, this.camera );
    window.requestAnimationFrame( this.render.bind( this ) );
  }
}