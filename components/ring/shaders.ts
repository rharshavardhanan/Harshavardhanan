// The small programs the graphics card runs to draw the home ring. They are
// written in GLSL (the language of WebGL). Every "uniform" is a value sent
// from components/ring/gl.ts: the same for every pixel, changeable any time
// without touching the shader. Change the numbers there, or the maths here,
// to change the look.
//
// Each frame is drawn in three passes:
//   1. TRAIL       the cursor's fading trail, painted into a small picture
//   2. BACKGROUND  slow moving texture across the whole window
//   3. VERTEX + FRAGMENT  the seven film panels, warped by the trail

// ---------------------------------------------------------------------------
// FILM GRAIN, shared by the background and the panels.
// ---------------------------------------------------------------------------
const GRAIN = /* glsl */ `
uniform float uGrainAmount;   // how strong the grain is
uniform float uGrainSize;     // how big each grain speck is, in screen pixels
uniform float uGrainFps;      // how many times per second the pattern changes
uniform float uGrainShadows;  // how much extra grain to add in dark areas

// A random number between 0 and 1 for a position. GLSL has no random(), so
// this scrambles the position: the same input always gives the same output,
// which is what lets the grain hold still between its 24 changes a second.
float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21)); // keep only the decimals: neighbours stop looking related
  p += dot(p, p + 45.32);              // mix x and y together
  return fract(p.x * p.y);             // and once more, down to 0..1
}

vec3 applyGrain(vec3 color) {
  // Pixels in blocks of uGrainSize share one speck: bigger = coarser grain.
  vec2 cell   = floor(gl_FragCoord.xy / uGrainSize);
  // A whole number that only goes up uGrainFps times a second: the pattern
  // jumps like film instead of sliding.
  float frame = floor(uTime * uGrainFps);
  // This block's speck on this frame, from -0.5 to 0.5 (as often darker as
  // lighter, so the brightness overall does not change).
  float n     = hash(cell + mod(frame, 512.0) * 17.0) - 0.5;
  // How bright the pixel is: 0 black, 1 white (eyes weigh green most).
  float luma  = dot(color, vec3(0.299, 0.587, 0.114));
  // Dark pixels get extra grain, bright ones the normal amount.
  float boost = mix(1.0 + uGrainShadows, 1.0, luma);
  return color + n * uGrainAmount * boost;
}
`;

// ---------------------------------------------------------------------------
// FULL-SCREEN VERTEX SHADER, for the trail and the background: one triangle
// big enough to cover the window, with vUv from 0 (bottom left) to 1.
// ---------------------------------------------------------------------------
export const FULLSCREEN = /* glsl */ `#version 300 es
in vec2 aPosition;
out vec2 vUv;
void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

// ---------------------------------------------------------------------------
// 1. TRAIL: where the cursor has been. This draws into a small picture of the
// window (one pixel per 8 × 8 screen pixels) that is fed back in next frame,
// so each frame builds on the last: the trail fades a little every frame
// (uDecay) and fresh movement is painted on top. In each pixel it keeps the
// direction the cursor was going (red, green) and how strongly (blue).
// ---------------------------------------------------------------------------
export const TRAIL = /* glsl */ `#version 300 es
precision highp float;
in vec2 vUv;

uniform sampler2D uPrevious;  // last frame's trail
uniform vec2 uMouse;          // the pointer, 0..1 across the window from bottom left
uniform vec2 uMove;           // how far it moved since last frame, same units
uniform float uAspect;        // the window's width ÷ height, so the brush is round
uniform float uBrushSize;     // the brush's radius, as a share of the window's height
uniform float uBrushStrength; // how much one frame of movement paints
uniform float uDecay;         // how much of the trail survives each frame (0.95 = 95%)

out vec4 colour;

void main() {
  vec4 previous = texture(uPrevious, vUv);
  vec2 direction = previous.xy * 2.0 - 1.0;          // stored as 0..1, used as -1..1
  // Fade. The small subtraction makes sure it really reaches zero (a picture
  // stores only 256 steps per colour, and a pure percentage would stall).
  float strength = max(previous.z * uDecay - 0.004, 0.0);

  // The brush: 1 at the pointer, falling to 0 at its edge.
  vec2 fromMouse = (vUv - uMouse) * vec2(uAspect, 1.0);
  float brush = smoothstep(uBrushSize, 0.0, length(fromMouse));
  // Only movement paints, and faster movement paints more.
  float speed = clamp(length(uMove) * 60.0, 0.0, 1.0);
  float paint = clamp(brush * speed * uBrushStrength, 0.0, 1.0);

  // Where fresh paint lands, the trail turns to the pointer's direction.
  vec2 heading = length(uMove) > 0.0 ? normalize(uMove) : direction;
  direction = mix(direction, heading, paint);
  strength = min(strength + paint, 1.0);

  colour = vec4(direction * 0.5 + 0.5, strength, 1.0);
}
`;

// ---------------------------------------------------------------------------
// 2. BACKGROUND: the page colour behind the ring, never quite still. Slow
// noise, read through more noise so it drifts like smoke instead of sliding,
// lightens and darkens the colour by up to 8%, with the same grain on top.
// ---------------------------------------------------------------------------
export const BACKGROUND = /* glsl */ `#version 300 es
precision highp float;
in vec2 vUv;

uniform vec3 uColour;    // the page colour: the middle project's background, 0..1
uniform vec2 uScreenPx;  // the canvas's size in pixels
uniform float uTime;     // seconds since the ring started
${GRAIN}

// Smooth noise: random values at whole-number points, blended in between.
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f); // ease the blend, so no creases
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}

// Four layers of noise, each twice as fine and half as strong: large soft
// shapes with finer detail inside them.
float fbm(vec2 p) {
  float value = 0.0;
  float weight = 0.5;
  for (int i = 0; i < 4; i++) {
    value += weight * noise(p);
    p *= 2.0;
    weight *= 0.5;
  }
  return value;
}

out vec4 colour;

void main() {
  vec2 p = gl_FragCoord.xy / uScreenPx.y * 2.2; // square cells, about two per window height
  float t = uTime * 0.05;                       // very slow
  float n = fbm(p + vec2(fbm(p + t), fbm(p - t + 3.7)));
  vec3 c = uColour * (0.92 + 0.16 * n);         // at most 8% lighter or darker
  colour = vec4(applyGrain(c), 1.0);
}
`;

// ---------------------------------------------------------------------------
// 3a. PANEL VERTEX SHADER: where each point of a film panel lands on the
// screen. A panel is a flat grid of 48 × 24 little squares; this runs once for
// every corner of every square, so the panel can be bent smoothly.
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
// 3b. PANEL FRAGMENT SHADER: the colour of each pixel of a film panel.
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
uniform float uTime;      // seconds since the ring started
uniform float uOpacity;   // 0 to 1: fades the panel in and out
uniform sampler2D uTrail; // the cursor's trail (pass 1)
uniform vec2 uScreenPx;   // the canvas's size in pixels, to find this pixel in the trail
uniform float uFluidShift; // how far the trail pushes the picture
uniform float uRgbShift;   // how far the trail pulls red and blue apart
${GRAIN}

out vec4 colour;

void main() {
  vec2 uv = (vUv - 0.5) * uCover + 0.5;

  // The cursor's trail at this pixel: the direction it went, times how
  // strongly (it fades over about a second). The picture is pushed along it.
  vec4 trail = texture(uTrail, gl_FragCoord.xy / uScreenPx);
  vec2 flow = (trail.xy * 2.0 - 1.0) * trail.z;
  uv -= flow * uFluidShift;

  // Speed effects, along the direction of travel:
  //  - split: red is read a little ahead, blue a little behind (RGB split),
  //    and the trail splits them too;
  //  - smear: five readings spread out and averaged (motion blur).
  vec2 dir = mix(vec2(1.0, 0.0), vec2(0.0, 1.0), uVertical);
  vec2 split = dir * uSpeed * 0.01 + flow * uRgbShift;
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

  c = applyGrain(c);

  // Colour times opacity: the canvas expects "premultiplied" colour.
  colour = vec4(c * uOpacity, uOpacity);
}
`;
