/**
 * GU Animator Parser.
 * Takes json and redirects to the respective renderers depending on animation format.
 */
export declare class GuParser {
    private rootJson;
    private config;
    private url;
    private animationAsset;
    constructor(config: any);
    loadAnimation(url: string): Promise<any[]>;
    private loadGuAnimatorJson;
    private loadBodymovinJson;
}
