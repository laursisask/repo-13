(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('../node_modules/tslib/tslib.es6.js'), require('lit'), require('lit/directives/ref.js'), require('lit/decorators.js'), require('gsap'), require('lottie-web'), require('three'), require('three/examples/jsm/loaders/GLTFLoader')) :
    typeof define === 'function' && define.amd ? define(['exports', '../node_modules/tslib/tslib.es6', 'lit', 'lit/directives/ref.js', 'lit/decorators.js', 'gsap', 'lottie-web', 'three', 'three/examples/jsm/loaders/GLTFLoader'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.guAnimator = {}, global.tslib_es6_js, global.lit, global.lit, global.lit, global.gsap, global.lottie, global.three, global.GLTFLoader));
})(this, (function (exports, tslib_es6_js, lit, ref_js, decorators_js, gsap, Lottie, three, GLTFLoader) { 'use strict';

    function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

    var Lottie__default = /*#__PURE__*/_interopDefaultLegacy(Lottie);

    /**
     * GU Animator Controller.
     * Takes a set of animations and manages the playback.
     */
    class GuController {
        constructor(config) {
            this.applications = {};
            this.animations = [];
            if (!config) {
                throw new Error('Invalid gu-animator configuration.');
            }
            else if (!config.container) {
                throw new Error('Invalid gu-animator configuration missing container.');
            }
            this.config = config;
            this.container = config.container;
            this.init();
        }
        /**
         * Init the GU Animator.
         * Setup the PixiJS and Lottie players.
         * @private
         */
        init() {
            const SIZEW = 1778; // 1920;
            const SIZEH = 1000; // 1080;
            this.applications = {
                // three: {},
                three: this.initThree({
                    width: SIZEW,
                    height: SIZEH,
                }),
                // TODO: Abstract out to a renderer application provider
                // pixi: this.initPixi({
                //   width: SIZEW,
                //   height: SIZEH,
                //   backgroundColor: 0xff00ff, // pink
                //   // backgroundAlpha: 0.5,
                //   sharedTicker: true,
                //   sharedLoader: true,
                //   antialias: false,
                //   clearBeforeRender: true,
                //   resolution: 1,
                // }),
                lottie: this.initLottie(),
            };
        }
        /**
         * Init the PixiJS Application and hook into GSAP ticker.
         * @param options
         * @private
         */
        initPixi(options) {
            // PIXI Background layer
            const app = {}; // new Application(options);
            // Install EventSystem, if not already
            // (PixiJS 6 doesn't add it by default)
            // if (!('events' in app.renderer)) {
            //   app.renderer.addSystem(EventSystem, 'events');
            // }
            if (this.container) {
                this.container.innerHTML = '';
                // this.container.appendChild(app.view);
            }
            else {
                throw new Error('Invalid gu-animator container.');
            }
            // We stop Pixi ticker using stop() function because autoStart = false does NOT stop the shared ticker:
            // doc: http://pixijs.download/release/docs/PIXI.Application.html
            // app.ticker.stop();
            // gsap.ticker.add(() => {
            //   app.ticker.update();
            // });
            return app;
        }
        initThree(options) {
            const three$1 = {
                scene: new three.Scene(),
                camera: new three.PerspectiveCamera(25, (options.width || 1) / (options.height || 1), 0.1, 20000),
                renderer: new three.WebGLRenderer({ antialias: true }),
                load: (filePath, onLoad, onProgress, onError) => {
                    const loader = new GLTFLoader.GLTFLoader();
                    loader.load(filePath, onLoad, onProgress, onError);
                    return loader;
                },
                clock: new three.Clock(),
                mixers: [],
                controls: false
            };
            three$1.camera.fov = 25;
            three$1.camera.focus = 10;
            three$1.camera.updateProjectionMatrix();
            // NOTE: Default to previous color space for pngs in After Effects
            three$1.renderer.outputEncoding = three.LinearEncoding;
            three$1.renderer.setPixelRatio(window.devicePixelRatio);
            three$1.renderer.setSize(options.width, options.height);
            // if (!three.controls) {
            //   three.controls = new OrbitControls(three.camera, three.renderer.domElement);
            //   three.controls.listenToKeyEvents(window); // optional
            // }
            return three$1;
        }
        initLottie() {
            return Lottie__default["default"];
        }
        defineAnimations(animations) {
            if (animations.length > 0) {
                animations.forEach((animation) => {
                    const totalDuration = (animation.totalFrames / animation.frameRate) * 1000;
                    const target = { frame: 0 };
                    const animationTimeline = gsap.gsap.timeline({
                        id: animation.meta.id,
                        paused: true,
                        repeat: animation.meta.repeat,
                    });
                    // Define tween for animation frame
                    animationTimeline.to(target, {
                        duration: (totalDuration / 1000),
                        frame: 1,
                        onUpdateParams: [animation],
                        onUpdate: function (targetAnimation) {
                            const nextMoment = Math.floor(totalDuration * this.progress());
                            targetAnimation.instance.goToAndStop(nextMoment); // in milliseconds
                            // if (targetAnimation.instance.path === '/assets/pack-opening/') {
                            //   console.log(targetAnimation.instance.currentFrame, nextMoment);
                            // }
                        }
                    });
                    animation.meta.timeline = animationTimeline;
                    // Convert animation markers to GSAP labels
                    const markers = animation.instance.markers;
                    if ((markers === null || markers === void 0 ? void 0 : markers.length) > 0) {
                        markers.forEach((marker) => {
                            // Convert marker frame to timeline time
                            const markerTime = marker.time / animation.frameRate;
                            animation.meta.timeline.addLabel(marker.payload.name, markerTime);
                            animation.meta.timeline.call((payload, anim) => {
                                if (this.onMarker) {
                                    this.onMarker(payload, anim);
                                }
                            }, [marker.payload, animation], markerTime);
                        });
                    }
                    // TODO: parse the timeline and build into root
                    // this.rootTimeline?.add(animationTween, 0);
                });
            }
        }
        getPixi() {
            return this.applications.pixi;
        }
        getThree() {
            return this.applications.three;
        }
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
        getLottie() {
            return this.applications.lottie;
        }
        setAnimations(animations) {
            this.animations = [...animations];
            // TODO: Define a root timeline if required
            this.rootTimeline = gsap.gsap.timeline({
                id: 'timeline',
                // repeat: 10,
                // duration: 20,
                paused: true,
                // ease : Sine.easeOut,
                onUpdateParams: [this],
                onUpdate: function (controller) {
                    // const nextMoment = Math.floor(totalDuration * this.progress());
                    // targetAnimation.goToAndStop(nextMoment); // in milliseconds
                    // checkFrame(this, anim, nextMoment);
                    // console.log('Animating root', this.progress(), controller);
                },
            });
            // Define tweens for all the animations
            this.defineAnimations(animations);
            // TODO: Move this debug stuff below into browser extension
            // GSAP timeline tool
            // GSDevTools.create(); // { animation: this.rootTimeline }
            const css = '.gs-dev-tools {z-index: 999;}';
            const head = document.head || document.getElementsByTagName('head')[0];
            const style = document.createElement('style');
            head.appendChild(style);
            style.type = 'text/css';
            if (style.styleSheet) {
                // This is required for IE8 and below.
                style.styleSheet.cssText = css;
            }
            else {
                style.appendChild(document.createTextNode(css));
            }
        }
        play() {
            if (this.rootTimeline) {
                this.rootTimeline.play();
            }
        }
    }

    /**
     * GU Animator Parser.
     * Takes json and redirects to the respective renderers depending on animation format.
     */
    class GuParser {
        constructor(config) {
            this.rootJson = {};
            this.config = {};
            this.url = {};
            this.animationAsset = {};
            this.config = config;
        }
        loadAnimation(url) {
            return tslib_es6_js.__awaiter(this, void 0, void 0, function* () {
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
                const checkLoading = () => tslib_es6_js.__awaiter(this, void 0, void 0, function* () {
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
                var _a;
                const assetsPath = this.url.substring(0, this.url.lastIndexOf('/') + 1);
                console.log('GUParser::loadBodyMovinJson()', this.url, assetsPath);
                // Create lottie animation and hook into loading state
                const animation = {
                    meta: Object.assign(Object.assign({}, this.animationAsset), { frame: 0 }),
                    totalFrames: 0,
                    frameRate: 0,
                    play: function () {
                        // play via gsap
                        this.meta.timeline && this.meta.timeline.play();
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
                        animType: 'three',
                        loop: true,
                        prerender: true,
                        autoplay: true,
                        path: this.url,
                        rendererSettings: {
                            className: 'animation',
                            preserveAspectRatio: 'xMidYMid meet',
                            clearCanvas: true,
                            assetsPath: ((_a = this.config.assetsPath) === null || _a === void 0 ? void 0 : _a.length) > 0 ? this.config.assetsPath : assetsPath,
                            renderer: this.config.renderer,
                        },
                    }),
                };
                // pixiApplication: this.config.loaders.pixi,
                animation.instance.addEventListener('DOMLoaded', () => {
                    animation.totalFrames = animation.instance.totalFrames;
                    animation.frameRate = animation.instance.frameRate;
                    resolve([animation]);
                });
                animation.instance.addEventListener('data_failed', () => {
                    reject('error failed load');
                });
                animation.instance.addEventListener('error', (error) => {
                    console.error(error);
                    reject('error loading');
                });
            });
        }
    }

    exports.GuAnimator = class GuAnimator extends lit.LitElement {
        constructor() {
            super(...arguments);
            this.src = '';
            this.assetsPath = '';
            this.renderer = 'threejs';
            this.container = ref_js.createRef();
            this.currentSrc = '';
            this.isLoaded = false;
        }
        static get styles() {
            return lit.css `
      :host {
        display: block;
        background-color: #f2f2f2;
        color: #5c5c5c;
      }
    `;
        }
        /**
         * Load the animation and all it's assets.
         * @param url
         */
        loadAnimation(url) {
            return tslib_es6_js.__awaiter(this, void 0, void 0, function* () {
                // console.log('GuAnimator::loadAnimation()', url);
                this.currentSrc = url;
                let animations = [];
                yield new Promise((resolve) => requestAnimationFrame(resolve));
                this.loading();
                try {
                    animations = yield this.parser.loadAnimation(url);
                }
                catch (error) {
                    // Error loading animation
                    const event = new CustomEvent('error', {
                        bubbles: true,
                        composed: true,
                        detail: {
                            error,
                            message: 'Error loading',
                            target: this,
                        },
                    });
                    this.dispatchEvent(event);
                }
                // Wire up the marker events
                if (this.controller) {
                    this.controller.onMarker = (marker, animation) => {
                        // console.log('GUAnimator::onMarker', marker, animation);
                        this.marker(marker, animation);
                    };
                    // Wire up the animations for playback
                    this.controller.setAnimations(animations);
                }
                this.loaded();
                return {
                    animations,
                };
            });
        }
        /**
         * Lifecycle callback as element has just rendered.
         * Use this to bootstrap the gu-animator.
         */
        firstUpdated() {
            // Bootstrap the gu-animator controller
            if (!this.controller) {
                this.controller = new GuController({
                    container: this.container.value,
                    renderer: this.renderer
                });
            }
            // Bootstrap the gu-animator parser
            if (!this.parser) {
                let rendererInstance;
                if (this.renderer === 'pixi') {
                    rendererInstance = this.controller.getPixi();
                }
                else if (this.renderer === 'threejs') {
                    rendererInstance = this.controller.getThree();
                }
                this.parser = new GuParser({
                    loaders: {
                        lottie: this.controller.getLottie(),
                    },
                    wrapper: this.container.value,
                    assetsPath: this.assetsPath,
                    renderer: rendererInstance,
                });
            }
            // Auto load the gu-animator src attribute
            if (this.src && this.currentSrc != this.src) {
                this.loadAnimation(this.src);
            }
        }
        render() {
            return lit.html `<div ${ref_js.ref(this.container)}></div>`;
        }
        getAnimationAsset(name) {
            var _a;
            let animation;
            if (this.isLoaded) {
                const animations = (_a = this.controller) === null || _a === void 0 ? void 0 : _a.animations;
                animation = animations === null || animations === void 0 ? void 0 : animations.find((a) => { var _a; return ((_a = a.meta) === null || _a === void 0 ? void 0 : _a.id) === name; });
            }
            return animation;
        }
        getTimeline() {
            var _a;
            if (this.isLoaded) {
                return (_a = this.controller) === null || _a === void 0 ? void 0 : _a.rootTimeline;
            }
            else {
                return null;
            }
        }
        /**
         * Dispatch loading event.
         * @private
         */
        loading() {
            this.isLoaded = false;
            // Mark as loading
            const loadingEvent = new CustomEvent('loading', {
                bubbles: true,
                composed: true,
                detail: {
                    date: new Date().toISOString(),
                    target: this,
                },
            });
            this.dispatchEvent(loadingEvent);
        }
        /**
         * Dispatch loaded event.
         * @private
         */
        loaded() {
            this.isLoaded = true;
            // Mark as loaded
            const loadedEvent = new CustomEvent('loaded', {
                bubbles: true,
                composed: true,
                detail: {
                    date: new Date().toISOString(),
                    target: this,
                },
            });
            this.dispatchEvent(loadedEvent);
        }
        /**
         * Dispatch marker event.
         * @private
         */
        marker(marker, animation) {
            // Marker
            const markerEvent = new CustomEvent('marker', {
                bubbles: true,
                composed: true,
                detail: {
                    marker,
                    animation,
                    target: this,
                },
            });
            this.dispatchEvent(markerEvent);
        }
    };
    tslib_es6_js.__decorate([
        decorators_js.property(),
        tslib_es6_js.__metadata("design:type", Object)
    ], exports.GuAnimator.prototype, "src", void 0);
    tslib_es6_js.__decorate([
        decorators_js.property(),
        tslib_es6_js.__metadata("design:type", Object)
    ], exports.GuAnimator.prototype, "assetsPath", void 0);
    tslib_es6_js.__decorate([
        decorators_js.property(),
        tslib_es6_js.__metadata("design:type", String)
    ], exports.GuAnimator.prototype, "renderer", void 0);
    exports.GuAnimator = tslib_es6_js.__decorate([
        decorators_js.customElement('gu-animator')
    ], exports.GuAnimator);

    Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=index.cjs.map
