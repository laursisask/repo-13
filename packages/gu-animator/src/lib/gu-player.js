import { __decorate, __metadata } from "tslib";
import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
// Registers the element
let GuPlayer = class GuPlayer extends LitElement {
    constructor() {
        super(...arguments);
        // Creates a reactive property that triggers rendering
        this.mood = 'great';
        this.src = '';
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
    render() {
        return html `GU Animator: <span>${this.src}</span>`;
    }
};
__decorate([
    property(),
    __metadata("design:type", Object)
], GuPlayer.prototype, "mood", void 0);
__decorate([
    property(),
    __metadata("design:type", Object)
], GuPlayer.prototype, "src", void 0);
GuPlayer = __decorate([
    customElement('gu-player')
], GuPlayer);
export { GuPlayer };
//# sourceMappingURL=gu-player.js.map