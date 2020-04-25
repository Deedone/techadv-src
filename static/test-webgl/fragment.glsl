

varying highp vec2 vTextureCoord;
uniform sampler2D uSampler;
precision mediump float;
uniform float iter;

float x;
float y;
float l;
vec2 coords;
void main(void){
    l = length(vTextureCoord)*2.0;
    x = vTextureCoord[0];
    y = vTextureCoord[1];
    coords[0] = x * cos(iter*l) - y*sin(iter*l);
    coords[1] = x * sin(iter*l) + y*cos(iter*l);
    coords[0] = coords[0] / 2.0 - 0.5;
    coords[1] = coords[1] / 2.0 - 0.5;
    gl_FragColor = texture2D(uSampler, coords);
}