
import vert from '!raw-loader!./vertex.glsl';
import fragTwist from '!raw-loader!./fragment2.glsl';
import fragBlur from '!raw-loader!./fragment.glsl';
let frag;

if (window.location.search.substr(1) == "blur"){
  frag = fragBlur;
}else{
  frag = fragTwist;
}
function loadTexture(gl, prog, url) {
  const texture = gl.createTexture();
  const level = 0;
  const internalFormat = gl.RGBA;
  const width = 1;
  const height = 1;
  const border = 0;
  const srcFormat = gl.RGBA;
  const srcType = gl.UNSIGNED_BYTE;
  const pixel = new Uint8Array([0, 0, 255, 255]);  // opaque blue
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                width, height, border, srcFormat, srcType,
                pixel);


  const image = new Image();
  image.onload = function() {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                  srcFormat, srcType, image);

    // WebGL1 has different requirements for power of 2 images
    // vs non power of 2 images so check if the image is a
    // power of 2 in both dimensions.
    if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
       // Yes, it's a power of 2. Generate mips.
       gl.generateMipmap(gl.TEXTURE_2D);
    } else {
       // No, it's not a power of 2. Turn off mips and set
       // wrapping to clamp to edge
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
    render(0);
  };
  image.src = url;
  let uSampler = gl.getUniformLocation(prog, 'uSampler');
  gl.uniform1i(uSampler, 0)
  return texture;
}

function prepareWebGL(gl) {


  let vertSh = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertSh, vert);
  gl.compileShader(vertSh);

  let fragSh = gl.createShader(gl.FRAGMENT_SHADER);

  gl.shaderSource(fragSh, frag);
  gl.compileShader(fragSh);

  console.log(gl.getShaderInfoLog(fragSh));
  let prog = gl.createProgram();
  gl.attachShader(prog, vertSh);
  gl.attachShader(prog, fragSh);
  gl.linkProgram(prog);
  gl.useProgram(prog);
  return prog;
}

function setArrays(gl, prog){
  let vertex_buffer = gl.createBuffer();
  const vertices = [-1.0, -1.0, 1.0, -1.0, -1.0, 1.0,
                  1.0, 1.0, 1.0, -1.0, -1.0, 1.0,
  ]
  gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);



  let coord = gl.getAttribLocation(prog, "coords");
  gl.vertexAttribPointer(coord, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(coord);
  return [coord, vertex_buffer];
}

function isPowerOf2(value) {
    return (value & (value - 1)) == 0;
  }

let render;

function inIframe () {
  try {
      return window.self !== window.top;
  } catch (e) {
      return true;
  }
}

function main(){
  const c = document.getElementById("c");
  if (inIframe()){
    c.height = c.width = document.body.clientWidth;
  }else{
    c.height = c.width = 600;
  }
  const gl = c.getContext("webgl");
  const prog = prepareWebGL(gl);
  const coord = setArrays(gl, prog);
  const iter = gl.getUniformLocation(prog, "iter");
  const TS = gl.getUniformLocation(prog, "uTextureSize");
  const range = document.getElementById("range");
  console.log(c.clientWidth,c.clientHeight);
  gl.viewport(0,0,c.width,c.height);
  gl.uniform1f(TS, 1024.0);
  console.log(coord);

  render = (it) => {
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    if (window.location.search.substr(1) == "blur"){
      if(it == 0) it = 1;
    }else{
      it /=10;
    }
    gl.uniform1f(iter, it);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    console.log("render");
  }

  const texture = loadTexture(gl, prog, "img.jpg");
  render(0);


  range.addEventListener("input", (e) => {
    render(e.target.value);
  })
}

main()

