import { __awaiter, __decorate, __metadata } from "tslib";
import { css, html, LitElement } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { GuController } from './controller/gu-controller';
let GuAnimator = class GuAnimator extends LitElement {
    constructor() {
        super(...arguments);
        this.src = '';
        this.currentSrc = '';
    }
    static get styles() {
        return css `
            :host {
                display: block;
                background-color: #F2F2F2;
                border-radius: 8px;
                padding: 20px;
                color: #5c5c5c;
            }
        `;
    }
    // Render the component's DOM by returning a Lit template
    // TODO: Potentially hook into a lit element life cycle event to create a GUAnimator instance
    // 1 - Create a Parser class
    // 2 - Load the JSON and parse into Animation instances
    // 3 - Create a Controller class
    // 4 - Orchestrate the Animation instances via the Controller class
    loadAnimation(url) {
        return __awaiter(this, void 0, void 0, function* () {
            this.currentSrc = url;
            // TODO: Pass url to an instance of Parser class return a Promise?
            // const parser = new GuParser(config);
            // const animations = await parser.loadAnimation(url);
            const animations = [];
            // Mark as loaded
            const event = new CustomEvent('loaded', {
                bubbles: true,
                composed: true,
                detail: {
                    date: new Date().toISOString(),
                    target: this,
                }
            });
            this.dispatchEvent(event);
            return {
                animations
            };
        });
    }
    getController() {
        // TODO: Potentially wire up playback methods directly to expose externally
        return this.controller;
    }
    render() {
        // Auto load the gu-animator src attribute
        if (this.src && this.currentSrc != this.src) {
            this.loadAnimation(this.src)
                .then((response) => {
                // Wire up the animations with playback
                this.controller = new GuController({
                    container: this.container
                });
                this.controller.setAnimations(response.animations);
            })
                .catch((error) => {
                // Error loading animation
                const event = new CustomEvent('loaded', {
                    bubbles: true,
                    composed: true,
                    detail: {
                        error,
                        message: 'Error loading',
                        target: this,
                    }
                });
                this.dispatchEvent(event);
            });
        }
        return html `<div #container>${this.src}</div>`;
    }
};
__decorate([
    property(),
    __metadata("design:type", Object)
], GuAnimator.prototype, "src", void 0);
__decorate([
    query('#container'),
    __metadata("design:type", HTMLElement)
], GuAnimator.prototype, "container", void 0);
GuAnimator = __decorate([
    customElement('gu-animator')
], GuAnimator);
export { GuAnimator };
//# sourceMappingURL=gu-animator.js.map