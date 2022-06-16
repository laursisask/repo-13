import { LitElement } from 'lit';
export declare class GuAnimator extends LitElement {
    mood: string;
    src: string;
    static get styles(): import("lit").CSSResult;
    render(): import("lit-html").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'gu-animator': GuAnimator;
    }
}
