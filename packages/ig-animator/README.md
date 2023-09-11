<div align="center">
  <p align="center">
    <a  href="https://docs.x.immutable.com/docs">
      <img src="https://cdn.dribbble.com/users/1299339/screenshots/7133657/media/837237d447d36581ebd59ec36d30daea.gif" width="280"/>
    </a>
  </p>
</div>

---

# Immutable Games Animator

> **Warning** **IMMUTABLE GAMES ANIMATOR IS UNSTABLE** <br/>
> Since it has not hit the version 1.0 yet, its public interface should not be considered final. Future releases may include breaking changes without further notice. We will do our best to keep this documentation updated providing visibility on breaking changes planned.

An animation framework that combines several libraries together (lottie / gsap / pixi / threejs). Ig-Animator helps to orchestrate syncing multiple animations from After Effects (exported via Bodymovin) and GLTF models in a 3D environment using threeJS.

## Installation and configuration

### Clone repo

Prerequisites:

- Your Node version needs to be `16.x`. If you've already installed a later version, you'll need to switch to `16.x` with a tool like [n](https://github.com/tj/n) or [nvm](https://github.com/nvm-sh/nvm).

To install this repository:

1. `git clone git@github.com:immutable/ig-animator.git`
2. `cd ig-animator`
3. `nvm install && nvm use` (set expected node version)
4. `npm install`
5. `npm run start`

## Building

Run `npm run build` to build the library or `nx build ig-animator`.

## Running unit tests

Run `nx test ig-animator` to execute the unit tests via [Jest](https://jestjs.io).
