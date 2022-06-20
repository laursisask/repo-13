import { __awaiter } from "tslib";
/**
 * GU Animator Parser.
 * Takes json and redirects to the respective renderers depending on animation format.
 */
export class GuParser {
    constructor(config) {
        this.json = {};
        this.config = {};
        this.config = config;
    }
    // converts json into animation instance
    createAnimationInstance(url) {
        return __awaiter(this, void 0, void 0, function* () {
            // Load json to check json format
            const response = yield fetch(url);
            this.json = yield response.json();
            // BodyMovin Animation
            if (Object.keys(this.json).includes('assets')) {
                // returns lottie animation instance
                return [
                    this.config.loaders.lottie.loadAnimation({
                        wrapper: this.config.wrapper,
                        animType: 'pixi',
                        loop: false,
                        autoplay: false,
                        path: url,
                        rendererSettings: {
                            className: 'animation',
                            preserveAspectRatio: 'xMidYMid meet',
                            clearCanvas: true,
                            pixiApplication: this.config.loaders.pixi,
                        },
                    }),
                ];
            }
            // TODO: Spine Animation support
            // if (Object.keys(this.json).includes('skeleton')) {
            // // returns pixi animation instance
            //   return this.loaders.pixi.loadAnimation(this.json);
            // }
            return Promise.resolve([]);
        });
    }
}
//# sourceMappingURL=gu-parser.js.map