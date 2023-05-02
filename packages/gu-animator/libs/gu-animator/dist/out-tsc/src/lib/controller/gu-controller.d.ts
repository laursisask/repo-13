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
    onMarker: any;
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
    private initThree;
    private initLottie;
    private defineAnimations;
    getPixi(): any;
    getThree(): any;
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
    getLottie(): any;
    setAnimations(animations: any): void;
    play(): void;
}
