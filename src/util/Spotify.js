let acessToken;
const clientId = '';
const redictedURL = '';

const Spotify ={
    getAcessToken(){
        let access_token;
        let expires_in;
        if(acessToken){
            return acessToken;
        }else{
            access_token = window.location.href.match(/access_token=([^&]*)/);
            expires_in = window.location.href.match(/expires_in=([^&]*)/); 
        }

        if(access_token&&expires_in){
            acessToken=access_token[1];
            const expiresIn = Number(expires_in[1]);

            window.setTimeout(()=>acessToken='',expiresIn*1000 );
            window.history.pushState('Access Token', null,'/');
            return acessToken;
        }else{
            const accessUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=playlist-modify-public&redirect_uri=${redictedURL}`;
            window.location = accessUrl;
        }
    },

    search(term){
        
        const acessToken = Spotify.getAcessToken();

        if(!term){return{}};
        return  fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`,{
            headers: {Authorization: `Bearer ${acessToken}`}
        }).then(response =>{
            return response.json();
        }).then(jsonResponse=>{
            if(!jsonResponse.tracks){
                return [];
            } else{

                return jsonResponse.tracks.items.map(track=>({
                        id: track.id,
                        name: track.name,
                        artist: track.artists[0].name,
                        album: track.album.name,
                        uri:track.uri
                        
                }));
            }
        
        });
        
    },

    savePlaylist(nameOfPlaylist,arrayTracks){
        if(!nameOfPlaylist || !arrayTracks.length){
            return;
        }

        const acessToken = Spotify.getAcessToken();
        const headers = {Authorization: `Bearer ${acessToken} 1` };
        let userId;

        return fetch(`https://api.spotify.com/v1/me`,{
            headers: headers
        }).then(response=>{
            return response.json()
        }).then(jsonResponse=>{

            userId = jsonResponse.id;
            return fetch(`https://api.spotify.com/v1/users/${userId}/playlists`,{
                headers:headers,
                method: 'POST',
                body: JSON.stringify({name:nameOfPlaylist})
            }).then(response=> response.json()).then(
                jsonResponse=>{
                    const playlistId = jsonResponse.id;
                    return fetch(`https://api.spotify.com/v1/users/${userId}/playlists/${playlistId}/tracks`,{
                        headers:headers,
                        method: 'POST',
                        body: JSON.stringify({uris: arrayTracks})
                    })
                }
            )
        })
    }

}

export default Spotify;