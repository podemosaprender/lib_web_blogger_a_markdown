//INFO: convertir posts de html a markdown, en especial bajados de blogger

const TurndownService = require('turndown');
const turndownService = new TurndownService();

function convertirUnPost(a) { //U: convierte un post a markdown
	let l= a.link;
	let n= l.match(/([^\/]+)\.html$/)[1];
	let t= a.titulo;
	let e= a.tags;
	let b= a.content["$t"]
	let b_md= turndownService.turndown(b);

	var s="---\n" +
        "layout: page\n" +
        "title: \"" + t + "\"\n" +
				"tags: [" + e + "]\n" +
				"img: \"" + a.img +"\"\n" +
				"redirect_from: \""+ l + "\"\n" +
				"---\n\n";

	return s+b_md;
}


////////////////////////////////////////////////////////////
//s: traer posts de blogger

const axios= require("axios");

src_url= "https://pizarra.podemosaprender.org/feeds/posts/default/?alt=json&max-results=99999";


/* VER: API de blogger, FROM: https://feed.mikle.com/support/google-blogger-rss/
Full site feed:
Atom 1.0: https://blogname.blogspot.com/feeds/posts/default
Comments-only feed:
Atom 1.0: https://blogname.blogspot.com/feeds/comments/default
Label-specific site feed:
To get a feed for a specific label, change [label].
Atom 1.0: https://blogname.blogspot.com/feeds/posts/default/-/[label]
Individual post comment feed:
Note: You can find the postId of an individual post from the Posting > ‘Edit Posts’ tab. Simply mouseover the ‘Edit’ link next to a particular post, and that postId will be displayed in your browser’s status bar.
Atom 1.0: https://blogname.blogspot.com/feeds/postId/comments/default
*/
function entry_kv_blogger(e0) { //U: una entrada del feed de blogger a un kv simple y que se ve en b-table
    //DBG console.log("E0",e0);
    let img= e0.content.$t.match("<img .*?src=\"([^\"]*)");
    let e1= { 
        titulo: e0.title.$t,
        tags: e0.category ? e0.category.map(e => e.term).join(", ") : "",
        updated: e0.updated.$t,
        link: e0.link.find(e => e.rel=="alternate").href,
        id: e0.id.$t,
        content: e0.content, //U: el contenido del post, en html
        img: ((img && img[1]) || "/logo512.png"),  //U: la url de la primera imagen
    }
    //DBG console.log("E1",e1);
    return e1;
}
                               
function itemsTraidosDeBlogger (src) { //U: trae los items de blogger y los formatea para b-table
	 return axios.get('https://cors-anywhere.herokuapp.com/'+src, {headers: {'x-requested-with': 'pepe'}}) //A: de blogger como json
		.then((data) => {
		//DBG: window.XDATA= data; // return([]); //U: Asi hice disponible el resultado en la consola para debuggear
		let a_kv_para_tabla= data.data.feed.entry.map(entry_kv_blogger);
		return(a_kv_para_tabla);
	}).catch(error => {
		console.log(error);
		return []
	})
}

itemsTraidosDeBlogger(src_url).then( res => { x= console.log(JSON.stringify(res,null,1)) });
