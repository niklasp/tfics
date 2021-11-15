uniform vec2 u_resolution;  // Canvas size (width,height)
uniform vec2 u_mouse;       // mouse position in screen pixels
uniform float u_time;       // Time in seconds since load

varying vec2 vUv;

void main() {
  gl_FragColor = vec4(abs(sin(u_time)), vUv.x, vUv.y, 1.0);
}