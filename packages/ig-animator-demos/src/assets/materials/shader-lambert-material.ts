import {
  AdditiveBlending,
  Color,
  ShaderMaterial,
  ShaderMaterialParameters,
  Texture,
  UniformsLib,
  UniformsUtils
} from 'three';
import {
  vertex as VertexShader,
  fragment as FragmentShader
} from '../shaders/lambert.glsl';
import { ExpansionChunk, IMap, MapChunk, MeshPhongChunk, SurfaceNormalChunk } from '../shaders/chunk';

/**
 * MeshLambertMaterial
 * https://github.com/mrdoob/three.js/blob/76c64b23d422dcfb36a28353f45b1effa1f68c5a/src/renderers/shaders/ShaderLib.js#L32
 */
export abstract class ShaderLambertMaterial extends ShaderMaterial implements IMap {

  constructor(
    vertexShader: string,
    fragmentShader: string,
    parameters?: ShaderMaterialParameters
  ) {
    super(parameters);

    parameters ??= {};
    vertexShader ??= VertexShader;
    fragmentShader ??= FragmentShader;

    this.initChunks();
    this.initUniforms();
    this.initDefines();
    this.vertexShader = vertexShader;
    this.fragmentShader = fragmentShader;
    this.initDefaultSetting(parameters);
  }

  public static getBasicUniforms(): any {
    return UniformsUtils.merge([
      UniformsLib.common,
      UniformsLib.specularmap,
      UniformsLib.envmap,
      UniformsLib.aomap,
      UniformsLib.lightmap,
      UniformsLib.emissivemap,
      UniformsLib.bumpmap,
      UniformsLib.normalmap,
      UniformsLib.displacementmap,
      UniformsLib.gradientmap,
      UniformsLib.fog,
      UniformsLib.lights,
      {
        emissive: { value: new Color(0x000000) },
        specular: { value: new Color(0x111111) },
        shininess: { value: 30 },
        hasAlphaMap: { value: false },
      },
      SurfaceNormalChunk.getUniform(),
      ExpansionChunk.getUniform(),
      MapChunk.getUniform(),
    ]);
  }

  protected initChunks(): void {
    MeshPhongChunk.registerChunk();
    SurfaceNormalChunk.registerChunk();
    ExpansionChunk.registerChunk();
    MapChunk.registerChunk();
  }

  protected initUniforms(): void {
    this.uniforms = UniformsUtils.merge([
      ShaderLambertMaterial.getBasicUniforms(),
      ExpansionChunk.getUniform(),
      {},
    ]);
  }

  /**
   * definesを初期化する。
   */
  protected initDefines(): void {
    this.defines = Object.assign(
      {},
      MeshPhongChunk.getDefines(),
      SurfaceNormalChunk.getDefines(),
      ExpansionChunk.getDefines(),
      this.defines
    );
  }

  protected initDefaultSetting(parameters?: ShaderMaterialParameters): void {
    this.uniformOpacity = this._opacity;
    this.lights = true; //FIXME シェーダーがエラーを起こすのでlights設定は強制でON
  }

  get color(): Color {
    return this.uniforms.diffuse.value;
  }
  set color(value: Color) {
    this.uniforms.diffuse.value = value;
  }


  /**
   * 透明度
   * @deprecated Use uniformOpacity, To be removed in version 0.3.0
   * @see https://github.com/microsoft/TypeScript/pull/37894
   */
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  get opacity(): number {
    return this.uniformOpacity;
  }

  /**
   * 透明度
   * @param value
   * @deprecated Use uniformOpacity, To be removed in version 0.3.0
   * @see https://github.com/microsoft/TypeScript/pull/37894
   */
  set opacity(value: number) {
    this.uniformOpacity = value;
  }

  /**
   * 透明度
   */
  get uniformOpacity(): number {
    return this._opacity;
  }

  /**
   * 透明度
   * opacityは基底クラスのMaterialのコンストラクタ内で明示的に1.0が代入される。
   * この段階でuniformsはundefinedなので、そのままでは初期化できない。
   * このsetterでは受け取った値をprivate変数に保存して、初期化後にuniformsに再代入する。
   * @param value
   */
  set uniformOpacity(value: number) {
    this._opacity = value;
    if (this.uniforms?.opacity) {
      this.uniforms.opacity.value = value;
    }
  }
  protected _opacity = 1.0;


  get emissive(): Color {
    return this.uniforms.emissive.value;
  }
  set emissive(value: Color) {
    this.uniforms.emissive.value = value;
  }

  get map(): Texture {
    return MapChunk.getMap(this);
  }

  set map(val: Texture) {
    MapChunk.setMap(this, val);
    this.onSetMap(val);
  }
  protected onSetMap(val: Texture): void {}

  get alphaMap(): Texture {
    return this.uniforms.alphaMap.value;
  }

  set alphaMap(value: Texture) {
    this.uniforms.alphaMap.value = value;
    this.uniforms.hasAlphaMap.value = value != null;
    this.onSetAlphaMap(value);
  }
  protected onSetAlphaMap(value: Texture): void {}

  /**
   * 発光状態のために、マテリアルの設定をまとめて変更する。
   * {@link https://stackoverflow.com/questions/37647853/three-js-depthwrite-vs-depthtest-for-transparent-canvas-texture-map-on-three-p}
   */
  public startGlow(): void {
    this.alphaTest = 0.0;
    this.depthWrite = false;
    this.blending = AdditiveBlending;
  }

}
