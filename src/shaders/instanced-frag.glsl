#version 300 es
precision highp float;

in vec4 fs_Pos;
in vec4 fs_Nor;
in vec4 fs_Col;

out vec4 out_Col;

vec4 lambert(vec3 p, vec3 normal, vec3 color) {
	vec3 direction = vec3(5, 5, 5) - p;
	float diffuseTerm = dot(normalize(normal), normalize(direction));
	diffuseTerm = clamp(diffuseTerm, 0.0, 1.0);
	float ambientTerm = 0.2;

	float lightIntensity = diffuseTerm + ambientTerm;
	return clamp(vec4(color.rgb * lightIntensity, 1.0), 0.0, 1.0);
}

void main()
{
    // float dist = 1.0 - (length(fs_Pos.xyz) * 2.0);
    // out_Col = vec4(dist) * fs_Col;
    out_Col = lambert(fs_Pos.xyz, fs_Nor.xyz, fs_Col.xyz);
}
