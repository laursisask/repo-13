import { IgConfig } from '../core/ig-config';
import { gsap } from 'gsap';
import Lottie from 'lottie-web';
// import Stats from 'three/examples/jsm/libs/stats.module';
import {
  Clock, Color,
  ColorManagement,
  LinearToneMapping,
  PerspectiveCamera,
  Scene,
  sRGBEncoding,
  WebGLRenderer,
} from 'three';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';

/**
 * GU Animator Controller.
 * Takes a set of animations and manages the playback.
 */
export class IgController {
  private applications: any = {};
  private container!: HTMLElement;
  private config: any;
  private currentScene: Scene | undefined;

  public animations: any[] = [];
  public rootTimeline: gsap.core.Timeline | undefined;

  public onMarker: any;

  constructor(config: IgConfig) {
    if (!config) {
      throw new Error('Invalid gu-animator configuration.');
    } else if (!config.container) {
      throw new Error('Invalid gu-animator configuration missing container.');
    }

    this.config = config;
    this.container = config.container;
    this.init();
  }

  /**
   * Init the GU Animator.
   * Setup the PixiJS and Lottie players.
   * @private
   */
  private init() {
    const SIZEW = 1778; // 1920;
    const SIZEH = 1000; // 1080;

    this.applications = {
      three: this.initThree({
        width: SIZEW,
        height: SIZEH,
        debug: this.config.debug,
        scale: this.config.scale,
        scene: this.currentScene,
        cameraModifier: {
          position: {
            x: 0,
            y: 0,
            z: this.config.cameraZ || 0
          }
        },
      }),

      // TODO: Abstract out to a renderer application provider
      // pixi: this.initPixi({
      //   width: SIZEW,
      //   height: SIZEH,
      //   backgroundColor: 0xff00ff, // pink
      //   // backgroundAlpha: 0.5,
      //   sharedTicker: true,
      //   sharedLoader: true,
      //   antialias: false,
      //   clearBeforeRender: true,
      //   resolution: 1,
      // }),
      lottie: this.initLottie(),
    };
  }

  /**
   * Init the PixiJS Application and hook into GSAP ticker.
   * @param options
   * @private
   */
  private initPixi(options: any) {
    // PIXI Background layer
    const app = {}; // new Application(options);

    // Install EventSystem, if not already
    // (PixiJS 6 doesn't add it by default)
    // if (!('events' in app.renderer)) {
    //   app.renderer.addSystem(EventSystem, 'events');
    // }

    if (this.container) {
      this.container.innerHTML = '';
      // this.container.appendChild(app.view);
    } else {
      throw new Error('Invalid gu-animator container.');
    }

    // We stop Pixi ticker using stop() function because autoStart = false does NOT stop the shared ticker:
    // doc: http://pixijs.download/release/docs/PIXI.Application.html
    // app.ticker.stop();
    // gsap.ticker.add(() => {
    //   app.ticker.update();
    // });
    return app;
  }

  // TODO: Pass the new scene in here with the options...
  private initThree(options: any) {
    const three: any = {
      scene: options.scene || new Scene(),
      camera: new PerspectiveCamera(
        25,
        (options.width || 1) / (options.height || 1),
        0.1,
        6000
      ),
      renderer: new WebGLRenderer({ antialias: true }),
      load: (
        filePath: string,
        onLoad: (gltf: GLTF) => void,
        onProgress?: any,
        onError?: any
      ) => {
        const loader = new GLTFLoader();
        loader.load(filePath, onLoad, onProgress, onError);

        return loader;
      },
      clock: new Clock(),
      mixers: [],
      controls: false,
      debug: options.debug,
      interaction: true,
      scale: 1,
      animate: true,
      viewport: {
        minWidth: 760,
        maxWidth: 2000,
        minHeight: 680,
        maxHeight: 810,
      },
      cameraModifier: options.cameraModifier,
    };
    if (options.viewport) {
      if (typeof options.viewport.width !== 'undefined') {
        three.viewport.width = options.viewport.width;
      }
      if (typeof options.viewport.height !== 'undefined') {
        three.viewport.height = options.viewport.height;
      }
    }
    three.composer = new EffectComposer(three.renderer);
    three.scene.background =  new Color('0x0a0a0a');

    three.camera.fov = 25;
    three.camera.focus = 10;
    three.camera.updateProjectionMatrix();

    ColorManagement.enabled = false;
    three.renderer.useLegacyLights = false;
    three.renderer.outputEncoding = sRGBEncoding;
    three.renderer.toneMapping = LinearToneMapping;
    three.renderer.toneMappingExposure = 0.4;
    three.renderer.setClearColor(0xcccccc);
    three.renderer.setPixelRatio(window.devicePixelRatio);
    three.renderer.setSize(options.width, options.height);

    if (options.scale) {
      three.scale = options.scale;
    }

    // if (!options.controls) {
    //   three.controls = new OrbitControls(three.camera, three.renderer.domElement);
    //   three.controls.listenToKeyEvents(window); // optional
    // }

    // Render with capped frame rate
    let delta = 0;
    let interval = 1 / 60; // 60 fps
    let lastUpdateTime = 0;
    let fps = 60;
    const animate = () => {
      requestAnimationFrame(animate);
      const currentTime = performance.now();
      const timeSinceLastUpdate = (currentTime - lastUpdateTime) / 1000;

      // Calculate the FPS
      fps = 1 / timeSinceLastUpdate;

      // Try to cap the frame rate from 60 / 30 / 10
      if (fps < 60) {
        interval = 1 / 30; // 30 fps
      } else if (fps < 30) {
        interval = 1 / 10; // 15 fps
      } else {
        interval = 1 / 60; // Reset to 60 fps
      }

      lastUpdateTime = currentTime;
      delta += timeSinceLastUpdate;
      if (delta > interval) {
        this.render(three);
        delta = delta % interval;
      }
    }

    animate();

    return three;
  }

  private render(three: any) {
    // Check for render override
    if (three.controls) {
      three.controls.update();
    }

    if (three.interaction && three.interaction.update) {
      three.interaction.update();
    }
    if (three.composer) {
      three.composer.render();
    } else {
      three.renderer.render(three.scene, three.camera);
    }
  }

  private initLottie() {
    return Lottie;
  }

  private defineAnimations(animations: any) {
    // console.log('IgController::defineAnimations()', animations);

    if (animations.length > 0) {
      animations.forEach((animation: any) => {
        const totalDuration =
          (animation.totalFrames / animation.frameRate) * 1000;
        const target = { frame: 0 };
        const animationTimeline = gsap.timeline({
          id: animation.meta.id,
          paused: true,
          repeat: animation.meta.repeat,
        });

        // Define tween for animation frame
        animationTimeline.to(target, {
          ease: 'Linear.easeNone',
          duration: totalDuration / 1000,
          frame: animation.totalFrames,
          onStart: () => {
            animation.instance.play();
          },
          onUpdateParams: [animation],
          onUpdate: function (targetAnimation) {
            // const nextMoment = Math.floor(totalDuration * this['progress']());
            const nextFrame = Math.floor(targetAnimation.instance.totalFrames * this['progress']());
            targetAnimation.instance.setCurrentRawFrameValue(nextFrame);
            targetAnimation.instance.gotoFrame();
          },
          onCompleteParams: [animation],
          onComplete: function (targetAnimation) {
            const nextMoment = Math.floor(totalDuration * this['progress']());
            targetAnimation.instance.goToAndStop(nextMoment); // in milliseconds
          },
        });

        // Convert animation markers to GSAP labels
        const markers = animation.instance.markers;
        if (markers?.length > 0) {
          markers.forEach((marker: any) => {
            // Convert marker frame to timeline time
            const markerTime = marker.time / animation.frameRate;
            marker.payload.time = markerTime;

            const markerName = marker.payload.name;
            animationTimeline.addLabel(markerName, markerTime);
            animationTimeline.call(
              (payload: any, anim: any) => {

                // Validate the timeline reflects this markers time
                const currentAnimationTime = anim.meta.timeline.time();
                const flooredTime = Math.floor(currentAnimationTime * 10) / 10;
                const flooredCheck = Math.floor(payload.time * 10) / 10;
                if (flooredCheck === flooredTime) {
                  if (this.onMarker) {
                    // console.log('IgController::onMarker()', payload, anim);
                    this.onMarker(payload, anim);
                  }
                }
              },
              [marker.payload, animation],
              markerTime
            );
          });
        }

        animation.meta.animation = target;
        animation.meta.timeline = animationTimeline;

        // TODO: parse the timeline and build into root
        // this.rootTimeline?.add(animationTween, 0);
      });
    } else {
      // animation.play();
      // const animation = animations[0];
      // const totalDuration = (animation.totalFrames / animation.frameRate) * 1000;
      // this.rootTimeline = gsap.timeline({
      //   id: 'root',
      //   x : 1,
      //   duration : (totalDuration / 1000),
      //   repeat : 10,
      //   yoyo : true,
      //   paused : true,
      //   ease : Sine.easeOut,
      //   onUpdateParams : [animation],
      //   onUpdate : function(targetAnimation) {
      //     const nextMoment = Math.floor(totalDuration * this.progress());
      //     targetAnimation.goToAndStop(nextMoment); // in milliseconds
      //     // checkFrame(this, anim, nextMoment);
      //   },
      // });
    }
  }

  public getPixi() {
    return this.applications.pixi;
  }

  public getThree() {
    return this.applications.three;
  }

  /**
   * Returns a reference to Lottie.
   * Lottie.loadAnimation would need to accept a params:
   * {
   *       wrapper: svgContainer,
   *       animType: 'threejs', // svg | html | pixi
   *       loop: false,
   *       autoplay: false,
   *       path: 'data.json',
   *       rendererSettings: {
   *         className: 'animation',
   *         preserveAspectRatio: 'xMidYMid meet',
   *         clearCanvas: true,
   *         pixiApplication: app
   *         assetsPath: '' // path to application
   *       },
   *     }
   */
  public getLottie() {
    return this.applications.lottie;
  }

  public setScene(scene: Scene) {
    this.currentScene = scene;
    const three = this.applications.three;
    three.scene = scene;
    three.renderScene = scene;
    // const renderPass = new RenderPass( three.scene, three.camera );
    // three.composer.passes = [renderPass];
  }

  public renderScene(scene: Scene) {
    scene.visible = true;
    this.currentScene = scene;
    const three = this.applications.three;
    three.scene = scene;
    three.renderScene = scene;
    const renderPass = new RenderPass( three.scene, three.camera );
    three.composer.passes = [renderPass];
  }

  public setAnimations(animations: any) {
    // TODO: Unwind all the existing animations??
    // Or store them for a scene transition

    this.animations = [...animations];

    // TODO: Define a root timeline if required
    this.rootTimeline = gsap.timeline({
      id: 'timeline',
      // repeat: 10,
      // duration: 20,
      paused: true,
      // ease : Sine.easeOut,
      onUpdateParams: [this],
      onUpdate: function (controller) {
        // const nextMoment = Math.floor(totalDuration * this.progress());
        // targetAnimation.goToAndStop(nextMoment); // in milliseconds
        // checkFrame(this, anim, nextMoment);
        // console.log('Animating root', this.progress(), controller);
      },
    });

    // Define tweens for all the animations
    this.defineAnimations(animations);

    // TODO: Move this debug stuff below into browser extension
    // GSAP timeline tool
    // GSDevTools.create(); // { animation: this.rootTimeline }
    // const css = '.gs-dev-tools {z-index: 999;}';
    // const head = document.head || document.getElementsByTagName('head')[0];
    // const style: any = document.createElement('style');
    // head.appendChild(style);
    // style.type = 'text/css';
    // if (style.styleSheet) {
    //   // This is required for IE8 and below.
    //   style.styleSheet.cssText = css;
    // } else {
    //   style.appendChild(document.createTextNode(css));
    // }
  }

  public play() {
    if (this.rootTimeline) {
      this.rootTimeline.play();
    }
  }
}
