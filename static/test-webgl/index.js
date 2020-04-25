
import vert from '!raw-loader!./vertex.glsl';
import frag from '!raw-loader!./fragment.glsl';


const c = document.getElementById("c");

c.width = 600;
c.height = 600;

const gl = c.getContext("webgl");
console.log("Init done");




 var vertices = [-1.0, -1.0, 1.0, -1.0, -1.0, 1.0,

 1.0, 1.0, 1.0, -1.0, -1.0, 1.0,

];

 var vertex_buffer = gl.createBuffer();
 gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
 gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);


 let vertSh = gl.createShader(gl.VERTEX_SHADER);
 gl.shaderSource(vertSh, vert);
 gl.compileShader(vertSh);

 let fragSh = gl.createShader(gl.FRAGMENT_SHADER);
 gl.shaderSource(fragSh, frag);
 gl.compileShader(fragSh);

 console.log(gl.getShaderInfoLog(fragSh))
 let prog = gl.createProgram();
 gl.attachShader(prog, vertSh);
 gl.attachShader(prog, fragSh);
 gl.linkProgram(prog);
 gl.useProgram(prog);

let iter = gl.getUniformLocation(prog, "iter");

let coord = gl.getAttribLocation(prog, "coords");
gl.vertexAttribPointer(coord, 2, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(coord);

gl.viewport(0,0,c.width,c.height);

const texture = loadTexture(gl);

let uSampler = gl.getUniformLocation(prog, 'uSampler');
gl.uniform1i(uSampler, 0);



console.log(iter)
let i = 0;

let lp = () => {
    i+=0.005;

    if ( i >= 10){
        i = 0;
    }
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(iter, i);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    window.requestAnimationFrame(() => lp());
}

lp();

function loadTexture(gl) {
    const text = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, text);
    const level = 0;
  const internalFormat = gl.RGBA;
  const width = 1;
  const height = 1;
  const border = 0;
  const srcFormat = gl.RGBA;
  const srcType = gl.UNSIGNED_BYTE;
  const pixel = new Uint8Array([0, 0, 255, 255]);  // opaque blue
  gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                width, height, border, srcFormat, srcType,
                pixel);


const image = new Image();
  image.onload = function() {

    console.log("LOADED");
    gl.bindTexture(gl.TEXTURE_2D, text);
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                  srcFormat, srcType, image);

    // WebGL1 has different requirements for power of 2 images
    // vs non power of 2 images so check if the image is a
    // power of 2 in both dimensions.
    if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
        console.log("POWER")
       // Yes, it's a power of 2. Generate mips.
       gl.generateMipmap(gl.TEXTURE_2D);
    } else {
       // No, it's not a power of 2. Turn off mips and set
       // wrapping to clamp to edge
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
  };
  console.log("Loading texture")
  image.src = "img.png";

  return text;

}


function isPowerOf2(value) {
    return (value & (value - 1)) == 0;
  }