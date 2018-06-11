const	EventEmitter	=	require( 'events' ),
		emitter			=	new EventEmitter(),
		request			=	require( 'request' ),
		jsdom			=	require( 'jsdom' ),
		{ JSDOM }		=	jsdom

var		requestParams	=	{},
		params			=	{
								q			:	''
							},
		callback		=	false

function bing( keyword, cb ) {
	var query 		= []
	params.q	=	keyword
	callback	=	cb
	Object.keys( params ).forEach( param => {
		query.push( param + '=' + params[ param ] )
	} )
	var url		=	'https://www.bing.com/search?'
	url 	+=	query.join( '&' )
	requestParams[ 'url' ] = url
	emitter.emit( 'scrap' )
}

bing.requestParams = requestParams

emitter.on( 'end', results => {
	callback( results )
} )

emitter.on( 'scrap', () => {
	request( requestParams, ( error, response, body ) => {
		if ( error ) {
			console.error( error )
			return
		}
		const { document }	=	( new JSDOM( body, { runScripts: "dangerously" } ) ).window
		var	results_list = document.querySelectorAll( 'li.b_algo' ),
			results = []
		results_list.forEach( result => {
			var	title	=	result.querySelector( 'h2' ),
				url		=	result.querySelector( 'h2 a' ),
				descr	=	result.querySelector( 'div.b_caption p' )
			try {
				title = title.textContent
				descr = descr.textContent
				url = url.href
				results.push( {
					title	:	title,
					url		:	url,
					descr	:	descr
				} )
			} catch ( e ) {
				// console.error( e )
			}
			
		} )
		emitter.emit( 'end', results )
	} )
} )

module.exports = bing
