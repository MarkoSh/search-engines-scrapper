const	EventEmitter	=	require( 'events' ),
		emitter			=	new EventEmitter(),
		request			=	require( 'request' ),
		jsdom			=	require( 'jsdom' ),
		{ JSDOM }		=	jsdom

var		requestParams	=	{},
		params			=	{
								p	:	'',
								ei	:	'UTF-8'
							},
		callback		=	false

function yahoo( keyword, cb ) {
	var query 		= []
	params.p	=	keyword
	callback	=	cb
	Object.keys( params ).forEach( param => {
		query.push( param + '=' + params[ param ] )
	} )
	var url		=	'https://search.yahoo.com/search?'
	url 	+=	query.join( '&' )
	requestParams[ 'url' ] = url
	emitter.emit( 'scrap' )
}

yahoo.requestParams = requestParams

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
		var	results_list = document.querySelectorAll( 'li div.algo' ),
			results = []
		results_list.forEach( result => {
			var	title	=	result.querySelector( 'h3.title' ),
				url		=	result.querySelector( 'h3 a' ),
				descr	=	result.querySelector( 'div.compText' )
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

module.exports = yahoo
