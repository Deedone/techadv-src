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