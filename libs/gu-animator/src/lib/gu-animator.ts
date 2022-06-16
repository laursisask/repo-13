import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';


export interface LoadedEvent {
    label: string;
    date: string;
    target: GuAnimator
}


// Registers the element
@customElement('gu-animator')
export class GuAnimator extends LitElement {

    @property()
    public src = '';

    private loadedSrc = '';

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
    loadAnimation(url: string) {
        // TODO: Pass url to an instance of Parser class return a Promise?

        // Mark as loaded
        this.loadedSrc = url;
        const event = new CustomEvent<LoadedEvent>('loaded', {
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

    override render() {
        // Auto load the gu-animator src attribute
        if (this.src && this.loadedSrc != this.src) {
            this.loadAnimation(this.src);
        }

        return html`GU Animator: <span>${this.src}</span>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'gu-animator': GuAnimator;
    }
}

