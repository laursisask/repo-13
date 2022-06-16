import './app.element.scss';
import '@immutable/gu-animator';

export class AppElement extends HTMLElement {
  public static observedAttributes = [

  ];

  connectedCallback() {
    const title = 'GU Animator examples';
    this.innerHTML = `
    <div class="wrapper">
      <div class="container">
        <!--  WELCOME  -->
        <div id="welcome" style="margin-bottom:40px;">
          <h1>
            <span> Hello there, </span>
            Welcome ${title} 👋
          </h1>
        </div>

        <gu-animator src="assets/data.json"></gu-animator>
      </div>
    </div>
      `;
  }
}
customElements.define('immutable-root', AppElement);
