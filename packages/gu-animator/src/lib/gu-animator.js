import { __decorate, __metadata } from "tslib";
import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
// Registers the element
let GuAnimator = class GuAnimator extends LitElement {
    constructor() {
        super(...arguments);
        this.src = '';
        this.loadedSrc = '';
    }
    static get styles() {
        return css `
        :host {
            display: block;
            background-color: #F2F2F2;
            border-radius: 8px;
            padding: 20px;
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
        // TODO: Pass url to an instance of Parser class return a Promise?
        // Mark as loaded
        this.loadedSrc = url;
        const event = new CustomEvent('loaded', {
            detail: {
                label: 'loaded',
                date: new Date().toISOString(),
                target: this,
            }
        });
        this.dispatchEvent(event);
    }
    getController() {
        // TODO: Return instance of Controller for playback
        return 'hello world';
    }
    render() {
        // Auto load the gu-animator src attribute
        if (this.src && this.loadedSrc != this.src) {
            this.loadAnimation(this.src);
        }
        return html `GU Animator: <span>${this.src}</span>`;
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