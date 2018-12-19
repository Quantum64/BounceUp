export default `
precision mediump float;

varying vec2 vTextureCoord;
varying vec4 vColor;

uniform sampler2D vTexture;

void main(){
	if (texture2D(vTexture, vTextureCoord).a != 1.0) {
        discard;
    }
	vec2 uvs = vTextureCoord.xy;

	vec4 fg = texture2D(vTexture, vTextureCoord);
	fg.r = mix(1.0-uvs.y, fg.r, 0.7);
	fg.b = mix(1.0-uvs.y, fg.b, 0.7);
	fg.g = mix(1.0-uvs.y, fg.g, 0.7);

	gl_FragColor = fg;
}`