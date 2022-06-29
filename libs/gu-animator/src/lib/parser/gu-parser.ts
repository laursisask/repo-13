/**
 * GU Animator Parser.
 * Takes json and redirects to the respective renderers depending on animation format.
 */
export class GuParser {
  private json: any = {};
  private config: any = {};
  private url: any = {};

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
      const animation = this.config.loaders.lottie.loadAnimation({
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
      } as any);

      animation.addEventListener('DOMLoaded', () => {
        resolve([animation]);
      });

      animation.addEventListener('data_failed', () => {
        reject('error failed load');
      });

      animation.addEventListener('error', (error: any) => {
        console.log(error, 'error');
        reject('error loading');
      });
    });
  }
}
