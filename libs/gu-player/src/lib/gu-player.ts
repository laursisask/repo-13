import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

// export function guPlayer(): string {
//     return 'gu-player';
// }


// Registers the element
@customElement('gu-player')
export class GuPlayer extends LitElement {

    // Creates a reactive property that triggers rendering
    @property()
    mood = 'great';

    // Render the component's DOM by returning a Lit template
    override render() {
        return html`Web Components are <span>${this.mood}</span>!`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'gu-player': GuPlayer;
    }
}

