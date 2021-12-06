uniform vec2 u_resolution;  // Canvas size (width,height)
uniform vec2 u_mouse;
uniform vec2 u_dMouse;
uniform vec2 u_mouseDampened;       // mouse position in screen pixels
uniform vec2 u_mouseSpeed;
uniform float u_time;       // Time in seconds since load
uniform sampler2D tDiffuse;
uniform vec2 resolution;
uniform float pixelSize;

varying highp vec2 vUv;
varying vec3 vNormal;

float dampenedStrength = 0.;

void main() {
  // dampenedStrength += ( u_dMouse.x - dampenedStrength ) * 0.1;
  // vec2 vUvNormal = vec2( vUv - 0.5 );
  // vec2 vUvMouse = vec2( vUv.x - u_mouse.x, vUv.y - u_mouse.y);
  // vec2 dxy = pixelSize / resolution * length(-vUvMouse) * ( dampenedStrength * 10. + 0.01 );
  // vec2 coord = dxy * floor( vUv / dxy );
  // gl_FragColor = texture2D( tDiffuse, coord );

  vec2 vUvNormal = vec2( vUv - 0.5 );
  vec2 vUvMouse = vec2( vUv.x - u_mouse.x, vUv.y - u_mouse.y);
  vec2 dxy = pixelSize * 2./ resolution;
  float circle = smoothstep(
    0.8,
    1.,
    dot(vUvNormal, vUvNormal) * 4.
  );
  vec2 pixelated = (dxy * floor( vUv / dxy ) );
  // gl_FragColor = texture2D(tDiffuse, pixelated - circle);
  gl_FragColor = texture2D( tDiffuse, vUv + vUvNormal / 4.); // add border effect lines
  gl_FragColor = texture2D( tDiffuse, vUv + (1. - circle) * vUvNormal / 4.); // dont distort center with circle
  gl_FragColor = texture2D( tDiffuse, vUv + ( pixelated - 0.5 )* ( circle ) * u_mouseSpeed * 3.5 ); //somehow working
  // gl_FragColor = vec4( circle, circle, circle, 1.0 );
}