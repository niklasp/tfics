#include <common>
uniform float u_time;       // Time in seconds since load
varying vec2 vUv;
uniform vec3 u_moveVector;
uniform sampler2D tDiffuse;
uniform float opacity;

float distortionAmount = 0.0;

float circle(vec2 uv, float radius, float sharpness ) {
  vec2 tempUV = uv - vec2(0.5);
  return smoothstep(
    radius - radius * sharpness,
    radius + radius * sharpness,
    dot( tempUV, tempUV ) * 4.
  );
}

// 2D Random
float random (vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))
                 * 43758.5453123);
}

// 2D Noise based on Morgan McGuire @morgan3d
// https://www.shadertoy.com/view/4dS3Wd
float noise (vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    // Smooth Interpolation

    // Cubic Hermine Curve.  Same as SmoothStep()
    vec2 u = f*f*(3.0-2.0*f);
    // u = smoothstep(0.,1.,f);

    // Mix 4 coorners percentages
    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

void main() {
  vec2 multiplier = vec2(1.0);
  vec2 distanceUV = vUv - vec2(0.5);
  vec2 noiseUV = vUv - vec2(0.5);
  // float distance = circle( vUv, u_circleScale, 0.2 + u_circleScale );
  float swirl = noise( vec2( noise( vec2( length(noiseUV) - u_time / 3.) * 4.), length(noiseUV) ));
  vec2 swirlDistort = swirl * noiseUV * 2.5;

  float distortionTarget = length( u_moveVector );
  distortionAmount = ( distortionTarget - distortionAmount ) * 0.1;

  vec2 newUv = (vUv - vec2( 0.5 )) * multiplier + vec2( 0.5 );
  // newUv += swirlDistort * .2;
  newUv = (1. + distortionAmount ) * vUv;

  // vec4 video = texture2D( u_video, newUv );
  // vec4 image = texture2D( u_image, newUv );

  // vec4 final = vec4(newUv, vNormal.z, 1.0);
  // gl_FragColor = final;
  vec4 texel = texture2D( tDiffuse, newUv );
  gl_FragColor = opacity * texel;


  // gl_FragColor = vec4( swirlDistort, 0., 1.);
}