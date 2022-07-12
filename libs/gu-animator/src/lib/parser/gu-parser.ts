/**
 * GU Animator Parser.
 * Takes json and redirects to the respective renderers depending on animation format.
 */
export class GuParser {
  private rootJson: any = {};
  private config: any = {};
  private url: any = {};
  private animationAsset: any = {};

  constructor(config: any) {
    this.config = config;
  }

  async loadAnimation(url: string): Promise<any[]> {
    // Load json to check json format
    this.url = url;
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

        if (loadingAnimation.contentPath == this.url) {
          console.error('Asset contentPath is the same as the parent path. Please check contentPath given.');
          reject(loadingAnimation);
        }

        this.loadAnimation(loadingAnimation.contentPath).then((animations) => {
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
        goToAndStop: (value: number, isFrame: boolean) => this.config.loaders.lottie.goToAndStop(value, isFrame),
        goToAndPlay: (value: number, isFrame: boolean) => this.config.loaders.lottie.goToAndPlay(value, isFrame),
        setDirection: (direction: number) => this.config.loaders.lottie.setDirection(direction),
        playSegments: (segments: [], forceFlag: boolean) =>
          this.config.loaders.lottie.registerAnimation(segments, forceFlag),
        setSubframe: (useSubFrames: boolean) => this.config.loaders.lottie.getRegisteredAnimations(useSubFrames),
        destroy: () => this.config.loaders.lottie.destroy(),
        getDuration: (inFrames: boolean) => this.config.loaders.lottie.getDuration(inFrames),
        instance: this.config.loaders.lottie.loadAnimation({
          wrapper: this.config.wrapper,
          animType: 'pixi',
          loop: false,
          autoplay: false,
          path: this.url,
          rendererSettings: {
            className: 'animation',
            preserveAspectRatio: 'xMidYMid meet',
            clearCanvas: true,
            pixiApplication: this.config.loaders.pixi,
          },
        } as any),
      };

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
