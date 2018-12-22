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
	fg.r = mix((fg.r + uvs.x) / 2.0, fg.r, 0.7);
	fg.b = mix((fg.b + uvs.x) / 2.0, fg.b, 0.7);
	fg.g = mix((fg.g + uvs.x) / 2.0, fg.g, 0.7);

	gl_FragColor = fg;
}`