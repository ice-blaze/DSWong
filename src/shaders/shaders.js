const shader_vertex_source=`
attribute vec3 coordinates;
uniform vec2 screen_size_in;
varying vec2 screen_size_out;

void main(void) {
  screen_size_out = screen_size_in;
  gl_Position = vec4(coordinates, 1.0);
}`;

const shader_fragment_source=`
precision mediump float;
varying vec2 screen_size_out;

const int MAX_MARCHING_STEPS = 255;
const float MIN_DIST = 0.0;
const float MAX_DIST = 100.0;
const float EPSILON = 0.0001;

float sphereSDF(vec3 samplePoint) {
    return length(samplePoint) - 1.0;
}

float sceneSDF(vec3 samplePoint) {
  return sphereSDF(samplePoint);
}

float shortestDistanceToSurface(vec3 eye, vec3 marchingDirection, float start, float end) {
    float depth = start;
    for (int i = 0; i < MAX_MARCHING_STEPS; i++) {
        float dist = sceneSDF(eye + depth * marchingDirection);
        if (dist < EPSILON) {
          return depth;
        }
        depth += dist;
        if (depth >= end) {
            return end;
        }
    }
    return end;
}

vec3 rayDirection(float fieldOfView, vec2 size, vec2 fragCoord) {
  vec2 xy = fragCoord - size / 2.0;
  float z = size.y / tan(radians(fieldOfView) / 2.0);
  return normalize(vec3(xy, -z));
}

void main(void) {
  vec3 dir = rayDirection(45.0, screen_size_out.xy, gl_FragCoord.xy);
  vec3 eye = vec3(0.0, 0.0, 5.0);
  float dist = shortestDistanceToSurface(eye, dir, MIN_DIST, MAX_DIST);

  if (dist > MAX_DIST - EPSILON) {
    // Didn't hit anything
    gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
    return;
  }

  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}`;
