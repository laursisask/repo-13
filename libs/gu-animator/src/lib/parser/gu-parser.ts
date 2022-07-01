/**
 * GU Animator Parser.
 * Takes json and redirects to the respective renderers depending on animation format.
 */
export class GuParser {
  private json: any = {};
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
    this.json = await response.json();

    if (Object.keys(this.json).includes('timeline')) {
      return this.loadGuAnimatorJson();
    } else if (Object.keys(this.json).includes('ddd')) {
      return this.loadBodymovinJson();
    }

    // TODO: Spine Animation support
    // if (Object.keys(this.json).includes('skeleton')) {
    // // returns pixi animation instance
    //   return this.loaders.pixi.loadAnimation(this.json);
    // }

    return Promise.resolve([]);
  }

  private loadGuAnimatorJson() {
    return new Promise<any[]>((resolve, reject) => {
      const pendingAnimations: any[] = this.json.assets;
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
        },
        play: () => this.config.loaders.lottie.play(),
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
        resolve([animation]);
      });

      animation.instance.addEventListener('data_failed', () => {
        reject('error failed load');
      });

      animation.instance.addEventListener('error', (error: any) => {
        console.log(error, 'error');
        reject('error loading');
      });
    });
  }
}
