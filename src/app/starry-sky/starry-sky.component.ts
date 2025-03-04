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
  private lessGoldenTexture!: THREE.Texture;

  constructor(private el: ElementRef) {}
  

  ngOnInit(): void {
    this.initThreeJS();
    this.trailTexture = this.textureLoader.load('assets/sp1.png');
    this.lessGoldenTexture = this.textureLoader.load('assets/sp2.png');
    this.addMouseMoveListener();
    this.addWindowResizeListener();
    this.addClickListener(); // Add click event listener
    this.createShootingStar();
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
    this.renderer.setClearColor(new THREE.Color('#1c1624'));
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

    // Geometries
    const geometrys = [new THREE.BufferGeometry(), new THREE.BufferGeometry(), new THREE.BufferGeometry(), new THREE.BufferGeometry()];
    geometrys[0].setAttribute('position', new THREE.BufferAttribute(this.getRandomParticlePos(7500), 3));
    geometrys[1].setAttribute('position', new THREE.BufferAttribute(this.getRandomParticlePos(15000), 3));
    geometrys[2].setAttribute('position', new THREE.BufferAttribute(this.getRandomParticlePos(2500), 3));
    geometrys[3].setAttribute('position', new THREE.BufferAttribute(this.getRandomParticlePos(3000), 3));

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

    // Materials for particles (sp1 and sp2)
    const particleMaterials = [
      new THREE.PointsMaterial({
        size: 0.005,
        map: loader.load('assets/sp1.png'),
        transparent: true,
        depthWrite: false, // Disable depth writing for particles
      }),
      new THREE.PointsMaterial({
        size: 0.0075,
        map: loader.load('assets/sp2.png'),
        transparent: true,
        depthWrite: false, // Disable depth writing for particles
      }),new THREE.PointsMaterial({
        size: 0.075,
        map: loader.load('assets/sp2.png'),
        transparent: true,
        depthWrite: false, // Disable depth writing for particles
      }),new THREE.PointsMaterial({
        size: 0.005,
        map: loader.load('assets/sp1.png'),
        transparent: true,
        depthWrite: false, // Disable depth writing for particles
      }),
    ];

    // Points (starry sky particles)
    this.starsT1 = new THREE.Points(geometrys[0], particleMaterials[0]);
    this.starsT2 = new THREE.Points(geometrys[1], particleMaterials[1]);
    this.starsT3 = new THREE.Points(geometrys[2], particleMaterials[2]);
    this.starsT4 = new THREE.Points(geometrys[3], particleMaterials[3]);

    // Set renderOrder for particles (render first)
    this.starsT1.renderOrder = 1;
    this.starsT2.renderOrder = 1;
    this.starsT3.renderOrder = 1;
    this.starsT4.renderOrder = 1;

    this.scene.add(this.starsT1);
    this.scene.add(this.starsT2);
    this.scene.add(this.starsT3);
    this.scene.add(this.starsT4);

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

  private getRandomParticlePos(particleCount: number): Float32Array {
    const arr = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      arr[i] = (Math.random() - 0.5) * 10;
    }
    return arr;
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

  private createShootingStar(): void {
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({
      color: 0xffd700,
      size: 0.003,
      transparent: true,
      opacity: 1,
      blending: THREE.AdditiveBlending
    });
    const positions = new Float32Array([0, 0, 0]);
    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.shootingStar = new THREE.Points(starGeometry, starMaterial);
    this.scene.add(this.shootingStar);
    this.moveShootingStar();
  }

  private moveShootingStar(): void {
    const startX = Math.random() * 4 - 2;
    const startY = Math.random() * 2 + 1;
    const endX = startX - 2;
    const endY = startY - 1;
    
    this.shootingStar.position.set(startX, startY, -1);
    this.createTrail(startX, startY);
    
    gsap.to(this.shootingStar.position, {
      x: endX, y: endY, duration: this.starSpeed, ease: 'power1.out',
      onUpdate: () => this.createTrail(this.shootingStar.position.x, this.shootingStar.position.y),
      onComplete: () => this.moveShootingStar()
    });
  }

  private createTrail(x: number, y: number): void {
    const trailGeometry = new THREE.BufferGeometry();
    const numParticles = 20;
    const positions = new Float32Array(numParticles * 3);
    const colors = new Float32Array(numParticles * 3);

    for (let i = 0; i < numParticles; i++) {
      positions[i * 3] = x - (Math.random() * 0.05 - 0.025); // Reduce trail width by half
      positions[i * 3 + 1] = y - (Math.random() * 0.05 - 0.025);
      positions[i * 3 + 2] = -1;
      
      const color = Math.random() < 0.4 ? new THREE.Color(0xf0d08f) : new THREE.Color(0xffd700);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    trailGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    trailGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const trailMaterial = new THREE.PointsMaterial({
      // color: 0xffd700,
      size: 0.005, // Use defined size
      transparent: true,
      opacity: 1,
      map: this.trailTexture,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexColors: true
    });
    
    const trail = new THREE.Points(trailGeometry, trailMaterial);
    this.scene.add(trail);
    this.trails.push(trail);
    
    gsap.to(trail.material, {
      opacity: 0,
      duration: this.trailDecaySpeed * (Math.random() * 2 + 1),
      onComplete: () => {
        this.scene.remove(trail);
        this.trails = this.trails.filter(t => t !== trail);
      }
    });
  }
  private animate(): void {
    if (!this.texturesLoaded) return;
  
    const render = (time: number) => {
      // Rotate the card group for a 3D effect if shouldRotate is true
      if (this.cardGroup && this.shouldRotate) {
        this.cardGroup.rotation.y += 0.01;
      }
  
      // Flash effect for particles
      const flashSpeed = 0.01; // Speed of the flash effect
      const scale = Math.sin(time * flashSpeed) * 0.5 + 1; // Oscillate between 0.5 and 1.5
      const dimmer = 0.001; // Speed of the flash effect
      const opacity = Math.sin(time * dimmer) * 0.5 + 0.5; // Oscillate between 0 and 1
  
      // Apply the flash effect to sp1 and sp2 particles
      if (this.starsT1.material instanceof THREE.PointsMaterial) {
        this.starsT1.material.size = 0.005 * scale; // Adjust the base size as needed
        this.starsT1.material.opacity = opacity;
      }
      if (this.starsT2.material instanceof THREE.PointsMaterial) {
        this.starsT2.material.size = 0.0075 * scale; // Adjust the base size as needed
      }

      this.starsT1.geometry.attributes['position'].needsUpdate = true;
      this.renderer.render(this.scene, this.camera);
      requestAnimationFrame(render);
    };
    requestAnimationFrame(render);
  }

  
}