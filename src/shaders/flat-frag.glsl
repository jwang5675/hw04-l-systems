#version 300 es
precision highp float;

uniform vec3 u_Eye, u_Ref, u_Up;
uniform vec2 u_Dimensions;
uniform float u_Time;

in vec2 fs_Pos;
out vec4 out_Col;

vec2 smoothF(vec2 pos) {
    return pos * pos * (3.0 - 2.0 * pos);
}

float noise(vec2 uv) {
    const float k = 257.0;
    vec4 l  = vec4(floor(uv), fract(uv));
    float u = l.x + l.y * k;
    vec4 v = vec4(u, u + 1.0, u + k, u + k + 1.0);
    v = fract(fract(1.23456789 * v) * v / 0.987654321);
    l.zw = smoothF(l.zw);
    l.x = mix(v.x, v.y, l.z);
    l.y = mix(v.z, v.w, l.z);
    return mix(l.x, l.y, l.w);
}

float fbm(vec2 pos) {
    float amp = 0.5;
    float freq = 5.0;
    float ret = 0.0;
    for(int i = 0; i < 8; i++) {
        ret += noise(pos * freq) * amp;
        amp *= .5;
        freq *= 2.;
    }
    return ret;
}

vec3 palette(in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d) {
	return a + b * cos(6.28318*(c*t+d));
}

void main() {
	vec3 a = vec3(0.8, 0.5, 0.4);
	vec3 b = vec3(0.2, 0.4, 0.2);
	vec3 c = vec3(2.0, 1.0, 1.0);
	vec3 d = vec3(0.00, 0.25, 0.25);

    out_Col = 0.2 * vec4(palette(fs_Pos.y / 2.0 + 0.5, a, b, c, d), 1.0);
    out_Col = out_Col + 0.1 * vec4(vec3(fbm(fs_Pos.xy)), 1.0);
}
