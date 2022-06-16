import './app.element.scss';
import '@immutable/gu-animator';
import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('animator-examples')
export class AppElement extends LitElement {
  onLoaded(event) {
    console.log('nada', event);
  }

  override render() {
    const title = 'GU Animator examples';
    return html`
    <div class="wrapper">
      <div class="container">
        <!--  WELCOME  -->
        <div id="welcome" style="margin-bottom:40px;">
          <h1>
            <span> Hello there, </span>
            Welcome ${title} 👋
          </h1>
        </div>

        <gu-animator src="assets/data.json" @loaded=${this.onLoaded}></gu-animator>
      </div>
    </div>
      `;
  }
}
