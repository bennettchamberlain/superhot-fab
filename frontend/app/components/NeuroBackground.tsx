'use client';

import { useEffect, useRef } from 'react';

const VERT = `
precision mediump float;
varying vec2 vUv;
attribute vec2 a_position;
void main() {
  vUv = .5 * (a_position + 1.);
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

// Adapted from @zozuar — warm red/orange/yellow palette for Superhot Fabrication
const FRAG = `
precision mediump float;
varying vec2 vUv;
uniform float u_time;
uniform float u_ratio;
uniform vec2 u_pointer_position;
uniform float u_scroll_progress;

vec2 rotate(vec2 uv, float th) {
  return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;
}

float neuro_shape(vec2 uv, float t, float p) {
  vec2 sine_acc = vec2(0.);
  vec2 res = vec2(0.);
  float scale = 8.;
  for (int j = 0; j < 15; j++) {
    uv = rotate(uv, 1.);
    sine_acc = rotate(sine_acc, 1.);
    vec2 layer = uv * scale + float(j) + sine_acc - t;
    sine_acc += sin(layer) + 2.4 * p;
    res += (.5 + .5 * cos(layer)) / scale;
    scale *= (1.2);
  }
  return res.x + res.y;
}

void main() {
  vec2 uv = .5 * vUv;
  uv.x *= u_ratio;

  vec2 pointer = vUv - u_pointer_position;
  pointer.x *= u_ratio;
  float p = clamp(length(pointer), 0., 1.);
  p = .5 * pow(1. - p, 2.);

  float t = .001 * u_time;
  float noise = neuro_shape(uv, t, p);

  noise = 1.2 * pow(noise, 3.);
  noise += pow(noise, 10.);
  noise = max(0.0, noise - .5);
  noise *= (1. - length(vUv - .5));

  // Warm palette: deep red <-> amber/yellow, slow cycle
  float phase = 0.5 + 0.5 * sin(u_time * 0.00022);
  vec3 col = normalize(mix(
    vec3(0.855, 0.110, 0.065),  // #DA291C deep red
    vec3(1.000, 0.720, 0.000),  // #FFB800 amber-yellow
    phase
  ));

  gl_FragColor = vec4(col * noise, noise);
}
`;

export default function NeuroBackground({ blur = 16 }: { blur?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio, 2);
    const ptr = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };

    const gl = (
      canvas.getContext('webgl') ?? canvas.getContext('experimental-webgl')
    ) as WebGLRenderingContext | null;
    if (!gl) return;

    const compileShader = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(s));
      }
      return s;
    };

    const prog = gl.createProgram()!;
    gl.attachShader(prog, compileShader(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compileShader(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(prog));
      return;
    }
    gl.useProgram(prog);

    // Collect uniform locations
    const u: Record<string, WebGLUniformLocation | null> = {};
    const uniformCount = gl.getProgramParameter(prog, gl.ACTIVE_UNIFORMS) as number;
    for (let i = 0; i < uniformCount; i++) {
      const info = gl.getActiveUniform(prog, i)!;
      u[info.name] = gl.getUniformLocation(prog, info.name);
    }

    // Full-screen quad
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, 'a_position');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      gl.uniform1f(u.u_ratio, canvas.width / canvas.height);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener('resize', resize);

    const updatePtr = (x: number, y: number) => {
      ptr.tx = x / window.innerWidth;
      ptr.ty = 1 - y / window.innerHeight;
    };
    const onMove = (e: PointerEvent) => updatePtr(e.clientX, e.clientY);
    const onClick = (e: MouseEvent) => updatePtr(e.clientX, e.clientY);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('click', onClick);

    let raf = 0;
    const render = () => {
      raf = requestAnimationFrame(render);
      ptr.x += (ptr.tx - ptr.x) * 0.2;
      ptr.y += (ptr.ty - ptr.y) * 0.2;
      gl.uniform1f(u.u_time, performance.now());
      gl.uniform2f(u.u_pointer_position, ptr.x, ptr.y);
      gl.uniform1f(u.u_scroll_progress, 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    render();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('click', onClick);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        filter: `blur(${blur}px)`,
        opacity: 0.88,
      }}
    />
  );
}
