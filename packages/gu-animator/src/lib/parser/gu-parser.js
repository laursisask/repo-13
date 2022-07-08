import { __awaiter } from "tslib";
/**
 * GU Animator Parser.
 * Takes json and redirects to the respective renderers depending on animation format.
 */
export class GuParser {
    constructor(config) {
        this.rootJson = {};
        this.config = {};
        this.url = {};
        this.animationAsset = {};
        this.config = config;
    }
    loadAnimation(url) {
        return __awaiter(this, void 0, void 0, function* () {
            // Load json to check json format
            this.url = url;
            const response = yield fetch(this.url);
            this.rootJson = yield response.json();
            if (Object.keys(this.rootJson).includes('timeline')) {
                return this.loadGuAnimatorJson();
            }
            else if (Object.keys(this.rootJson).includes('ddd')) {
                return this.loadBodymovinJson();
            }
            else {
                // TODO: Spine Animation support
                // if (Object.keys(this.rootJson).includes('skeleton')) {
                // // returns pixi animation instance
                //   return this.loaders.pixi.loadAnimation(this.rootJson);
                // }
                console.warn('Unknown JSON to parse', url);
                return Promise.resolve([]);
            }
        });
    }
    loadGuAnimatorJson() {
        return new Promise((resolve, reject) => {
            const pendingAnimations = this.rootJson.assets;
            let loadedAnimations = [];
            const checkLoading = () => __awaiter(this, void 0, void 0, function* () {
                const loadingAnimation = pendingAnimations.shift();
                this.animationAsset = loadingAnimation;
                if (loadingAnimation.contentPath == this.url) {
                    console.error('Asset contentPath is the same as the parent path. Please check contentPath given.');
                    reject(loadingAnimation);
                }
                this.loadAnimation(loadingAnimation.contentPath).then((animations) => {
                    loadedAnimations = loadedAnimations.concat(animations);
                    if (pendingAnimations.length > 0) {
                        checkLoading();
                    }
                    else {
                        resolve(loadedAnimations);
                    }
                });
            });
            checkLoading();
        });
    }
    loadBodymovinJson() {
        return new Promise((resolve, reject) => {
            // Create lottie animation and hook into loading state
            console.log('body movin asset', this.animationAsset);
            const animation = {
                meta: Object.assign(Object.assign({}, this.animationAsset), { frame: 0 }),
                totalFrames: 0,
                frameRate: 0,
                play: function () {
                    // this.config.loaders.lottie.play()
                    console.log('this play', this.meta.timeline.play());
                },
                stop: () => this.config.loaders.lottie.stop(),
                pause: () => this.config.loaders.lottie.pause(),
                setSpeed: (speed) => this.config.loaders.lottie.setSpeed(speed),
                goToAndStop: (value, isFrame) => this.config.loaders.lottie.goToAndStop(value, isFrame),
                goToAndPlay: (value, isFrame) => this.config.loaders.lottie.goToAndPlay(value, isFrame),
                setDirection: (direction) => this.config.loaders.lottie.setDirection(direction),
                playSegments: (segments, forceFlag) => this.config.loaders.lottie.registerAnimation(segments, forceFlag),
                setSubframe: (useSubFrames) => this.config.loaders.lottie.getRegisteredAnimations(useSubFrames),
                destroy: () => this.config.loaders.lottie.destroy(),
                getDuration: (inFrames) => this.config.loaders.lottie.getDuration(inFrames),
                instance: this.config.loaders.lottie.loadAnimation({
                    wrapper: this.config.wrapper,
                    animType: 'pixi',
                    loop: false,
                    autoplay: false,
                    path: this.url,
                    rendererSettings: {
                        className: 'animation',
                        preserveAspectRatio: 'xMidYMid meet',
                        clearCanvas: true,
                        pixiApplication: this.config.loaders.pixi,
                    },
                }),
            };
            animation.instance.addEventListener('DOMLoaded', () => {
                animation.totalFrames = animation.instance.totalFrames;
                animation.frameRate = animation.instance.frameRate;
                resolve([animation]);
            });
            animation.instance.addEventListener('data_failed', () => {
                reject('error failed load');
            });
            animation.instance.addEventListener('error', (error) => {
                console.log(error, 'error');
                reject('error loading');
            });
        });
    }
}
//# sourceMappingURL=gu-parser.js.map