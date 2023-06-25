// language=GLSL
export const vertex = `
  #define LAMBERT

  varying vec3 vViewPosition;
  varying vec2 uvPosition;
  varying vec2 vUv;

  #include <common>
  #include <uv_pars_vertex>
  #include <displacementmap_pars_vertex>
  #include <envmap_pars_vertex>
  #include <color_pars_vertex>
  #include <normal_pars_vertex>

  void main() {
    vUv = uv;
    uvPosition = uv;

    #include <uv_vertex>
    #include <color_vertex>
    #include <morphcolor_vertex>

    #include <beginnormal_vertex>
    #include <morphnormal_vertex>
    #include <skinbase_vertex>
    #include <skinnormal_vertex>
    #include <defaultnormal_vertex>
    #include <normal_vertex>

    #include <begin_vertex>
    #include <morphtarget_vertex>
    #include <skinning_vertex>
    #include <displacementmap_vertex>
    #include <project_vertex>

    vViewPosition = - mvPosition.xyz;

    #include <worldpos_vertex>
    #include <envmap_vertex>
    #include <shadowmap_vertex>
    #include <fog_vertex>

    // gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    // gl_Position = vec4( position, 1.0 );
  }
`;


export const fragment = `
  #define LAMBERT

  varying vec2 uvPosition;
  varying vec3 vNormal;
  uniform vec3 diffuse;
  uniform float opacity;

  uniform float time;
  uniform bool isAnimate;
  uniform float grid;
  uniform float divisionScaleX;
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

  vec2 rand2D(vec2 p, vec2 scale) {
      p = mod(p, scale);
      const float a = 12.9898, b = 78.233, c = 43758.5453;
      const float a2 = 26.7, b2 = 14.879;

      highp float dt = dot(p, vec2(a, b)), sn = mod(dt, PI);
      highp float dt2 = dot(p, vec2(a2, b2)), sn2 = mod(dt2, PI);
      return fract(sin(vec2(dt, dt2)) * c);
  }

  /*!
   * Cellular Noise
   *
   * The inherits function is :
   * Author : patriciogv
   * see https://thebookofshaders.com/12/
   * LICENSE : https://github.com/patriciogonzalezvivo/thebookofshaders/issues/235
   */
  float cellularNoise(vec2 uv, float grid, float divisionScaleX, float time){

      vec2 scale = grid * vec2 ( divisionScaleX, 1.0 );
      uv *= scale;

      vec2 i_uv = floor(uv);
      vec2 f_uv = fract(uv);

      float minDist = 1.;

      for (int y= -1; y <= 1; y++) {
          for (int x= -1; x <= 1; x++) {
              vec2 neighbor = vec2(float(x), float(y));
              vec2 point = rand2D(i_uv + neighbor, scale);

              point = 0.5 + 0.5 * sin(time + PI2 * point);

              vec2 diff = neighbor + point - f_uv;
              float dist = length(diff);

              minDist = min(minDist, dist);
          }
      }

      return minDist;
  }

  void main() {
    // vec4 diffuseColor = vec4(1.0, 0.7529, 0.7961, 1.0); // Pink color values
    // vec4 outgoingLight = vec4(1.0, 0.7529, 0.7961, 1.0);

    vec2 mapUV = uvPosition;
    vec4 diffuseColor = vec4( diffuse, opacity );
	  ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	  vec3 totalEmissiveRadiance = emissive;

	  #include <logdepthbuf_fragment>
    #include <map_fragment>
    #include <color_fragment>

    float dist = cellularNoise( mapUV, grid, divisionScaleX, time );
    diffuseColor.rgb *= dist;
    diffuseColor.a *= dist;

    #include <alphamap_fragment>
    #include <alphatest_fragment>
    #include <specularmap_fragment>
    #include <emissivemap_fragment>

    // modulation
    #include <aomap_fragment>

    vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;

    // Shader

    // Get the color from the texture
    vec2 uv = gl_FragCoord.xy;
    // diffuseColor = texture2D( map, vMapUv );
    // diffuseColor.rgb = vec3(uv.x, uv.y, 0.0);

    outgoingLight = vec3(diffuseColor.rgb);

    #include <envmap_fragment>
    #include <output_fragment>
    #include <tonemapping_fragment>
    #include <encodings_fragment>
    #include <premultiplied_alpha_fragment>
    #include <dithering_fragment>
  }
`;
