uniform vec2 u_resolution;  // Canvas size (width,height)
uniform vec2 u_mouse;
uniform vec2 u_dMouse;
uniform vec2 u_mouseDampened;       // mouse position in screen pixels
uniform float u_time;       // Time in seconds since load
uniform sampler2D tDiffuse;
uniform vec2 resolution;
uniform float pixelSize;

varying highp vec2 vUv;
varying vec3 vNormal;

float dampenedStrength = 0.;

void main() {
  dampenedStrength += ( u_dMouse.x - dampenedStrength ) * 0.1;
  vec2 vUvNormal = vec2( vUv - 0.5 );
  vec2 vUvMouse = vec2( vUv.x - u_mouse.x, vUv.y - u_mouse.y);
  vec2 dxy = pixelSize / resolution * length(-vUvMouse) * ( dampenedStrength * 10. + 0.01 );
  vec2 coord = dxy * floor( vUv / dxy );
  gl_FragColor = texture2D(tDiffuse, coord);
}