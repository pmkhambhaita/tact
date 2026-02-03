import React, { useRef, useEffect } from 'react';

const ShaderBackground: React.FC<{ isDark: boolean }> = ({ isDark }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const gl = canvas.getContext('webgl');
        if (!gl) return;

        // Vertex Shader (Simple Pass-through)
        const vsSource = `
      attribute vec4 aVertexPosition;
      void main() {
        gl_Position = aVertexPosition;
      }
    `;

        // Fragment Shader (Soft Noise Gradient)
        const fsSource = `
      precision mediump float;
      uniform vec2 uResolution;
      uniform float uTime;
      uniform vec3 uColor1;
      uniform vec3 uColor2;

      // Simple noise function
      float random (in vec2 st) {
          return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
      }

      float noise (in vec2 st) {
          vec2 i = floor(st);
          vec2 f = fract(st);
          float a = random(i);
          float b = random(i + vec2(1.0, 0.0));
          float c = random(i + vec2(0.0, 1.0));
          float d = random(i + vec2(1.0, 1.0));
          vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
      }

      void main() {
        vec2 st = gl_FragCoord.xy / uResolution.xy;
        
        // Slow moving coordinates
        vec2 pos = vec2(st * 3.0);
        float n = noise(pos + uTime * 0.1);
        
        // Secondary movement
        float n2 = noise(pos * 2.0 - uTime * 0.05);

        // Mix noise
        float finalNoise = mix(n, n2, 0.5);

        // Soft Radial Gradient
        float dist = distance(st, vec2(0.5, 0.5));
        float glow = 1.0 - smoothstep(0.2, 1.5, dist);

        // Color define
        vec3 color = mix(uColor1, uColor2, finalNoise * glow);
        
        // Add minimal grain
        float grain = random(st * uTime) * 0.03;

        gl_FragColor = vec4(color + grain, 1.0);
      }
    `;

        const initShaderProgram = (gl: WebGLRenderingContext, vs: string, fs: string) => {
            const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vs);
            const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fs);
            if (!vertexShader || !fragmentShader) return null;

            const shaderProgram = gl.createProgram();
            if (!shaderProgram) return null;
            gl.attachShader(shaderProgram, vertexShader);
            gl.attachShader(shaderProgram, fragmentShader);
            gl.linkProgram(shaderProgram);

            if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
                return null;
            }
            return shaderProgram;
        };

        const loadShader = (gl: WebGLRenderingContext, type: number, source: string) => {
            const shader = gl.createShader(type);
            if (!shader) return null;
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                gl.deleteShader(shader);
                return null;
            }
            return shader;
        };

        const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
        if (!shaderProgram) return;

        const programInfo = {
            program: shaderProgram,
            attribLocations: {
                vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
            },
            uniformLocations: {
                resolution: gl.getUniformLocation(shaderProgram, 'uResolution'),
                time: gl.getUniformLocation(shaderProgram, 'uTime'),
                color1: gl.getUniformLocation(shaderProgram, 'uColor1'),
                color2: gl.getUniformLocation(shaderProgram, 'uColor2'),
            },
        };

        const buffers = initBuffers(gl);
        let animationFrameId: number;
        let startTime = Date.now();

        function render() {
            if (!gl || !programInfo) return;

            // Resize handling
            const displayWidth = canvas!.clientWidth;
            const displayHeight = canvas!.clientHeight;
            if (canvas!.width !== displayWidth || canvas!.height !== displayHeight) {
                canvas!.width = displayWidth;
                canvas!.height = displayHeight;
                gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
            }

            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT);

            gl.useProgram(programInfo.program);

            // Bind vertices
            gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
            gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

            // Uniforms
            gl.uniform2f(programInfo.uniformLocations.resolution, gl.canvas.width, gl.canvas.height);
            gl.uniform1f(programInfo.uniformLocations.time, (Date.now() - startTime) * 0.001);

            // Colors based on Dark Mode
            if (isDark) {
                // Dark Mode: Deep Slate -> Midnight
                gl.uniform3f(programInfo.uniformLocations.color1, 0.05, 0.09, 0.16); // #0f172a
                gl.uniform3f(programInfo.uniformLocations.color2, 0.02, 0.03, 0.05); // Darker
            } else {
                // Light Mode: Slate 50 -> Soft White warmth
                gl.uniform3f(programInfo.uniformLocations.color1, 0.97, 0.98, 0.99); // #f8fafc
                gl.uniform3f(programInfo.uniformLocations.color2, 0.95, 0.96, 0.98); // #f1f5f9
            }

            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

            animationFrameId = requestAnimationFrame(render);
        }

        render();

        return () => cancelAnimationFrame(animationFrameId);
    }, [isDark]);

    return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none -z-10" />;
};

function initBuffers(gl: WebGLRenderingContext) {
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = [
        1.0, 1.0,
        -1.0, 1.0,
        1.0, -1.0,
        -1.0, -1.0,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    return { position: positionBuffer };
}

export default ShaderBackground;
