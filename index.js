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
		res.render = function( viewPath, parcelPath ) {
			var _arguments = arguments;
			var app = req.app;
			var viewAbsolutePath;
			var existsSync = fs.existsSync ? fs.existsSync : path.existsSync;
			
			if( ! parcelPath ) {
				// try to find the absolute path of the template by resolving it against the views folder
				viewAbsolutePath = path.resolve( app.get( "views" ), viewPath );
				if( ! existsSync( viewAbsolutePath ) ) {
					// if that doesn't work, resolve it using same method as app.render, which adds
					// extensions based on the view engine being used, etc.
					try {
						var view = new View( viewPath, {
							defaultEngine: app.get( "view engine" ),
							root: app.get( "views" ),
							engines: app.engines
						} );
						viewAbsolutePath = view.path;
					} catch( err ) {
						// if there is an error, give up, this view probably does not exist
						return oldRender.apply( res, _arguments );
					}
				}

				parcelPath = path.dirname( viewAbsolutePath );
			}

			opts.populateRes( parcelPath, hook, res, function( err ) {
				if( err ) return next( err );

				oldRender.apply( res, _arguments );
			} );
		};

		next();
	};

	function populateResDefault( parcelPath, hook, res, cb ) {
		hook.getParcelTags( parcelPath, function( err, scriptTags, styleTags ) {
			if( err ) return cb(); // parcel does not exist
			console.log( parcelPath );
			
			res.locals.cartero_js = scriptTags;
			res.locals.cartero_css = styleTags;

			return cb();
		} );
	}
};
