/**
 * sculeJs v1.4 is failing to detect localStorage on
 * Firefox OS v1.3 specifically on detecting window.localStorage
 * through the use of `window.hasOwnProperty('localStorage')`
 *
 * Will work on firefox OS below v2.0
 */

FF_OS_VERSION_2_0    = 32.0;
ff_useragent_version = parseFloat(
	// apply regex on the user agent version and get the result
	(navigator.userAgent.match(/Firefox\/([\d]+\.[\w]?\.?[\w]+)/))[1]
);

// do not run if unnecessary
if ( ff_useragent_version < FF_OS_VERSION_2_0 ) {
	// define holder property
	window._compatibility = {};
	// copy to new property
	window._compatibility.hasOwnProperty = window.hasOwnProperty;

	/**
	 * uses original `hasOwnProperty` but adds layer for 
	 * compatibility checking
	 * @param  {string}  property
	 * @return {Boolean}
	 */
	window.hasOwnProperty = function ( property ) {
		if ( property == "localStorage" ) {
			return true;
		}
	}
}