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

export interface MarkerEvent {
  marker: any;
  animation: any;
  target: GuAnimator;
}

export type GuRenderer = 'pixi' | 'threejs';

@customElement('gu-animator')
export class GuAnimator extends LitElement {
  @property()
  public src = '';

  @property()
  public assetsPath = '';

  @property()
  public renderer: GuRenderer = 'threejs';

  private container: Ref<HTMLElement> = createRef();
  private currentSrc = '';
  private controller!: GuController;
  private parser!: GuParser;
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

  /**
   * Load the animation and all it's assets.
   * @param url
   */
  async loadAnimation(url: string) {
    // console.log('GuAnimator::loadAnimation()', url);
    this.currentSrc = url;
    let animations: any[] = [];
    await new Promise((resolve) => requestAnimationFrame(resolve));
    this.loading();

    try {
      animations = await this.parser.loadAnimation(url);

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

    // Wire up the marker events
    if (this.controller) {
      this.controller.onMarker = (marker: any, animation: any) => {
        // console.log('GUAnimator::onMarker', marker, animation);
        this.marker(marker, animation);
      };

      // Wire up the animations for playback
      this.controller.setAnimations(animations);
    }
    this.loaded();

    return {
      animations,
    };
  }

  /**
   * Lifecycle callback as element has just rendered.
   * Use this to bootstrap the gu-animator.
   */
  firstUpdated() {
    // Bootstrap the gu-animator controller
    if (!this.controller) {
      this.controller = new GuController({
        container : this.container.value,
      });
    }

    // Bootstrap the gu-animator parser
    if (!this.parser) {
      let rendererInstance: any;
      if (this.renderer === 'pixi') {

        rendererInstance = this.controller.getPixi();
      } else if (this.renderer === 'threejs') {

        rendererInstance = this.controller.getThree();
      }

      this.parser = new GuParser({
        loaders: {
          lottie: this.controller.getLottie(),
          [this.renderer]: rendererInstance,
        },
        wrapper: this.container.value,
        assetsPath: this.assetsPath,
      });
    }

    // Auto load the gu-animator src attribute
    if (this.src && this.currentSrc != this.src) {
      this.loadAnimation(this.src);
    }
  }

  override render() {
    return html`<div ${ref(this.container)}></div>`;
  }

  getAnimationAsset(name: string) {
    let animation;
    if (this.isLoaded) {
      const animations = this.controller?.animations;
      animation = animations?.find((a) => a.meta?.id === name);
    }

    return animation;
  }

  getTimeline() {
    if (this.isLoaded) {
      return this.controller?.rootTimeline;
    } else {
      return null;
    }
  }

  /**
   * Dispatch loading event.
   * @private
   */
  private loading() {
    this.isLoaded = false;

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
  }

  /**
   * Dispatch loaded event.
   * @private
   */
  private loaded() {
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
  }

  /**
   * Dispatch marker event.
   * @private
   */
  private marker(marker: any, animation: any) {
    // Marker
    const markerEvent = new CustomEvent<MarkerEvent>('marker', {
      bubbles: true,
      composed: true,
      detail: {
        marker,
        animation,
        target: this,
      },
    });
    this.dispatchEvent(markerEvent);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gu-animator': GuAnimator;
  }
}
