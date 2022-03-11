import './style/main.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { SkeletonUtils } from 'three/examples/jsm/utils/SkeletonUtils'

// import * as dat from 'dat.gui'
// const gui = new dat.GUI()

// https://discourse.threejs.org/t/how-to-put-a-weapon-in-a-characters-hand/22121/4

const canvas = document.querySelector('canvas.webgl')
const scene = new THREE.Scene()

const light = new THREE.DirectionalLight(0xffffff, 10);
scene.add(light);

let arm, mitten, armSkeleton, mittenSkeleton;
async function loadModels() {
  const loader = new GLTFLoader();
  arm = await loader.loadAsync("/Low Poly Arm.glb");
  mitten = await loader.loadAsync("/Mitten.glb");
  scene.add(arm.scene);
  scene.add(mitten.scene);

  console.log(arm.scene);

  // Find the skeleton
  let armSkeleton;
  arm.scene.traverse(node => {
    if (node.isSkinnedMesh) {
      armSkeleton = node.skeleton;
      return;
    }
  })
  let mittenSkeleton;
  mitten.scene.traverse(node => {
    if (node.isSkinnedMesh) {
      // mittenSkeleton = node.skeleton;
      node.skeleton = armSkeleton;
      return
    }
  })

  arm.mixer = new THREE.AnimationMixer(arm.scene);
  arm.animations.forEach(clip => {
    console.log("clip:", clip)
    arm.mixer.clipAction(clip).play();
  })
}


loadModels();

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
}

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  // Update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.001,
  100
)
camera.position.x = 1
camera.position.y = 1
camera.position.z = 1
scene.add(camera)

const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.enablePan = false
controls.dampingFactor = 0.05
controls.maxDistance = 10
controls.minDistance = 0.1
controls.touches = {
  ONE: THREE.TOUCH.ROTATE,
  TWO: THREE.TOUCH.DOLLY_PAN,
}

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

const tick = () => {

  controls.update()
  renderer.render(scene, camera)

  if (arm && arm.mixer) {
    arm.mixer.update(1 / 64);

    // if (armSkeleton && mittenSkeleton) {
    //   SkeletonUtils.retarget(mittenSkeleton, armSkeleton);
    // }
  }

  window.requestAnimationFrame(tick)
}

tick()
