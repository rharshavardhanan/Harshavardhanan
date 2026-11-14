// The small programs the graphics card runs to draw the home page. They are
// written in GLSL (the language of WebGL). Every "uniform" is a value sent
// from JavaScript: the same for every pixel, changeable any time without
// touching the shader. The settings live in components/ring/gl.ts (LOOK) and
// components/ring/smoke.ts.
//
// Two canvases, one behind the other:
//   SMOKE (its own canvas, smoke.ts)  a dark glossy oil surface over the window
//   the ring (gl.ts), drawn in two passes each frame:
//     1. TRAIL             the cursor's fading trail, painted into a small picture
//     2. VERTEX + FRAGMENT the seven film panels, on a circle around you

// ---------------------------------------------------------------------------
// FILM GRAIN, shared by the smoke and the panels.
// ---------------------------------------------------------------------------
const GRAIN = /* glsl */ `
uniform float uGrainAmount;   // how strong the grain is, for this draw
uniform float uGrainSize;     // how big each grain speck is, in screen pixels
uniform float uGrainFps;      // how many times per second the pattern changes

// A random number between 0 and 1 for a position. GLSL has no random(), so
// this scrambles the position: the same input always gives the same output,
// which is what lets the grain hold still between its 24 changes a second.
float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21)); // keep only the decimals: neighbours stop looking related
  p += dot(p, p + 45.32);              // mix x and y together
  return fract(p.x * p.y);             // and once more, down to 0..1
}

// This pixel's grain speck on this frame, from -0.5 to 0.5.
float speck() {
  // Pixels in blocks of uGrainSize share one speck: bigger = coarser grain.
  // mod(…, 512) keeps the numbers small: hash() multiplies them by over a
  // hundred, and big results keep too few decimals on many graphics cards,
  // which turns the "random" specks into stripes.
  vec2 cell   = mod(floor(gl_FragCoord.xy / uGrainSize), 512.0);
  // A whole number that only goes up uGrainFps times a second: the pattern
  // jumps like film instead of sliding (64 frames, then round again).
  float frame = mod(floor(uTime * uGrainFps), 64.0);
  return hash(cell + frame * 17.0) - 0.5;
}

// Grain for the films. It MULTIPLIES the colour: black times anything stays
// black, so dark areas stay deep and rich (added grain would be cut off at
// zero and lift black towards grey), and grain only shows where there is
// picture. It is strongest in the mid-tones: mid is 0 at pure black and pure
// white and 1 at mid-grey, and w keeps a little grain everywhere.
vec3 applyGrain(vec3 color, float amount) {
  float luma = dot(color, vec3(0.299, 0.587, 0.114));
  float mid  = 4.0 * luma * (1.0 - luma);
  float w    = mix(0.25, 1.0, mid);
  return color * (1.0 + speck() * amount * 2.0 * w);
}

// Grain for the smoke: ADDED, since the smoke never reaches pure black
// (its darkest is about 0.03), so nothing is cut off.
vec3 addGrain(vec3 color, float amount) {
  return color + speck() * amount;
}
`;

// ---------------------------------------------------------------------------
// FULL-SCREEN VERTEX SHADER, for the trail and the smoke: one triangle big
// enough to cover the window, with vUv from 0 (bottom left) to 1.
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
// OIL: the background, drawn as a dark, glossy surface, like black satin or
// oil, rather than as coloured cloud. A hilly surface is made from noise
// (its "height" at every point); the shader works out which way the surface
// faces at each pixel, and lights it with three lights. The cursor drags the
// surface like a finger through oil.
// ---------------------------------------------------------------------------
export const SMOKE = /* glsl */ `#version 300 es
precision highp float;

uniform vec2  uRes;         // the canvas's size in pixels
uniform float uTime;        // seconds
uniform float uDistortion;  // how much the surface folds (2, plus the ring's speed × 1.5)
uniform vec2  uMouse;       // the pointer, -0.5..0.5, eased: the surface leans after it
uniform sampler2D uTrail;   // this canvas's own cursor trail (trail.ts)
uniform float uRelief;      // how deep the folds look: higher = steeper, glossier
uniform int   uOctaves;     // layers of noise: 4 on a computer, 3 on a phone
${GRAIN}

// Smooth random "value noise": random values on a grid, blended smoothly
// between the grid's points.
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f); // a smooth curve, so the blending has no hard creases
  float a = hash(mod(i, 289.0));
  float b = hash(mod(i + vec2(1.0, 0.0), 289.0));
  float c = hash(mod(i + vec2(0.0, 1.0), 289.0));
  float d = hash(mod(i + vec2(1.0, 1.0), 289.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

// fbm: layers of noise, each twice as fine and half as strong, which gives
// natural, cloudy detail.
float fbm(vec2 p) {
  float v = 0.0, amp = 0.5;
  mat2 rot = mat2(0.8, -0.6, 0.6, 0.8); // turn each layer, so no grid lines show
  for (int i = 0; i < 5; i++) {
    if (i >= uOctaves) break;
    v += amp * noise(p);
    p = rot * p * 2.0 + vec2(13.7, 7.1);  // finer, turned and shifted
    amp *= 0.5;
  }
  return v;
}

out vec4 colour;

void main() {
  // This pixel's place, from the middle of the window, in square units.
  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  vec2 p = uv * 1.6 + uMouse * 0.12;

  // The cursor's trail pushes the surface along the way the pointer went,
  // so the folds drag behind it and ease back as the trail fades.
  vec4 trail = texture(uTrail, gl_FragCoord.xy / uRes);
  vec2 flow = (trail.xy * 2.0 - 1.0) * trail.z;
  p -= flow * uDistortion * 0.35;

  // One big, lazy vortex behind the centre panel: turn p round the middle,
  // most near the middle (exp falls off with distance), slowly to and fro.
  float swirl = 0.25 * exp(-2.0 * dot(p, p)) * sin(uTime * 0.05);
  p = mat2(cos(swirl), sin(swirl), -sin(swirl), cos(swirl)) * p;

  // The surface's height: noise read through two layers of itself (domain
  // warping), so the hills fold into each other. The warp w is worked out
  // once here and kept for the neighbouring points below: it hardly changes
  // across a pixel or two, and this saves most of the work.
  float t = uTime * 0.035;
  vec2 q = vec2(fbm(p + vec2(0.0, t)),
                fbm(p + vec2(5.2, 1.3) - t));
  vec2 r = vec2(fbm(p + uDistortion * q + vec2(1.7, 9.2) + 0.15 * t),
                fbm(p + uDistortion * q + vec2(8.3, 2.8) - 0.12 * t));
  vec2 w = uDistortion * r;

  // Which way the surface faces (its "normal"). Compare the height a pixel
  // and a half to the right with a pixel and a half to the left: hx is how
  // much it rises going right; hy the same going up. A surface that rises to
  // the right faces a little to the left, hence the minus signs; uRelief
  // exaggerates the slopes, and 1.0 is "facing straight out of the screen".
  float e = 1.5 * 1.6 / uRes.y;
  float hx = fbm(p + w + vec2(e, 0.0)) - fbm(p + w - vec2(e, 0.0));
  float hy = fbm(p + w + vec2(0.0, e)) - fbm(p + w - vec2(0.0, e));
  vec3 n = normalize(vec3(-hx * uRelief, -hy * uRelief, 1.0));

  // Lighting, all in grey.
  // Diffuse: how squarely the surface faces the key light (from the top
  // left): broad, soft light and shade that show the shape of the folds.
  vec3 keyDir = normalize(vec3(-0.5, 0.6, 0.6));
  float diffuse = max(dot(n, keyDir), 0.0);
  // Specular: the shine. The "half-way" direction sits between the light
  // and your eye; where the surface faces exactly that way, the light
  // bounces straight at you. The power of 48 keeps only the closest
  // matches: small, tight, glossy highlights.
  vec3 viewDir = vec3(0.0, 0.0, 1.0);
  vec3 halfV = normalize(keyDir + viewDir);
  float spec = pow(max(dot(n, halfV), 0.0), 48.0);
  // Rim: the steep sides of the folds (facing away from you, n.z small)
  // catch a little light, like the edge of a silk fold.
  float rim = pow(1.0 - max(n.z, 0.0), 2.0);
  float v = 0.025 + 0.10 * diffuse + 0.35 * spec + 0.12 * rim;
  vec3 c = vec3(v);

  // A faint lighter halo behind the middle panel, and darker corners.
  c *= 1.0 + 0.6 * exp(-dot(uv, uv) * 3.5);
  c *= 1.0 - 0.45 * dot(uv, uv);

  colour = vec4(addGrain(c, uGrainAmount), 1.0);
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
// 2a. PANEL VERTEX SHADER: where each point of a film panel goes. You stand
// near the middle of a circle; the panels stand on its rim, facing you. A
// panel is a flat grid of 48 × 24 little squares; this runs once for every
// corner of every square and wraps it onto the circle, so the panel curves
// exactly with the room.
// ---------------------------------------------------------------------------
export const VERTEX = /* glsl */ `#version 300 es

// This point's place on the flat panel: -0.5 to 0.5 across and up.
in vec2 aPosition;

uniform float uAngle;    // this panel's middle, as an angle around the circle
                         // (0 = straight ahead; positive = to your right, or
                         // below you on a phone)
uniform float uRadius;   // the circle's radius, at rest
uniform float uTighten;  // speed rolls the circle tighter: 1 at rest, up to 1.18
uniform vec2 uPanel;     // the panel's size: along the ring (its arc) and across
uniform float uVertical; // 0: the ring runs sideways (desktop); 1: up and down (phone)
uniform float uCamera;   // how far behind the circle's middle the camera stands
uniform vec2 uTan;       // tan of half the lens's view, across (x) and up (y)
uniform float uYaw;      // the head turned right (+) or left, in radians
uniform float uPitch;    // the head turned up (+) or down
uniform float uDepth;    // how far out beyond the rim the panel is (the fly-in)
uniform float uExpand;   // 0: on the ring; 1: flat across the whole window
                         // (when you open a project)

// Passed on to the fragment shader: where on the picture this point is.
out vec2 vUv;

void main() {
  vUv = aPosition + 0.5;

  // How far this point is from the panel's middle along the ring, and across
  // it. (On a phone the ring runs downwards, so "along" is down the screen.)
  float along = mix(aPosition.x, -aPosition.y, uVertical) * uPanel.x;
  float across = mix(aPosition.y, aPosition.x, uVertical) * uPanel.y;

  // This point's own angle around the circle. An arc of length L on a
  // circle of radius R spans L / R radians, so moving \`along\` from the
  // panel's middle adds along / R to the panel's angle.
  // Speed rolls the circle tighter: a smaller radius, with the angles scaled
  // up to match, so every panel and gap keeps its length but curves more.
  float radius = uRadius / uTighten + uDepth;
  float angle = (uAngle + along / uRadius) * uTighten;

  // Onto the circle. Think of a clock seen from above with you at its
  // middle: sin(angle) says how far to the side the point is, cos(angle)
  // how far ahead. At angle 0: 0 to the side, the full radius ahead.
  float side = radius * sin(angle);
  float ahead = radius * cos(angle);

  // Into the camera's view: x to the right, y up, z towards you, so
  // "ahead" is minus z. The camera stands uCamera behind the middle.
  vec3 p = mix(vec3(side, across, -ahead), vec3(across, -side, -ahead), uVertical);
  p.z -= uCamera;

  // Turning the head: the room turns the other way, a little.
  float cy = cos(uYaw), sy = sin(uYaw);
  p = vec3(cy * p.x + sy * p.z, p.y, -sy * p.x + cy * p.z);
  float cp = cos(uPitch), sp = sin(uPitch);
  p = vec3(p.x, cp * p.y + sp * p.z, -sp * p.y + cp * p.z);

  // The lens: everything is divided by its distance (w = -z, done by the
  // graphics card), and scaled so the edges of the view land on the edges
  // of the screen. Nearer things come out bigger: the sides of each panel,
  // closer to you on the circle, look taller than its middle.
  vec4 clip = vec4(p.x / uTan.x, p.y / uTan.y, 0.0, -p.z);

  if (uExpand > 0.0) {
    // Opening a project: blend from its place in the room to the whole window.
    vec2 window = aPosition * 2.0;
    gl_Position = vec4(mix(clip.xy / clip.w, window, uExpand), 0.0, 1.0);
  } else {
    gl_Position = clip;
  }
}
`;

// ---------------------------------------------------------------------------
// 2b. PANEL FRAGMENT SHADER: the colour of each pixel of a film panel.
// ---------------------------------------------------------------------------
export const FRAGMENT = /* glsl */ `#version 300 es
precision highp float;

in vec2 vUv;              // where on the panel this pixel is, 0 to 1

uniform sampler2D uImage; // the film's current frame (or its poster)
uniform vec2 uCover;      // shrinks the picture's coordinates so it covers the
                          // panel without being squashed (like object-fit: cover)
uniform float uVertical;  // which way the ring moves (the smear follows it)
uniform float uSpeed;     // how fast the ring is moving: 0 still, 1 fast
uniform float uSide;      // how far round this panel is: 0 in front, 1 a
                          // neighbour (its angle ÷ the step between panels)
uniform float uTime;      // seconds since the ring started
uniform float uOpacity;   // 0 to 1: fades the panel in and out
uniform sampler2D uTrail; // the cursor's trail (pass 1)
uniform vec2 uScreenPx;   // the canvas's size in pixels, to find this pixel in the trail
uniform float uFluidShift; // how far the trail pushes the picture
uniform float uRgbShift;   // how far the trail pulls red and blue apart
uniform vec2 uBox;         // the panel's size on screen, in pixels (for the corners)
uniform float uCorner;     // how round its corners are, in pixels
${GRAIN}

out vec4 colour;

// How far a point is from the edge of a rectangle with rounded corners:
// below 0 inside, above 0 outside. abs(p) folds the four corners onto one,
// so the maths only has to handle one corner.
float roundedBox(vec2 p, vec2 halfSize, float r) {
  vec2 q = abs(p) - halfSize + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

// One reading of the picture, with red a little ahead and blue a little
// behind (the RGB split).
vec3 split(vec2 uv, vec2 by) {
  return vec3(texture(uImage, uv + by).r,
              texture(uImage, uv).g,
              texture(uImage, uv - by).b);
}

void main() {
  vec2 uv = (vUv - 0.5) * uCover + 0.5;

  // The cursor's trail at this pixel: the direction it went, times how
  // strongly (it fades over about a second). The picture is pushed along it.
  vec4 trail = texture(uTrail, gl_FragCoord.xy / uScreenPx);
  vec2 flow = (trail.xy * 2.0 - 1.0) * trail.z;
  uv -= flow * uFluidShift;

  // Speed: the colours split and the picture smears along the direction of
  // travel. The trail splits the colours too.
  vec2 dir = mix(vec2(1.0, 0.0), vec2(0.0, 1.0), uVertical);
  vec2 by = dir * uSpeed * 0.01 + flow * uRgbShift;
  vec2 smear = dir * uSpeed * 0.004;
  vec3 c = vec3(0.0);
  float readings = 0.0;
  for (int i = -2; i <= 2; i++) {
    c += split(uv + smear * float(i), by);
    readings += 1.0;
  }

  // Depth: the further round the room a panel is, the softer, greyer and
  // darker it gets, so the one in front is always the sharpest, brightest
  // thing. It starts only halfway to the next place (uSide 0.5), so the
  // panel in front, and one turning past, stay at full brightness.
  // (Blur: six extra readings in a small circle around this pixel.)
  float d = clamp((uSide - 0.5) * 2.0, 0.0, 1.0);
  float blur = d * 0.008;
  if (blur > 0.0) {
    for (int k = 0; k < 6; k++) {
      float a = float(k) * 1.0472; // 60° apart
      c += split(uv + vec2(cos(a), sin(a)) * blur, by);
      readings += 1.0;
    }
  }
  c /= readings;
  float grey = dot(c, vec3(0.299, 0.587, 0.114));
  c = mix(c, vec3(grey), d * 0.5);  // less colour
  c *= mix(1.0, 0.45, d);           // darker

  // Darker towards the edges: down to 75% at the corners, so the picture
  // glows from its middle like a lit cinema screen.
  float vig = smoothstep(0.9, 0.2, length(vUv - 0.5));
  c *= mix(0.75, 1.0, vig);

  c = applyGrain(c, uGrainAmount);

  // Rounded corners: fully there inside, fading out over about one pixel at
  // the edge (fwidth: how much d changes from one pixel to the next), so the
  // corners are smooth rather than jagged.
  float edge = roundedBox((vUv - 0.5) * uBox, uBox * 0.5, uCorner);
  float alpha = 1.0 - smoothstep(0.0, fwidth(edge) * 1.5, edge);

  // Colour times opacity: the canvas expects "premultiplied" colour.
  float a = uOpacity * alpha;
  colour = vec4(c * a, a);
}
`;
