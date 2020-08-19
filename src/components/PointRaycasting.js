import React, {Component} from 'react';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module';
import { Interaction } from 'three.interaction';


export default class PointRaycasting extends Component {
    componentDidMount() {
        this.sceneSetup();
        this.animate();
    }

    generatePointCloudGeometry = (color, width, length) => {
        var geometry = new THREE.BufferGeometry();
        var numPoints = width * length;

        var positions = new Float32Array( numPoints * 3 );
        var colors = new Float32Array( numPoints * 3 );
        
        //generate the points and the varying colors of the points 
        var k = 0; 
        
        for ( var i = 0; i < width; i ++ ) {

            for ( var j = 0; j < length; j ++ ) {

                var u = i / width;
                var v = j / length;
                var x = u - 0.5;
                var y = ( Math.cos( u * Math.PI * 4 ) + Math.sin( v * Math.PI * 8 ) ) / 20;
                var z = v - 0.5;

                positions[ 3 * k ] = x;
                positions[ 3 * k + 1 ] = y;
                positions[ 3 * k + 2 ] = z;

                var intensity = ( y + 0.1 ) * 5;
                colors[ 3 * k ] = color.r * intensity;
                colors[ 3 * k + 1 ] = color.g * intensity;
                colors[ 3 * k + 2 ] = color.b * intensity;

                k ++;

            }

        }

        geometry.setAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
		geometry.setAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );
        geometry.computeBoundingBox();
        
        return geometry;
    }

    generatePointcloud = (color, width, length) => {
        var geometry = this.generatePointCloudGeometry( color, width, length );
		var material = new THREE.PointsMaterial( { size: this.pointSize, vertexColors: true } );

		return new THREE.Points( geometry, material );
    }

    generateIndexedPointcloud = (color, width, length) => {
        var geometry = this.generatePointCloudGeometry( color, width, length );
		var numPoints = width * length;
		var indices = new Uint16Array( numPoints );

		var k = 0;

		for ( var i = 0; i < width; i ++ ) {

			for ( var j = 0; j < length; j ++ ) {

				indices[ k ] = k;
				k ++;

			}

		}

		geometry.setIndex( new THREE.BufferAttribute( indices, 1 ) );

		var material = new THREE.PointsMaterial( { size: this.pointSize, vertexColors: true } );

		return new THREE.Points( geometry, material );
    }

    generateIndexedWithOffsetPointcloud = ( color, width, length ) => {

        var geometry = this.generatePointCloudGeometry( color, width, length );
        var numPoints = width * length;
        var indices = new Uint16Array( numPoints );

        var k = 0;

        for ( var i = 0; i < width; i ++ ) {

            for ( var j = 0; j < length; j ++ ) {

                indices[ k ] = k;
                k ++;

            }

        }

        geometry.setIndex( new THREE.BufferAttribute( indices, 1 ) );
        geometry.addGroup( 0, indices.length );

        var material = new THREE.PointsMaterial( { size: this.pointSize, vertexColors: true } );

        return new THREE.Points( geometry, material );

    }

    onWindowResize = (e) => {
        this.containerWidth = this.el.clientWidth;
        this.containerHeight = this.el.clientHeight;
        this.renderer.setSize(this.containerWidth, this.containerHeight, false);
        this.camera.aspect = this.el.clientWidth / this.el.clientHeight;
        this.camera.updateProjectionMatrix();
    }

    onMouseMove = (e) => {
        e.preventDefault();
        this.mouseVector.x = 2 * (e.clientX / this.containerWidth) - 1;
        this.mouseVector.y = 1 - 2 * ( e.clientY / this.containerHeight );
    }

    animate = () => {
        requestAnimationFrame(this.animate);
        this.controls.update();
        this.renderScene();
        this.stats.update();
    }

    renderScene = () => {
        this.raycaster.setFromCamera( this.mouseVector, this.camera );

        //detect all intersections with the points cloud
        var intersections = this.raycaster.intersectObjects(this.pointclouds);
        var intersection = (intersections.length) > 0 ? intersections[0] : null;

        if ( this.toggle > 0.02 && intersection !== null ) {

            this.spheres[ this.spheresIndex ].position.copy( intersection.point );
            this.spheres[ this.spheresIndex ].scale.set( 0.5, 0.5, 0.5 );
            this.spheresIndex = ( this.spheresIndex + 1 ) % this.spheres.length;

            this.toggle = 0;
        }

        for ( var i = 0; i < this.spheres.length; i ++ ) {

            var sphere = this.spheres[ i ];
            sphere.scale.multiplyScalar( 0.98 );
            sphere.scale.clampScalar( 0.01, 1 );

        }

        this.toggle += this.clock.getDelta();

        this.renderer.render( this.scene, this.camera );
    }

    sceneSetup = () => {
        //window size and class variables  
        this.containerWidth = window.innerWidth;
        this.containerHeight = window.innerHeight;
        this.pointSize = 0.05;
        this.spheres = [];
        this.spheresIndex = 0;
        this.toggle = 0;

        //local variables 
        var threshold = 0.1;
        var width = 80;
        var length = 160;
        
        this.clock = new THREE.Clock();

        //set up the scene
        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera(45, this.containerWidth / this.containerHeight, 1, 1000);
        this.camera.position.set( 10, 10, 10 );
        this.camera.lookAt( this.scene.position );
        //user camera controls 
        this.controls = new OrbitControls( this.camera, this.el );
        this.controls.zoomSpeed = 0.3;

        var pcBuffer = this.generatePointcloud( new THREE.Color( 1, 0, 0 ), width, length );
		pcBuffer.scale.set( 5, 10, 10 );
		pcBuffer.position.set( - 5, 0, 0 );
        this.scene.add( pcBuffer );
        
        var pcIndexed = this.generateIndexedPointcloud( new THREE.Color( 0, 1, 0 ), width, length );
		pcIndexed.scale.set( 5, 10, 10 );
		pcIndexed.position.set( 0, 0, 0 );
		this.scene.add( pcIndexed );

		var pcIndexedOffset = this.generateIndexedWithOffsetPointcloud( new THREE.Color( 0, 1, 1 ), width, length );
		pcIndexedOffset.scale.set( 5, 10, 10 );
		pcIndexedOffset.position.set( 5, 0, 0 );
		this.scene.add( pcIndexedOffset );

		this.pointclouds = [ pcBuffer, pcIndexed, pcIndexedOffset ];

        var sphereGeometry = new THREE.SphereBufferGeometry( 0.1, 32, 32 );
        var sphereMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
        
        for ( var i = 0; i < 40; i ++ ) {

            var sphere = new THREE.Mesh( sphereGeometry, sphereMaterial );
            this.scene.add( sphere );
            this.spheres.push( sphere );

        }


        this.renderer = new THREE.WebGLRenderer( { antialias: true } );
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize( window.innerWidth, window.innerHeight );
		this.el.appendChild( this.renderer.domElement );

        this.raycaster = new THREE.Raycaster();
        this.raycaster.params.Points.threshold = threshold;

        this.stats = new Stats();
        this.el.appendChild( this.stats.dom );

        //track mouse position 
        this.mouseVector = new THREE.Vector2();

        //add listener for click event 
        this.interaction = new Interaction(this.renderer, this.scene, this.camera);

        window.addEventListener( 'resize', this.onWindowResize, false );
        window.addEventListener( 'mousemove', this.onMouseMove, false );
    }


    render() {
        return(
            <div ref={ref => (this.el = ref)} />
        );
    }
}