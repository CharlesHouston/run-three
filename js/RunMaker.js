function RunMaker() {

    var renderer, scene, camera, controls;
    
    var HSCALE = 8;
    var VSCALE = 2;

    var XMIN, XMAX, YMIN, YMAX, ZMIN, ZMAX = null;
    var XRANGE, YRANGE, ZRANGE = null;

    var pointSize = 0.075;

    var parser = new GPXParser();

    var needToUpdate = false;
    var runs = [];
    var runPts = [];
  
    // Setting up renderer
    container = document.getElementById( 'container' );

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 20000 );
    camera.applyMatrix( new THREE.Matrix4().makeTranslation( 0, 0, 35 ) );
    camera.applyMatrix( new THREE.Matrix4().makeRotationX( -0.3 ) );

    controls = new THREE.OrbitControls( camera );
    controls.damping = 0.2;
    controls.addEventListener( 'change', render );

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );

    window.addEventListener( 'resize', onWindowResize, false );

    requestAnimationFrame( animate );

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

    function animate() {

        requestAnimationFrame( animate );
        controls.update();

    }

    function render() {

        renderer.render( scene, camera );

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

        }

        if( needToUpdate ) {

            updatePoints();
            needToUpdate = false;

        }

        scene.add( run );

        render();

    }

    function getMin( vals ) {
        
        return Math.min.apply( null, vals );

    }

    function getMax( vals ) {

        return Math.max.apply( null, vals );

    }

}
