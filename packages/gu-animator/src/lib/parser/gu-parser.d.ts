/**
 * GU Animator Parser.
 * Takes json and redirects to the respective renderers depending on animation format.
 */
export declare class GuParser {
    private json;
    private config;
    constructor(config: any);
    createAnimationInstance(url: string): Promise<any[]>;
}
