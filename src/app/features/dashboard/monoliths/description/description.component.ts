import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { IMonolith, MonolithFeature } from '../monoliths.interfaces';
import { monolithFeatures, monolithId$ } from '../monoliths.config';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-description',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './description.component.html',
  styleUrl: './description.component.scss',
})
export class DescriptionComponent implements OnInit, AfterViewInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  @ViewChild('model', { static: false }) private canvasRef?: ElementRef;
  selectedModel!: MonolithFeature;
  selectedModelProperties!: IMonolith;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;

  constructor(private router: Router) {}

  private initThree() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      1,
      0.1,
      1000
    );
    this.camera.position.z = 2.5;

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setClearColor(0xffffff, 1);

    // Use this backborund color to scene
    const canvasContainer = this.canvasRef?.nativeElement as HTMLDivElement;

    // Use custom dimensions of canvas
    const canvasWidth = 350;
    const canvasHeight = 350;
    this.renderer.setSize(canvasWidth, canvasHeight);

    // Add canvas to container
    canvasContainer.appendChild(this.renderer.domElement);
  }

  private loadModel() {
    // option N2
    const loaderGLTF = new GLTFLoader();
    loaderGLTF.load(`/assets/3d-models/model_${this.selectedModel.getId()}.glb`, (gltf) => {
      const lightDistance = 10;
      const lightIntensity = 75;
      const light = new THREE.PointLight('rgb(255,255,255)', lightIntensity, lightDistance);
      const light2 = new THREE.PointLight('rgb(255,255,255)', lightIntensity, lightDistance);
      const light3 = new THREE.PointLight('rgb(255,255,255)', lightIntensity, lightDistance);
      const light4 = new THREE.PointLight('rgb(255,255,255)', lightIntensity, lightDistance);
      const light5 = new THREE.PointLight('rgb(255,255,255)', lightIntensity, lightDistance);
      const lightPosition = 3.5;
      light.position.set(0, 0, lightPosition);
      light2.position.set(lightPosition, 0, 0);
      light3.position.set(0, lightPosition, 0);
      light4.position.set(-lightPosition, lightPosition, lightPosition);
      light5.position.set(0, 0, -lightPosition);
      this.scene.add(light);
      this.scene.add(light2);
      this.scene.add(light3);
      this.scene.add(light4);
      this.scene.add(light5);
      // Setting possition of object model
      gltf.scene.position.set(0, -1, 0);
      this.scene.add(gltf.scene);
    });
  }

  private setupOrbitControls() {
    // Configuración de los controles de órbita
    this.controls = new OrbitControls(this.camera, this.renderer?.domElement);
    this.controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    this.controls.dampingFactor = 0.25;
    this.controls.screenSpacePanning = false;
    this.controls.maxPolarAngle = Math.PI / 2;
  }

  private animate() {
    // Función de animación
    const animate = () => {
      requestAnimationFrame(animate);
      this.controls.update();
      this.renderer.render(this.scene, this.camera);
    };

    animate();
  }

  // GLTF Models
  subscribeToMonolithFeatureId() {
    const monolithId = Number(this.router.url.split('/').pop());
    this.subscriptions.push(monolithId$.subscribe(featureId => {
      const monolithFt = monolithFeatures.find(feature => feature.getProperties()['n'] === featureId);
      if(monolithFt) {
        this.selectedModel = monolithFt;
        this.selectedModelProperties = monolithFt.getProperties() as IMonolith;
        if(document.getElementById('model')?.innerHTML) {
          document.getElementById('model')!.innerHTML = '';
          this.createMonolithScene();
        }
      } else {
        this.router.navigate(['dashboard/monoliths']);
      }
    }));
    monolithId$.next(monolithId);
  }

  createMonolithScene() {
    // Probe obj model
    this.initThree();
    this.loadModel();
    this.setupOrbitControls();
    this.animate();
  }

  getUnits(monolith: IMonolith) {
    return monolith.dimension.join(' x ') + ` ${monolith.units}`;
  }

  ngOnInit(): void {
    this.subscribeToMonolithFeatureId();
  }

  ngAfterViewInit() {
    this.createMonolithScene();
  }

  ngOnDestroy(): void {
    this.subscriptions.map((subscription) => subscription.unsubscribe());
  }
}
