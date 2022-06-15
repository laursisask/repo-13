import { LitElement } from 'lit';
export declare class GuPlayer extends LitElement {
    mood: string;
    render(): import("lit-html").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'gu-player': GuPlayer;
    }
}
