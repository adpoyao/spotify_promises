'use strict';

// !!!FILL IN YOUR CLIENT ID FROM YOUR APPLICATION CONSOLE:
// https://developer.spotify.com/my-applications/#!/applications !!!
const CLIENT_ID = '67aa405cef54489ca04d1eb92b953ce3';
const CLIENT_SECRET = 'c15251c4f38b453ba1c3a86bd1ce937b';

const getFromApi = function (endpoint, query = {}) {
  // You won't need to change anything in this function, but you will use this function 
  // to make calls to Spotify's different API endpoints. Pay close attention to this 
  // function's two parameters.

  const url = new URL(`https://api.spotify.com/v1/${endpoint}`);
  const headers = new Headers();
  headers.set('Authorization', `Bearer ${localStorage.getItem('SPOTIFY_ACCESS_TOKEN')}`);
  headers.set('Content-Type', 'application/json');
  const requestObject = {
    headers
  };

  Object.keys(query).forEach(key => url.searchParams.append(key, query[key]));
  return fetch(url, requestObject).then(function (response) {
    if (!response.ok) {
      return Promise.reject(response.statusText);
    }
    return response.json();
  });
};

let artist;
let artistId;
let relatedArtistArray = [];

const getArtist = function (name) {
  return getFromApi('search', {
    q: name,
    limit: 1,
    type: 'artist'
  }).then((item) =>
  { artist = item.artists.items[0];
    artistId = item.artists.items[0].id;
    return artistId;
  }).then((artistId) => {
    return getFromApi(`artists/${artistId}/related-artists`);
  }).then((item) => {
    artist.related = item.artists;
    return artist.related;
  }).then(relatedArtists => {
    let topTracksPromises =[];
    for(let i=0; i<relatedArtists.length; i++){
      topTracksPromises.push(
        getFromApi(`artists/${relatedArtists[i].id}/top-tracks`, {
          country: 'US'
        })
      );
    }
    return Promise.all(topTracksPromises).then(topTracksArray => {
      console.log(topTracksArray);
      for(let i=0; i<topTracksArray.length; i++){
        artist.related[i].tracks = topTracksArray[i].tracks;
      }
      return artist;
    });
  }).catch((err) => {
    console.error('ERROR: ', err);
    // (Plan to call `getFromApi()` several times over the whole exercise from here!)
  });
};
    
  // }).then((artist) => {
  //   artist.related.forEach(i => {
  //     relatedArtistArray.push(i.id);
  //   });
  //   return relatedArtistArray;
  // }).then(idArray => {
  //   const concurrentPromises = [];
  //   for (let i=0; i<idArray.length; i++) {
  //     concurrentPromises.push(getTopTracks(i));
  //   }
  //   Promise.all(concurrentPromises)
  //     .then(result => {
  //       console.log(result);
  //       let newArray = result.map(album => {
  //         return album.tracks[0].name;
  //       });
  //       console.log(newArray);
  //       return newArray;
  //       // artist.relatedTracks = result.tracks;
  //     });


function getTopTracks(id){
  return getFromApi(`artists/${relatedArtistArray[id]}/top-tracks`, {
    country: 'US'
  });
}

// =========================================================================================================
// IGNORE BELOW THIS LINE - THIS IS RELATED TO SPOTIFY AUTHENTICATION AND IS NOT NECESSARY  
// TO REVIEW FOR THIS EXERCISE
// =========================================================================================================
const login = function () {
  const AUTH_REQUEST_URL = 'https://accounts.spotify.com/authorize';
  const REDIRECT_URI = 'http://localhost:8080/auth.html';

  const query = new URLSearchParams();
  query.set('client_id', CLIENT_ID);
  query.set('response_type', 'token');
  query.set('redirect_uri', REDIRECT_URI);

  window.location = AUTH_REQUEST_URL + '?' + query.toString();
};

$(() => {
  $('#login').click(login);
});