import { css, html, LitElement } from 'lit';
import { Ref, createRef, ref } from 'lit/directives/ref.js';
import { customElement, property } from 'lit/decorators.js';
import { IgController } from './controller/ig-controller';
import { IgParser } from './parser/ig-parser';
import { Color, Material, MeshBasicMaterial, MeshPhysicalMaterial, Scene } from 'three';
import { Howler } from 'howler';

export interface LoadingEvent {
  date: string;
  target: IgAnimator;
}

export interface LoadedEvent {
  date: string;
  target: IgAnimator;
}

export interface ErrorEvent {
  error: any;
  message: string;
  target: IgAnimator;
}

export interface MarkerEvent {
  marker: any;
  animation: any;
  target: IgAnimator;
}

export type IgRenderer = 'pixi' | 'threejs';

@customElement('ig-animator')
export class IgAnimator extends LitElement {
  @property()
  public declare src: string;

  @property()
  public declare assetsPath: string;

  @property()
  public declare renderer: IgRenderer;

  @property()
  public declare debug: boolean;

  @property({ type: Number})
  public declare scale: number;

  @property({ type: Number})
  public declare cameraZ: number;

  @property()
  public declare animatorStyles: any;

  set volume(value: number) {
    Howler.volume(value);

    // console.log('>> Setting volume', value, this.loadedAnimation);
    Object.keys(this.loadedAnimation).forEach((animationId) => {
      this.loadedAnimation[animationId].animations.forEach((animation: any) => {
        // console.log('>> Loaded animation', animation);
        animation.instance.setVolume(value);
      });
    })
  }

  get volume(): number {
    return Howler.volume();
  }

  private container: Ref<HTMLElement> = createRef();
  private currentSrc = '';
  private currentSceneId = '';
  private previousSceneId = '';
  private controller!: IgController;
  private parser!: IgParser;
  private isLoaded = false;
  private loadedAnimation: any;

  constructor() {
    super();

    this.src = '';
    this.assetsPath = '';
    this.renderer = 'threejs';
    this.debug = true;
    this.scale = 1;
    this.loadedAnimation = {};
  }

  static override get styles() {
    return css`
      :host {
        display: block;
        background-color: #f2f2f2;
        color: #5c5c5c;
      }

      > canvas {
        position: absolute;
        top: -10px;
      }
    `;
  }

  /**
   * Load the animation and all it's assets.
   * @param url
   */
  async loadAnimation(url: string, name = 'new') {
    // console.log('GuAnimator::loadAnimation()', name, url, this.parser);
    this.currentSrc = url;
    let animations: any[] = [];

    // TODO: Render a snapshot of this previous scene for a transition
    // Create something that transitions prev scene into new scene
    // Establish that we can render either scene in the target camera/renderer
    const prevSceneId = this.currentSceneId;
    this.previousSceneId = prevSceneId;

    if (prevSceneId) {
      // console.log('>>> Prev scene Id', prevSceneId);
      const prevAnimationLoaded = this.loadedAnimation[prevSceneId];
      prevAnimationLoaded.animations.forEach((animation: any) => {
        animation.meta.timeline.revert();
        animation.meta.timeline.clear();
        animation.stop();

        // Stop and Hide the video element
        animation.instance?.videoPreloader?.stop();
        animation.instance?.renderer.elements.forEach((element: any) => {
          if (element.data.ty === 9) {
            element.pivotElement.visible = false;
          }
        });
        // animation.instance.destroy();
        // TODO: Look at unloading all loaded assets
      });
    }

    const scene = new Scene()
    scene.visible = false;
    scene.background = new Color('0x0a0a0a');
    scene.name = name;
    // console.log('Load Animation with new scene:', scene);

    await new Promise((resolve) => requestAnimationFrame(resolve));
    this.loading();

    try {

      // TODO: Key to a scene transition is rendering the next load in a new scene
      // console.log('*** Set the options for the parser', scene, this.controller, this.parser);
      this.controller.setScene(scene);
      // this.controller.getThree().scene = scene;
      // this.parser.config.scene = scene;
      animations = await this.parser.loadAnimation(url);
    } catch (error) {
      // Error loading animation
      const event = new CustomEvent<ErrorEvent>('error', {
        bubbles: true,
        composed: true,
        detail: {
          error,
          message: 'Error loading',
          target: this,
        },
      });
      this.dispatchEvent(event);
    }

    // Wire up the marker events
    // scene.visible = true;
    this.controller.setAnimations(animations);

    this.loaded();
    const previousAnimation = this.loadedAnimation[prevSceneId];
    const loadedAnimation = {
      scene,
      animations,
      id: name
    }
    this.loadedAnimation[name] = loadedAnimation;
    this.currentSceneId = name;

    // Show the video
    animations.forEach((animation: any) => {
      animation.instance?.renderer.elements.forEach((element: any) => {
        if (element.data.ty === 9) {
          element.pivotElement.visible = false;
        }
      });
    })

    // TODO: Hook into default loader to track if anything is still loading / expose count
    // const defaultLoader = this.controller.getThree().loader;
    // defaultLoader.onStart = (url: string, itemsLoaded: boolean, itemsTotal: number) => {
    //   console.log('Three::Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
    //   console.log('Three::onStart::', this);
    // };
    //
    // defaultLoader.onLoad = () => {
    //   console.log('Three::Loading Complete! isLoadingChecked:', defaultLoader);
    //   console.log('Three::onLoad() isVideoRequired', defaultLoader, 'isVideoLoaded', defaultLoader);
    //   console.log('Three::onLoad() isImagesRequired', defaultLoader, 'isImagesLoaded', defaultLoader);
    // };
    //
    // defaultLoader.onProgress = (url: string, itemsLoaded: boolean, itemsTotal: number) => {
    //   console.log('Three::Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
    // };
    //
    // defaultLoader.onError = (url: string) => {
    //   console.log('Three::There was an error loading ' + url);
    // };

    this.controller.renderScene(loadedAnimation.scene);

    if (previousAnimation) {
      // previousAnimation.animations.forEach((animation: any) => {
      //   // Clean up scene
      //   // animation.instance.destroy();
      // });
      previousAnimation.scene.traverse((object: any) => {
        if (!object.isMesh) return;
        object.geometry.dispose();

        if (object.material.isMaterial) {
          this.cleanMaterial(object.material);
        } else {
          for (const material of object.material) this.cleanMaterial(material);
        }
      });
    }
    return loadedAnimation;
  }

  /**
   * Lifecycle callback as element has just rendered.
   * Use this to bootstrap the gu-animator.
   */
  override firstUpdated() {
    // console.log('GUAnimator::firstUpdated()');
    // Bootstrap the gu-animator controller
    if (!this.controller) {
      this.controller = new IgController({
        container: this.container.value,
        renderer: this.renderer,
        debug: this.debug,
        scale: this.scale,
        cameraZ: this.cameraZ,
      });

      this.controller.onMarker = (marker: any, animation: any) => {
        this.marker(marker, animation);
      };
    }

    // Bootstrap the gu-animator parser
    if (!this.parser) {
      let rendererInstance: any;
      if (this.renderer === 'pixi') {
        rendererInstance = this.controller.getPixi();
      } else if (this.renderer === 'threejs') {
        rendererInstance = this.controller.getThree();
      }

      this.parser = new IgParser({
        loaders: {
          lottie: this.controller.getLottie(),
        },
        wrapper: this.container.value,
        assetsPath: this.assetsPath,
        renderer: rendererInstance,
      });
    }

    // Auto load the gu-animator src attribute
    if (this.src && this.currentSrc != this.src) {
      this.loadAnimation(this.src);
    }
  }

  override render() {
    const styles = this.animatorStyles || {};
    return html`<div ${ref(this.container)} style=${styles}></div>`;
  }

  getAnimationAsset(name: string) {
    let animation;
    if (this.isLoaded) {
      const animations = this.controller?.animations;
      animation = animations?.find((a) => a.meta?.id === name);
    }

    return animation;
  }

  unloadPreviousAnimationAssets() {
    const animationId = this.previousSceneId;
    if (this.previousSceneId === animationId) {

      const prevAnimationLoaded = this.loadedAnimation[animationId];
      prevAnimationLoaded.animations.forEach((animation: any) => {
        animation.meta.timeline.revert();
        animation.meta.timeline.clear();
        animation.stop();

        animation.instance?.videoPreloader?.pause();
        animation.destroy();
      });

      // Clean up scene
      // prevAnimationLoaded.scene.traverse((object: any) => {
      //   console.log('>>> Cleaning up scene', object.name, object);
      //   if (!object.isMesh) return;
      //   object.geometry.dispose();
      //
      //   if (object.material.isMaterial) {
      //     this.cleanMaterial(object.material);
      //   } else {
      //     for (const material of object.material) this.cleanMaterial(material);
      //   }
      // });
    }
  }

  play(name: string): gsap.core.Timeline | Promise<boolean> {
    if (this.isLoaded) {
      const animation = this.getAnimationAsset(name);
      animation.meta.timeline.restart();
      return animation.meta.timeline.play();
    } else {
      return Promise.resolve(false);
    }
  }

  playMarker(name: string, marker: string): gsap.core.Timeline | null {
    // console.log('playMarker()', name, marker, 'loaded', this.isLoaded);
    if (this.isLoaded) {
      let markerItem: any;
      const animation = this.getAnimationAsset(name);
      if (animation.instance?.markers?.length > 0) {
        markerItem = animation.instance.markers.find((animationMarker: any) => animationMarker.payload.name === marker);
      }

      if (markerItem) {
        if (markerItem.duration) {
          const markerStartTime = markerItem.payload.time;
          const markerEndTime = markerItem.payload.time + (markerItem.duration / animation.instance.frameRate);
          // animation.instance.audioController.play();
          const tween = animation.meta.timeline.tweenFromTo(markerStartTime, markerEndTime);
          tween.then(() => {
            animation.instance.pause();
          });
          return tween;

        } else {
          // animation.instance.play();
          // animation.instance.audioController.play();
          const tween = animation.meta.timeline.play(markerItem.payload.name);
          tween.then(() => {
            animation.instance.pause();
          });

          return tween;
        }
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  getTimeline() {
    if (this.isLoaded) {
      return this.controller?.rootTimeline;
    } else {
      return null;
    }
  }

  getThree() {
    // TODO: Promise to three
    return this.controller?.getThree();
  }

  /**
   * Dispatch loading event.
   * @private
   */
  private loading() {
    this.isLoaded = false;

    // Mark as loading
    const loadingEvent = new CustomEvent<LoadingEvent>('loading', {
      bubbles: true,
      composed: true,
      detail: {
        date: new Date().toISOString(),
        target: this,
      },
    });
    this.dispatchEvent(loadingEvent);
  }

  /**
   * Dispatch loaded event.
   * @private
   */
  private loaded() {
    this.isLoaded = true;

    // Mark as loaded
    const loadedEvent = new CustomEvent<LoadedEvent>('loaded', {
      bubbles: true,
      composed: true,
      detail: {
        date: new Date().toISOString(),
        target: this,
      },
    });
    this.dispatchEvent(loadedEvent);
  }

  /**
   * Dispatch marker event.
   * @private
   */
  private marker(marker: any, animation: any) {
    // Marker
    const markerEvent = new CustomEvent<MarkerEvent>('marker', {
      bubbles: true,
      composed: true,
      detail: {
        marker,
        animation,
        target: this,
      },
    });
    this.dispatchEvent(markerEvent);
  }

  private cleanMaterial(material: MeshPhysicalMaterial) {
    material.dispose();

    // for those materials that have texture maps or env maps
    if (material.map) material.map.dispose();
    if (material.lightMap) material.lightMap.dispose();
    if (material.bumpMap) material.bumpMap.dispose();
    if (material.normalMap) material.normalMap.dispose();
    if (material.envMap) material.envMap.dispose();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ig-animator': IgAnimator;
  }
}
