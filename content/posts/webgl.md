---
title: "WebGL tutorial: image processing"
date: 2020-04-25T20:00:38+03:00
description2: "In this WebGL tutorial you will learn how to use the power of GPU from javascript. With some WebGL shader examples such as blur and twist."
tags: [
"webgl",
"javascript"
]
---
In this tutorial you will learn how to use WebGL for image processing.
We will cover basic stuff like initialization, texture loading, and simple fragment shaders.
I will try to cover all aspects of interaction with WebGL but you should have a decent understanding of vanilla javascript.
If you want more in-depth explanations, there is a good book called "Learn WebGL", check it out.
<!--more-->
Here are examples of what we will do:

### Image twist

<iframe style="border:none" src="/test-webgl/dist/" width="100%" onload="javascript:(function(o){o.style.height=o.contentWindow.document.body.clientWidth+60+'px';}(this));"></iframe>

### Image blur

<iframe style="border:none" src="/test-webgl/dist/?blur" width="100%" onload="javascript:(function(o){o.style.height=o.contentWindow.document.body.clientWidth+60+'px';}(this));"></iframe>

Drag slider to see effects. 

[SOURCE CODE](https://github.com/Deedone/techadv-src/tree/master/static/test-webgl) 

If you want to skip the theory and build setup click [here](#code).
# Theory
Everybody who tries to implement good graphics quickly understands he now has severe performance issues.
The amount of computation required to produce any decent scene is simply huge.
You need to process every polygon (some models have thousands of them) to project them on screen.
Then you need to rasterize them. Apply textures, shading, reflections for every pixel.
And you also need to do all of this stuff at least 30 times in a second.
CPUs just can't handle this very well. 
Especially when using some scripting language with lots of overhead for every operation.

All of the tasks described above are highly parallel in their nature.
Polygons and pixels usually do not depend on each other.
They all can be easily and much faster processed in parallel.
And luckily people invented GPUs.
Which are incredibly good at parallel computations.
While modern processors usually have 4-8 cores, any decent graphics card has thousands of them.
They are much less complex then CPU cores and highly optimized for specific 3D-related calculations.

<p align="center">
<figure style="width:100%;margin:0;">

<img src="/images/cpu-gpu.png" width="100%">
</figure>
</p>

[WebGL](https://www.khronos.org/webgl/) is a web standard for low-level 3D graphics API.
It allows you to run your code directly on GPU, giving you all of it's power.
You write all your rendering code in OpenGL Shading Language aka GLSL.
It's not hard and very similar to C.
Programs written in GLSL usually called shaders.
They are compiled and loaded into a graphics card in runtime using WebGL API.
# Preparation
Technically you don't need to install anything.
But without a proper web server you won't be able to load images and additional scripts.
So it's a good idea to have one.
I will use webpack-dev-server, it's easy to setup and use.

The first thing that you need to do is create an empty folder and run `npm init` inside.
You can skip all of the questions from NPM.  
Then add this lines to `package.json`
```json
{
    "scripts": {
        "build": "webpack",
        "serve": "webpack-dev-server"
    },
    "devDependencies": {
        "copy-webpack-plugin": "^5.1.1",
        "html-webpack-plugin": "^4.2.0",
        "raw-loader": "^4.0.1",
        "webpack": "^4.43.0",
        "webpack-cli": "^3.3.11",
        "webpack-dev-server": "^3.10.3"
    }

}
```  
Run `npm install` and create a new file named `webpack.config.js`.  
Here is the contents of webpack config:
```js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: './index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'index.js',
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: 'index.html'
        }),
        new CopyWebpackPlugin([{
            from: "styles/*.css",
            to: ""
        }])
    ],
    mode: 'development'
};
```
Now you can start dev server by running `npm run serve` and open [http://localhots:8080](http://localhots:8080).
Everything should work out of the box.
You are ready for some development.
# Code

Let's deal with HTML right away.
All we need is a canvas and a slider, so here they are.
#### index.html
```html
<html>
<head>
    <title>Webgl</title>
</head>
<body>

    <canvas id="c"></canvas>
    <div class="slidecontainer">
        <input type="range" min="0" max="30" value="0" class="slider" id="range">
      </div>
</body>
</html>
```

Just basic HTML template.
Webpack will add your scripts automatically, so no need to worry about them.
Now, it's time to initialize WebGL.
#### index.js
```js
// Using webpack's raw loader to get shader code as JS string.
// Much more convenient than writing them directly as string 
// or loading in runtime
import vert from '!raw-loader!./vertex.glsl';
import frag from '!raw-loader!./fragment.glsl';

function prepareWebGL(gl) {
  // Creating and compiling vertex shadr
  let vertSh = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertSh, vert);
  gl.compileShader(vertSh);
  // This line is very important
  // By default if shader compilation fails,
  // WebGL will not show you error,
  // so debugging is almost impossible
  console.log(gl.getShaderInfoLog(vertSh));

  // Creating and compiling fragment shader
  let fragSh = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragSh, frag);
  gl.compileShader(fragSh);
  // This line is very import 
  // By default if shader compilation fails,
  // WebGL will not show you error,
  // so debugging is almost impossible
  console.log(gl.getShaderInfoLog(fragSh));

  // Linking program and passing it to GPU
  let prog = gl.createProgram();
  gl.attachShader(prog, vertSh);
  gl.attachShader(prog, fragSh);
  gl.linkProgram(prog);
  gl.useProgram(prog);
  gl.viewport(0,0,c.width,c.height);
  return prog;
}
```
Error checks are omitted for clarity.  
So, how exactly WebGL works?
It's sort of a separate world.
You need to pass some programs and data there.
Then you GPU will crunch the numbers and eventually give you an image.

<div align="center">
<figure style="width:100%;margin:0;">
<img src="/images/webgl.png" width="100%">
<figcaption align="center">
WebGL graphics pipeline
</figcaption>
</figure>
</div>

Let's familiarize ourselves with terminology.  
**Vertex**: coordinates of some point in space, usually with additional data attached to it.
In our case it's just coordinates.  
**Fragment**: one pixel on the surface of the rasterized shape.
In our case it's the same as a pixel on the screen.  
**Rasterization**: process of converting vector image to raster image.
In our case it's filling triangles with pixels.  
**Framebuffer**: memory area that contains data that will be drawn on the screen.

Every program consists of two parts: vertex and fragment shaders.
Vertex shader is applied to every vertex, that you pass in.
Here you perform all 3D stuff such as transformations, projections, and clipping.
Then GPU rasterizes your shapes.
After rasterization every fragment is passed through fragment shader to determine it's color.
Finally everything is drawn to the framebuffer and displayed on the screen.

It's important to understand that your shaders are executed **in parallel**.
On **every** vertex and **every** fragment **independently**. 
Also, shaders produce values not by returning them but setting special variables.
Such as `gl_Position` and `gl_FragColor`, treat them as return statements.

For the sake of simplicity we will mostly play with fragment shaders and stay in a 2D world.
Later we will fill our canvas with a rectangle.
This is needed to have some planes for applying textures.
Here is simple pass-through vertex shader:

#### vertex.glsl
```glsl
// This is our input from js world
attribute vec2 coords;
// This is output for the fragment shader
// varying variables are a little special
// you will see why later
varying highp vec2 vTextureCoord;

void main (void) {
    // Texture and verticies have different coordinate spaces
    // we do this to invert Y axis
    vTextureCoord = -coords;

    // Setting vertix position for shape assembler 
    // GLSL has many convenient vector functions
    // here we extending 2D coords vector to 4D with 2 values
    // 0.0 is a Z coordinate
    // 1.1 is a W, special value needed for 3D math
    // just leave it 1 for now
    gl_Position = vec4(coords, 0.0, 1.0);
}
```


To understand how fragment shader works you need to comprehend varying variables.
Let's imagine you have two vertices in a line.
In vertex shader you set some varying variable to red color from one of them and to green from another.
All fragments between these two points will get different values when reading this variable.
Hence come the "varying" modifier, these variables vary from one fragment to another.
The value will smoothly transition from red to green.
So if you set fragment color to the value of this variable you will get something like this.
Such behavior is called interpolation.

<div align="center">
<figure style="width:100%;margin:0;">
<img src="/images/gradient.png" width="100%">
<figure>
<figcaption>
Color interpolated from red to green
<figcaption>
</div>

We will also use a couple of uniform variables. 
But no need to worry, they are quite simple.
Uniform variables are just constant parameters.
Useful for passing global setting and texture ids.



#### fragment.glsl
```glsl
// Setting precision for float calculations
precision mediump float;
// This is input from vertex shader
varying highp vec2 vTextureCoord;
// Samplers are needeed to select textures
// actually its integers
uniform sampler2D uSampler;
// This will tell us how much to screw the image
uniform float iter;

vec2 coords;
float x;
float y;
float l;
void main(void){

    // Getting distance from origin
    l = length(vTextureCoord);
    // Just renaming to reduce typing
    x = vTextureCoord[0];
    y = vTextureCoord[1];
    // Rotating point around origin 
    coords[0] = x * cos(iter * l) - y * sin(iter * l);
    coords[1] = x * sin(iter * l) + y * cos(iter * l);

    // Transforming coordinates from GL space to texture space
    // All math can be done directly to vectors
    coords = coords / 2.0 - 0.5;

    // Fragment shader must set this variable
    gl_FragColor = texture2D(uSampler, coords);
}
```

The key here is to understand that angle of point movements is dependent on it's distance to the center.
This will result in a cool effect of texture twisting and sucking in a black hole.
If we delete the `* l` part, the whole thing will just rotate.


Our program is now ready, compiled, and loaded.
Time to deal with the data.
Here we are loading vertex coordinates to WebGL memory.
Just two triangles to cover the canvas so we have some surface for texturing.
Be aware that WebGL coordinates work different from canvas coordinates.
Unlike canvas, it's origin is at the center and all coordinates are normalized.
So no matter what aspect ratio your canvas has, X and Y are always in -1 to 1 range.
Also, the Y-axis is pointing upwards.

<div align="center">
<figure style="width:100%;margin:0;">
<img src="/images/square.png.svg" style="max-width:100%">
<figcaption style="margin-top:0px"> Like this </figcaption>
</figure>
</div>

#### index.js
```javascript
function setArrays(gl, prog){
  // Getting WebGL buffer object
  let vertex_buffer = gl.createBuffer();
  // This is 2 triangles that form a square
  // Each triangle consists of 3 points
  // Each point consists of two numbers: X and Y coordinates
  // GL coordinate space has origin in center
  // and spans from -1 to 1 on both axes
  // here is why we need to transform our coords
  // in fragment shader
  const vertices = [-1.0, -1.0, 1.0, -1.0, -1.0, 1.0,
                     1.0, 1.0, 1.0, -1.0, -1.0, 1.0,
  ]
  // Loading our data as ARRAY_BUFFER
  gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);


  // Finding location of variable "coords" in GL memory
  // and binding ARRAY_BUFFER to it
  let coord = gl.getAttribLocation(prog, "coords");
  // Variable binds to last buffer that was written to GL memory
  gl.vertexAttribPointer(coord, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(coord);
  // ARRAY_BUFFER is now free and can be reused
  return [coord, vertex_buffer];
}
```
Array data is loaded.
Time for textures. 
Better to find one that has sizes of powers of two.
WebGL able to automatically generate [mipmaps](https://en.wikipedia.org/wiki/Mipmap) for such textures and scale them properly.  
At first we create simple 1x1 blue pixel texture and immediately return it.
Later, when image loads, we replace this pixel with proper texture data.

#### index.js
```javascript
function loadTexture(gl, prog, url) {
  // Creating 1x1 blue tuxture
  const texture = gl.createTexture();
  const level = 0;
  const internalFormat = gl.RGBA;
  const width = 1;
  const height = 1;
  const border = 0;
  const srcFormat = gl.RGBA;
  const srcType = gl.UNSIGNED_BYTE;
  const pixel = new Uint8Array([0, 0, 255, 255]);  // opaque blue (RGBA)
  // bindTexture works similar to bindBuffer
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                width, height, border, srcFormat, srcType,
                pixel);

  // Loading image
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
    // Quik re-render to display new texture
    // See implementation below

    render(0);
  };
  // Triggering load
  image.src = url;
  return texture;
}
function isPowerOf2(value) {
    return (value & (value - 1)) == 0;
}

```
Preparations done. Now is time to tie everything together.
#### index.js
```javascript

function main(){
  // Getting WebGL context from canvas
  const c = document.getElementById("c");
  c.width = 600;
  c.height = 600;
  // Getting slider
  const range = document.getElementById("range");

  const gl = c.getContext("webgl");
  const prog = prepareWebGL(gl);
  const coord = setArrays(gl, prog);
  const texture = loadTexture(gl, prog, "img.jpg");

  // Handle to control amount of twist
  const iter = gl.getUniformLocation(prog, "iter");
  const uSampler = gl.getUniformLocation(prog, 'uSampler');
  // As is said samplers are just integers
  // Tell the shader to use texture 0
  gl.uniform1i(uSampler, 0)

  // This is main workhorse
  render = (it) => {
    // Binding texture to slot 0
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Filling screen with black color
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Setting iter to slider value
    gl.uniform1f(iter, it);
    // Triggering webgl render
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  render(0);

  range.addEventListener("input", (e) => {
    render(e.target.value);
  })
}

main()
```

That's it. 
If you totally stuck on something, the working source from demos above is [here](https://github.com/Deedone/techadv-src/tree/master/static/test-webgl).
It's slightly different from examples here.
Because I added logic of choosing shaders for demos.
But all of the crucial parts are the same.


## Bonus: Blur shader
GLSL is quite restrictive. 
For example you can't write loops with non-constant bounds.
This may seem strange at first, but actually have decent reasoning behind it.
Most of the restrictions are needed to help compilers apply some aggressive optimization techniques.
So, here is the blur shader.
#### fragment.glsl
```glsl
varying highp vec2 vTextureCoord;
uniform sampler2D uSampler;
precision mediump float;
uniform float iter;
uniform float uTextureSize;

void main(void){
    float pixel = 1.0 / uTextureSize;
    vec2 coords;
    vec4 color = vec4(0.0, 0.0, 0.0, 0.0);

    float div = (iter + 1.0) * (iter + 1.0) * 4.0;

    for (int i = 0; i <= 100; i++) {
        if (float(i) > iter){
            break;
        }
        for (int j = 0; j <= 100; j++) {
            if (float(j) > iter){
                break;
            }
            coords = vTextureCoord.st / 2.0 - 0.5;
            coords += vec2(float(i), float(j)) * pixel;
            color += texture2D(uSampler, coords).rgba / div;

            coords = vTextureCoord.st / 2.0 - 0.5;
            coords -= vec2(float(i), float(j)) * pixel;
            color += texture2D(uSampler, coords).rgba / div;
        }
        int i2 = -i;
        for (int j = 0; j <= 100; j++) {
            if (float(j) > iter){
                break;
            }
            coords = vTextureCoord.st / 2.0 - 0.5;
            coords += vec2(float(i2), float(j)) * pixel;
            color += texture2D(uSampler, coords).rgba / div;

            coords = vTextureCoord.st / 2.0 - 0.5;
            coords -= vec2(float(i2), float(j)) * pixel;
            color += texture2D(uSampler, coords).rgba / div;
        }
    }

    gl_FragColor = vec4(color.rgb, 1.0);
}
```
It's not the best, but it works.
And I hope you can learn something from it.

# Ideas
You can use this project as a template for future experiments.

Here are some cool ideas:
* [Sobel Edge detection](https://en.wikipedia.org/wiki/Sobel_operator)
* [Hue shift](https://hue.imageonline.co/)
* Variuos photo filters

Good luck in your programming journey and *__Remember to create exponentially__*
