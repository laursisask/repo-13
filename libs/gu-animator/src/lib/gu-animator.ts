import { css, html, LitElement } from 'lit';
import { Ref, createRef, ref } from 'lit/directives/ref.js';
import { customElement, property, query } from 'lit/decorators.js';
import { GuController } from './controller/gu-controller';
import { GuParser } from './parser/gu-parser';

export interface LoadingEvent {
  date: string;
  target: GuAnimator;
}

export interface LoadedEvent {
  date: string;
  target: GuAnimator;
}

export interface ErrorEvent {
  error: any;
  message: string;
  target: GuAnimator;
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
  private isLoaded = false;

  static override get styles() {
    return css`
      :host {
        display: block;
        background-color: #f2f2f2;
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
    console.log('GuAnimator::loadAnimation()', url);
    this.currentSrc = url;
    let animations: any[] = [];
    await new Promise((resolve) => requestAnimationFrame(resolve));

    try {
      this.controller = new GuController({
        container: this.container.value,
      });

      const parser = new GuParser({
        loaders: {
          lottie: this.controller.getLottie(),
          pixi: this.controller.getPixi(),
        },
        wrapper: this.container.value,
      });

      // Mark as loading
      const loadingEvent = new CustomEvent<LoadingEvent>('loading', {
        bubbles: true,
        composed: true,
        detail: {
          date: new Date().toISOString(),
          target: this,
        },
      });
      this.dispatchEvent(loadingEvent);

      animations = await parser.loadAnimation(url);
      this.isLoaded = true;

      // Mark as loaded
      const loadedEvent = new CustomEvent<LoadedEvent>('loaded', {
        bubbles: true,
        composed: true,
        detail: {
          date: new Date().toISOString(),
          target: this,
        },
      });
      this.dispatchEvent(loadedEvent);
    } catch (error) {
      // Error loading animation
      const event = new CustomEvent<ErrorEvent>('error', {
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

    // Wire up the animations with playback
    this.controller?.setAnimations(animations);

    return {
      animations,
    };
  }

  connectedCallback() {
    super.connectedCallback();

    // Auto load the gu-animator src attribute
    // TODO: Possibly do this within a different lifecycle event
    console.log('GuAnimator::connectedCallback()', this.container, this.container.value);
    if (this.src && this.currentSrc != this.src) {
      this.loadAnimation(this.src);
    }
  }

  getController() {
    // TODO: Potentially wire up playback methods directly to expose externally
    return this.controller;
  }

  getAnimationAsset(name: string) {
    if (this.isLoaded) {
      const animations = this.controller?.animations;
      animations?.find((a) => {
        return a.name === name;
      });
    }

    return null;
  }

  getTimeline() {
    if (this.isLoaded) {
      return this.controller?.rootTimeline;
    }

    return null;
  }

  override render() {
    return html`<div ${ref(this.container)}></div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gu-animator': GuAnimator;
  }
}
