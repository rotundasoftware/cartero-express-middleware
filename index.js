/*
 * cartero-express-hook v0.1.1
 * https://github.com/rotundasoftware/cartero-express-hook
 *
 * Copyright (c) 2013 Rotunda Software, LLC
 * Licensed under the MIT license.
 *
 * A Node.js / Express Hook for the Cartero asset manager, implemented as Express middleware.
 * 
 */

 var fs = require( "fs" ),
	path = require( "path" ),
	View = require('express/lib/view');

module.exports = function( hook, opts ) {
	opts = opts || {};

	if( typeof( opts.populateRes ) !== 'function' ) opts.populateRes = populateResDefault;

	return function( req, res, next ) {
		var oldRender = res.render;

		// for each request, wrap the render function so that we can execute our own code 
		// first to populate the `cartero_js`, `cartero_css`
		res.render = function( name, options ) {
			var _arguments = arguments;
			var app = req.app;
			var absolutePath;
			var existsSync = fs.existsSync ? fs.existsSync : path.existsSync;
			
			// try to find the absolute path of the template by resolving it against the views folder
			absolutePath = path.resolve( app.get( "views" ), name );
			if( ! existsSync( absolutePath ) ) {
				// if that doesn't work, resolve it using same method as app.render, which adds
				// extensions based on the view engine being used, etc.
				try {
					var view = new View( name, {
						defaultEngine: app.get( "view engine" ),
						root: app.get( "views" ),
						engines: app.engines
					} );
					absolutePath = view.path;
				} catch( err ) {
					// if there is an error, give up, this view probably does not exist
					return oldRender.apply( res, _arguments );
				}
			}

			opts.populateRes( absolutePath, hook, res, function( err ) {
				if( err ) return next( err );

				oldRender.apply( res, _arguments );
			} );
		};

		next();
	};

	function populateResDefault( viewAbsPath, hook, res, cb ) {
		hook.getViewAssetHTMLTags( viewAbsPath, function( err, result ) {
			if( err ) return cb( err ); // view does not exist

			res.locals.cartero_js = result.script;
			res.locals.cartero_css = result.style;

			return cb();
		} );
	}
};
