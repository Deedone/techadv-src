

varying highp vec2 vTextureCoord;
uniform sampler2D uSampler;
precision mediump float;
uniform float iter;
uniform float uTextureSize;

float x;
float y;
float l;
//vec2 coords;
void main(void){
    float pixel = 1.0 / 1024.0;

    vec2 coords;
    //l = length(vTextureCoord)*2.0;
    //x = vTextureCoord[0];
    //y = vTextureCoord[1];
    //coords[0] = x * cos(iter*l) - y*sin(iter*l);
    //coords[1] = x * sin(iter*l) + y*cos(iter*l);
    //coords[0] = coords[0] / 2.0 - 0.5;
    //coords[1] = coords[1] / 2.0 - 0.5;

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

    gl_FragColor = vec4(color.rgb, texture2D(uSampler, vTextureCoord / 2.0 - 0.5).a);
    gl_FragColor = texture2D(uSampler, vTextureCoord / 2.0 - 0.5);
    gl_FragColor = vec4(color.rgb, 1.0);
}