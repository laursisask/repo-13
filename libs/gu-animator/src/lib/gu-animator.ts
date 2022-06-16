import { css, html, LitElement } from 'lit';
import { Ref, createRef, ref } from 'lit/directives/ref.js';
import { customElement, property, query } from 'lit/decorators.js';
import { GuController } from './controller/gu-controller';

export interface LoadedEvent {
    date: string;
    target: GuAnimator
}

export interface ErrorEvent {
    error: any,
    message: string;
    target: GuAnimator
}

@customElement('gu-animator')
export class GuAnimator extends LitElement {

    @property()
    public src = '';

    // @query('#container')
    // private container!: HTMLElement;
    private container: Ref<HTMLElement> = createRef();

    private currentSrc = '';
    private controller: GuController | undefined;

    static override get styles() {
        return css`
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
    async loadAnimation(url: string) {
        this.currentSrc = url;

        // TODO: Pass url to an instance of Parser class return a Promise?
        // const parser = new GuParser(config);
        // const animations = await parser.loadAnimation(url);
        const animations: any[] = [];

        // Mark as loaded
        const event = new CustomEvent<LoadedEvent>('loaded', {
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
    }

    connectedCallback() {
        super.connectedCallback()

        // Auto load the gu-animator src attribute
        // TODO: Possibly do this within a different lifecycle event
        console.log('GuAnimator::connectedCallback()', this.container, this.container.value);
        if (this.src && this.currentSrc != this.src) {
            this.loadAnimation(this.src)
              .then((response) => {

                  // Wire up the animations with playback
                  this.controller = new GuController({
                      container: this.container.value
                  });
                  this.controller.setAnimations(response.animations);

              })
              .catch((error) => {

                  // Error loading animation
                  const event = new CustomEvent<ErrorEvent>('error', {
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
    }

    getController() {
        // TODO: Potentially wire up playback methods directly to expose externally
        return this.controller;
    }

    override render() {
        return html`<div ${ref(this.container)}>${this.src}</div>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'gu-animator': GuAnimator;
    }
}

