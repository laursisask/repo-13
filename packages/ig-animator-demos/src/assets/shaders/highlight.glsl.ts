// language=GLSL
export const vert = `
// varying vec2 vUv;
//
// void main() {
//   vUv = uv;
//   gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
// }

uniform float time;
uniform vec2 resolution;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  // gl_Position = vec4( position, 1.0 );
}
`;

// language=GLSL
export const frag = `
  #define HIGHLIGHT

  #include <mesh_phong_uniform>
  varying vec2 uvPosition;
  #include <mesh_position_varying>

  #include <tiling_fbm_uniform_chunk>
  #include <tiling_fbm_function_chunk>
  #include <time_animation_uniform_chunk>

  uniform float strength;
  uniform float bloom;

  #include <surface_normal_varying_chunk>
  uniform float rimStrength;
  uniform float rimPow;

  #include <common>
  #include <packing>
  #include <dithering_pars_fragment>
  #include <color_pars_fragment>
  #include <uv_pars_fragment>
  #include <uv2_pars_fragment>
  #include <map_pars_fragment>
  // #include <alphamap_pars_fragment>
  #include <alphatest_pars_fragment>
  #include <aomap_pars_fragment>
  #include <lightmap_pars_fragment>
  #include <emissivemap_pars_fragment>
  #include <envmap_common_pars_fragment>
  #include <envmap_pars_fragment>
  #include <cube_uv_reflection_fragment>
  #include <fog_pars_fragment>
  #include <bsdfs>
  #include <lights_pars_begin>
  #include <normal_pars_fragment>
  #include <lights_phong_pars_fragment>
  #include <shadowmap_pars_fragment>
  #include <bumpmap_pars_fragment>
  #include <normalmap_pars_fragment>
  #include <specularmap_pars_fragment>
  #include <logdepthbuf_pars_fragment>
  #include <clipping_planes_pars_fragment>
  void main()
  {
    #include <clipping_planes_fragment>

    #include <mesh_phong_diffuse_color>

    #include <logdepthbuf_fragment>
    #include <__ShaderMaterial__map_fragment_begin_chunk>
    #include <map_fragment>
    #include <color_fragment>

    vec2 uv = uvPosition;
    float uVy = uv.y;
    uv *= tiles;

    vec2 q = vec2(0.0);
    q.x = fbm( uv + vec2(1.7,9.2) +.16  * time );
    q.y = fbm( uv + vec2(8.3,2.8) +.356 * time );

    float fbmVal = fbm(uv + q);
    fbmVal += 1.0-(uVy * 1.0 );
    fbmVal *= 1.0-uVy;

    vec3 viewDir = normalize(vViewPosition);
    float rimGlow = 1.0 - max(0.0, dot(surfaceNormal, viewDir));
    rimGlow = pow(rimGlow, rimPow) * rimStrength;
    rimGlow = clamp( rimGlow, 0.0, 1.0);
    fbmVal *= 1.0-rimGlow;

    vec3 color = diffuseColor.rgb;

    float st = 1.0 - strength;
    float bri = smoothstep( max( st - 0.4, 0.0 ), st, fbmVal );

    float blm = 1.0 - bloom;
    float bloomVal = smoothstep( blm - 0.4, blm, fbmVal );
    color += bloomVal;

    diffuseColor.rgb = color;
    diffuseColor.a *= bri;

    #include <mesh_phong_switching_alpha_map>

    // #include <alphamap_fragment>
    #include <alphatest_fragment>
    #include <specularmap_fragment>
    #include <normal_fragment_begin>
    #include <normal_fragment_maps>
    #include <emissivemap_fragment>
    // accumulation
    #include <lights_phong_fragment>
    #include <lights_fragment_begin>
    #include <lights_fragment_maps>
    #include <lights_fragment_end>
    // modulation
    #include <aomap_fragment>
    vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
    #include <envmap_fragment>
    #include <output_fragment>
    #include <tonemapping_fragment>
    #include <encodings_fragment>
    #include <fog_fragment>
    #include <premultiplied_alpha_fragment>
    #include <dithering_fragment>
  }

// uniform float time;
// uniform vec2 resolution;
// uniform sampler2D texture1;
// varying vec2 vUv;
// void main() {
// vec2 uv = vUv;
//  vec4 color = vec4(0.,0.,0.,1.);
//  vec4 color2 = vec4(0.,0.,0.,1.);
//
//  vec4 result;
//
//  vec4 flamecolor = vec4(0.929, 0.706, 0.106, 1.000);
//
//
//  vec4 gradient = mix(vec4(1.,1.,1.,1.),vec4(0.,0.,0.,0.),vUv.y*1.5);
//  vec4 gradientFlame = mix(vec4(0.553, 0.196, 0.024, 1.000),vec4(0.929, 0.706, 0.106, 1.000),vUv.y*2.);
//  // gradient += 0.1;
//
//  vec4 noise = texture2D(texture1,vec2(fract(vUv.x*2.),fract(2.*vUv.y - time/600.)));
//  /// vec4 maskT = texture2D(mask,vec2(vUv.x + (1. - gradient.r)*sin(time/20. + vUv.y)/30.,vUv.y));
//
//  noise +=gradient;
//  result = noise*gradient*gradient;
//
//  if(result.r>0.5) {
//   color.r = 1.;
//  } else{
//   color.r = 0.;
//  }
//
//  if(result.r>0.4) {
//   color2.r = 1.;
//  } else{
//   color2.r = 0.;
//  }
//
//
//
//  color = vec4(color.r,color.r,color.r,1.0);
//  color2 = clamp(vec4(color2.r,color2.r,color2.r,1.0) - color,0.,1.);
//
//
//  color *= gradientFlame;
//  color2 *= vec4(0.910, 0.753, 0.518, 1.000);



//  }
// uniform sampler2D texture1;
// uniform vec3 color;
// uniform float alpha;
// uniform float time;
//
// varying vec2 vUv;

// void main() {
//     vec2 uv = vUv;
//
//     // Offset the uv coordinates using the perlin noise texture
//     // vec2 noise = texture2D( texture1, uv + vec2(time * 0.1)).rg;
//     //
//     // // Get the color from the texture
//     // vec4 texColor = texture2D( texture1, uv);
//     //
//     // // Lerp the base color with the texture color using alpha as the factor
//     // // vec3 mixedColor = mix(color, texColor.rgb, alpha);
//     //
//     // // The final color will use the mixed color and the alpha from the texture
//     // gl_FragColor = texColor; // vec4(mixedColor, texColor.a);
//
//     // Center the coordinates
//     vec2 centeredUv = uv - 0.5;
//
//     // Get the distance from the center
//     float len = length(centeredUv);
//
//     // Offset the uv coordinates using the perlin noise texture
//     vec2 noise = texture2D( texture1, uv + vec2(time * 0.1)).rg;
//     uv += vec2(
//         centeredUv.x * len * noise.r * 2.0,
//         centeredUv.y * len * noise.g * 2.0
//     );
//
//     // Get the color from the texture
//     vec4 texColor = texture2D( texture1, uv);
//
//     // Combine the color with the texture color and apply the alpha
//     vec4 finalColor = vec4(color * texColor.rgb, alpha * texColor.a);
//
//     // gl_FragColor = new Vector( texture1);
//     //
//     vec4 working = texture2D( texture1, vUv);
//     gl_FragColor = finalColor; // vec4(color, texColor.a);

  // Encodings
//  gl_FragColor = linearToOutputTexel(gl_FragColor);
//
//  // Get get normal blending with premultipled, use with CustomBlending, OneFactor, OneMinusSrcAlphaFactor, AddEquation.
//	gl_FragColor.rgb *= gl_FragColor.a;
`;

export default frag;
