import { __decorate, __metadata } from "tslib";
import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
// export function guPlayer(): string {
//     return 'gu-player';
// }
// Registers the element
let GuPlayer = class GuPlayer extends LitElement {
    constructor() {
        super(...arguments);
        // Creates a reactive property that triggers rendering
        this.mood = 'great';
    }
    // Render the component's DOM by returning a Lit template
    render() {
        return html `Web Components are <span>${this.mood}</span>!`;
    }
};
__decorate([
    property(),
    __metadata("design:type", Object)
], GuPlayer.prototype, "mood", void 0);
GuPlayer = __decorate([
    customElement('gu-player')
], GuPlayer);
export { GuPlayer };
//# sourceMappingURL=gu-player.js.map