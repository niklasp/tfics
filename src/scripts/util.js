import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

/**
 * @param {Function} onRatioChange The callback when the scroll ratio changes
 */
 export const monitorScroll = onRatioChange => {
  const html = document.documentElement;
  const body = document.body;

  window.addEventListener('scroll', () => {
    onRatioChange(
      (html.scrollTop || body.scrollTop)
      /
      ((html.scrollHeight || body.scrollHeight) - html.clientHeight)
    );
  });
};

/**
 * Load models from glb / gltf
 * @param {*} onComplete 
 * @param {*} onLoad 
 * @param {*} onError 
 */
export const loadModels = ( onComplete, onLoad, onError ) => {
  const that = this;
  this.loader = new GLTFLoader();
  this.loader.load(
    // resource URL
    model,
    // called when the resource is loaded
    function ( gltf ) {
      onComplete( gltf );
    },
    // called while loading is progressing
    function ( xhr ) {
      onLoad( xhr );
    },
    // called when loading has errors
    function ( error ) {
      onError( error );
    }
  );
};
