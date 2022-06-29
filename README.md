> DEPRECIATION NOTICE: At long last, cartero has been depreciated. As the first multi-page application build tool, cartero served its purpose well for many years. However now there are far more robust and better supported tools that can be used to achieve the same goals. We recommend migrating any projects still using cartero to [Web Pack](https://webpack.js.org/). Thank you to everyone who contributed to this pioneering project.

# cartero-express-middleware

Express middleware for [cartero](https://github.com/rotundasoftware/cartero). Overrides res.render with a method that accepts an additional argument, the path to a parcel.

* `res.locals.cartero_js` is populated with the `script` tags for to load the js for the parcel.
* `res.locals.cartero_css` is populated with the `link` tags for to load the css for the parcel.

The path of the parcel defaults to the directory of the view that is being rendered, so if you use your views folder to hold your parcels as recommended in the [cartero docs](https://github.com/rotundasoftware/cartero#packages-and-parcels) and [tutorial](https://github.com/rotundasoftware/cartero-tutorial), the variables are set to the appropriate values for parcel of the view being rendered.

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
        h1 People List
        // ...
```

## Contributors

* [Oleg Seletsky](https://github.com/go-oleg)
* [David Beck](https://twitter.com/davegbeck)

## License

MIT
