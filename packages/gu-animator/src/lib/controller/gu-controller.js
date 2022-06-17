import { Application } from "pixi.js";
import { gsap } from 'gsap';
import { AnimatedGIFLoader } from '@pixi/gif';
import Lottie from 'lottie-web';
import * as PIXI from 'pixi.js';
// import { GSDevTools } from 'gsap/GSDevTools.js';
import { PixiPlugin } from 'gsap/PixiPlugin';
gsap.registerPlugin(PixiPlugin); // GSDevTools
PixiPlugin.registerPIXI(PIXI);
PIXI.Loader.registerPlugin(AnimatedGIFLoader);
/**
 * GU Animator Controller.
 * Takes a set of animations and manages the playback.
 */
export class GuController {
    constructor(config) {
        this.applications = {};
        this.animations = [];
        if (!config) {
            throw new Error('Invalid gu-animator configuration.');
        }
        else if (!config.container) {
            throw new Error('Invalid gu-animator container.');
        }
        this.container = config.container;
        this.init();
    }
    init() {
        const SIZEW = 1920;
        const SIZEH = 1080;
        this.applications = {
            pixi: this.initPixi({
                width: SIZEW,
                height: SIZEH,
                backgroundColor: 0xFF00FF,
                // backgroundAlpha: 0.5,
                sharedTicker: true,
                sharedLoader: true,
                antialias: false,
                clearBeforeRender: true,
                resolution: 1
            }),
            lottie: this.initLottie()
        };
    }
    initPixi(options) {
        // PIXI Background layer
        const app = new Application(options);
        if (this.container) {
            this.container.innerHTML = '';
            this.container.appendChild(app.view);
        }
        else {
            throw new Error('Invalid gu-animator container.');
        }
        return app;
    }
    initLottie() {
        return Lottie;
    }
    getPixi() {
        return this.applications.pixi;
    }
    /**
     * Returns a reference to Lottie.
     * Lottie.loadAnimation would need to accept a params:
     * {
     *       wrapper: svgContainer,
     *       animType: 'pixi', // svg
     *       loop: false,
     *       autoplay: false,
     *       path: 'data.json',
     *       rendererSettings: {
     *         className: 'animation',
     *         preserveAspectRatio: 'xMidYMid meet',
     *         clearCanvas: true,
     *         pixiApplication: app
     *       },
     *     }
     */
    getLottie() {
        return this.applications.lottie;
    }
    setAnimations(animations) {
        this.animations = animations;
        const animation = animations[0];
        console.log('Set animation', animation);
    }
}
//# sourceMappingURL=gu-controller.js.map