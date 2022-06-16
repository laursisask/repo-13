import { LitElement } from 'lit';
export interface LoadedEvent {
    label: string;
    date: string;
    target: GuAnimator;
}
export declare class GuAnimator extends LitElement {
    src: string;
    private loadedSrc;
    static get styles(): import("lit").CSSResult;
    loadAnimation(url: string): void;
    getController(): string;
    render(): import("lit-html").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'gu-animator': GuAnimator;
    }
}
