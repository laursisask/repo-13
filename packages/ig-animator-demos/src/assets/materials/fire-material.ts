import { ShaderLambertMaterial } from './shader-lambert-material';
import { Color, ShaderMaterialParameters, UniformsUtils, Vector2 } from 'three';
import {
  vertex as VertexShader,
  fragment as FragmentShader
} from '../shaders/fire.glsl';
// import FragmentShader from '../shaders/fire.frag.glsl';
// import {
//   // fragment as FragmentShader,
//   vertex as VertexShader,
// } from 'three/src/renderers/shaders/ShaderLib/meshlambert.glsl.js'
import { AnimationChunk, IAnimatable, ITiledFBM, TilingFBMChunk } from '../shaders/chunk';
import { gsap } from 'gsap';

export class FireMaterial extends ShaderLambertMaterial implements ITiledFBM, IAnimatable {

  get tiles(): number {
    return this.uniforms.tiles.value;
  }
  set tiles(value: number) {
    this.uniforms.tiles.value = value;
  }
  get hashLoop(): number {
    return this.uniforms.hashLoop.value;
  }
  set hashLoop(value: number) {
    this.uniforms.hashLoop.value = value;
  }
  get amp(): number {
    return this.uniforms.amp.value;
  }
  set amp(value: number) {
    this.uniforms.amp.value = value;
  }

  get glowPower(): number {
    return this.uniforms.glowPower.value;
  }
  set glowPower(value: number) {
    this.uniforms.glowPower.value = value;
  }

  addTime(delta: number): void {
    AnimationChunk.addTime(this, delta);
  }

  get isAnimate(): boolean {
    return this.uniforms.isAnimate.value;
  }
  set isAnimate(value: boolean) {
    this.uniforms.isAnimate.value = value;
    if (this.isAnimate) {
      this.startAnimation();
    } else {
      this.stopAnimation();
    }
  }

  speed = -0.5;


  get strength(): number {
    return this.uniforms.strength.value;
  }
  set strength(value: number) {
    this.uniforms.strength.value = value;
  }
  get bloom(): number {
    return this.uniforms.bloom.value;
  }
  set bloom(value: number) {
    this.uniforms.bloom.value = value;
  }

  get transformSpeed(): number {
    return this.uniforms.transformSpeed.value;
  }
  set transformSpeed(value: number) {
    this.uniforms.transformSpeed.value = value;
  }

  get rimPow(): number {
    return this.uniforms.rimPow.value;
  }
  set rimPow(value: number) {
    this.uniforms.rimPow.value = value;
  }

  get rimStrength(): number {
    return this.uniforms.rimStrength.value;
  }
  set rimStrength(value: number) {
    this.uniforms.rimStrength.value = value;
  }

  get grid(): number {
    return this.uniforms.grid.value;
  }
  set grid(value: number) {
    this.uniforms.grid.value = value;
  }
  get divisionScaleX(): number {
    return this.uniforms.divisionScaleX.value;
  }
  set divisionScaleX(value: number) {
    this.uniforms.divisionScaleX.value = value;
  }


  constructor(parameters?: ShaderMaterialParameters) {
    super(VertexShader, FragmentShader, parameters);
  }

  protected initUniforms(): void {
    this.uniforms = UniformsUtils.merge([
      ShaderLambertMaterial.getBasicUniforms(),
      TilingFBMChunk.getUniform(),
      AnimationChunk.getUniform(),
      {
        strength: { value: 0.45 },
        bloom: { value: 0.1 },
        rimStrength: { value: 1.0 },
        rimPow: { value: 1.0 },
        grid: { value: 3.0 },
        maskEdge: { value: 0.4 },
        divisionScaleX: { value: 1.0 },
        gradientStartColor: { value: new Color(0,0,0) },
        gradientEndColor: { value: new Color(0,0,0) },
        gradientIntensity: { value: 1.0 },
        gradientPower: { value: 1.0 },
        glowPower: { value: 1.0 },
        controlPoint1: { value: 0.0 },
        controlPoint2: { value: 1.0 },
        additionalMap: {value: null},
        additionalMapUVSpeed: { value: new Vector2(0.0, 0.0)}
      },
    ]);
  }

  protected initChunks(): void {
    super.initChunks();
    TilingFBMChunk.registerChunk();
    AnimationChunk.registerChunk();
  }

  protected initDefines(): void {
    super.initDefines();
    this.defines = Object.assign({}, TilingFBMChunk.getDefines(), this.defines);
    this.defines.USE_SURFACE_NORMAL = true;
  }

  protected initDefaultSetting(parameters?: ShaderMaterialParameters): void {
    super.initDefaultSetting(parameters);

    if (parameters.transparent == null) {
      this.transparent = true;
    } else {
      this.transparent = parameters.transparent;
    }
  }

  private animationListener = (e) => {
    this.addTime(e.delta / 1000);
  };

  protected startAnimation() {
    gsap.ticker.add(this.animationListener);
    // RAFTicker.on("onBeforeTick", this.animationListener);
  }

  protected stopAnimation(): void {
    gsap.ticker.remove(this.animationListener);
    // RAFTicker.off("onBeforeTick", this.animationListener);
  }
}
