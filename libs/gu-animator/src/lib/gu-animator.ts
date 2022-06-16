import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

// Registers the element
@customElement('gu-animator')
export class GuAnimator extends LitElement {

    // Creates a reactive property that triggers rendering
    @property()
    public mood = 'great';

    @property()
    public src = '';

    static override get styles() {
        return css`
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

    override render() {
        return html`GU Animator: <span>${this.src}</span>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'gu-animator': GuAnimator;
    }
}

