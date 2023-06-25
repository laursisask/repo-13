// language=GLSL
export const vertex = `
  #define LAMBERT

  varying vec3 vViewPosition;
  varying vec2 uvPosition;
  varying vec2 vUv;
  uniform mat3 mapTransform;
  varying vec2 vMapUv;
  // varying for screen space UV coordinates
  varying vec2 vScreenUV;

  #include <common>
  varying vec4 vColor;
  varying vec3 vNormal;

  void main() {
    vUv = uv;
    uvPosition = uv;
    vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;

    vec3 objectNormal = vec3( normal );
    vec3 transformedNormal = objectNormal;
    transformedNormal = normalMatrix * transformedNormal;

    vec3 transformed = vec3( position );
    vec4 mvPosition = vec4( transformed, 1.0 );

    mvPosition = modelViewMatrix * mvPosition;

    gl_Position = projectionMatrix * mvPosition;

    // Compute screen space UVs
    vScreenUV = gl_Position.xy/gl_Position.w * 0.5 + 0.5;

    vViewPosition = - mvPosition.xyz;

    float yNormalized = (gl_Position.y + 1.0) / gl_Position.w + 2.0 ;

    // Compute gradient color from pink to blue
    vec3 gradientColor = mix(vec3(1.0, 0.0, 1.0), vec3(0.0, 0.0, 1.0), yNormalized);
    vColor = vec4(gradientColor, 1.0);
  }
`;

// language=GLSL
export const fragment = `
  #define LAMBERT

  varying vec2 uvPosition;
  varying vec3 vNormal;
  varying vec4 vColor;
  uniform vec3 diffuse;
  uniform float opacity;

  uniform float time;
  uniform bool isAnimate;
  uniform float grid;
  uniform float divisionScaleX;
  uniform vec3 emissive;
  varying vec2 vScreenUV;

  // additional uniforms for the second texture and animation speed
  uniform sampler2D additionalMap;
  uniform vec2 additionalMapUVSpeed;

  #include <common>
  #include <dithering_pars_fragment>
  #include <color_pars_fragment>
  #include <uv_pars_fragment>
  #include <map_pars_fragment>

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
    // vec2 mapUV = uvPosition;
    vec2 mapUV = vScreenUV;

    // get the additional map color using animated UVs
    // vec4 additionalMapColor = texture2D(additionalMap, vScreenUV + additionalMapUVSpeed * time);
    vec4 additionalMapColor = texture2D(additionalMap, fract(vScreenUV + additionalMapUVSpeed * time));

    vec4 diffuseColor = vec4( diffuse, opacity );
	  ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	  vec3 totalEmissiveRadiance = emissive;

    // diffuseColor = vColor;

    diffuseColor *= vColor;

    float dist = cellularNoise( mapUV, grid, divisionScaleX, time );
    diffuseColor.rgb *= dist;
    diffuseColor.a *= dist;

    // #include <output_fragment>
    gl_FragColor = vec4( diffuseColor.rgb, diffuseColor.a );

    // mix the additional map color into the output color
    gl_FragColor = vec4( mix(diffuseColor.rgb, additionalMapColor.rgb, additionalMapColor.a), diffuseColor.a );
    gl_FragColor.rgb *= diffuse;

    #include <tonemapping_fragment>
    #include <encodings_fragment>
    #include <premultiplied_alpha_fragment>
    #include <dithering_fragment>
  }
`;
