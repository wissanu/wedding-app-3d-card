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
  private mouseX = 0;
  private mouseY = 0;
  private cardGroup!: THREE.Group;
  private texturesLoaded = false;
  private shouldRotate = true; // Flag to control auto-rotation
  private particleSystem!: THREE.Points;
  private particles!: THREE.BufferGeometry;
  private particleMaterial!: THREE.ShaderMaterial;
  private textureLoader = new THREE.TextureLoader();
  private starTexture!: THREE.Texture;

  constructor(private el: ElementRef) {}
  

  ngOnInit(): void {
    this.initThreeJS();
    this.starTexture = this.textureLoader.load('assets/white_circle.png'); 
    this.addMouseMoveListener();
    this.addWindowResizeListener();
    this.addClickListener(); // Add click event listener
    this.addParticles();
    this.addGradientBackground();
    this.animate();
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
      alpha: true
    });
    
    // this.renderer.setClearColor(new THREE.Color('#1D2951'));
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
    this.camera.position.z = 3;

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

  // private addParticles(): void {
  //   const particleCount = 500;
  //   const positions = new Float32Array(particleCount * 3);
  //   const velocities = new Float32Array(particleCount * 3);
  //   const sizes = new Float32Array(particleCount);
    
  //   for (let i = 0; i < particleCount; i++) {
  //     positions[i * 3] = (Math.random() - 0.5) * 4000;
  //     positions[i * 3 + 1] = (Math.random() - 0.5) * 1000;
  //     positions[i * 3 + 2] = (Math.random() - 0.5) * 100 - 5;
      
  //     velocities[i * 3] = (Math.random() - 0.5) * 0.002;
  //     velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.002;
  //     velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.002;

  //     sizes[i] = Math.random() * 0.5 + 0.1;
  //   }

  //   this.particles = new THREE.BufferGeometry();
  //   this.particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  //   this.particles.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
  //   this.particles.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  //   this.particleMaterial = new THREE.PointsMaterial({
  //     map: this.starTexture,
  //     color: 0xffc0cb, // Soft pink glow
  //     size: 0.4,
  //     transparent: true,
  //     opacity: 0.8,
  //     depthWrite: false,
  //     blending: THREE.AdditiveBlending
  //   });

  //   this.particleSystem = new THREE.Points(this.particles, this.particleMaterial);
  //   this.particleSystem.position.z = -3;
  //   this.particleSystem.renderOrder = 1;
  //   this.scene.add(this.particleSystem);
  // }
  private addParticles(): void {
    const particleCount = 1500;
    const positions = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 400;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 100 - 5;
      sizes[i] = Math.random() * 20.0 + 5.0;
    }

    this.particles = new THREE.BufferGeometry();
    this.particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.particles.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    this.particleMaterial = new THREE.ShaderMaterial({
      uniforms: {
        pointTexture: { value: this.starTexture },
        time: { value: 0.0 }
      },
      vertexShader: `
        attribute float size;
        uniform float time;
        varying float vOpacity;
        void main() {
          float pulsate = sin(time * 2.0 + size) * 0.5 + 0.5;
          vOpacity = pulsate;
          vec3 newPosition = position;
          
          // Add movement
          newPosition.y += sin(time * 0.5 + position.x * 0.1) * 0.7; // Gentle up/down drift
          newPosition.x += cos(time * 0.3 + position.y * 0.1) * 0.5; // Slight circular motion
          newPosition.z += sin(time * 0.2 + position.x * 0.05) * 0.7; // Slight depth variation

          vec4 mvPosition = modelViewMatrix * vec4(newPosition, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z) * pulsate;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform sampler2D pointTexture;
        varying float vOpacity;
        void main() {
          vec4 color = texture2D(pointTexture, gl_PointCoord);
          color.rgb = mix(color.rgb, vec3(1.0, 0.75, 0.8), 0.6); // Soft pink blend
          color.a *= vOpacity;
          gl_FragColor = color;
          gl_FragColor.rgb += vec3(0.3, 0.2, 0.5) * vOpacity; // Add slight color shift
          gl_FragColor.a *= smoothstep(0.3, 1.0, length(gl_PointCoord - vec2(0.5))); // Blurring effect
        }
      `,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      transparent: true
    });

    this.particleSystem = new THREE.Points(this.particles, this.particleMaterial);
    this.particleSystem.position.z = -3;
    this.particleSystem.renderOrder = 1;
    this.scene.add(this.particleSystem);
  }

  private addGradientBackground(): void {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    if (ctx){
      const gradient = ctx.createLinearGradient(0,0,0,canvas.height);
      gradient.addColorStop(0, '#ffd1dc');
      gradient.addColorStop(1, '#d8a7ff');
      // gradient.addColorStop(0, '#FFF6B7');
      // gradient.addColorStop(1, '#F6416C');
      ctx.fillStyle = gradient;
      ctx.fillRect(0,0,canvas.width, canvas.height);

      // apply blur effect
      ctx.filter = 'blur(20px)';
      ctx.drawImage(canvas, 0, 0);
    }

    const bgTexture = new THREE.CanvasTexture(canvas);
    bgTexture.minFilter = THREE.LinearFilter;
    bgTexture.magFilter = THREE.LinearFilter;
    this.scene.background = bgTexture;
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

      // const positions = this.particles.attributes['position'].array;
      // const velocities = this.particles.attributes['velocity'].array;
      // const sizes = this.particles.attributes['size'].array;

      // for (let i = 0; i < positions.length; i += 3) {
      //   positions[i] += velocities[i];
      //   positions[i + 1] += velocities[i + 1];
      //   positions[i + 2] += velocities[i + 2];

      //   // Reset positions if they move too far
      //   if (positions[i] > 2 || positions[i] < -2) positions[i] = (Math.random() - 0.5) * 4;
      //   if (positions[i + 1] > 1.5 || positions[i + 1] < -1.5) positions[i + 1] = (Math.random() - 0.5) * 3;

      //   sizes[i] = 0.2 + 0.1 * Math.sin(time * 0.002 + i * 0.1);
      // }

      // this.particles.attributes['position'].needsUpdate = true;
      // this.particles.attributes['size'].needsUpdate = true;
      // this.particleMaterial.size = 0.3 + 0.1 * Math.sin(time * 0.002);
      // this.particleMaterial.opacity = 0.7 * 0.3 * Math.sin(time * 0.002);
      this.particleMaterial.uniforms['time'].value = time * 0.001;

      this.renderer.render(this.scene, this.camera);
      requestAnimationFrame(render);
    };
    requestAnimationFrame(render);
  }

  
}