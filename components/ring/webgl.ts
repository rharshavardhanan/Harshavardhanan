// Small helpers shared by the home page's two canvases (the ring, gl.ts, and
// the background, smoke.ts) and the cursor trail each of them runs (trail.ts).

/** Compiles and links one shader program, and finds its uniforms by name. */
export function build(
  gl: WebGL2RenderingContext,
  vertex: string,
  fragment: string,
) {
  const program = gl.createProgram()!;
  for (const [type, source] of [
    [gl.VERTEX_SHADER, vertex],
    [gl.FRAGMENT_SHADER, fragment],
  ] as const) {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(shader) ?? "shader did not compile");
    }
    gl.attachShader(program, shader);
  }
  // Every program reads its corner positions from slot 0, so the shapes
  // below work with all of them.
  gl.bindAttribLocation(program, 0, "aPosition");
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program) ?? "program did not link");
  }
  const found = new Map<string, WebGLUniformLocation | null>();
  const at = (name: string) => {
    if (!found.has(name)) found.set(name, gl.getUniformLocation(program, name));
    return found.get(name)!;
  };
  return { program, at };
}

export type Program = ReturnType<typeof build>;

/** A shape: corner positions in slot 0, and optionally a list of triangles. */
export function shape(
  gl: WebGL2RenderingContext,
  points: Float32Array,
  corners?: Uint16Array,
) {
  const vao = gl.createVertexArray()!;
  gl.bindVertexArray(vao);
  const buffers = [gl.createBuffer()!];
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers[0]);
  gl.bufferData(gl.ARRAY_BUFFER, points, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  if (corners) {
    buffers.push(gl.createBuffer()!);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers[1]);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, corners, gl.STATIC_DRAW);
  }
  gl.bindVertexArray(null);
  return { vao, buffers };
}

export type Shape = ReturnType<typeof shape>;

export function dropShape(gl: WebGL2RenderingContext, s: Shape) {
  gl.deleteVertexArray(s.vao);
  s.buffers.forEach((buffer) => gl.deleteBuffer(buffer));
}

/** One triangle twice the window's size: the part inside covers it. */
export const WHOLE_WINDOW = new Float32Array([-1, -1, 3, -1, -1, 3]);

/** A new texture that blends smoothly between its pixels and does not wrap
 *  round at its edges. */
export function smoothTexture(gl: WebGL2RenderingContext) {
  const texture = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return texture;
}
