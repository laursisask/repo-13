import { GuConfig } from '../core/gu-config';
/**
 * GU Animator Controller.
 * Takes a set of animations and manages the playback.
 */
export declare class GuController {
    private applications;
    private container;
    private config;
    animations: any[];
    rootTimeline: gsap.core.Timeline | undefined;
    constructor(config: GuConfig);
    /**
     * Init the GU Animator.
     * Setup the PixiJS and Lottie players.
     * @private
     */
    private init;
    /**
     * Init the PixiJS Application and hook into GSAP ticker.
     * @param options
     * @private
     */
    private initPixi;
    private initLottie;
    getPixi(): any;
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
    getLottie(): any;
    setAnimations(animations: any): void;
    play(): void;
}
