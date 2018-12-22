export default `
precision mediump float;

varying vec2 vTextureCoord;
varying vec4 vColor;

uniform vec3 color1;
uniform vec3 color2;
uniform float amount;

void main(){
	vec2 uvs = vTextureCoord.xy;
	vec4 fg = vec4(0.0, 0.0, 0.0, 1.0);
	fg.r = mix(color1.r, color2.r, uvs.y *  amount);
	fg.b = mix(color1.b, color2.b, uvs.y *  amount);
	fg.g = mix(color1.g, color2.g, uvs.y *  amount);

	gl_FragColor = fg;
}`