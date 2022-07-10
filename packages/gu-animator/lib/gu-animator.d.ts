import { LitElement } from 'lit';
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
export declare class GuAnimator extends LitElement {
    src: string;
    private container;
    private currentSrc;
    private controller;
    private parser;
    private isLoaded;
    static get styles(): import("lit").CSSResult;
    /**
     * Load the animation and all it's assets.
     * @param url
     */
    loadAnimation(url: string): Promise<{
        animations: any[];
    }>;
    /**
     * Lifecycle callback as element has just rendered.
     * Use this to bootstrap the gu-animator.
     */
    firstUpdated(): void;
    render(): import("lit-html").TemplateResult<1>;
    getAnimationAsset(name: string): any;
    getTimeline(): gsap.core.Timeline | null | undefined;
    /**
     * Dispatch loading event.
     * @private
     */
    private loading;
    /**
     * Dispatch loaded event.
     * @private
     */
    private loaded;
}
declare global {
    interface HTMLElementTagNameMap {
        'gu-animator': GuAnimator;
    }
}
