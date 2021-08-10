import '../styles/index.scss';
import Sketch from './app.js';

if (process.env.NODE_ENV === 'development') {
  require('../index.html');
}

document.addEventListener(
  'DOMContentLoaded',
  () => {
    new Sketch({
      dom: document.getElementById( 'threejs-container' )
    });
  },
  false
);




