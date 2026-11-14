// The two small programs the graphics card runs to draw each film panel.
// They are written in GLSL (the language of WebGL). Every "uniform" is a value
// sent from components/ring/gl.ts before a panel is drawn; change the numbers
// here to change the look.

// ---------------------------------------------------------------------------
// VERTEX SHADER: where each point of a panel lands on the screen.
// A panel is a flat grid of 48 × 24 little squares. This runs once for every
// corner of every square, so the panel can be bent smoothly.
// ---------------------------------------------------------------------------
export const VERTEX = /* glsl */ `#version 300 es

// This point's place on the flat panel: -0.5 to 0.5 across and up.
in vec2 aPosition;

uniform vec2 uScreen;    // the window's width and height, in pixels
uniform vec2 uSize;      // this panel's width and height, in pixels
uniform float uAlong;    // how far this panel's centre is from the middle of
                         // the window along the ring, in pixels
uniform float uVertical; // 0: the ring runs sideways (desktop); 1: downwards (phone)
uniform float uBend;     // how strongly the ring curves away from you; it grows
                         // with speed, so the panels bow as they rush past
uniform float uExpand;   // 0: in the ring; 1: grown flat to fill the window
                         // (when you open a project)
uniform float uDepth;    // pixels pushed back into the screen (the fly-in)

// Passed on to the fragment shader: where on the picture this point is.
out vec2 vUv;

void main() {
  vUv = aPosition + 0.5;

  // The panel's size, growing to the window's size as it expands.
  vec2 size = mix(uSize, uScreen, uExpand);
  vec2 p = aPosition * size;

  // Slide the panel to its place on the ring: right, or down on a phone
  // (screen y points up, so "down" is minus).
  float slide = uAlong * (1.0 - uExpand);
  p += mix(vec2(slide, 0.0), vec2(0.0, -slide), uVertical);

  // The curve. The further a point is from the middle of the window along
  // the ring, the further back it goes (a parabola, close to a cylinder).
  float along = mix(p.x, p.y, uVertical);
  float span = mix(uScreen.x, uScreen.y, uVertical);
  float z = -uBend * (1.0 - uExpand) * along * along / span - uDepth;

  // Perspective: a camera with a 30° view, placed so a point at z = 0 shows
  // at its true size in pixels. Things further back (z < 0) come out smaller.
  float camera = uScreen.y * 1.866;
  gl_Position = vec4(p / (uScreen * 0.5), 0.0, (camera - z) / camera);
}
`;

// ---------------------------------------------------------------------------
// FRAGMENT SHADER: the colour of each pixel of a panel.
// ---------------------------------------------------------------------------
export const FRAGMENT = /* glsl */ `#version 300 es
precision highp float;

in vec2 vUv;              // where on the panel this pixel is, 0 to 1

uniform sampler2D uImage; // the film's current frame (or its poster)
uniform vec2 uCover;      // shrinks the picture's coordinates so it covers the
                          // panel without being squashed (like object-fit: cover)
uniform float uVertical;  // which way the ring moves (the smear follows it)
uniform float uSpeed;     // how fast the ring is moving: 0 still, 1 fast
uniform float uFocus;     // 1 for the panel in the middle, 0 for the others
uniform vec2 uPointer;    // the pointer's place on this panel, 0 to 1
uniform float uRipple;    // 0 to 1: how much the panel ripples under the pointer
uniform float uTime;      // seconds since the ring started
uniform float uOpacity;   // 0 to 1: fades the panel in and out

out vec4 colour;

void main() {
  vec2 uv = (vUv - 0.5) * uCover + 0.5;

  // A gentle ripple spreading out from the pointer, fading with distance.
  vec2 away = vUv - uPointer;
  float dist = length(away);
  uv += away / max(dist, 0.0001)
      * sin(dist * 48.0 - uTime * 5.0) * 0.003
      * uRipple * smoothstep(0.4, 0.0, dist);

  // Speed effects, along the direction of travel:
  //  - split: red is read a little ahead, blue a little behind (RGB split);
  //  - smear: five readings spread out and averaged (motion blur).
  vec2 dir = mix(vec2(1.0, 0.0), vec2(0.0, 1.0), uVertical);
  vec2 split = dir * uSpeed * 0.01;
  vec2 smear = dir * uSpeed * 0.004;
  vec3 c = vec3(0.0);
  for (int i = -2; i <= 2; i++) {
    vec2 o = smear * float(i);
    c.r += texture(uImage, uv + o + split).r;
    c.g += texture(uImage, uv + o).g;
    c.b += texture(uImage, uv + o - split).b;
  }
  c /= 5.0;

  // Panels away from the middle: less colour and darker.
  float grey = dot(c, vec3(0.299, 0.587, 0.114));
  c = mix(vec3(grey), c, 0.35 + 0.65 * uFocus);
  c *= 0.5 + 0.5 * uFocus;

  // A soft vignette, darker towards the panel's edges.
  vec2 q = vUv - 0.5;
  c *= 1.0 - dot(q, q) * 0.5;

  // Film grain: a random speck per pixel that changes every frame.
  float n = fract(sin(dot(gl_FragCoord.xy + fract(uTime) * 100.0,
                          vec2(12.9898, 78.233))) * 43758.5453);
  c += (n - 0.5) * 0.035;

  // Colour times opacity: the canvas expects "premultiplied" colour.
  colour = vec4(c * uOpacity, uOpacity);
}
`;
