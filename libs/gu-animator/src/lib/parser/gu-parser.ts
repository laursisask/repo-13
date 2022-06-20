/**
 * GU Animator Parser.
 * Takes json and redirects to the respective renderers depending on animation format.
 */
export class GuParser {
  private json: any = {};
  private config: any = {};

  constructor(config: any) {
    this.config = config;
  }

  // converts json into animation instance
  async createAnimationInstance(url: string): Promise<any[]> {
    // Load json to check json format
    const response = await fetch(url);
    this.json = await response.json();

    // BodyMovin Animation
    if (Object.keys(this.json).includes('assets')) {
      // returns lottie animation instance
      return [
        this.config.loaders.lottie.loadAnimation({
          wrapper: this.config.wrapper,
          animType: 'pixi', // svg
          loop: false,
          autoplay: false,
          path: url,
          rendererSettings: {
            className: 'animation',
            preserveAspectRatio: 'xMidYMid meet',
            clearCanvas: true,
            pixiApplication: this.config.loaders.pixi,
          },
        } as any),
      ];
    }

    // TODO: Spine Animation support
    // if (Object.keys(this.json).includes('skeleton')) {
    // // returns pixi animation instance
    //   return this.loaders.pixi.loadAnimation(this.json);
    // }
    return Promise.resolve([]);
  }
}
