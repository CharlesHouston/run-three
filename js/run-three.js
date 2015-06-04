( function() {

    var runMaker = new RunMaker();
    runMaker.init();
    
    runMaker.makeRun( "welsh_ultra_series_r2.gpx");
    runMaker.makeRun( "london-mara.gpx" );
    runMaker.render();

} )();
