uniform vec2 u_resolution;  // Canvas size (width,height)
uniform vec2 u_mouse;       // mouse position in screen pixels
uniform float u_time;       // Time in seconds since load

varying vec2 vUv;
varying vec3 vNormal;

void main() {
  gl_FragColor = vec4(vUv, 0.0, 1.0);
  gl_FragColor = vec4(vNormal, 1.0);
}