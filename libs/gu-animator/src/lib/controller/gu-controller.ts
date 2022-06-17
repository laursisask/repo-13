import { GuConfig } from '../core/gu-config';
import {
  Application, Loader, Text, Ticker, Sprite, Container, BLEND_MODES
} from 'pixi.js';
import * as gsap from "gsap";

// gsap.registerPlugin(PixiPlugin, GSDevTools);
// PixiPlugin.registerPIXI(PIXI);
// PIXI.Loader.registerPlugin(AnimatedGIFLoader);

/**
 * GU Animator Controller.
 * Takes a set of animations and manages the playback.
 */
export class GuController {

  private animations: any[] = [];
  private container!: HTMLElement;


  constructor(config: GuConfig) {
    if (!config) {
      throw new Error('Invalid gu-animator configuration.');
    } else if (!config.container) {
      throw new Error('Invalid gu-animator container.');
    }

    this.container = config.container;
    this.init();
  }

  private init() {

    // PIXI Background layer
    const SIZEW = 1920;
    const SIZEH = 1080;
    const app = new Application({
      width: SIZEW,
      height: SIZEH,
      backgroundColor: 0xFF00FF, // pink
      // backgroundAlpha: 0.5,
      sharedTicker: true,
      sharedLoader: true,
      antialias: false,
      clearBeforeRender: true,
      resolution: 1
    });

    if (this.container) {
      this.container.innerHTML = '';
      this.container.appendChild(app.view);
    } else {
      throw new Error('Invalid gu-animator container.');
    }
  }

  public getPixi() {
    // TODO: return pixi application / loader
  }

  public getLotti() {
    // TODO: return pixi application / loader
  }

  public setAnimations(animations: any) {
    this.animations = animations;
  }
}
