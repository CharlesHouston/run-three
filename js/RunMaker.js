function RunMaker() {

    var renderer;
    var scene;
    var camera;
    var controls;

    var HSCALE = 8;
    var VSCALE = 2;

    var XMIN, XMAX, YMIN, YMAX, ZMIN, ZMAX = null;
    var XRANGE, YRANGE, ZRANGE = null;

    var pointSize = 0.075;

    var parser = new GPXParser();

    this.init = function() {
        
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

        animate();

    };

    this.makeRun = function( file ) {

        parse( file );

    };

    function onFileRead( evt ) {

        var strcontent = evt.target.result;
        var parsed = new DOMParser().parseFromString( strcontent, 'text/xml' );
        var pts = parser.getPoints( parsed );
        processPoints( pts );
        addRun( pts );

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

    function processPoints() {

        // Finding the min and max values
        var xvals = [];
        var yvals = [];
        var zvals = [];

        for( var i = 0; i < arguments.length; i++ ) {

            var points = arguments[ i ];
           
            for( var j = 0; j < points.length; j++ ) {

                xvals.push( points[ j ].x );
                yvals.push( points[ j ].y );
                zvals.push( points[ j ].z );

            }

        }

        if( XMIN == null ) {

            XMIN = Math.min.apply( null, xvals );
            XMAX = Math.max.apply( null, xvals );
            YMIN = Math.min.apply( null, yvals );
            YMAX = Math.max.apply( null, yvals );
            ZMIN = Math.min.apply( null, zvals );
            ZMAX = Math.max.apply( null, zvals );

            XRANGE = XMAX - XMIN;
            YRANGE = YMAX - YMIN;
            ZRANGE = ZMAX - ZMIN;

        }

        for( var i = 0; i < arguments.length; i++ ) {

            arguments[ i ].forEach( function( p ) {

                var xnorm = 2 * ( p.x - XMIN ) / XRANGE - 1;
                p.x = HSCALE * xnorm;

                var ynorm = 2 * ( p.y - YMIN ) / YRANGE - 1;
                p.y = VSCALE * ynorm;

                var znorm = 2 * ( p.z - ZMIN ) / ZRANGE - 1;
                p.z = HSCALE * ZRANGE / XRANGE * znorm;

            } );

        }

    }

    function addRun() {

        for( var i = 0; i < arguments.length; i++ ) {

            var geom = new THREE.Geometry();
            var color = new THREE.Color( Math.random() * 0x808080 + 0x808080 );

            arguments[ i ].forEach( function( p ) {

                geom.vertices.push( p );
                geom.colors.push( color );

            } );

            var mat = new THREE.PointCloudMaterial( { vertexColors: THREE.VertexColors, size: pointSize } );

            var run = new THREE.PointCloud( geom, mat );
            scene.add( run );

            render();

        }

    }

}
