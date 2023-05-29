import '@imtbl/ig-animator';
import { css, html, LitElement } from 'lit';
import { Ref, createRef, ref } from 'lit/directives/ref.js';
import {
  customElement,
  property,
  query,
  eventOptions,
} from 'lit/decorators.js';
import './app.element.css';
import {
  AmbientLight,
  AnimationClip,
  AnimationMixer,
  DirectionalLight,
  LoopOnce,
  Object3D,
} from 'three';
import GUI from 'lil-gui';
import { IgAnimator } from '@imtbl/ig-animator';
import { gsap } from 'gsap';

@customElement('app-root')
export class AppElement extends LitElement {
  private animatorRef: Ref<HTMLElement> = createRef();
  private mouse = { x: 0, y: 0 };
  private openPosition = [1150, 645, 780];

  private initPack = false;

  private config = {
    isEditing: false,
    isFollowing: false,
    cameraX: 0,
    cameraY: 0,
    cameraZ: 0,
    selectedX: 1150,
    selectedY: 645,
    selectedZ: 780,
    packX: 0,
    packY: 0,
    packZ: 0,
    packScaleX: 0,
    packScaleY: 0,
    packScaleZ: 0,
    lightDirect: 0,
    lightAmbient: 0,
    selectPack: () => {
      this.selectPack();
    },
    openPack: () => {
      this.openPack();
    },
    reset: () => {
      this.resetPack();
    },
    selectedMesh: false,
    selectedModel: null,
    selectedPack: null,
  };

  @eventOptions({ passive: true })
  onLoaded(event) {
    // Start the background animation
    const guAnimator = event.detail.target;
    if (!guAnimator.controller) {
      console.warn('GU-Animator failed to initialize.');
      return;
    }
    // const background = guAnimator.getAnimationAsset('bg');
    // const timeline = background.meta.timeline;
    // timeline.repeat = -1;
    // timeline.play();

    document.addEventListener('mousemove', (e) => {
      const rect = guAnimator.getBoundingClientRect();
      const x = e.clientX - rect.left; //x position within the element.
      const y = e.clientY - rect.top; //y position within the element.
      this.mouse = { x, y };
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
    const camera = bg.instance.animationData.layers.find(
      (layer) => layer.nm === 'Camera 1'
    );

    if (bg && bg.instance) {
      console.log('Animate the background', bg);
      bg.meta.timeline.play();

      bg.instance.animationData.layers.forEach((layer) => {
        console.log('BG layer', layer);
      });
    }
    // anim.animationData.layers[0].ks.p.k[0]

    // const startX = camera.ks.p.k[0];
    // const startY = camera.ks.p.k[1];
    // const obj = {x: startX, y:startY, z:0};
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
      x: 0,
      y: 0,
    };
    function calculateSize() {
      windowW = window.innerWidth;
      windowH = window.innerHeight;
    }

    calculateSize();

    window.addEventListener('mousemove', (ev) => {
      mouseCoords.x = ev.clientX || ev.pageX;
      mouseCoords.y = ev.clientY || ev.pageY;
      theta = Math.atan2(
        windowH / 2 - mouseCoords.y,
        windowW / 2 - mouseCoords.x
      );

      dist =
        2 *
        Math.sqrt(
          Math.pow(mouseCoords.x - windowW / 2, 2) +
            Math.pow(mouseCoords.y - windowH / 2, 2)
        );
      dist = dist / 100;

      mousePos[0] = 960 + Math.cos(theta) * (dist * -1);
      mousePos[1] = 540 + Math.sin(theta) * dist;

      currentPos[0] = currentPos[0] + (mousePos[0] - currentPos[0]) * 0.25;
      currentPos[1] = currentPos[1] + (mousePos[1] - currentPos[1]) * 0.25 + 10;
      currentPos[2] = currentPos[2] + (mousePos[2] - currentPos[2]) * 0.25;

      if (this.config && this.config.isFollowing) {
        this.config.cameraX = currentPos[0];
        this.config.cameraY = currentPos[1];

        // Pos x
        camera.ks.p.k[0].s[0] = currentPos[0];
        camera.ks.p.k[1].s[0] = currentPos[0];

        // Pos y
        camera.ks.p.k[0].s[1] = currentPos[1];
        camera.ks.p.k[1].s[1] = currentPos[1];
      }
    });
    //  console.log('Find camera', camera);

    // Setup pack
    if (!this.initPack) {
      this.initPack = true;

      // Init the dev tools
      const gui = new GUI();
      const editingController = gui.add(this.config, 'isEditing');
      editingController.onChange((value) => {
        if (value) {
          this.config.packX = this.config.selectedPack.scene.position.x;
          this.config.packY = this.config.selectedPack.scene.position.y;
          this.config.packZ = this.config.selectedPack.scene.position.z;
          this.config.packScaleX = this.config.selectedPack.scene.scale.x;
          this.config.packScaleY = this.config.selectedPack.scene.scale.y;
          this.config.packScaleZ = this.config.selectedPack.scene.scale.z;
        }
      });

      gui.add(this.config, 'isFollowing');
      gui.add(this.config, 'cameraX').listen();
      gui.add(this.config, 'cameraY').listen();
      gui.add(this.config, 'cameraZ').listen();
      gui.add(this.config, 'selectedX');
      gui.add(this.config, 'selectedY');
      gui.add(this.config, 'selectedZ');

      const packFolder = gui.addFolder('Pack');
      packFolder.add(this.config, 'packX').listen();
      packFolder.add(this.config, 'packY').listen();
      packFolder.add(this.config, 'packZ').listen();
      packFolder.add(this.config, 'packScaleX').listen();
      packFolder.add(this.config, 'packScaleY').listen();
      packFolder.add(this.config, 'packScaleZ').listen();

      gui.add(this.config, 'selectPack');
      gui.add(this.config, 'openPack');
      gui.add(this.config, 'reset');

      const directController = gui.add(this.config, 'lightDirect'); // Number Field
      directController.onChange((value) => {
        if (threeData.directionalLight) {
          threeData.directionalLight.intensity = value;
        }
      });

      const ambientController = gui.add(this.config, 'lightAmbient'); // Number Field
      ambientController.onChange((value) => {
        if (threeData.ambientLight) {
          threeData.ambientLight.intensity = value;
        }
      });

      gui.onChange((changes) => {
        if (
          changes.property === 'cameraX' ||
          changes.property === 'cameraY' ||
          changes.property === 'cameraZ'
        ) {
          if (changes.property === 'cameraX') {
            camera.ks.p.k[0].s[0] = changes.value;
            camera.ks.p.k[1].s[0] = changes.value;
          }
          if (changes.property === 'cameraY') {
            camera.ks.p.k[0].s[1] = changes.value;
            camera.ks.p.k[1].s[1] = changes.value;
          }
          if (changes.property === 'cameraZ') {
            camera.ks.p.k[0].s[2] = changes.value;
            camera.ks.p.k[1].s[2] = changes.value;
          }
        }
        if (
          this.config.selectedMesh &&
          (changes.property === 'selectedX' ||
            changes.property === 'selectedY' ||
            changes.property === 'selectedZ')
        ) {
          (this.config.selectedMesh as any).position.set(
            this.config.selectedX,
            this.config.selectedY,
            this.config.selectedZ
          );
        }

        if (
          this.config.isEditing &&
          this.config.selectedPack &&
          (changes.property === 'packX' ||
            changes.property === 'packY' ||
            changes.property === 'packZ' ||
            changes.property === 'packScaleX' ||
            changes.property === 'packScaleY' ||
            changes.property === 'packScaleZ')
        ) {
          (this.config.selectedPack as any).scene.position.set(
            this.config.packX,
            this.config.packY,
            this.config.packZ
          );
          (this.config.selectedPack as any).scene.scale.set(
            this.config.packScaleX,
            this.config.packScaleY,
            this.config.packScaleZ
          );
        }
      });

      // const anim = bg.instance;
      const threeData = guAnimator.controller.getThree();

      const cardLoader = threeData.load('/assets/model/card.gltf', (gltf) => {
        console.log('Loaded Card GLTF', gltf);

        this.config.selectedPack = gltf;
        const model = gltf.scene;
        model.scale.set(20, 20, 20);
        model.position.set(1156, 565, 1120);
        model.visible = false;

        threeData.scene.add(model);
      });

      // TODO: Load a gltf file..
      const loader = threeData.load('/assets/model/m2.gltf', (gltf) => {
        console.log('Loaded GLTF', gltf);
        this.config.selectedModel = gltf;
        this.config.selectedMesh = gltf.scene; // .children[0];

        const mesh = this.config.selectedMesh as any;
        mesh.scale.set(9, 9, 9);
        mesh.position.set(
          this.config.selectedX,
          this.config.selectedY,
          this.config.selectedZ
        );

        // gltf.scene.position.set(this.openPosition[0], this.openPosition[1], this.openPosition[2]);

        threeData.scene.add(gltf.scene);

        const ambientLight = new AmbientLight(0x404040, 10);
        threeData.ambientLight = ambientLight;
        threeData.scene.add(ambientLight);

        const directionalLight = new DirectionalLight(0xffffff, 35);
        directionalLight.position.set(1, 1, 1).normalize();
        threeData.directionalLight = directionalLight;
        threeData.scene.add(directionalLight);

        // const animate = () => {
        //   requestAnimationFrame(animate);
        //   const delta = threeData.clock.getDelta();
        //   if (threeData.mixers.length > 0) {
        //     threeData.mixers.forEach((mixer) => mixer.update(delta));
        //   }
        // }
        // animate();

        // Add axes helper
        // const axesHelper = new THREE.AxesHelper(5);
        // threeData.scene.add(axesHelper);
        //
        // // Add camera helper (for perspective camera)
        // const cameraHelper = new THREE.CameraHelper(threeData.camera);
        // threeData.scene.add(cameraHelper);

        // const albedoTexture = new THREE.TextureLoader().load(`/assets/model/m2_pack_booster_albedo.png`);
        // const normalTexture = new THREE.TextureLoader().load(`/assets/model/m2_pack_booster_normal.png`);
        // const aoTexture = new THREE.TextureLoader().load(`/assets/model/m2_pack_booster_AO.png`);
        // const ormTexture = new THREE.TextureLoader().load(`/assets/model/m2_pack_booster_ORM.png`);
        // const emissiveTexture = new THREE.TextureLoader().load(`/assets/model/m2_pack_booster_emissive.png`);

        // this.three.scene.environment = diffuseCubemap;
        // const mat = new THREE.MeshPhysicalMaterial();
        // gltf.scene.children[0].children[0].material = mat;

        // mat.envMap = diffuseCubemap;
        // mat.map = albedoTexture;
        // mat.map.flipY = false;
        // mat.aoMap = aoTexture;
        // mat.aoMap.flipY = false;
        // mat.normalMap = normalTexture;
        // mat.normalMap.flipY = false;
        // mat.emissiveMap = emissiveTexture;
        // mat.emissiveMap.flipY = false;
        // mat.roughnessMap = ormTexture;
        // mat.roughnessMap.flipY = false;

        // mat.side = THREE.FrontSide;
        // mat.roughness = 2;
        // mat.needsUpdate = true;

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

    if (event.detail.marker.name === 'pack_openzz') {
      this.revealContents();
    }
  }

  firstUpdated() {
    const guAnimator: IgAnimator = this.animatorRef.value as IgAnimator;
    console.log('Demos::firstUpdated()', guAnimator, guAnimator.loadAnimation);
    guAnimator
      .loadAnimation('/assets/gu-pack-opening/data.json')
      .then((animations: any) => {
        console.log('GUAnimator::loadAnimation done', animations);
      });
  }

  override render() {
    const title = 'GU Animator examples';
    return html`
      <div class="wrapper">
        <div class="container">
          <ig-animator
            ${ref(this.animatorRef)}
            @loaded=${this.onLoaded}
            @loading=${this.onLoading}
            @marker=${this.onMarker}
            @error=${this.onError}
          ></ig-animator>
        </div>
      </div>
    `;
  }

  private revealContents() {
    console.log('Demo::revealContents()');
    if (this.config.selectedPack) {
      this.config.selectedPack.scene.visible = true;
    }
  }

  private selectPack() {
    console.log('Demo::selectPack()', this.config.selectedModel);
    // TODO: Load a specific GLTF

    const mixer = new AnimationMixer(this.config.selectedModel.scene);
    const openClip = AnimationClip.findByName(
      this.config.selectedModel.animations,
      'Anim_0'
    );
    const openAction = mixer.clipAction(openClip);

    console.log('Play the animation::selectPack()', openAction);
    if (openAction) {
      openAction.clampWhenFinished = true;
      openAction.reset();
      openAction.play();
      openAction.loop = LoopOnce;

      // Play the animation
      gsap.to(mixer, {
        _time: openClip.duration,
        duration: openClip.duration,
        onUpdateParams: [mixer],
        onUpdate: function (m) {
          const animProgress = openClip.duration * this['progress']();
          m.setTime(animProgress);
        },
      });
    }
  }

  private openPack(e?: any) {
    // MouseEvent || InteractionEvent

    // Open the pack
    const guAnimator = this.animatorRef.value as any;
    const pack = guAnimator.getAnimationAsset('pack');
    if (pack) {
      console.log('Found timeline', pack.meta.timeline);
      pack.meta.timeline.restart();
      pack.meta.timeline.play();
    }
  }

  private resetPack(e?: MouseEvent) {
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
