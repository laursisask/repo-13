import './app.element.scss';
import '@immutable/gu-animator';
import { html, LitElement } from 'lit';
import { Ref, createRef, ref } from 'lit/directives/ref.js';
import { customElement, eventOptions } from 'lit/decorators.js';
import * as THREE from 'three';

import { gsap, Power1 } from 'gsap';
// import { PixiPlugin } from 'gsap/all';
// import * as PIXI from 'pixi.js';
// import { InteractionEvent, BLEND_MODES } from "pixi.js";
// import { blendFullArray } from '@pixi/picture';

// gsap.registerPlugin(PixiPlugin);
// PixiPlugin.registerPIXI(PIXI);

// const customBlendModes = [blendFullArray[BLEND_MODES.LIGHTEN]];

// // Scale mode for all textures, will retain pixelation
// PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

@customElement('animator-examples')
export class AppElement extends LitElement {
  private animatorRef: Ref<HTMLElement> = createRef();
  private mouse = { x: 0, y: 0 };
  private openPosition = [1150, 645, 780];

  private initPack = false;

  @eventOptions({ passive: true })
  onLoaded(event) {

    // Start the background animation
    let packObj;
    const guAnimator = event.detail.target;
    const background = guAnimator.getAnimationAsset('bg');
    const timeline = background.meta.timeline;
    timeline.repeat = -1;
    timeline.play();

    document.addEventListener('mousemove', (e) => {
      const rect = guAnimator.getBoundingClientRect();
      const x = e.clientX - rect.left; //x position within the element.
      const y = e.clientY - rect.top;  //y position within the element.
      this.mouse = {x, y};
    });

    // const pack = guAnimator.getAnimationAsset('pack');
    // console.log('Example animator pack', pack);
    // const comp = pack && pack.instance.renderer.elements.find((element) => element.data.nm === 'pack_break-up');
    // if (comp) {
    //   this.home.x = comp.baseElement.x;
    //   this.home.y = comp.baseElement.y;
    //   comp.baseElement.interactive = true;
    //   comp.baseElement.buttonMode = true;
    //   // comp.baseElement.on('pointerdown', (e) => {
    //   //   console.log('Pack hit');
    //   //   this.openPack(e);
    //   // });
    // }

    // pack.meta.timeline.addLabel('charlie', 1);
    // pack.meta.timeline.call((x, t) => {
    //   console.log('hit the frame', x, t.currentLabel());
    // }, ['charlie', pack.meta.timeline], 1);

    // Make stage interactive so you can click on it too
    // const pixiApp = pack.instance.renderer.pixiApplication;
    // pixiApp.stage.interactive = true;
    // pixiApp.stage.hitArea = pixiApp.renderer.screen;
    //
    // // Hover animation
    // const tlCan = gsap.timeline({repeat:-1, yoyo: true, paused: false});
    // tlCan
    //   .to(comp.baseElement,{duration:6, x:'-=10', ease:Power1.easeInOut}, 0)
    //   .to(comp.baseElement,{duration:6, x:'+=10', ease:Power1.easeInOut}, 6)
    //   .to(comp.baseElement,{duration:4, x:'+=10', ease:Power1.easeInOut}, 12)
    //   .to(comp.baseElement,{duration:4, x:'+=10', ease:Power1.easeInOut}, 16)
    //   .to(comp.baseElement,{duration:3, y:'-=10', ease:Power1.easeInOut}, 0)
    //   .to(comp.baseElement,{duration:2, y:'+=10', ease:Power1.easeInOut}, 3)
    //   .to(comp.baseElement,{duration:3, y:'-=5', ease:Power1.easeInOut}, 5)
    //   .to(comp.baseElement,{duration:3, y:'+=5', ease:Power1.easeInOut}, 8)
    //   .to(comp.baseElement,{duration:3, y:'-=10', ease:Power1.easeInOut}, 11)
    //   .to(comp.baseElement,{duration:3, y:'+=10', ease:Power1.easeInOut}, 14)
    //   .to(comp.baseElement,{duration:2, y:'-=5', ease:Power1.easeInOut}, 17)
    //   .to(comp.baseElement,{duration:2, y:'+=5', ease:Power1.easeInOut}, 19);

    const bg = guAnimator.getAnimationAsset('bg');
    const camera = bg.instance.animationData.layers.find((layer) => layer.nm === 'Camera 1');

    bg.instance.animationData.layers.forEach((layer) => {
      console.log('BG layer', layer);
    })
    // anim.animationData.layers[0].ks.p.k[0]

    const startX = camera.ks.p.k[0];
    const startY = camera.ks.p.k[1];
    const obj = {x: startX, y:startY, z:0};
    // gsap.to(obj, { duration: 5, x: startX + 100, y: startY + 100, onUpdate: () => {
    //     console.log('camera change x', obj.x, camera, bg.instance.renderer.camera);
    //     camera.ks.p.k[0].s[0] = obj.x;
    //     camera.ks.p.k[1].s[0] = obj.x;
    //
    //     // Pos y
    //     camera.ks.p.k[0].s[1] = obj.y;
    //     camera.ks.p.k[1].s[1] = obj.y;
    //     bg.instance.renderer.camera.renderFrame();
    // }});

    let theta;
    const currentPos = [960, 540, -2666.667];
    const mousePos = [960, 540, -2666.667];
    let windowW, windowH, dist;
    const mouseCoords = {
      x:0,
      y:0
    }
    function calculateSize(){
      windowW = window.innerWidth;
      windowH = window.innerHeight;
    }

    calculateSize();

    window.addEventListener('mousemove', function(ev){

      mouseCoords.x = (ev.clientX || ev.pageX);
      mouseCoords.y = ev.clientY || ev.pageY;
      theta = Math.atan2(
        windowH/2 - mouseCoords.y,
        windowW/2 - mouseCoords.x
      );

      dist = 2 * Math.sqrt(Math.pow(mouseCoords.x - windowW/2, 2) + Math.pow(mouseCoords.y - windowH/2, 2));
      dist = dist / 100;

      mousePos[0] = 960 + Math.cos(theta) * (dist * -1);
      mousePos[1] = 540 + Math.sin(theta )* (dist);

      currentPos[0] = currentPos[0] + (mousePos[0] - currentPos[0])*0.25;
      currentPos[1] = currentPos[1] + (mousePos[1] - currentPos[1])*0.25 + 10;
      currentPos[2] = currentPos[2] + (mousePos[2] - currentPos[2])*0.25;

      // Pos x
      camera.ks.p.k[0].s[0] = currentPos[0];
      camera.ks.p.k[1].s[0] = currentPos[0];

      // Pos y
      camera.ks.p.k[0].s[1] = currentPos[1];
      camera.ks.p.k[1].s[1] = currentPos[1];
    });
    console.log('Find camera', camera);

    // Setup pack
    if (!this.initPack) {
      this.initPack = true;

      const anim = bg.instance;
      const threeData = guAnimator.controller.getThree();

      // camera = anim.animationData.layers.find((layer) => layer.nm === 'Camera 1');
      // threeData.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      // threeData.renderer.toneMappingExposure = 1;

      // TODO: Load a gltf file..
      const loader = threeData.load('/assets/model/m2.gltf', (gltf) => {
        console.log('Loaded GLTF', gltf);
        packObj = gltf;
        gltf.scene.scale.set(900, 900, 900);
        gltf.scene.position.set(this.openPosition[0], this.openPosition[1], this.openPosition[2]);

        threeData.scene.add(gltf.scene);

        const ambientLight = new THREE.AmbientLight(0x404040, 1);
        threeData.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(1, 1, 1).normalize();
        threeData.scene.add(directionalLight);

        // Add axes helper
        // const axesHelper = new THREE.AxesHelper(5);
        // threeData.scene.add(axesHelper);
        //
        // // Add camera helper (for perspective camera)
        // const cameraHelper = new THREE.CameraHelper(threeData.camera);
        // threeData.scene.add(cameraHelper);

        const albedoTexture = new THREE.TextureLoader().load(`/assets/model/m2_pack_booster_albedo.png`);
        const normalTexture = new THREE.TextureLoader().load(`/assets/model/m2_pack_booster_normal.png`);
        const aoTexture = new THREE.TextureLoader().load(`/assets/model/m2_pack_booster_AO.png`);
        const ormTexture = new THREE.TextureLoader().load(`/assets/model/m2_pack_booster_ORM.png`);
        const emissiveTexture = new THREE.TextureLoader().load(`/assets/model/m2_pack_booster_emissive.png`);

        // this.three.scene.environment = diffuseCubemap;
        const mat = new THREE.MeshPhysicalMaterial();
        gltf.scene.children[0].children[0].material = mat;

        // mat.envMap = diffuseCubemap;
        mat.map = albedoTexture;
        mat.map.flipY = false;
        mat.aoMap = aoTexture;
        mat.aoMap.flipY = false;
        mat.normalMap = normalTexture;
        mat.normalMap.flipY = false;
        mat.emissiveMap = emissiveTexture;
        mat.emissiveMap.flipY = false;
        mat.roughnessMap = ormTexture;
        mat.roughnessMap.flipY = false;

        mat.side = THREE.FrontSide;
        mat.roughness = 2;
        mat.needsUpdate = true;

        // Create TransformControls
        // const transformControls = new THREE.TransformControls(threeData.camera, threeData.renderer.domElement);
        // threeData.scene.add(transformControls);

        // // Add directional light helper
        //  const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 1);
        // threeData.scene.add(directionalLightHelper);

        console.log('Loaded GLTF', gltf);
        // transformControls.attach(gltf.scene);

        // gltf.scene.children[0].children[0].material.wireframe = true;

        // Details of the KHR_materials_variants extension used here can be found below
        // https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_variants
        // const parser = gltf.parser;
        // const variantsExtension = gltf.userData.gltfExtensions[ 'KHR_materials_variants' ];
        // const variants = variantsExtension.variants.map( ( variant ) => variant.name );
        // const variantsCtrl = gui.add( state, 'variant', variants ).name( 'Variant' );
        //selectVariant( scene, parser, variantsExtension, state.variant );

        console.log('AnimatedMorphSphere::onLoaded', gltf);
        // variantsCtrl.onChange( ( value ) => selectVariant( scene, parser, variantsExtension, value ) );
        //
        // render();

      });
    }
  }

  @eventOptions({ passive: true })
  onLoading(event) {
    console.log('Examples loading:', event);
  }

  @eventOptions({ passive: true })
  onError(event) {
    console.log('Examples error:', event);
  }

  @eventOptions({ passive: true })
  onMarker(event) {
    console.log('Examples marker:', event);
  }

  override render() {
    const title = 'GU Animator examples';
    return html`
      <div class="wrapper">
        <div class="container">
          <!--  WELCOME  -->
          <div id="welcome" style="margin-bottom:40px;">
            <h1>
              <span @click=${this.openPack}> Hello there, </span>
              <span @click=${this.resetPack}>Welcome</span> ${title} 👋
            </h1>
          </div>

          <gu-animator
            ${ref(this.animatorRef)}
            src="/assets/gu-animator-pack-opening/data.json"
            assetsPath="/assets/bg_camera/"
            @loaded=${this.onLoaded}
            @loading=${this.onLoading}
            @marker=${this.onMarker}
            @error=${this.onError}
          ></gu-animator>
        </div>
      </div>
    `;
  }

  private openPack(e: any) { // MouseEvent || InteractionEvent

    // Open the pack
    const guAnimator = this.animatorRef.value as any;
    const pack = guAnimator.getAnimationAsset('pack');
    if (pack) {
      console.log('Found timeline', pack.meta.timeline);
      pack.meta.timeline.restart();
      pack.meta.timeline.play();
    }
  }

  private resetPack(e: MouseEvent) {

    // Reset the pack
    const guAnimator = this.animatorRef.value as any;
    const pack = guAnimator.getAnimationAsset('pack');
    if (pack) {
      pack.meta.timeline.restart();
      pack.meta.timeline.progress(0, true);
      pack.meta.timeline.pause();
    }
  }
}
