const	EventEmitter	=	require( 'events' ),
		emitter			=	new EventEmitter(),
		request			=	require( 'request' ),
		jsdom			=	require( 'jsdom' ),
		{ JSDOM }		=	jsdom

var		requestParams	=	{},
		params			=	{
								text	:	''
							},
		callback		=	false

function yandex( keyword, cb ) {
	var query 		= []
	params.text	=	keyword
	callback	=	cb
	Object.keys( params ).forEach( param => {
		query.push( param + '=' + params[ param ] )
	} )
	var url		=	'https://www.yandex.ru/search/?'
	url 	+=	query.join( '&' )
	requestParams[ 'url' ] = url
	emitter.emit( 'scrap' )
}

yandex.requestParams = requestParams

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
		var	results_list = document.querySelectorAll( 'li.serp-item' ),
			results = []
		results_list.forEach( result => {
			var	title	=	result.querySelector( 'h2 a div.organic__url-text' ),
				url		=	result.querySelector( 'h2 a' ),
				descr	=	result.querySelector( 'span.extended-text__full' )
			try {
				var hide	=	descr.querySelector( 'span' )
				hide.remove()
			} catch ( e ) {

			}
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

module.exports = yandex
