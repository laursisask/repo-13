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
    vec3 top = vec3(82.0/255.0, 1.0, 252.0/255.0);
    vec3 bottom = vec3(2.0/255.0, 165.0/255.0, 187.0/255.0);
    vec3 gradientColor = mix(top, bottom, yNormalized);
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
  uniform float maskEdge;

  // additional uniforms for the second texture and animation speed
  uniform sampler2D additionalMap;
  uniform vec2 additionalMapUVSpeed;
  uniform vec3 gradientStartColor;
  uniform vec3 gradientEndColor;
  uniform float gradientIntensity;
  uniform float gradientPower;
  uniform float glowPower;
  uniform float controlPoint1; // beginning of the gradient
  uniform float controlPoint2; // end of the gradient

  #include <common>
  #include <dithering_pars_fragment>
  #include <color_pars_fragment>
  #include <uv_pars_fragment>
  #include <map_pars_fragment>

  mat2 rotationMatrix(float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat2(c, -s, s, c);
  }

//  float linearGradient(vec2 uv, float edgeThickness) {
//    vec2 center = vec2(0.5);
//    vec2 dist = abs(uv - center);
//    return smoothstep(edgeThickness, edgeThickness + 0.1, dist.x) * smoothstep(edgeThickness, edgeThickness + 0.1, dist.y);
//  }

  float linearGradient(vec2 uv) {
    // return pow(1.0 - uv.x, gradientPower);
    return 1.0 - uv.x;
  }

  void main() {
    // vec2 mapUV = uvPosition;
    vec2 mapUV = vScreenUV;

    vec2 additionalMapUVSpeed1 = vec2(0.2, 0.2);
    vec4 additionalMapColor1 = texture2D(additionalMap, fract(vScreenUV + additionalMapUVSpeed1 * time));

    vec2 additionalMapUVSpeed2 = vec2(-0.0, -0.0);
    float rotationSpeed = 0.2;  // adjust the rotation speed as needed
    vec2 centeredUV = fract(vScreenUV + additionalMapUVSpeed2 * time) - vec2(0.5);
    vec2 rotatedUV = rotationMatrix(rotationSpeed * time) * centeredUV + vec2(0.5);
    vec4 additionalMapColor2 = texture2D(additionalMap, rotatedUV);

    float maxContrast = 2.0;
    // additionalMapColor1.rgb = ((additionalMapColor1.rgb - 0.5) * maxContrast) + 0.5;
    // additionalMapColor2.rgb = ((additionalMapColor2.rgb - 0.5) * maxContrast) + 0.5;

    float originalValue = additionalMapColor1.r; // This is your original R channel value between 0 and 1
    float minValue = 0.425;
    float maxValue = 1.0;
    float newValue = minValue + originalValue * (maxValue - minValue);

    vec4 diffuseColor = vec4( diffuse, opacity );
	  ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	  vec3 totalEmissiveRadiance = emissive;

    // diffuseColor *= vColor;

    float combinedRGB = newValue + additionalMapColor2.r;
    gl_FragColor = vec4(combinedRGB); // , max(additionalMapColor1.rgb, additionalMapColor2.rgb));
    // gl_FragColor.rgb *= diffuse;
    // gl_FragColor.rgb *= diffuse;

    // Apply the gradient mask
    // float mask = linearGradient(uvPosition, maskEdge); // use uvPosition to apply gradient in model space
    // gl_FragColor *= (1.0 - mask);

    // Define your control points

    // Calculate the relative position in the gradient (from 0 to 1)
    // float gradientPos = clamp((uvPosition.x - controlPoint1) / (controlPoint2 - controlPoint1), 0.0, 1.0);

    // Control points
//    float controlPoint1 = 0.2; // start of the gradient
//    float controlPoint2 = 0.8; // end of the gradient

    // float maxContrast = 2.0;
    // additionalMapColor1.rgb = ((additionalMapColor1.rgb - 0.5) * maxContrast) + 0.5;
    // additionalMapColor2.rgb = ((additionalMapColor2.rgb - 0.5) * maxContrast) + 0.5;


    // Calculate gradient mask
//    float mask = 1.0 - smoothstep(controlPoint1, controlPoint2, uvPosition.x);
//
//    // Apply the gradient mask
//    gl_FragColor.a *= mask;

    // gl_FragColor.rgb *= diffuse;

    // Apply the gradient mask
    // float mask = linearGradient(uvPosition, maskEdge); // use uvPosition to apply gradient in model space
    // gl_FragColor *= (1.0 - mask);

    // Calculate the relative position in the gradient (from 0 to 1)
    // float gradientPos = clamp((uvPosition.x - controlPoint1) / (controlPoint2 - controlPoint1), 0.0, 1.0);

    // Apply the gradient mask
    // float mask = pow(1.0 - gradientPos, glowPower);
    // gl_FragColor.a *= mask;

    // Calculate position of gradient
//    float gradientPosition = (uvPosition.x - controlPoint1) / (controlPoint2 - controlPoint1);
//
//    // Clamp between 0 and 1 to avoid going outside of the gradient
//    gradientPosition = clamp(gradientPosition, 0.0, 1.0);
//
//    // Apply the gradient mask
//    float mask = mix(0.0, 1.0, gradientPosition);
//    gl_FragColor.a *= (1.0 - mask);

    // Apply the gradient mask
//    float mask = pow(1.0 - gradientPos, glowPower);
//    gl_FragColor.a = (1.0 - gradientPos);

    // Apply the gradient mask
//    float mask = pow(1.0 - uvPosition.x, glowPower); // use uvPosition to apply gradient in model space
//    gl_FragColor.a *= mask;

    //    vec3 gradientColor = mix(gradientStartColor, gradientEndColor, mask);
//    gl_FragColor.rgb = mix(gl_FragColor.rgb, gradientColor, gradientIntensity);
//    gl_FragColor.a *= mask;
//
//    vec3 baseMask = mix(vec3(0), vec3(0.8), mask);
//    vec4 baseColor = vec4(82.0/255.0, 1.0, 252.0/255.0, baseMask.r);
    vec3 glowColor = vec3(0.0, 1.0, 0.98);
    gl_FragColor.rgb *= glowColor;
//    gl_FragColor.rgb = mix(gl_FragColor.rgb, baseColor.rgb, 0.5); // vec3(82.0/255.0, 1.0, 252.0/255.0);
//    gl_FragColor.a =  mix(gl_FragColor.a, baseMask.r, 0.5); // *= baseColor;

    // Apply the gradient mask
//    float mask = linearGradient(uvPosition); // use uvPosition to apply gradient in model space
//    gl_FragColor.a *= mask;

    // gl_FragColor = vec4( diffuseColor.rgb, diffuseColor.a );
//    gl_FragColor = vec4( mix(additionalMapColor2.rgb, additionalMapColor1.rgb, additionalMapColor1.a), additionalMapColor2.a );
//    gl_FragColor.rgb *= diffuse;

    #include <tonemapping_fragment>
    #include <encodings_fragment>
    #include <premultiplied_alpha_fragment>
    #include <dithering_fragment>
  }
`;
