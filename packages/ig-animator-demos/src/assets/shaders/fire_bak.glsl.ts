// language=GLSL
export const vertex = `
  #define LAMBERT
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    // gl_Position = vec4( position, 1.0 );
  }
`;


export const fragment = `
  #define LAMBERT
  varying vec2 uvPosition;
  varying vec3 vNormal;
  uniform vec3 diffuse;
  uniform float opacity;

  uniform vec3 emissive;

  #include <common>
  #include <dithering_pars_fragment>
  #include <color_pars_fragment>
  #include <uv_pars_fragment>
  #include <map_pars_fragment>
  #include <alphamap_pars_fragment>
  #include <alphatest_pars_fragment>
  #include <aomap_pars_fragment>
  #include <emissivemap_pars_fragment>
  #include <envmap_common_pars_fragment>
  #include <envmap_pars_fragment>
  #include <logdepthbuf_pars_fragment>

  void main() {
    // vec4 diffuseColor = vec4(1.0, 0.7529, 0.7961, 1.0); // Pink color values
    // vec4 outgoingLight = vec4(1.0, 0.7529, 0.7961, 1.0);

    vec4 diffuseColor = vec4( diffuse, opacity );
	  ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	  vec3 totalEmissiveRadiance = emissive;

	  #include <logdepthbuf_fragment>
    #include <map_fragment>
    #include <color_fragment>
    #include <alphamap_fragment>
    #include <alphatest_fragment>
    #include <specularmap_fragment>
    #include <emissivemap_fragment>

    // modulation
    #include <aomap_fragment>

    vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;

    // Shader

    // Get the color from the texture
    diffuseColor = texture2D( map, vMapUv );
    outgoingLight = vec3(diffuseColor.rgb);

    #include <envmap_fragment>
    #include <output_fragment>
    #include <tonemapping_fragment>
    #include <encodings_fragment>
    #include <premultiplied_alpha_fragment>
    #include <dithering_fragment>
  }
`;
