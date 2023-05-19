import { CGFscene, CGFcamera, CGFaxis, CGFappearance, CGFshader, CGFtexture } from "../lib/CGF.js";
import { MyPlane } from "./MyPlane.js";
import { MySphere } from "./MySphere.js";
import { MyPanorama } from "./MyPanorama.js";
import { MyBird } from "./MyBird.js";
import { MyTerrain } from "./MyTerrain.js";
import { MyBirdEgg } from "./MyBirdEgg.js";
import { MyWing } from "./MyWing.js";
import { MyBirdPaw } from "./MyBirdPaw.js";
import { MyBillBoard } from "./MyBillBoard.js";
import { MyTreeRowPatch } from "./MyTreeRowPatch.js";
import { MyTreeGroupPatch } from "./MyTreeGroupPatch.js";
import { MyNest } from "./MyNest.js";
/**
 * MyScene
 * @constructor
 */
export class MyScene extends CGFscene {
  constructor() {
    super();
  }


  init(application) {
    super.init(application);
    
    this.initCameras();
    this.initLights();

    //Background color
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);

    this.gl.clearDepth(100.0);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.depthFunc(this.gl.LEQUAL);

    
    //Objects connected to MyInterface
    this.selectedObject = 0;
    this.displayNormals = false;
    this.objectComplexity = 0.5;
    this.displayAxis = true;
    this.scaleFactor = 1;
    this.speedFactor = 1;

    this.enableTextures(true);

    //--textures
    this.texture = new CGFtexture(this, "images/terrain.jpg");
    this.earth = new CGFtexture(this, 'images/earth.jpg');
    this.sky = new CGFtexture(this, 'images/panorama4.jpg');
    this.wing = new CGFtexture(this,"images/wing.jpg");
    this.beak = new CGFtexture(this,"images/beak.jpg");
    this.eye = new CGFtexture(this,"images/eye.jpg");
    this.head = new CGFtexture(this,"images/head.jpg");
    this.egg = new CGFtexture(this,"images/egg.jpg");
    this.heightMap = new CGFtexture(this, 'images/heightmap.jpg');
    this.tree1 = new CGFtexture(this, 'images/billboardtree.png');
    this.tree2 = new CGFtexture(this, 'images/tree2.png');
    this.tree3 = new CGFtexture(this, 'images/tree3.png');
    this.nestTexture = new CGFtexture(this, 'images/nest.png');

    //Initialize scene objects
    this.axis = new CGFaxis(this);
    this.terrain = new MyTerrain(this);
    this.panorama = new MyPanorama(this, this.sky);
    this.bird = new MyBird(this,Math.PI, 0, [4,2,4]);
    this.eggs = [new MyBirdEgg(this, [3,0,2],false), new MyBirdEgg(this, [2,0,0],false),new MyBirdEgg(this,[0,0,2],false),new MyBirdEgg(this, [4,0,4],false)]
    this.tree = new MyBillBoard(this,this.tree1,[0,0,0],1);
    this.treeRow = new MyTreeRowPatch(this,[this.tree1,this.tree2,this.tree3],[0,0,0]);
    this.treeGrid = new MyTreeGroupPatch(this,[this.tree1,this.tree2,this.tree3],[0,0,0]);
    this.nest = new MyNest(this,100,100,true,this.nestTexture,[-2,0,2]);


    this.objects = [this.bird, this.panorama, this.birdEgg, this.tree, this.treeRow, this.treeGrid, this.nest];
    this.objectIDs = {'bird': 0, 'panorama': 1, 'birdEgg': 2, 'tree': 3, 'treeRow': 4, 'treeGrid': 5, 'nest': 6};

    this.appearance = new CGFappearance(this);
    this.appearance.setTexture(this.texture);
    this.appearance.setTextureWrap('REPEAT', 'REPEAT');

    this.setUpdatePeriod(1000/60)
  }

  update(t) {
    this.checkKeys();
    this.bird.update(t);
    for(let i = 0; i < this.eggs.length; i++){
      this.eggs[i].update(t,i);
    }
  }


  updateObjectComplexity(){
    this.objects[this.selectedObject].updateBuffers(this.objectComplexity);
  }


  initLights() {
    this.lights[0].setPosition(15, 0, 5, 1);
    this.lights[0].setDiffuse(1.0, 1.0, 1.0, 1.0);
    this.lights[0].enable();
    this.lights[0].update();
  }


  initCameras() {
    this.camera = new CGFcamera(
      Math.PI / 2,
      0.1,
      1000,
      vec3.fromValues(50, 10, 15),
      vec3.fromValues(0, 0, 0)
    );
  }


  setDefaultAppearance() {
    this.setAmbient(0.2, 0.4, 0.8, 1.0);
    this.setDiffuse(0.2, 0.4, 0.8, 1.0);
    this.setSpecular(0.2, 0.4, 0.8, 1.0);
    this.setShininess(10.0);
  }

  checkKeys() {
    var keysPressed = false;

    if(this.gui.isKeyPressed("KeyW")) {
      this.bird.accelerate(0.5);
      keysPressed = true;
    }

    if(this.gui.isKeyPressed("KeyS")) {
      this.bird.accelerate(-0.5);
      keysPressed = true;
    }

    if(this.gui.isKeyPressed("KeyA")) {
      this.bird.turn(-Math.PI / 12);
      keysPressed = true;
    }

    if(this.gui.isKeyPressed("KeyD")) {
      this.bird.turn(Math.PI / 12);
      keysPressed = true;
    }

    if(this.gui.isKeyPressed("KeyR")) {
      this.bird.resetPosition();
      keysPressed = true;
    }

    if(this.gui.isKeyPressed("KeyP")) {
      this.bird.pickEgg = true;
      keysPressed = true;
    }

    if(this.gui.isKeyPressed("KeyO")) {
      this.bird.dropEgg();
      keysPressed = true;
    }
  }



  display() {
    // ---- BEGIN Background, camera and axis setup
    // Clear image and depth buffer everytime we update the scene
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    // Initialize Model-View matrix as identity (no transformation
    this.updateProjectionMatrix();
    this.loadIdentity();
    // Apply transformations corresponding to the camera position relative to the origin
    this.applyViewMatrix();

    // Draw axis
    if (this.displayAxis) this.axis.display();

    this.pushMatrix();
    this.terrain.display();

    // scale factor for the bird
    this.scale(this.scaleFactor,this.scaleFactor,this.scaleFactor);

    
    // display normals of the objects

    if (this.displayNormals)
        this.objects[this.selectedObject].enableNormalViz();
    else
        this.objects[this.selectedObject].disableNormalViz();
    
    //this.translate(this.camera.position[0],this.camera.position[1],this.camera.position[2])
  
  
    for(var i = 0; i < this.eggs.length; i++) {
      this.eggs[i].display();
      if(this.displayNormals)
        this.eggs[i].enableNormalViz();
      else
        this.eggs[i].disableNormalViz();
    }

    this.objects[this.selectedObject].display();
    this.nest.display();
    if(this.displayNormals)
      this.nest.enableNormalViz();
    else
      this.nest.disableNormalViz();
    //this.birdEgg.display();
    //this.tree.display();
    //this.treeGrid.display();
    this.popMatrix();


  }
}
