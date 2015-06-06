( function() {

    var runMaker = new RunMaker();
    var fileDropArea = document.getElementById( 'drop_zone' );

    fileDropArea.addEventListener( 'drop', dropFile, false );
    fileDropArea.addEventListener( 'dragover', cancel, false );
    fileDropArea.addEventListener( 'dragenter', cancel, false );
    fileDropArea.addEventListener( 'dragexit', cancel, false );

    function dropFile( evt ) {

        evt.stopPropagation();
        evt.preventDefault();

        var files = evt.dataTransfer.files;

        if( files.length ) {

            go( files[ 0 ] );

        }

    }

    function go( file ) {

        runMaker.makeRun( file );
        fileDropArea.classList.add( 'dropped' );

    }

    function cancel( evt ) {

        evt.preventDefault();

    }

} )();


