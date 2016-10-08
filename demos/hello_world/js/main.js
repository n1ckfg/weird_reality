"use strict";

var skyboxTextureLoader;
var geometry, material, cube, skybox;
var animation, ground, groundMaterial, planeGeometry;
var skySphere, skySphereGeo, skySphereMat, skySphereTextureLoader;

var worm_loader, worm_skinnedMesh, worm_mixer;
var polyman_loader, polyman_skinnedMesh, polyman_mixer;
var hallway_loader, hallway_mesh;

function main() {
    init();

    light = new THREE.HemisphereLight( 0xffffff, 0x003300, 1 );
    light.position.set( - 80, 500, 50 );
    scene.add(light);

    skySphereTextureLoader = new THREE.TextureLoader();
    skySphereTextureLoader.load("./textures/pano.jpg", onSkySphereTextureLoaded);

    boxWidth = 20;
    skyboxTextureLoader = new THREE.TextureLoader();
    skyboxTextureLoader.load("./textures/box.png", onSkyboxTextureLoaded);

    groundMaterial = new THREE.MeshPhongMaterial( { emissive: 0xbbbbbb } );
    planeGeometry = new THREE.PlaneBufferGeometry( 16000, 16000 );
    ground = new THREE.Mesh( planeGeometry, groundMaterial );
    ground.position.set( 0, -5, 0 );
    ground.rotation.x = -Math.PI/2;
    //scene.add( ground );

    worm_loader = new THREE.JSONLoader();
    
    worm_loader.load("./models/worm.json", function(geometry, materials) {

        for (var k in materials) {
            materials[k].skinning = true;
        }

        worm_skinnedMesh = new THREE.SkinnedMesh(geometry, new THREE.MeshFaceMaterial(materials));
        worm_skinnedMesh.scale.set( 0.1, 0.1, 0.1 );
        worm_skinnedMesh.position.set(0, 0, 1);
        //scene.add( worm_skinnedMesh );

        //worm_mixer = new THREE.AnimationMixer( worm_skinnedMesh );
        //worm_mixer.addAction( new THREE.AnimationAction( worm_skinnedMesh.geometry.animations[0] ) );                 

    });

    polyman_loader = new THREE.JSONLoader();

    polyman_loader.load("./models/polyman_anim.json", function(geometry, materials) { 

        for ( var k in materials ) {
            materials[k].skinning = true;
        }

        polyman_skinnedMesh = new THREE.SkinnedMesh(geometry, new THREE.MeshFaceMaterial(materials));
        polyman_skinnedMesh.scale.set(0.1, 0.1, 0.1);
        polyman_skinnedMesh.position.set(0, 0, -1);

        scene.add( polyman_skinnedMesh );

        polyman_mixer = new THREE.AnimationMixer( polyman_skinnedMesh );
        polyman_mixer.addAction( new THREE.AnimationAction( polyman_skinnedMesh.geometry.animations[0] ) );                    

    });

    
    hallway_loader = new THREE.ColladaLoader();
    hallway_loader.options.convertUpAxis = true;
    hallway_loader.load("./models/hallway/hallway.dae", function(collada) {

        hallway_mesh = collada.scene;

        hallway_mesh.traverse(function(child) {
            if (child instanceof THREE.SkinnedMesh) {
                var animation = new THREE.Animation(child, child.geometry.animation);
                animation.play();
            }
        });

        hallway_mesh.scale.x = hallway_mesh.scale.y = hallway_mesh.scale.z = 1; //0.002;
        hallway_mesh.position.set(2,0,1);
        hallway_mesh.updateMatrix();

        scene.add(hallway_mesh);
    });

    function onSkyboxTextureLoaded(texture) {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(boxWidth, boxWidth);

        var geometry = new THREE.BoxGeometry(boxWidth, boxWidth, boxWidth);
        var material = new THREE.MeshBasicMaterial({
            map: texture,
            color: 0x01BE00,
            side: THREE.BackSide
        });

        skybox = new THREE.Mesh(geometry, material);
        //scene.add(skybox);
    }

    function onSkySphereTextureLoaded(texture) {
        skySphereGeo = new THREE.SphereGeometry(500, 60, 40);
        skySphereGeo.applyMatrix(new THREE.Matrix4().makeScale(-1, 1, 1));
        skySphereMat = new THREE.MeshBasicMaterial({ map : texture });
        skySphere = new THREE.Mesh(skySphereGeo, skySphereMat);
        scene.add(skySphere);
    }

    geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    material = new THREE.MeshNormalMaterial();
    cube = new THREE.Mesh(geometry, material);
    cube.position.set(0, 1.5, -1);
    scene.add(cube);

    function animate(timestamp) {
        var delta = clock.getDelta();

        if( worm_mixer ) worm_mixer.update( delta );
        if( polyman_mixer ){
            polyman_mixer.update( delta );

            //polyman_skinnedMesh.rotation.y += 0.005;
            //skybox.rotation.y += 0.005;
        }

        cube.rotation.y += delta * 0.0006;

        if (hallway_mesh) {
            //hallway_mesh.rotation.y += delta * 0.0003;
        }

        render(timestamp);
        requestAnimationFrame(animate);
    }

    animate(performance ? performance.now() : Date.now());
}

window.onload = main;
