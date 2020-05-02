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