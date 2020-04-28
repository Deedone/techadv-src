---
title: "Webgl"
date: 2020-04-25T20:00:38+03:00
draft: true
---
# Money shot
# Theory
Everybody likes good-loking graphics.
Everybody who tries to implement good graphics quickly understands he now have huge performance issues.
Amount of computation required to produce any decent scene is simply huge.
You need to process every polygon (some models have thousands of them) to project them on screen.
Then you need to rasterize them. Apply textures, shading, reflections for every pixel on the screen.
And you also need to do all of this stuff at least 30 times in a second.
CPUs just can't handle this very well. 
Espcesially when using some scripting langauge with lots of overhead for every operation.

Luckily people found a solution and invented GPUs.
All of the task described above are highly parallel in their nature.
Polygons and pixels usually do not depend on each other and can be easily (and much more efficiently) processed at the same time.
GPUs are especially good at this.
While moder processors usually have 4-8 cores, any decent graphics card have thousands of them.
They are much less complex then CPU cores and higly optimized for specific 3D-related calculations.

<p align="center">
<figure>

<img src="/images/cpu-gpu.png" width="100%">
</figure>
</p>

[WebGL](https://www.khronos.org/webgl/) is a web standart for low-level 3D graphics API.
It allows you to run your code directly on GPU, giving you great power of it.
You write all your rendering code in OpenGL Shading Lanuage aka GLSL.
It's not hard and very similar to C.
Programs written in GLSL usually called shaders.
They are compiled and loaded into graphics card in runtime using WebGL api.
# Preparation
Technically you don't need to install anything.
But without a proper web server you won't be able to load images and additional scripts.
So it's a good idea to have one.
I will use webpack-dev-server, it's easy to setup and use.

First thing that you need to do is create an empty folder and run `npm init` inside.
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
Now you can start dev server by running `npm run serve` and opening [http://localhots:8080](http://localhots:8080).
I will not explain this all deeply, as this is not the main topic.
Everything should just work and if you want you can research this stuff later.
So lets get straight to the cool stuff
# Code
If just want to play with it a little, full source code is [here]().

Lets deal with HTML right away.
All we need is a canvas, so here it is.
#### index.html
```html
<html>
<head>
    <title>Webgl</title>
</head>
<body>
    <canvas id="c"></canvas>
</body>
</html>
```

Just basic HTML template with a canvas that we can use.
Now, lets initialize WebGL.
#### index.js
```js
import vert from '!raw-loader!./vertex.glsl';
import frag from '!raw-loader!./fragment.glsl';

const c = document.getElementById("c");
c.width = 600;
c.height = 600;
const gl = c.getContext("webgl");

function prepareWebGL(gl) {
  let vertSh = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertSh, vert);
  gl.compileShader(vertSh);

  let fragSh = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragSh, frag);
  gl.compileShader(fragSh);

  let prog = gl.createProgram();
  gl.attachShader(prog, vertSh);
  gl.attachShader(prog, fragSh);
  gl.linkProgram(prog);
  gl.useProgram(prog);
  gl.viewport(0,0,c.width,c.height);
  return prog;
}

prepareWebGL(gl);
```
There is really nothing extraodrdinary here, but lets break it down.





# Ideas

