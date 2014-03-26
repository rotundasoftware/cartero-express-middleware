# cartero-express-middleware

Express middleware for [Cartero](https://github.com/rotundasoftware/cartero). Automatically populates `res.locals.cartero_js` and `res.locals.cartero_css` with `script` and `link` tags that load all the js / css assets for view being rendered.

## Usage

After runnning [Cartero](https://github.com/rotundasoftware/cartero), initialize an instance of the [Cartero node hook](https://github.com/rotundasoftware/cartero-node-hook), and then install the middleware, passing it the hook instance.

```javascript
// app.js

var app = express();
var hook = require( "cartero-node-hook" );
var carteroMiddleware = require( "cartero-express-hook" );
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

The middleware wraps the existing `res.render()` function, so it has an opportunity to populate `cartero_js` and `cartero_css` with the appropriate values each time a template is rendered. When `hello.jade` is rendered, we can just dump `cartero_js` and `cartero_css` to load our assets.

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

## License

MIT
