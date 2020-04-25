
attribute vec2 coords;
varying highp vec2 vTextureCoord;


void main (void) {
    vTextureCoord = -coords;
    gl_Position = vec4(coords, 0.0, 1.0);
}