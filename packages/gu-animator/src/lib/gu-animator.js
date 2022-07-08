import { __awaiter, __decorate, __metadata } from "tslib";
import { css, html, LitElement } from 'lit';
import { createRef, ref } from 'lit/directives/ref.js';
import { customElement, property } from 'lit/decorators.js';
import { GuController } from './controller/gu-controller';
import { GuParser } from './parser/gu-parser';
let GuAnimator = class GuAnimator extends LitElement {
    constructor() {
        super(...arguments);
        this.src = '';
        this.container = createRef();
        this.currentSrc = '';
        this.isLoaded = false;
    }
    static get styles() {
        return css `
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
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
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
            // Wire up the animations for playback
            (_a = this.controller) === null || _a === void 0 ? void 0 : _a.setAnimations(animations);
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
            });
        }
        if (!this.parser) {
            this.parser = new GuParser({
                loaders: {
                    lottie: this.controller.getLottie(),
                    pixi: this.controller.getPixi(),
                },
                wrapper: this.container.value,
            });
        }
        // Auto load the gu-animator src attribute
        // TODO: Possibly do this within a different lifecycle event
        console.log('GuAnimator::firstUpdated()', this.container, this.container.value);
        if (this.src && this.currentSrc != this.src) {
            this.loadAnimation(this.src);
        }
    }
    render() {
        return html `<div ${ref(this.container)}></div>`;
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
};
__decorate([
    property(),
    __metadata("design:type", Object)
], GuAnimator.prototype, "src", void 0);
GuAnimator = __decorate([
    customElement('gu-animator')
], GuAnimator);
export { GuAnimator };
//# sourceMappingURL=gu-animator.js.map