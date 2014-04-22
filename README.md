# cartero-express-middleware

Express middleware for [cartero](https://github.com/rotundasoftware/cartero). Overrides res.render with a method that accepts an additional argument, the path to a parcel. The `res.locals.cartero_js` and `res.locals.cartero_css` variables are then populated with the `script` and `link` tags for that parcel.

The path of the parcel defaults to the directory of the view that is being rendered, so if you use your views folder to hold your parcels as recommended in the [cartero docs](https://github.com/rotundasoftware/cartero#packages-and-parcels), `res.locals.cartero_js` and `res.locals.cartero_css` are set to the script and link tags needed for the view being rendered.

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

	app.use( carteroMiddleware( h ) );			    // install the middleware

	// ...

	app.get( '/hello', function( req, res ) {
		res.render( 'hello/hello.jade', {}, '/usr/parcels/hello' );
	} );
} );
```

The middleware sets the `res.locals.cartero_js` and `res.locals.cartero_css` properties on `res.locals`. Templates can then just dump `cartero_js` and `cartero_css` to load all the js / css assets they require.

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

The middleware also takes an `opts` argument, which can contain an async function `populateRes` that populates `res.locals` with the appropriate values. It should be of the signature `function( parcelPath, hook, res, cb )`. For example, to include templates:

```javascript
app.use( carteroMiddleware( h, {
	populateRes : function( parcelPath, hook, res, cb ) {
		hook.getParcelTags( parcelPath, function( err, result ) {
			if( err ) return cb( err ); // view does not exist

			res.locals.cartero_js = result.script;
			res.locals.cartero_css = result.style;

			hook.getParcelAssets( parcelPath, function( err, result ) {
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

## Contributors

* [Oleg Seletsky](https://github.com/go-oleg)
* [David Beck](https://twitter.com/davegbeck)

## License

MIT
