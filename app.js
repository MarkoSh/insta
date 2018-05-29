const	express		=	require( 'express' )
		app			=	express()
		bodyParser	=	require( 'body-parser' )
		fs			=	require( 'fs' )
		request		=	require( 'request' )
		jsdom		= 	require( 'jsdom' ),
		{ JSDOM }	= 	jsdom
		async		= 	require( 'async' )
		

app.use( bodyParser.urlencoded( { extended: true } ) )
app.use( bodyParser.json() )

app.use( '/css', express.static( 'views/app/css' ) )
app.use( '/js', express.static( 'views/app/js' ) )

app.get( '/', ( req, res ) => {
	res.render( 'app/index.ejs' )
} )

app.get( '/tags', ( req, res ) => {
	res.json( Object.values( tags ) )
} )

app.get( '/status', ( req, res ) => {
	res.json( {
		status: status,
		perc: perc
	} )
} )

app.listen( 3000, () => {
	console.log( 'Example app listening on port 3000!' );
} )

const IG_URL	=	'https://www.instagram.com/'
		top		=	( () => {
			return fs.readFileSync( 'top.list' ).toString().split( "\n" ).filter( ( value, index, self ) => {
				return value !== ''
			} )
		} )()
var tags,
	status,
	perc

var collector = () => {
	tags = {}
	status = 'collecting'
	perc = 0
	console.info( 'Collector started' )
	async.eachOfLimit( top, 5, ( user, i, callback ) => {
		console.info( 'Collecting ' + user )
		request.get( IG_URL + user, ( error, response, body ) => {
			if ( ! error ) {
				var { window } = new JSDOM( body, {
					runScripts: 'dangerously'
				} ).window
				if ( window && window._sharedData && window._sharedData.entry_data.ProfilePage && window._sharedData.entry_data.ProfilePage.length > 0 ) {
					var	user_ 				= window._sharedData.entry_data.ProfilePage[ 0 ].graphql.user,
						edge_follow 		= window._sharedData.entry_data.ProfilePage[ 0 ].graphql.user.edge_follow.count,
						edge_followed_by 	= window._sharedData.entry_data.ProfilePage[ 0 ].graphql.user.edge_followed_by.count,
						edges 				= window._sharedData.entry_data.ProfilePage[ 0 ].graphql.user.edge_owner_to_timeline_media.edges
	
					if ( edges ) {
						edges.slice( 0, 1 ).forEach( edge => {
							var caption 				= edge.node.edge_media_to_caption.edges.length > 0 ? edge.node.edge_media_to_caption.edges[ 0 ].node.text : '';
								edge_liked_by 			= edge.node.edge_liked_by.count,
								edge_media_to_comment	= edge.node.edge_media_to_comment.count,
								tags_list 				= caption.match( /\#([a-zA-Z0-9]+)/g );
								imagedate				= edge.node.taken_at_timestamp
		
							if ( 'undefined' !== tags_list && tags_list ) {
								tags_list.forEach( tag => {
									tags[ tag ] = {
										comments	:	edge_media_to_comment,
										likes		:	edge_liked_by,
										user		:	user_.username,
										user_url	:	IG_URL + user_.username + '/',
										followers	:	edge_followed_by,
										tag			: 	tag,
										image		:	edge.node.shortcode,
										image_url	:	IG_URL + 'p/' + edge.node.shortcode + '/',
										imagedate	:	new Date( imagedate * 1000 ).toString()
									}
								} )
							}
						} )
					}
				}
			}
			console.info( 'Collecting ' + user + ' done.' )
			++perc
			callback()
		} )
	
	}, ( error ) => {
		if ( ! error ) {
			status = 'done'
			perc = 100
			console.info( 'All collects done.' )
		}
	} )
}
collector()
setInterval( () => {
	console.info( 'Recollect' )
	collector()
}, 60 * 60000 )

