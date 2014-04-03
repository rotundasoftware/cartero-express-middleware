# cartero-express-middleware

Express middleware for [cartero](https://github.com/rotundasoftware/cartero). Automatically populates `res.locals.cartero_js` and `res.locals.cartero_css` with `script` and `link` tags that load all the js / css assets for view being rendered.

## Installation
```
$ npm install cartero-express-middleware
```

## Usage

After runnning [cartero](https://github.com/rotundasoftware/cartero), initialize an instance of the [cartero node hook](https://github.com/rotundasoftware/cartero-node-hook), and then install the middleware, passing it the hook instance.

```javascript
// app.js

var app = express();
var hook = require( "cartero-node-hook" );
var carteroMiddleware = require( "cartero-express-middleware" );
// ...

app.configure( function() {
	app.set( "port" , process.env.PORT || 3000 );
	app.set( "views" , path.join( __dirname, "views" ) );
	app.use( express.static( path.join( __dirname, "static" ) ) );
	// ...

	var h = hook(									// initialize a cartero hook
		path.join( __dirname, "views" ),			// views directory
		path.join( __dirname, "static/assets" ),	// output directory
		{ outputDirUrl : 'assets/' }				// output directory base url
	);

	app.use( carteroMiddleware( h ) );			// install the middleware

	// ...

	app.get( '/hello', function( req, res ) {
		res.render( 'hello.jade' );
	} );
} );
```

The middleware wraps `res.render()` so that it can automatically set `res.locals.cartero_js` and `res.locals.cartero_css` each time a template is rendered. Templates can then just dump `cartero_js` and `cartero_css` to load all the js / css assets they require.

```jade
doctype 5
html(lang="en")
    head
        title login
        | !{cartero_js}
        | !{cartero_css} 
    body
        | !{cartero_tmpl} 
        h1 People List
        // ...
```

### Customization

The middleware also takes an `opts` argument, which can contain an async function `populateRes` that populates `res.locals` with the appropriate values. It should be of the signature `function( viewAbsPath, hook, res, cb )`. For example, to include templates:

```javascript
app.use( carteroMiddleware( h, {
	populateRes : function( viewAbsPath, hook, res, cb ) {
		hook.getViewAssetHTMLTags( viewAbsPath, function( err, result ) {
			if( err ) return cb( err ); // view does not exist

			res.locals.cartero_js = result.script;
			res.locals.cartero_css = result.style;

			hook.getViewAssets( viewAbsPath, function( err, { types : [ 'template' ], paths : true }, result ) {
				var templateContent = result.template.reduce( function( memo, thisTemplatePath ) {
					return memo + fs.readFileSync( thisTemplatePath, 'utf8' );
				}, '' );

				res.locals.cartero_tmpl = templateContent;
				return cb();
			} );
		} );
	}
} ) );
```

## License

MIT
