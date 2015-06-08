function RunMaker() {

    var renderer, scene, camera, controls, timer;
    
    var HSCALE = 8;
    var VSCALE = 2;

    var XMIN, XMAX, YMIN, YMAX, ZMIN, ZMAX = null;
    var XRANGE, YRANGE, ZRANGE = null;

    var pointSize = 0.075;

    var parser = new GPXParser();

    var needToUpdate = false;
    var runs = [];
    var runPts = [];

    var spheres = [];
    var spherePointIndexes = [];
    var trailing = 6;
  
    // Setting up renderer
    container = document.getElementById( 'container' );

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 20000 );
    camera.applyMatrix( new THREE.Matrix4().makeTranslation( 0, 0, 35 ) );
    camera.applyMatrix( new THREE.Matrix4().makeRotationX( -0.3 ) );

    controls = new THREE.OrbitControls( camera );
    controls.damping = 0.2;
    controls.addEventListener( 'change', render );

    timer = new THREE.Clock();

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );

    window.addEventListener( 'resize', onWindowResize, false );

    animate();

    this.makeRun = function( file ) {

        parse( file );

    };

    function onFileRead( evt ) {

        var strcontent = evt.target.result;
        var parsed = new DOMParser().parseFromString( strcontent, 'text/xml' );

        var pts = parser.getPoints( parsed );

        runPts.push( pts );
        if( runPts.length > 3 ) {

            runPts.splice( 0, 1 );

        }

        var nPts = processPoints( pts );
        addRun( nPts );

    }

    function parse( file ) {

        var fileReader = new FileReader();
        fileReader.addEventListener( 'loadend', onFileRead );
        fileReader.readAsText( file );

    }

    var toggle = 0;

    function animate() {

        requestAnimationFrame( animate );

        if( toggle > 0.02 ) {

            for( var i = 0; i < spheres.length; i++ ) {

                for( var j = 0; j < spheres[ i ].length; j++ ) {

                    var newPosIndex = spherePointIndexes[ i ] + 5 * ( trailing - j - 1 );
                    spheres[ i ][ j ].position.copy( runs[ i ].geometry.vertices[ clamp( newPosIndex, 0, runs[ i ].geometry.vertices.length - 1 ) ] );

                }

                spherePointIndexes[ i ] += 1;
                if( spherePointIndexes[ i ] > runs[ i ].geometry.vertices.length - 1 ) {
                    
                    spherePointIndexes[ i ] = 0;

                }

            }

        }

        toggle += timer.getDelta();

        render();
        controls.update();

    }

    function render() {

        renderer.render( scene, camera );

    }

    function clamp( value, min, max ) {

        if( value > max ) {
            
            return max;

        } else if( value < min ) {

            return min;

        } else {

            return value;

        }

    }

    function onWindowResize() {

        renderer.setSize( window.innerWidth, window.innerHeight );

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        render();

    }

    function processPoints( pts ) {

        // Finding the min and max values
        var xvals = [];
        var yvals = [];
        var zvals = [];

        for( var j = 0; j < pts.length; j++ ) {

            xvals.push( pts[ j ].x );
            yvals.push( pts[ j ].y );
            zvals.push( pts[ j ].z );

        }

        if( XMIN == null ) {

            XMIN = getMin( xvals );
            XMAX = getMax( xvals );
            YMIN = getMin( yvals );
            YMAX = getMax( yvals );
            ZMIN = getMin( zvals );
            ZMAX = getMax( zvals );

        } else {

            if( getMin( xvals ) < XMIN ) {
                
                XMIN = getMin( xvals );
                needToUpdate = true;

            }

            if( getMax( xvals ) > XMAX ) {

                XMAX = getMax( xvals );
                needToUpdate = true;

            }

            if( getMin( yvals ) < YMIN ) {

                YMIN = getMin( yvals );
                needToUpdate = true;

            }

            if( getMax( yvals ) > YMAX ) {

                YMAX = getMax( yvals );
                needToUpdate = true;

            }

            if( getMin( zvals ) < ZMIN ) {

                ZMIN = getMin( zvals );
                needToUpdate = true;

            }

            if( getMax( zvals ) > ZMAX ) {

                ZMAX = getMax( zvals );
                needToUpdate = true;

            }

        }
        
        XRANGE = XMAX - XMIN;
        YRANGE = YMAX - YMIN;
        ZRANGE = ZMAX - ZMIN;

        return normalisePts( pts );
        
    }

    function updatePoints() {

        for( var i = 0; i < runs.length - 1; i++ ) {

            var nPts = normalisePts( runPts[ i ] );
            runs[ i ].geometry.vertices = nPts;
            runs[ i ].geometry.verticesNeedUpdate = true;

        }

    }

    function normalisePts( pts ) {

        var nPts = [];

        for( var i = 0; i < pts.length; i++ ) {

            var p = new THREE.Vector3();

            var xnorm = 2 * ( pts[ i ].x - XMIN ) / XRANGE - 1;
            p.x = HSCALE * xnorm;

            var ynorm = 2 * ( pts[ i ].y - YMIN ) / YRANGE - 1;
            p.y = VSCALE * ynorm;

            var znorm = 2 * ( pts[ i ].z - ZMIN ) / ZRANGE - 1;
            p.z = HSCALE * ZRANGE / XRANGE * znorm;

            nPts.push( p );

        }

        return nPts;

    }

    function addRun( pts ) {

        var geom = new THREE.Geometry();
        var color = new THREE.Color( Math.random() * 0x808080 + 0x808080 );

        pts.forEach( function( p ) {

            geom.vertices.push( p );
            geom.colors.push( color );

        } );

        var mat = new THREE.PointCloudMaterial( { vertexColors: THREE.VertexColors, size: pointSize } );

        var run = new THREE.PointCloud( geom, mat );
        runs.push( run );
        if( runs.length > 3 ) {

            scene.remove( runs[ 0 ] );
            runs.splice( 0, 1 );

            scene.remove( spheres[ 0 ]);
            spheres.splice( 0, 1 );
            spherePointIndexes.splice( 0, 1 );

        }

        if( needToUpdate ) {

            updatePoints();
            needToUpdate = false;

        }

        scene.add( run );

        // Spheres 'running' course
       
        var trail = [];

        for( var i = 0; i < trailing; i++ ) {

            var sphereGeom = new THREE.SphereGeometry( 0.15 - 0.075 * ( i / trailing ), 32, 32 );
            var sphereMat = new THREE.MeshBasicMaterial( { color: color } );
            var sphere = new THREE.Mesh( sphereGeom, sphereMat );
            sphere.position.set( 0, 0, 0 );
            scene.add( sphere );

            trail.push( sphere );
        
        }

        spheres.push( trail );
        spherePointIndexes.push( 0 );

        render();

    }

    function getMin( vals ) {
        
        return Math.min.apply( null, vals );

    }

    function getMax( vals ) {

        return Math.max.apply( null, vals );

    }

}
