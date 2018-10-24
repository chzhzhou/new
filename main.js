if (WEBGL.isWebGLAvailable() === false) {

    document.body.appendChild(WEBGL.getWebGLErrorMessage());

}

var camera, scene, renderer, dirLight, dirLightHeper, hemiLight, hemiLightHelper;
var mixers = [];
var stats;
var controls;
var clock = new THREE.Clock();
var texture, normal;
init();
animate();

function init() {

    var container = document.getElementById('container');

    camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 5000);
    camera.position.set(0, 0, 80);

    scene = new THREE.Scene();
    scene.background = new THREE.Color().setHSL(0.6, 0, 1);
    scene.fog = new THREE.Fog(scene.background, 1, 5000);

    // LIGHTS

    hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
    hemiLight.color.setHSL(0.6, 1, 0.6);
    hemiLight.groundColor.setHSL(0.095, 1, 0.75);
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);

    hemiLightHelper = new THREE.HemisphereLightHelper(hemiLight, 10);
    scene.add(hemiLightHelper);

    //

    dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.color.setHSL(0.1, 1, 0.95);
    dirLight.position.set(-2, 1.75, -1);
    dirLight.position.multiplyScalar(30);
    scene.add(dirLight);

    dirLight.castShadow = true;

    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;

    var d = 50;

    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;

    dirLight.shadow.camera.far = 3500;
    dirLight.shadow.bias = -0.0001;

    dirLightHeper = new THREE.DirectionalLightHelper(dirLight, 10);
    scene.add(dirLightHeper);

    // GROUND

    var groundGeo = new THREE.PlaneBufferGeometry(10000, 10000);
    var groundMat = new THREE.MeshPhongMaterial({ color: 0xffffff, specular: 0x050505 });
    groundMat.color.setHSL(0.95, 1, 0.75);

    var ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -33;
    scene.add(ground);

    ground.receiveShadow = true;

    // SKYDOME

    normal = new THREE.TextureLoader().load(assetPath+"4096_norma.jpg");
    texture = new THREE.TextureLoader().load(assetPath+"4096_earth.jpg");
    //normal = new THREE.TextureLoader().load(assetPath+"4096_norma.jpg");
    var vertexShader = document.getElementById('vertexShader_sky').textContent;
    var fragmentShader = document.getElementById('fragmentShader_sky').textContent;
    var uniforms = {
        topColor: { value: new THREE.Color(0x0077ff) },
        bottomColor: { value: new THREE.Color(0xffffff) },
        offset: { value: 33 },
        exponent: { value: 0.6 }, 
        tx: { type: 't', value: texture },           
        tNormal: {value: normal}
    };
    uniforms.topColor.value.copy(hemiLight.color);
    scene.fog.color.copy(uniforms.bottomColor.value);

    var skyGeo = new THREE.SphereBufferGeometry(4000, 32, 15);
    var skyMat = new THREE.ShaderMaterial({ vertexShader: vertexShader, fragmentShader: fragmentShader, uniforms: uniforms, side: THREE.BackSide });

    var sky = new THREE.Mesh(skyGeo, skyMat);
    scene.add(sky);

    // MODEL

    // var loader = new THREE.GLTFLoader();

    // loader.load('models/gltf/Flamingo.glb', function (gltf) {

    //     var mesh = gltf.scene.children[0];

    //     var s = 0.35;
    //     mesh.scale.set(s, s, s);
    //     mesh.position.y = 15;
    //     mesh.rotation.y = -1;

    //     mesh.castShadow = true;
    //     mesh.receiveShadow = true;

    //     scene.add(mesh);

    //     var mixer = new THREE.AnimationMixer(mesh);
    //     mixer.clipAction(gltf.animations[0]).setDuration(1).play();
    //     mixers.push(mixer);

    // });

    // texture
    var assetPath = 'assets/sphere/';
    var texture_obj = new THREE.TextureLoader().load(assetPath+"4096_earth.jpg");
    var normal_obj = new THREE.TextureLoader().load(assetPath+"4096_norma.jpg");    
    //normal = new THREE.TextureLoader().load(assetPath+"4096_norma.jpg");
    var vertexShader_obj = document.getElementById('vertexShader_obj').textContent;
    var fragmentShader_obj = document.getElementById('fragmentShader_obj').textContent;
    var uniforms_obj = {
        topColor: { value: new THREE.Color(0x0077ff) },
        bottomColor: { value: new THREE.Color(0xffffff) },
        offset: { value: 33 },
        exponent: { value: 0.6 }, 
        tx: { type: 't', value: texture_obj },           
        tNormal: {value: normal_obj}
    };
    uniforms_obj.topColor.value.copy(hemiLight.color);
    //var skyGeo = new THREE.SphereBufferGeometry(4000, 32, 15);
    var material_obj = new THREE.ShaderMaterial({ 
        vertexShader: vertexShader_obj, 
        fragmentShader: fragmentShader_obj, 
        uniforms: uniforms_obj,
        shading: THREE.SmoothShading,
        side: THREE.DoubleSide });
    
     //textureMaterial = new THREE.MeshPhongMaterial( { map: texture, normalMap: normal, ambient: 0x555555, color: 0x555555, specular: 0xffffff, shininess: 50, shading: THREE.SmoothShading} );
    //phongMaterial = new THREE.MeshPhongMaterial({ ambient: 0x555555, color: 0x555555, specular: 0xffffff, shininess: 50, shading: THREE.SmoothShading });
    //basicMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 1, wireframe: true });

    
    var objLoader = new THREE.OBJLoader2();
    objLoader.setUseIndices(true);
    var callbackOnLoad = function (event) {
        var tmp = event.detail.loaderRootNode;

        tmp.scale.set(0.05, 0.05, 0.05);
        tmp.position.set(0, 0, 00);
        //tmp.rotation.y = -0.5;
        tmp.children[0].castShadow = true;
        tmp.children[0].receiveShadow = true;
        tmp.children[0].name = 'aa';
        
        tmp.children[0].material=material_obj;
        tmp.children[0].material.normalMap = normal_obj;
        //tmp.children[0].material.normalScale.set(1,1);
        //tmp.children[0].material.color.seHex(0xff0000);
        //tmp.children[0].geometry.computeFaceNormals();
        //tmp.children[0].geometry.computeVertexNormals(true);
        scene.add(tmp);

        //console.log));
        console.log('Loading complete: ' + event.detail.modelName);
    };
    var onLoadMtl = function (materials) {
        //objLoader.setModelName( modelName );
        objLoader.setMaterials(materials);
        //materials.default.map.magFilter = THREE.NearestFilter;
        //materials.default.map.minFilter = THREE.LinearFilter;


        objLoader.setLogging(true, true);
        objLoader.load(assetPath + 'earth.obj', callbackOnLoad, null, null, null, false);

    };
    //objLoader.loadMtl(mt, null, onLoadMtl);
    objLoader.loadMtl(assetPath + 'earth.mtl', null, onLoadMtl);







    // RENDERER

    renderer = new THREE.WebGLRenderer({ antialias: true     ,alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    renderer.gammaInput = true;
    renderer.gammaOutput = true;

    renderer.shadowMap.enabled = true;
    /* Controls */

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;
    //controls.maxDistance =500;
    //controls.minDistance =100.;
    controls.maxPolarAngle  = 2.0;
    

    // STATS

    stats = new Stats();
    container.appendChild(stats.dom);

    //

    window.addEventListener('resize', onWindowResize, false);
    document.addEventListener('keydown', onKeyDown, false);


}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

function onKeyDown(event) {

    switch (event.keyCode) {

        case 72: // h
            hemiLight.visible = !hemiLight.visible;
            hemiLightHelper.visible = !hemiLightHelper.visible;
            break;

        case 68: { // d            
            dirLight.visible = !dirLight.visible;
            dirLightHeper.visible = !dirLightHeper.visible;
            break;

        }

        case 66:
            var d = 1;
            if (event.shiftKey) { console.debug(1); d = d * -1; };
            scene.traverse(function (child) {
                if (child instanceof THREE.Group) {
                    if (child.children[0].name === 'aa') {
                        arr = child.children[0].geometry.attributes.position.array;
                        nom = child.children[0].geometry.attributes.normal.array;
                        for (var i = 0; i < arr.length; i++) {
                            arr[i] += nom[i] * d;// (Math.random() - 0.5);
                        }
                    };


                    //child.children[0].geometry.computeFaceNormals();
                    child.children[0].geometry.computeVertexNormals();
                    
                    
                    //child.children[0].material = textureMaterial;



                    //man.geometry.computeFaceNormals();
                    //man.geometry.computeVertexNormals();
                    child.children[0].geometry.attributes.position.needsUpdate = true;
                    child.children[0].geometry.attributes.normal.needsUpdate = true;

                }

            });
            break;

    }

}





//

function animate() {

    requestAnimationFrame(animate);

    render();
    stats.update();

}

function render() {

    var delta = clock.getDelta();

    for (var i = 0; i < mixers.length; i++) {
        mixers[i].update(delta);
    }

    renderer.render(scene, camera);

}
