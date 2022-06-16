import { GuConfig } from '../core/gu-config';
/**
 * GU Animator Controller.
 * Takes a set of animations and manages the playback.
 */
export declare class GuController {
    private animations;
    private container;
    constructor(config: GuConfig);
    setAnimations(animations: any): void;
}
