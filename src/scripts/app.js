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
import { RoughnessMipmapper } from 'three/examples/jsm/utils/RoughnessMipmapper.js';
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min';
import Stats from 'stats.js';

import GUI from 'lil-gui';

import YouTubePlayer from 'youtube-player';

import VideoElement from './VideoElement';

import vid1ph from '../models/raumschiff_erde.jpeg';

import theFont from '../static/metropolis.json';
// import metropolisModel from '../models/untitled2.glb';
import metropolisModel from '../models/pabloausstellung.glb';
// import metropolisModel from '../models/assembled17.glb';
// import metropolisModel from '../models/sm4.glb';
import ant from '../models/lowpoly_ant/ant.glb';
import krabbe from '../models/krabbe.glb';
import '../../public/omegapunkt.mp4';
import still1 from '../../public/still1.jpg';
import still2 from '../../public/still2.jpg';
import still4 from '../../public/still4.jpg';

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

    this.INTERSECTED = null;

    this.mouse = new THREE.Vector2( 0.0, 0.0 );
    this.mouseSpeed = new THREE.Vector2( 0.0, 0.0 );
    this.oldMouseSpeed = new THREE.Vector2( 0.0, 0.0 );
    this.mouseAcc = new THREE.Vector2( 0.0, 0.0 );
    this.lMouseSpeed = new THREE.Vector2( 0.0, 0.0 );
    this.lMouse = new THREE.Vector2( 0.0, 0.0 );

    this.yAxis = new THREE.Vector3(0, 1, 0);


    this.scene = new THREE.Scene();
    const color = 0xffffff;
    const near = 100;
    const far = 300;
    this.scene.background = new THREE.Color( 0xbb99cc );
    this.scene.background.opacity = 0.1;
    this.scene.opacity = 0.5;
    // this.scene.fog = new THREE.Fog(color, near, far);
    this.camera = new THREE.PerspectiveCamera( 50, this.width / this.height, 0.1, 1000 );
    // this.camera.position.set( 20, 30, 50 );
    
    this.cityGroup = new THREE.Group();

    this.appParams = {
      zoomedOut: false,
      ambLight: {
        color: 0x281439,
        intensity: 10.0,
      }
    };

    const size = 100;
    const divisions = 10;
    
    const gridHelper = new THREE.GridHelper( size, divisions );
    // this.scene.add( gridHelper );

    const axesHelper = new THREE.AxesHelper( 50 );
    // this.scene.add( axesHelper );

    this.videoIds = [
      'iItaoaRG0NU',
      'aUwTFRghE-8',
      'GtvX_GIR1Kc',
      'yk9XWlgm5dU',
      'A3GJuPcvde4',
      '9pw6_Mg6E_c',
    ];

    this.videoObjects = new THREE.Group();

    this.matMetalness = 0.0;
    this.matColor = new THREE.Color( 0xa8ffbe );
    this.matOpacity = 1.0;
    this.matRoughness = 0.33;
    this.matReflectivity = 0.5;

    // this.stats = new Stats();
    // this.stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
    // document.body.appendChild( this.stats.dom );

    this.renderer = new THREE.WebGLRenderer( {
      antialias: true,
      alpha: true,
      // autoClear: true,
      powerPreference: "high-performance",
      // preserveDrawingBuffer: true,
    } );
    
    // this.renderer.autoClearColor = false;
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( this.width, this.height );
    this.renderer.setClearColor(0xffffff, 0.1);
    // this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    // this.renderer.toneMappingExposure = 1;
    // this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1;

    this.ytIndex = 0;
    this.ytIds = [
      'DkjMYlPEpOc',
      '98WltKGjwss',
      '3jaZajrxKU8',
      'beiQToIZFN8',
      'GqLWSsi_uhE',
    ];


    this.ytProgress = [
      0,
      0,
      0,
      0,
      0,
    ];

    this.ytTitles = [
      'Spaceship Earth',
      'Every Ant is a queen',
      'united humanity',
      'Time Stranger',
      'Omega Point'
    ];
    
    this.container.appendChild( this.renderer.domElement );
    this.infoOverlay = document.querySelector('#info-overlay');
    this.initialInfo = this.infoOverlay.innerHTML;

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
    this.controls.maxDistance = 500;
    this.controls.zoomSpeed = 0.3;
    this.controls.object.position.set(60,40,120);

    // this.controls = new PointerLockControls( this.camera, document.body );

    // this.controls = new FlyControls( this.camera, this.renderer.domElement );

    this.controls.movementSpeed = 1000;
    // this.controls.domElement = this.renderer.domElement;
    // this.controls.rollSpeed = Math.PI / 24;
    // this.controls.autoForward = false;
    // this.controls.dragToLook = false;

    this.mat = new THREE.MeshStandardMaterial( {
      color: this.matColor,
      metalness: this.matMetalness,
      roughness: this.matRoughness,
      opacity: this.matOpacity,
      // side: THREE.DoubleSide,
      transparent: true,
      // wireframe: true,
      // envMapIntensity: 5,
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

    this.raycaster = new THREE.Raycaster();

    this.resize();
    this.setupListeners();
    this.addFont();
    this.addObjects();
    this.initYoutube();
    // this.addScreens();
    this.addPlanets();
    this.addMovingText();
    this.addLights();
    // this.addGui();
    this.render();
  }

  initYoutube() {
    this.player = new YouTubePlayer('ytplayer', {
      playerVars: {
        controls: 0,
        fs: 0,
        rel: 0,
        playlist: 'PLKOpvjXJWuA6cn-Wel5TYt5ke5_5EAimV',
        modestbranding: 1,
        enablejsapi: 1,
        origin: window.location.hostname,
        showinfo: 0,
      }
    });
    // 'loadVideoById' is queued until the player is ready to receive API calls.
    
    this.player.on('stateChange', (e) => {
      console.log( 'State changed, ', e );
    });
  }

  playYt( ) {
    // arguments : index, startseconds
    this.player.loadVideoById( this.ytIds[ this.ytIndex ], this.ytProgress[ this.ytIndex ] );
    this.player.playVideo();
  }

  async pauseYt( ) {
    this.ytProgress[ this.ytIndex ] = await this.player.getCurrentTime();
    console.log( 'set the time to ', this.ytProgress );
    this.player.pauseVideo();
  }

  handleInteraction() {
    const that = this;
    // console.log( 'handleInteraction');
    if (new Date() - that.clickTime > 150) {
      // console.log( 'time' );
      return;
    }
    
    this.intersects = this.raycaster.intersectObjects( this.scene.children );

    // for ( let i = 0; i < this.intersects.length; i ++ ) {
    //   console.log( this.intersects );
      if ( that.intersects.length && that.intersects[ 0 ].object.name.length || that.appParams.zoomedOut ) {
        const n = that.intersects[ 0 ].object.name;
        const idx = n.split('-')[1];
        that.ytIndex = idx;
        that.onClick();
      }
    // }
  }

  onMouseMove( e ) {
    this.oldMouse = this.mouse;
    this.mouse.x = e.clientX / this.width * 2 - 1;
    this.mouse.y = - ( e.clientY / this.height ) * 2 + 1;
    // console.log( 'mousemove', this.mouse );
    // this.oldMouseSpeed = this.mouseSpeed;
    // this.mouseSpeed = new THREE.Vector2( Math.abs(Math.min((this.mouse.x - this.oldMouse.x) * 10, 1)), Math.abs(Math.min((this.mouse.y - this.oldMouse.y) * 10), 1));
    // this.mouseAcc = new THREE.Vector2( (this.mouse.x - e.clientX) - this.mouseSpeed.x , (this.mouse.y - this.height + e.clientY) - this.mouseSpeed.y );
    // this.shaderPass.uniforms.u_mouse.value = this.mouse;
  }

  setupListeners() {
    this.container.addEventListener( 'mousemove', this.onMouseMove.bind( this ) );
    window.addEventListener( 'resize', this.resize.bind( this ) );

    this.container.addEventListener( 'mousedown', () => {
      this.clickTime = new Date();
    });

    this.container.addEventListener( 'touchstart', () => {
      this.clickTime = new Date();
    });

    this.container.addEventListener( 'click', this.handleInteraction.bind( this ) );

    document.querySelector('.yt-wrap').addEventListener( 'click', () => {
      this.pauseYt();
    });
  }

  onClick() {
    if ( ! this.appParams.zoomedOut ) {
      console.log( 'case not zoomed' );
      this.appParams.zoomedOut = true;
      this.controls.maxDistance = 1500;
      this.infoOverlay.innerHTML = 'click to go back';
      this.infoOverlay.style.fontSize = '30px';
      this.playYt();
      const t = new TWEEN.Tween( this.controls.object.position )
      .to( {
        z: 1500 }, 4000 )
      .easing(TWEEN.Easing.Quadratic.Out)
      .onUpdate( ( z ) => {
      })
      .onComplete( () => {

      }).start();
    } else {
      console.log( 'case zoomed' );
      this.appParams.zoomedOut = false;
      this.controls.maxDistance = 500;
      this.infoOverlay.innerHTML = this.initialInfo;
      this.infoOverlay.style.fontSize = '100px';
      this.pauseYt();
      const t = new TWEEN.Tween( this.controls.object.position )
      .to( {
        x: 60,
        y: 40,
        z: 120,
      }, 4000 )
      .easing(TWEEN.Easing.Quadratic.Out)
      .onUpdate( ( z ) => {
      })
      .onComplete( () => {
      
      }).start();
    }
  }

  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize( this.width, this.height );
  }

  addLights() {
    const color = new THREE.Color( 0x27094a );
    const intensity = 10.0;
    this.light = new THREE.AmbientLight( this.appParams.ambLight.color, this.appParams.ambLight.intensity );
    
    this.scene.add(this.light);
    this.dirLight = new THREE.DirectionalLight(color, intensity );
    this.dirLight.position.set(0, 10, 0);

    // this.scene.add( this.dirLight );

    // this.scene.add( new THREE.AmbientLight( 0xffffff, 1.0 ) );

    // const light = new THREE.PointLight( 0xff0000, 1, 100 );
    // light.position.set( 50, 50, 50 );
    // this.scene.add( light );

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
    const gui = new GUI();
    const that = this;
    // gui.add( document, 'controls' );
    gui.add(this.appParams.ambLight, 'intensity', 0, 5, 0.1 ).onChange( ( val ) => {
      this.light.intensity = val;
    });
    gui.addColor(this.appParams.ambLight, 'color', 0, 5, 0.1 ).onChange( ( val ) => {
      this.light.color.setHex( val );
    });
    const objFolder = gui.addFolder( '3d object' );
    objFolder.add(this.mat, 'metalness', 0, 2, 0.01 ).onChange( ( val ) => {
      that.city.traverse( ( child ) => {
        if ( child.isMesh ) {
          child.material.metalness = val;

          child.material.needsUpdate = true;
        }
      } );
    });
    objFolder.add(this.mat, 'roughness', 0, 2, 0.01 ).onChange( ( val ) => {
      that.city.traverse( ( child ) => {
        if ( child.isMesh ) {
          child.material.roughness = val;
          child.material.needsUpdate = true;
        }
      } );
    });
    objFolder.add(this.mat, 'opacity', 0, 2, 0.01 ).onChange( ( val ) => {
      that.city.traverse( ( child ) => {
        if ( child.isMesh ) {
          child.material.opacity = val;
          child.material.needsUpdate = true;
        }
      } );
    });
    objFolder.add(this.mat, 'wireframe' ).onChange( ( val ) => {
      that.city.traverse( ( child ) => {
        if ( child.isMesh ) {
          child.material.wireframe = val;
          child.material.needsUpdate = true;
        }
      } );
    });
    objFolder.addColor(this.mat, 'color' ).onChange( ( val ) => {
      that.city.traverse( ( child ) => {
        if ( child.isMesh ) {
          child.material.color = val;
          child.material.needsUpdate = true;
        }
      } );
    });
    objFolder.addColor(this.mat, 'emissive' ).onChange( ( val ) => {
      that.city.traverse( ( child ) => {
        if ( child.isMesh ) {
          child.material.emissive = val;
          child.material.needsUpdate = true;
        }
      } );
    });
  }

  addFont() {
    const font = new Font( theFont );

    const textToShow = 'the future is coming soon';
    this.fontGeometries = [];
    this.fontMeshes = [];
    for ( let i = 0; i<textToShow.length; i++) {
      const glyphMaterial = new THREE.MeshStandardMaterial( {
        color: 0xcc3399,
        emissive: 0x110011,
        metalness: 1,
        roughness: 0,
      } );
  
      const glyphGeometry = new TextGeometry( textToShow[ i ], {
        font: font,
        size: 29,
        height: 17,
        curveSegments: 2,
        // bevelEnabled: true,
        // bevelThickness: 0.1,
        // bevelSize: 0.8,
        // bevelOffset: 0,
        // bevelSegments: 2
      } );

      this.fontGeometries.push( glyphGeometry );
      const theMesh = new THREE.Mesh( glyphGeometry, glyphMaterial );
      theMesh.name = textToShow[ i ];
      theMesh.lookAt( 0, 0, 0 );
      this.fontMeshes.push( theMesh );
      this.scene.add( theMesh );
    }
  }

  addObjects() {

    const that = this;
    // fontLoader.load( fontLoader.parse( theFont ), function ( font ) {
      // this.geometry = 
    // } );

    // this.geometry = new THREE.BoxGeometry( 20, 20, 20 );



    new RGBELoader()
    .setDataType( THREE.UnsignedByteType )
    .load( environment, function ( texture ) {

      // var roughnessMipmapper = new RoughnessMipmapper( that.renderer );
      const pmremGenerator = new THREE.PMREMGenerator( that.renderer );
      pmremGenerator.compileEquirectangularShader();
      const envMap = pmremGenerator.fromEquirectangular( texture ).texture;
      // console.log( envMap.mesh, envMap.material );
      that.scene.background = null;
      that.scene.environment = envMap;

      that.sphereGeometry = new THREE.SphereGeometry( 500, 60, 40 );
      // invert the geometry on the x-axis so that all of the faces point inward
      that.sphereGeometry.scale( - 1, 1, 1 );
      that.material = new THREE.MeshBasicMaterial( {
        color: 0xffffff,
        envMap: envMap,
      } );
      that.bgMesh = new THREE.Mesh( that.sphereGeometry, that.material );
      that.bgMesh.material.color.set( {r:255, g:255, b:255 } );
      that.scene.add( that.bgMesh );
      // let bgGeom = THREE.SphereGeometry( 100, 60, 40 );
      // const bgMat = THREE.MeshBasicMaterial( {
      //   color: 0xffff22,
      //   // map: envMap,
      //   side: THREE.DoubleSide
      // });
      // const bgMesh = new THREE.Mesh( bgGeom, bgMat );
      // that.scene.add( bgMesh );
      // bgGeom = new THREE.SphereGeometry( 870, 60, 40 );
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

      that.loader.load( ant, ( gltf ) => {
        that.realAnt = gltf.scene.children[0];
        that.realAnt.name = 'interactive-1';
        that.realAnt.material.metalness = 0.7;
        that.realAnt.material.roughness = .33;
        that.realAnt.material.envMap = envMap;
        that.realAnt.material.color.setHex( 0xffff );
        that.realAnt.position.set( 33, 0, 32 );
        that.realAnt.scale.set( 1.8, 1.8, 1.8 );
        that.scene.add( that.realAnt );
      });

      if ( true ) {
        that.loader.load( metropolisModel,
          function ( gltf ) {
            console.log( gltf );
            gltf.scene.scale.set(3,3,3);
            gltf.scene.traverse( function ( child ) {
            if ( child.isMesh ) {
              // child.name = 'model';
              console.log( 'is a mesh', child );
              
              // console.log( child.material );
              child.material.metalness = 0.0;
              child.material.envMap = envMap;
              // child.material.opacity = 1.0;
              // child.material.reflectivity = 0.7;
              child.material.roughness = .33;
              // child.material.refractionRatio = 1.0;
              // if ( child.material.color )
              // child.material.copy( that.mat );
              // child.side = THREE.DoubleSide;
              // child.material.blending = THREE.MultiplyBlending;
              // child.depthTest = false;
              // child.material.transparent = true;
              child.material.color = that.matColor;
              child.material.needsUpdate = true;
              // child.material.map.needsUpdate = true;
              if ( child.isMesh ) {
                // roughnessMipmapper.generateMipmaps( child.material );
                // child.rotation.x = -2 * 3.14;
              }
            }
          } );

          // that.city = gltf.scene.children[5];
          // that.city.geometry.center();

          gltf.scene.rotateX( Math.PI );
          that.city = gltf.scene;
          gltf.scene.position.x = -0.05;
          gltf.scene.position.y = 36.13;
          gltf.scene.position.z = -0.16;
          
          that.scene.add( that.city );
          loader.style.display = 'none';
        },
        function ( xhr ) {
          loader.innerText = 'loading...';
        },
        function ( error ) {
          console.log( 'An error happened', error );
        });
      }
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
    const curveWidth = 200;
    randomPoints.push( new THREE.Vector3(-curveWidth,-curveWidth/2,-curveWidth/2) );
    randomPoints.push( new THREE.Vector3(0,0,curveWidth) );
    randomPoints.push( new THREE.Vector3(curveWidth,-curveWidth/2,curveWidth/2) );
    randomPoints.push( new THREE.Vector3(0,0,-curveWidth) );
    // randomPoints.push( new THREE.Vector3(-curveWidth,-curveWidth/2,-curveWidth) );
    // randomPoints.push( new THREE.Vector3(curveWidth,0,curveWidth) );
    
    this.curve = new THREE.CatmullRomCurve3( randomPoints, true, 'centripetal', 0.9 );
    // const points = this.curve.getPoints( 50 );
    // const geometry = new THREE.BufferGeometry().setFromPoints( points );
    
    // const material = new THREE.LineBasicMaterial( { color : 0xaa33cc } );
    // const splineObject = new THREE.Line( geometry, material );
    // this.scene.add( splineObject );

  }

  addPlanets() {
    this.planets = [];
    const geom1 = new THREE.SphereGeometry( 50, 60, 40 );
    const video1 = document.getElementById( 'vid1' );
    video1.play();
    const texture1 = new THREE.VideoTexture( video1 );
    const mat1 = new THREE.MeshBasicMaterial( {
      color: 0xffffff,
      map: texture1,
      side: THREE.DoubleSide,
    } );
    const mesh1 = new THREE.Mesh(geom1, mat1);
    mesh1.position.set( 10, -50, 20 );
    mesh1.rotation.z = Math.PI / 6;
    mesh1.name = 'planet-4';
    this.planets.push( mesh1 );
    this.scene.add( mesh1 );

    const geom2 = new THREE.SphereGeometry( 50, 60, 40 );
    const texture2 = new THREE.TextureLoader().load( still1 );
    const mat2 = new THREE.MeshBasicMaterial( {
      color: 0xffffff,
      map: texture2,
      side: THREE.DoubleSide,
    } );
    const mesh2 = new THREE.Mesh(geom2, mat2);
    mesh2.position.set( 60, -10, 20 );
    mesh2.rotation.z = Math.PI / 6;
    mesh2.name = 'planet-0';
    this.planets.push( mesh2 );
    this.scene.add( mesh2 );

    const geom3 = new THREE.SphereGeometry( 50, 60, 40 );
    const texture3 = new THREE.TextureLoader().load( still2 );
    const mat3 = new THREE.MeshBasicMaterial( {
      color: 0xffffff,
      map: texture3,
      side: THREE.DoubleSide,
    } );
    const mesh3 = new THREE.Mesh(geom3, mat3);
    mesh3.position.set( 20, 50, -20 );
    mesh3.rotation.z = Math.PI / 6;
    mesh3.name = 'planet-2';
    this.planets.push( mesh3 );
    this.scene.add( mesh3 );

    const geom4 = new THREE.SphereGeometry( 50, 60, 40 );
    const texture4 = new THREE.TextureLoader().load( still4 );
    const mat4 = new THREE.MeshBasicMaterial( {
      color: 0xffffff,
      map: texture4,
      side: THREE.DoubleSide,
    } );
    const mesh4 = new THREE.Mesh(geom4, mat4);
    mesh4.position.set( 20, 100, -20 );
    mesh4.rotation.z = Math.PI / 6;
    mesh4.name = 'planet-3';
    this.planets.push( mesh4 );
    this.scene.add( mesh4 );
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

    this.time+= 0.05;
    this.updateMouse();
    // this.camera.updateMatrixWorld();
    this.controls.update( this.clock.getDelta() );

    // this.shaderPass.uniforms.u_mouse.value = this.mouse;
    // this.shaderPass.uniforms.u_mouseSpeed.value = this.lMouseSpeed;

    // this.controls.movementSpeed = 8.3;

    this.prevTime = this.time;
    // this.mesh.rotation.x = this.time / 10;
    // this.mesh.rotation.y = this.time / 30;

    if ( Math.abs( this.dampenedMouseX - this.targetX ) > 0.0001 ) {
      this.dampenedMouseX += ( this.targetX - this.dampenedMouseX ) * DAMPENING_FACTOR;
    }

    if ( Math.abs( this.dampenedMouseY - this.targetY ) > 0.0001 ) {
      this.dampenedMouseY += ( this.targetY - this.dampenedMouseY ) * DAMPENING_FACTOR;
    }

    // select the Z world axis
    // rotate the mesh 45 on this axis

    if ( this.city ) {
      this.city.rotation.y = -this.time / 70.0;
      this.realAnt.rotation.y = -this.time / 70.0;
    }

    // this.videoObjects.rotation.y = - this.time / 60.0;
    
    // let camRot = this.cugetTangent(this.time / 10000);
    // this.mesh.position = camPos;
    // console.log( camPos );
    this.fontMeshes.forEach(( mesh, idx ) => {
      const camPos = this.curve.getPoint( (-this.time / 5.0 - idx * 1.1) / 50);
      mesh.position.set( camPos.x, camPos.y, camPos.z);
      mesh.lookAt( 0,0,0 );
      // mesh.rotation.y = -this.time / 70.0 * ( idx % 2 );
      // mesh.position.set( camPos.x + Math.sin( this.time / 5.0 ) * 20 + idx * 40 - 440, camPos.y + 50 - idx * 8.0, camPos.z - 100 );
    });
    // this.mesh.position.set(  );
    // this.shaderPass.uniforms.u_time.value = this.time / 10.0;

    this.raycaster.setFromCamera( this.mouse, this.camera );

    TWEEN.update();

    this.intersects = this.raycaster.intersectObjects( this.scene.children, false );
    // console.log( this )

    if ( ! this.appParams.zoomedOut ) {

      if ( this.intersects.length > 0 ) {

        if ( this.INTERSECTED != this.intersects[ 0 ].object ) {

          if ( this.INTERSECTED && this.INTERSECTED.material && this.INTERSECTED.material.emissive && this.INTERSECTED.material && this.INTERSECTED.material.emissive ) {
            // this.INTERSECTED.material.emissive.setHex( this.INTERSECTED.currentHex );
            this.INTERSECTED.material.needsUpdate = true;
          }


          if ( this.INTERSECTED && ( this.INTERSECTED.name.includes( 'interactive' ) || this.INTERSECTED.name.includes( 'planet' ) )&& this.INTERSECTED.material && this.INTERSECTED.material.color ) {
            this.INTERSECTED.material.color.setHex( 0xffffff );
            this.container.style.cursor = 'default';
            this.infoOverlay.innerHTML = this.initialInfo;
          }

          if ( this.INTERSECTED && this.INTERSECTED.name.includes( 'Leg' ) ) {
            
          }

          this.INTERSECTED = this.intersects[ 0 ].object;
          console.log( this.INTERSECTED.name );

          if ( this.INTERSECTED && this.INTERSECTED.material && this.INTERSECTED.material.emissive ) {
            // this.INTERSECTED.currentHex = this.INTERSECTED.material.emissive.getHex();
            // this.INTERSECTED.material.emissive.setHex( 0xcc11ff );
          }

          if ( this.INTERSECTED && ( this.INTERSECTED.name.includes( 'interactive' ) || this.INTERSECTED.name.includes( 'planet' ) ) && this.INTERSECTED.material && this.INTERSECTED.material.color ) {
            this.INTERSECTED.material.color.setHex( 0xaacc22 );
            this.container.style.cursor = 'pointer';
            const n = this.INTERSECTED.name;
            const idx = n.split('-')[1];
            this.infoOverlay.innerHTML = this.ytTitles[ idx ];
          }

        }

      } else { 

        if ( this.INTERSECTED && this.INTERSECTED.material && this.INTERSECTED.material.emissive ) {
          // this.INTERSECTED.material.emissive.setHex( this.INTERSECTED.currentHex );
        }
        this.INTERSECTED = null;
        this.infoOverlay.innerHTML = this.initialInfo;

      }
    }

    if ( this.planets ) {
      const radius = 300;
      for (let index = 0; index < this.planets.length; index++) {
        const posIdx = index + 1;
        const element = this.planets[index];
        element.rotation.y = -this.time / 10.0;
        element.position.x = Math.sin( Math.PI/ 2 * index + this.time / 40 ) * radius;
        element.position.y = Math.cos( Math.PI/ 2 * index - this.time / 10 ) * radius / 4.;
        element.position.z = Math.cos( Math.PI/ 2 * index + this.time / 40 ) * radius;
      }
    }


    // this.stats.begin();
    this.renderer.render( this.scene, this.camera );
    // this.stats.end();
    
    window.requestAnimationFrame( this.render.bind( this ) );

    // console.log( this.camera.rotation );
  }
}