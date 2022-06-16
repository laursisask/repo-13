import { Application } from 'pixi.js';
/**
 * GU Animator Controller.
 * Takes a set of animations and manages the playback.
 */
export class GuController {
    constructor(config) {
        this.animations = [];
        if (!config) {
            throw new Error('Invalid gu-animator configuration.');
        }
        else if (!config.container) {
            throw new Error('Invalid gu-animator container.');
        }
        this.container = config.container;
    }
    setAnimations(animations) {
        this.animations = animations;
        // PIXI Background layer
        const SIZEW = 1920;
        const SIZEH = 1080;
        const app = new Application({
            width: SIZEW,
            height: SIZEH,
            backgroundColor: 0xFF00FF,
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
        }
        else {
            throw new Error('Invalid gu-animator container.');
        }
    }
}
//# sourceMappingURL=gu-controller.js.map