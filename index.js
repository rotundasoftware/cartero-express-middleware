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
		var app = req.app;

		// for each request, wrap the render function so that we can execute our own code 
		// first to populate the `cartero_js`, `cartero_css`
		res.render = function( viewPath, options, parcelPath, cb ) {
			var viewAbsolutePath;
			var existsSync = fs.existsSync ? fs.existsSync : path.existsSync;

			if( ! options ) options = {};

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
						return oldRender.call( res, viewPath, options, cb );
					}
				}

				parcelPath = path.dirname( viewAbsolutePath );
			}
			else
				parcelPath = path.resolve( app.get( 'views' ), parcelPath );

			opts.populateRes( parcelPath, hook, res, function( err ) {
				if( err ) return next( err );

				oldRender.call( res, viewPath, options, cb );
			} );
		};

		next();
	};

	function populateResDefault( parcelPath, hook, res, cb ) {
		hook.getParcelTags( parcelPath, function( err, scriptTags, styleTags ) {
			if( err ) {
				console.log( 'Could not find or load parcel at ' + parcelPath );
				return cb(); // parcel probably does not exist. not a bid deal
			}

			res.locals.cartero_js = scriptTags;
			res.locals.cartero_css = styleTags;

			return cb();
		} );
	}
};
