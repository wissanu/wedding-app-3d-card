import { Component, ElementRef, OnInit, OnDestroy } from '@angular/core';
import * as THREE from 'three';
import gsap from 'gsap';

@Component({
  selector: 'app-starry-sky',
  templateUrl: './starry-sky.component.html',
  styleUrls: ['./starry-sky.component.css']
})
export class StarrySkyComponent implements OnInit, OnDestroy {
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private starsT1!: THREE.Points;
  private starsT2!: THREE.Points;
  private starsT3!: THREE.Points;
  private starsT4!: THREE.Points;
  private mouseX = 0;
  private mouseY = 0;
  private cardGroup!: THREE.Group;
  private texturesLoaded = false;
  private shouldRotate = true; // Flag to control auto-rotation
  private starSpeed = 1.5;
  private trailDecaySpeed = 1.5;
  private shootingStar!: THREE.Points;
  private trails: THREE.Points[] = [];
  private textureLoader = new THREE.TextureLoader();
  private trailTexture!: THREE.Texture;
  private starTexture!: THREE.Texture;

  constructor(private el: ElementRef) {}
  

  ngOnInit(): void {
    this.initThreeJS();
    this.trailTexture = this.textureLoader.load('assets/sp1.png');
    this.starTexture = this.textureLoader.load('assets/sp2.png'); 
    this.addMouseMoveListener();
    this.addWindowResizeListener();
    this.addClickListener(); // Add click event listener
  }

  ngOnDestroy(): void {
    if (this.renderer) {
      this.renderer.dispose();
    }
    window.removeEventListener('resize', this.onWindowResize);
    document.removeEventListener('click', this.toggleRotation); // Remove click event listener
  }

  private initThreeJS(): void {
    const canvas = this.el.nativeElement.querySelector('#c');

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
    });
    
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.setRendererSize();
    

    // Scene
    this.scene = new THREE.Scene();

    // Light
    const color = 0xffffff;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    this.scene.add(light);

    // Camera
    const fov = 45;
    const aspect = canvas.clientWidth / canvas.clientHeight;
    const near = 0.1;
    const far = 100;
    this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this.camera.position.z = 1.5;

    // Adjust camera position for mobile devices
    const isMobile = window.innerWidth <= 768; // Check if the device is mobile
    this.camera.position.z = isMobile ? 2.5 : 1.5; // Zoom out for mobile devices

    // Texture Loader with Loading Manager
    const loadingManager = new THREE.LoadingManager(
      () => {
        this.texturesLoaded = true;
        this.animate();
      },
      (url, loaded, total) => {
        console.log(`Loading ${url}: ${loaded}/${total}`);
      },
      (url) => {
        console.error(`Failed to load ${url}`);
      }
    );

    const loader = new THREE.TextureLoader(loadingManager);

    // Load textures
    const frontTexture = loader.load('assets/images/front.png');
    const backTexture = loader.load('assets/images/back.png');

    // Flip the back texture
    backTexture.repeat.x = -1;
    backTexture.offset.x = 1;

    // Add 3D Card
    this.add3DCard(frontTexture, backTexture);
  }

  private add3DCard(frontTexture: THREE.Texture, backTexture: THREE.Texture): void {
    // Create a plane geometry for the card
    const cardGeometry = new THREE.PlaneGeometry(1, 1.5);

    // Create materials for the front and back
    const frontMaterial = new THREE.MeshBasicMaterial({
      map: frontTexture,
      side: THREE.FrontSide,
      transparent: true,
    });

    const backMaterial = new THREE.MeshBasicMaterial({
      map: backTexture,
      side: THREE.BackSide,
      transparent: true,
    });

    // Create meshes for the front and back
    const frontMesh = new THREE.Mesh(cardGeometry, frontMaterial);
    const backMesh = new THREE.Mesh(cardGeometry, backMaterial);

    // Position the back mesh behind the front mesh
    backMesh.position.z = -0.01;

    // Create a group to hold both front and back meshes
    this.cardGroup = new THREE.Group();
    this.cardGroup.add(frontMesh);
    this.cardGroup.add(backMesh);

    // Set renderOrder for the card (render last)
    this.cardGroup.renderOrder = 2;

    // Position the card group in the scene
    this.cardGroup.position.set(0, 0, -1);

    // Add the card group to the scene
    this.scene.add(this.cardGroup);
  }


  private addWindowResizeListener(): void {
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  private onWindowResize(): void {
    this.setRendererSize();
    this.camera.aspect = this.renderer.domElement.clientWidth / this.renderer.domElement.clientHeight;
    this.camera.updateProjectionMatrix();

     // Adjust camera position for mobile devices on resize
    const isMobile = window.innerWidth <= 768; // Check if the device is mobile
    this.camera.position.z = isMobile ? 2.5 : 1.5; // Zoom out for mobile devices
  }

  private setRendererSize(): void {
    const canvas = this.renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const pixelRatio = window.devicePixelRatio;

    this.renderer.setSize(width, height, false);
    this.renderer.setPixelRatio(Math.min(pixelRatio, 2));
  }

  private addMouseMoveListener(): void {
    document.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    });
  }

  private addClickListener(): void {
    document.addEventListener('click', this.toggleRotation.bind(this));
  }

  private toggleRotation(): void {
    this.shouldRotate = !this.shouldRotate; // Toggle the rotation flag
  }

  private animate(): void {
    if (!this.texturesLoaded) return;
  
    const render = (time: number) => {
      // Rotate the card group for a 3D effect if shouldRotate is true
      if (this.cardGroup && this.shouldRotate) {
        this.cardGroup.rotation.y += 0.01;
      }

      this.renderer.render(this.scene, this.camera);
      requestAnimationFrame(render);
    };
    requestAnimationFrame(render);
  }

  
}