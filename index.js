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

var fs = require( "fs" );
var path = require( "path" );

module.exports = function( hook, opts ) {
	opts = opts || {};

	if( typeof( opts.populateRes ) !== 'function' ) opts.populateRes = populateResDefault;

	return function( req, res, next ) {
		var oldRender = res.render;
		var app = req.app;

		// for each request, wrap the render function so that we can execute our own code 
		// first to populate the `cartero_js`, `cartero_css`
		res.render = function( viewName, options, entryPointPath, cb ) {
			if( ! options ) options = {};

			if( ! entryPointPath ) {
				// try to find the absolute path of the template by resolving it against the views folder
				var viewAbsolutePath = findAbsoluteViewPath( viewName, app );
				if( ! viewAbsolutePath ) {
					oldRender.call( res, viewName, options, cb );
					return;
				}

				entryPointPath = path.join( path.dirname( viewAbsolutePath ), 'index.js' );
			}
			else
				entryPointPath = path.resolve( app.get( 'views' ), entryPointPath );

			opts.populateRes( entryPointPath, hook, res, function( err ) {
				if( err ) return next( err );

				oldRender.call( res, viewName, options, cb );
			} );
		};

		next();
	};

	function populateResDefault( entryPointPath, hook, res, cb ) {
		hook.getTagsForEntryPoint( entryPointPath, function( err, scriptTags, styleTags ) {
			if( err ) {
				console.log( 'Could not find or load assets for entry point ' + entryPointPath );
				return cb(); // parcel probably does not exist. likely not a big deal
			}

			res.locals.cartero_js = scriptTags;
			res.locals.cartero_css = styleTags;

			return cb();
		} );
	}

	function findAbsoluteViewPath( viewName, app ) {
		var existsSync = fs.existsSync ? fs.existsSync : path.existsSync;

		var viewPath = path.resolve( app.get( "views" ), viewName );
		if( existsSync( viewPath ) && fs.statSync( viewPath ).isFile() ) return viewPath;

		// if that doesn't work, resolve it using same method as app.render, which adds
		// extensions based on the view engine being used, etc.
		var ext = path.extname( viewName );
		var defaultEngine = app.get( "view engine" );

		if( ! ext && ! defaultEngine )
			throw new Error( 'No default engine was specified and no extension was provided.' );
		if( ! ext ) viewName += (ext = ('.' != defaultEngine[0] ? '.' : '') + defaultEngine);

		// <path>.<engine>
		viewPath = path.resolve( app.get( "views" ), viewName );
		if( existsSync( viewPath ) && fs.statSync( viewPath ).isFile() ) return viewPath;

		// <path>/index.<engine>
		viewPath = path.join(path.dirname(viewPath), path.basename(viewPath, ext), 'index' + ext);
		if( existsSync( viewPath ) && fs.statSync( viewPath ).isFile() ) return viewPath;

		return null;
	}
};
