import { Howl } from 'howler';
import { AudioProxy } from '../audio/audio-proxy';

/**
 * GU Animator Parser.
 * Takes json and redirects to the respective renderers depending on animation format.
 */
export class IgParser {
  public config: any = {};

  private rootJson: any = {};
  private url: any = {};
  private initialUrl: string;
  private animationAsset: any = {};

  constructor(config: any) {
    this.config = config;
    this.initialUrl = '';
  }

  async loadAnimation(url: string, isChildAnimation = false): Promise<any[]> {
    // Load json to check json format
    this.url = url;
    if (!isChildAnimation) {
      this.initialUrl = url;
    }
    const response = await fetch(this.url);
    this.rootJson = await response.json();

    if (Object.keys(this.rootJson).includes('timeline')) {
      return this.loadGuAnimatorJson();
    } else if (Object.keys(this.rootJson).includes('ddd')) {
      return this.loadBodymovinJson();
    } else {
      // TODO: Spine Animation support
      // if (Object.keys(this.rootJson).includes('skeleton')) {
      // // returns pixi animation instance
      //   return this.loaders.pixi.loadAnimation(this.rootJson);
      // }

      console.warn('Unknown JSON to parse', url);
      return Promise.resolve([]);
    }
  }

  private loadGuAnimatorJson() {
    return new Promise<any[]>((resolve, reject) => {
      const pendingAnimations: any[] = this.rootJson.assets;
      let loadedAnimations: any[] = [];

      const checkLoading = async () => {
        const loadingAnimation = pendingAnimations.shift();
        this.animationAsset = loadingAnimation;

        let contentPath = loadingAnimation.contentPath;
        if (loadingAnimation.contentPath == this.url) {
          console.error(
            'Asset contentPath is the same as the parent path. Please check contentPath given.'
          );
          reject(loadingAnimation);
        } else {
          // Append the content Path to be relative to the original url
          if (!loadingAnimation.contentPath.includes('/') ||
            (!loadingAnimation.contentPath.startsWith('http') && !loadingAnimation.contentPath.startsWith('/'))) {
            const assetsPath = this.initialUrl.substring(0, this.initialUrl.lastIndexOf('/') + 1);

            contentPath = `${assetsPath}${loadingAnimation.contentPath}`;
          }
        }

        this.loadAnimation(contentPath, true).then((animations) => {
          loadedAnimations = loadedAnimations.concat(animations);

          if (pendingAnimations.length > 0) {
            checkLoading();
          } else {
            resolve(loadedAnimations);
          }
        });
      };

      checkLoading();
    });
  }

  private loadBodymovinJson() {
    return new Promise<any[]>((resolve, reject) => {
      const assetsPath = this.url.substring(0, this.url.lastIndexOf('/') + 1);

      console.log('Loading new animation', this.url, assetsPath, this.config);
      console.log('LoadBodymovinJson', this.config);
      console.log('LoadBodymovinJson >> ', this.config.renderer);
      // Create lottie animation and hook into loading state
      const animation = {
        meta: {
          ...this.animationAsset,
          frame: 0,
        },
        totalFrames: 0,
        frameRate: 0,
        play: function () {
          // play via gsap
          this.meta.timeline && this.meta.timeline.play();
        },
        stop: () => this.config.loaders.lottie.stop(),
        pause: () => this.config.loaders.lottie.pause(),
        setSpeed: (speed: number) => this.config.loaders.lottie.setSpeed(speed),
        goToAndStop: (value: number, isFrame: boolean) =>
          this.config.loaders.lottie.goToAndStop(value, isFrame),
        goToAndPlay: (value: number, isFrame: boolean) =>
          this.config.loaders.lottie.goToAndPlay(value, isFrame),
        setDirection: (direction: number) =>
          this.config.loaders.lottie.setDirection(direction),
        playSegments: (segments: [], forceFlag: boolean) =>
          this.config.loaders.lottie.registerAnimation(segments, forceFlag),
        setSubframe: (useSubFrames: boolean) =>
          this.config.loaders.lottie.getRegisteredAnimations(useSubFrames),
        destroy: () => this.config.loaders.lottie.destroy(),
        unload: () => this.config.loaders.lottie.unload(),
        getDuration: (inFrames: boolean) =>
          this.config.loaders.lottie.getDuration(inFrames),
        instance: this.config.loaders.lottie.loadAnimation({
          wrapper: this.config.wrapper,
          animType: 'threejs',
          loop: true,
          prerender: true,
          autoplay: false,
          path: this.url,
          rendererSettings: {
            className: 'animation',
            preserveAspectRatio: 'xMidYMid meet',
            clearCanvas: true,
            assetsPath:
              this.config.assetsPath?.length > 0
                ? this.config.assetsPath
                : assetsPath,
            renderer: this.config.renderer,
            renderScene: this.config.scene,
            scene: this.config.scene,
          },
          audioFactory: (assetPath: string) => {
            // console.log('Audio Factory new:', assetPath);
            return new AudioProxy(assetPath);
          }
        } as any),
      };
      // pixiApplication: this.config.loaders.pixi,

      animation.instance.addEventListener('DOMLoaded', () => {
        animation.totalFrames = animation.instance.totalFrames;
        animation.frameRate = animation.instance.frameRate;
        resolve([animation]);
      });

      animation.instance.addEventListener('data_failed', () => {
        reject('error failed load');
      });

      animation.instance.addEventListener('error', (error: any) => {
        console.error(error);
        reject('error loading');
      });
    });
  }
}
