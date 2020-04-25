---
title: "First impressions on Rust and Webassembly"
date: 2020-04-20T20:45:02+03:00
tags: [
    "rust",
    "webassembly",
    "simulation",
]
draft: false
---

I implemented [Conway's Game of Life](https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life) to familiarize myself with this setup. Controls should be self-explanatory. You can also draw on a field. (Drawing only works from PC, not from mobile devices)
<!--more-->

<iframe src="/wasm-gol/dist/index.html" style="width:100%; border:none; overflow: hidden;" onload='javascript:(function(o){o.style.height=o.contentWindow.document.body.clientWidth+60+"px";}(this));'></iframe>

PRO TIP: You can toggle the `DBG` checkbox to enable debug overlay.
This allows us to see how one of the basics GameOfLife optimization works.
On each iteration program tracks what cells have changed and in the next iteration processes only the "hot" ones.
This trick greatly reduces CPU load.
Now instead of every cell we check only 10-30% of them and can make game field much bigger without losing FPS.


[Source code](https://github.com/Deedone/techadv-src/tree/master/static/wasm-gol)

## Motivation
I love statically typed languages.
I love native speed.
I also love to make cool demos and visualizations and show them to people.
Web looks like a good platform for this, **but** it's kinda slow.
JS got a lot faster in the last years ([check out this cool talk if you are interested how](https://www.youtube.com/watch?v=uMuYaES4W3o)) but I always felt that it's not enough for me.
<p align="center">
<img src="/images/wasm.jpeg" width="90%">
</p>

Here comes [WebAssembly](https://en.wikipedia.org/wiki/WebAssembly). 
It seems to be a perfect solution to this problem. 
Ease of distribution and great visual abilities, while maintaining almost native performance.


### Language choice
My main experience is in C/C++, a natural decision will be to use them. 
On the other hand since I'm already exploring new technologies why not go all the way in.
I prefer to get a full pack of new skills altogether when learning something.
It's harder but much more interesting and beneficial in the long term.

Two main candidates were Rust and Golang.
I've had some prior experience with both and I just can't stand Golang. 
I liked the simplicity of it but the inability to compile something with warnings is way too annoying.
I've always developed in a fiddly iterative process, with lots of dead code and unused variables.
Initially it's a mess but when everything starts to work I usually clean it up a little.
Rust seems to be quite cool tho.
Fast, flexible, have cool features and still manages to protect you from your stupidity. 
Also quite different (heavily inspired by Haskell I think) from everything that I know so a good opportunity to flex your brain a little. 

Also Rust appears to have decent integration with WebGL, which will allow us to implement many neat things in the future.

<p align="center">
<figure align="center" style="text-align:center">
<img width="70%" src="/images/rust_wasm.png">
<figcaption>

Ferris the crab, the Rust mascot
</figcaption>
</figure>
</p>

## Current state
WebAssembly has become quite mature in the past couple of years.
It's certainly no longer a bleeding-edge technology.
Build tools became quite sophisticated, so you can build everything with one npm command.

Directory structure:
```
.
├── src
|    └── lib.rs
├── package.json
├── index.html
├── index.js
├── webpack.config.js
└── cargo.toml

```
Here is my webpack config:
```js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const WasmPackPlugin = require("@wasm-tool/wasm-pack-plugin");
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
        new WasmPackPlugin({
            crateDirectory: path.resolve(__dirname, ".")
        }),
        new CopyWebpackPlugin([{
            from: "styles/*.css",
            to: ""
        }])
    ],
    mode: 'development'
};


```
The coolest thing is WasmPackPlugin. 
It automatically rebuilds your Rust crate when necessary.

And package.json:
```json
{
  "scripts": {
    "build": "webpack",
    "serve": "webpack-dev-server"
  },
  "devDependencies": {
    "@wasm-tool/wasm-pack-plugin": "1.0.1",
    "copy-webpack-plugin": "^5.1.1",
    "html-webpack-plugin": "^3.2.0",
    "webpack": "^4.29.4",
    "webpack-cli": "^3.1.1",
    "webpack-dev-server": "^3.1.0"
  }
}

```


And cargo.toml :
```ini
[package]
name = "wasm-gol"
version = "0.1.0"

[lib]
crate-type = ["cdylib"]

[features]
default = ["console_error_panic_hook"]

[dependencies]
wasm-bindgen = "0.2.60"
lazy_static = "*"
console_error_panic_hook = { version = "0.1.1", optional = true }

[dependencies.web-sys]
version = "0.3.4"
features = [
  "console",
  "CanvasRenderingContext2d",
]
[profile.release]
debug = true
```
`CanvasRenderingContext2d` allows to access canvas drawing context directly from rust, which is quite convinient.


Many people complain about the complexity of debugging Wasm, it wasn't the case for me.
Perhaps I'm lucky, or Rust successfully managed to protect me from my stupidity.
So I hadn't encountered any cryptic bugs.
After installing panic hook debugging became trivial.
Firefox's profiler is also great. I was really surprised when it managed to show me a complete trace of all Wasm calls.

At first Rust was very hard. 
I spent almost a day battling with borrow-checker.
But after some time certain things just click in your head and everything falls in place.
Despite this harshness, Rust compiler is actually pretty friendly.
It very often shows exact changes that you need to do to fix errors, and have good vibe in general. I especially love smiley faces when everything compiles successfully(maybe wasm-pack prints them, i'm not sure).

### Performance

Initially I planned to write two versions.
One in Rust and the other in JS to compare performance.
But I'm to lazy for this, so if you want to compare speeds check out [this article](https://medium.com/@torch2424/webassembly-is-fast-a-real-world-benchmark-of-webassembly-vs-es6-d85a23f8e193).
Roughly it seems quite faster than the implementation that I wrote a couple years ago in pure js. But you certainly can't rely on that metric.

## Results

After a couple of days experimenting with Rust+Wasm, it seems to be a good combo.
Great performance and feature support opens a land of opportunities.
Build tools are also great and Wasm should now be supported by all major browsers.

I'm pleased with this experience. 
Can totally recommend trying it out if you are bored.
Maybe someday this will be a new industry standard, who knows...

***_Remember to create exponentially_***

