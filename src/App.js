import React, { Component } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export default class App extends Component {

    componentDidMount() {

        var
		geom,
		range = 50,
        axes;
                
        this.containerWidth = window.innerWidth;
        this.containerHeight = window.innerHeight;

        //options for blending when rendering the scene
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

        this.renderer.setClearColor( 0xeeeedd, 1.0 );
        this.renderer.setPixelRatio(window.devicePixelRatio);
	    this.renderer.setSize( this.containerWidth, this.containerHeight, false );
	    this.el.appendChild( this.renderer.domElement );

        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera( 45, this.containerWidth / this.containerHeight, 1, 10000 );
        this.camera.position.set( 0, 0, range * 2 );
        this.camera.lookAt( new THREE.Vector3( 0, 0, 0 ) );
        
        geom = new THREE.CubeGeometry( 5, 5, 5 );

        this.cubes = new THREE.Object3D();
        this.scene.add( this.cubes );

        for(var i = 0; i < 100; i++ ) {
            var grayness = Math.random() * 0.5 + 0.25,
                mat = new THREE.MeshBasicMaterial(),
                cube = new THREE.Mesh( geom, mat );
            mat.color.setRGB( grayness, grayness, grayness );
            cube.position.set( range * (0.5 - Math.random()), range * (0.5 - Math.random()), range * (0.5 - Math.random()) );
            cube.rotation.set( Math.random()* 2 * Math.PI, Math.random()* 2 * Math.PI, Math.random()* 2 * Math.PI );
            cube.grayness = grayness;
            this.cubes.add( cube );
        }

        axes = this.buildAxes();
        this.scene.add(axes);

        //raycaster will detects mouse intersections within the scene 
        this.raycaster = new THREE.Raycaster();

        //get the mouse coordinates - 2D vector, raycaster will translate this to 3D point in our 3D scene
        this.mouseVector = new THREE.Vector2();

        window.addEventListener( 'mousemove', this.onMouseMove, false );
        window.addEventListener( 'resize', this.onWindowResize, false );
        
        //replace trackball controls with orbitcontrols
        this.controls = new OrbitControls( this.camera, this.el );
        this.controls.zoomSpeed = 0.1;

        this.animate();
    }

    onMouseMove = (e) => {
        //these two lines convert from mouse coordinates to scene coordinates
        //the mouse Y position needs to be negated because the typical DOM grows from top to bottom (top is 0) and our scene grows from bottom to top
        this.mouseVector.x = 2 * (e.clientX / this.containerWidth) - 1;
        this.mouseVector.y = 1 - 2 * ( e.clientY / this.containerHeight );

        //casts a ray from mouse, through the camera, into the scene 
        this.raycaster.setFromCamera(this.mouseVector, this.camera);
        
        //get the objects in this.cubes.children that the ray intersected with 
        var intersects = this.raycaster.intersectObjects(this.cubes.children);

        this.cubes.children.forEach(function(cube) {
            cube.material.color.setRGB( cube.grayness, cube.grayness, cube.grayness );
        });

        //iterate over the objects that were intersected
        for(var i = 0; i < intersects.length; i++) {
            var intersection = intersects[i],
                //returns the actual object associated with the intersection (intersection also has properties distance, point, and face)
                obj = intersection.object;
            obj.material.color.setRGB(1.0 - i / intersects.length, 0, 0);
        }

    }
    
    onWindowResize = (e) => {
        this.containerWidth = this.el.clientWidth;
        this.containerHeight = this.el.clientHeight;
        this.renderer.setSize(this.containerWidth, this.containerHeight, false);
        this.camera.aspect = this.el.clientWidth / this.el.clientHeight;
        this.camera.updateProjectionMatrix();
    }

    animate = () => {
        requestAnimationFrame(this.animate);
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    buildAxes = () => {
        var axes = new THREE.Object3D();

		axes.add( this.buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 100, 0, 0 ), 0xFF0000, false ) ); // +X
		axes.add( this.buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( -100, 0, 0 ), 0x800000, true) ); // -X
		axes.add( this.buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 100, 0 ), 0x00FF00, false ) ); // +Y
		axes.add( this.buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, -100, 0 ), 0x008000, true ) ); // -Y
		axes.add( this.buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, 100 ), 0x0000FF, false ) ); // +Z
		axes.add( this.buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, -100 ), 0x000080, true ) ); // -Z

		return axes;

    }

    buildAxis = ( src, dst, colorHex, dashed ) => {
		var geom = new THREE.Geometry(),
			mat; 

		if(dashed) {
			mat = new THREE.LineDashedMaterial({ linewidth: 1, color: colorHex, dashSize: 5, gapSize: 5 });
		} else {
			mat = new THREE.LineBasicMaterial({ linewidth: 1, color: colorHex });
		}

		geom.vertices.push( src.clone() );
		geom.vertices.push( dst.clone() );

		var axis = new THREE.Line( geom, mat );

		return axis;
	}

    render() {
        return <div ref={ref => (this.el = ref)} />
    }

}