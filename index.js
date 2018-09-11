const OMDb_SEARCH_URL = 'https://www.omdbapi.com/';
const TMDb_SEARCH_URL = 'https://api.themoviedb.org/3/search/movie';
const TMDb_NOWPLAYING_URL = 'https://api.themoviedb.org/3/movie/now_playing'
const TMDb_POPULAR_URL = 'https://api.themoviedb.org/3/movie/popular'
const TMDb_TOPRATED_URL = 'https://api.themoviedb.org/3/movie/top_rated'
const TMDb_UPCOMING_URL = 'https://api.themoviedb.org/3/movie/upcoming'
const TMDb_MOVIE_URL = 'https://api.themoviedb.org/3/movie/'
const TMDb_DISCOVER_URL = 'https://aple.themoviedb.org/3/discover/movie'
const TMDb_IMAGE_BIG_URL = 'https://image.tmdb.org/t/p/original/';
const TMDb_IMAGE_SMALL_URL = 'https://image.tmdb.org/t/p/w500/';
const YOUTUBE_VIDEO_URL = 'https://www.youtube.com/watch?v=';
const YOUTUBE_THUMBNAIL_URL = 'https://img.youtube.com/vi/';
const searchObj = {};
const key = {
  TMDb: '46922a4eb88a052d565922dfe0666828',
  OMDb: 'c6c932dc'
}

function searchTMDb(search) {
  const query = {
    api_key: key.TMDb,
    query: search
  }
  $.getJSON(TMDb_SEARCH_URL, query, displayResults);
}

function discoverSearch(discover, country) {
  const query = {
    api_key: key.TMDb,
    region: country
  }
  let discoverURL = '';
  switch (discover) {
    case 'nowPlaying':
      discoverURL = TMDb_NOWPLAYING_URL;
      break;
    case 'popular':
      discoverURL = TMDb_POPULAR_URL;
      break;
    case 'topRated':
      discoverURL = TMDb_TOPRATED_URL;
      break;
    case 'upcoming':
      discoverURL = TMDb_UPCOMING_URL;
      break;
  }

  $.getJSON(discoverURL, query, displayResults);
}

function displayResults(data) {
  //Clear previous results
  $('.main-gallery').flickity('remove', $('.main-gallery').flickity('getCellElements'));
  //Filter results to not show any films that don't have a movie poster.
  const results = data.results.filter(movie => movie.poster_path);
  console.log(results);
  results.forEach(function (result, index) {
    var $cellElems = $(`<div class="gallery-cell">
    <img class="result-image" src="${TMDb_IMAGE_SMALL_URL}${result.poster_path}" id="${index}" alt="REPLACE">
      <h3>
        <a class="js-user-name" href="" target="_blank">${result.original_title}</a>
      </h3>
    </div>`);
    $('.main-gallery').flickity('append', $cellElems);
  })
  $('.main-gallery').flickity('select', 0);
}

function getDataFromOMDb() {
  const query = {
    apikey: 'c6c932dc',
    i: searchObj.imdbID,
  }
  return $.getJSON(OMDb_SEARCH_URL, query);
}

function getVideoFromTMDb() {
  const query = {
    api_key: '46922a4eb88a052d565922dfe0666828'
  }
  return $.getJSON(`${TMDb_MOVIE_URL}${searchObj.TMDbID}/videos`, query)
}

function logTMDbID(data) {
  searchObj.TMDbID = data.movie_results[0].id;
  $.when(getDataFromOMDb(), getDataFromTMDb(), getVideoFromTMDb()).done(function (dataOMDb, dataTMDb, dataVideo) {
    searchObj.dataOMDb = dataOMDb[0];
    searchObj.dataTMDb = dataTMDb[0];
    searchObj.dataVideo = dataVideo[0].results;
    displayMovieData();
  })
}

function renderResult(result, index) {
  return `
    <div class="gallery-cell">
        <img class="result-image" src="${TMDb_IMAGE_SMALL_URL}${result.poster_path}" id="${index}" alt="REPLACE">
      <h3>
        <a class="js-user-name" href="" target="_blank">${result.original_title}</a>
      </h3>
    </div>
  `;
}

function displayMovieData() {
  const OMDb = searchObj.dataOMDb;
  const TMDb = searchObj.dataTMDb;
  const videoDb = searchObj.dataVideo;

  //Movie title
  $('.movie-title').text(OMDb.Title);
  //Movie details
  $('.year').text(OMDb.Year);
  $('.rating').text(OMDb.Rated);
  $('.released').text(OMDb.Released);
  $('.runtime').text(OMDb.Runtime);
  //Review scores
  $('.imdbScore').text(OMDb.Ratings[0].Value);
  $('.rtScore').text(OMDb.Ratings[1].Value);
  $('.mcScore').text(OMDb.Ratings[2].Value);
  //Side Poster Image
  $('.movie-container').css('background-image', `linear-gradient(
        rgba(0, 0, 0, 0.75), 
        rgba(0, 0, 0, 0.75)
      ),
      url('${TMDb_IMAGE_URL}${TMDb.backdrop_path}')
    `)
  //Plot text
  $('.movie-plot').text(OMDb.Plot);
  //Trailers
  const results = videoDb.map((item) => renderTrailers(item));
  $('.movie-trailers').html(results);
  $('.movie-container').removeClass('hidden');
}

function renderTrailers(data) {
  return `
    <div>
      <img src="${YOUTUBE_THUMBNAIL_URL}${data.key}/hqdefault.jpg">
    </div
  `;
}

function displayResultsText(data) {
  $('.js-results-text').prop('hidden', false);
  $('.js-results-text').text(`
    Results: ${data.pageInfo.totalResults}
  `);
}

function watchSubmit() {
  $('.js-search-form').submit(event => {
    event.preventDefault();
    const queryTarget = $(event.currentTarget).find('.js-query');
    searchObj.value = queryTarget.val();
    // clear out the input
    queryTarget.val("");
    $('.movie-container').addClass('hidden');
    searchTMDb(searchObj.value);
  });
}

function watchMovieClick() {
  $('.main-gallery').on("click", ".result-image", displayMovieDetails);
}

function displayMovieDetails(e) {
  $('.main-gallery').before('<div class="movieDetails section group"></div>');
  $('.movieDetails').animate({
    height: "300px"
  }, 500, 'linear', function () {

  })
}

function watchContainerClose() {
  $('.close').click(function () {
    $('.movie-container').addClass('hidden');
  })
}

function watchNowPlaying() {
  $('.js-now-playing').submit(event => {
    const discover = $(event.currentTarget).find('.discover').val();
    const country = $(event.currentTarget).find('.country').val();
    event.preventDefault();
    discoverSearch(discover, country);
  })
}

function listCountries() {
  const dropDown = $('.country');
  countryDb.forEach(country => {
    dropDown.append($('<option></option>').attr('value', country.iso_3166_1).text(country.english_name))
  })
  //Make US the default value
  $("option[value='US']").prop('selected', true);
}

function flickityInit() {
  $('.main-gallery').flickity({
    // options
    cellAlign: 'left',
    contain: false,
    adaptiveHeight: true, 
    
  });
}

function flickityWatchClick() {
  $('.main-gallery').on('staticClick.flickity', function (event, pointer, cellElement, cellIndex) {
    // dismiss if cell was not clicked
    if (!cellElement) {
      return;
    }

    if ($(cellElement).hasClass('is-clicked')) {
      $(cellElement).removeClass('is-clicked');
      $('.main-gallery').flickity('select', cellIndex);        
      $('.main-gallery').flickity('reposition');
      $(cellElement).bind("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function(){ 
      })
      return;
    }
    // change cell background with .is-clicked
    $('.main-gallery').find('.is-clicked').removeClass('is-clicked');
    $(cellElement).addClass('is-clicked');
    $('.main-gallery').flickity('reposition');
    $('.main-gallery').flickity('select', cellIndex);
  });
}
/*
function flickityWatchClick() {
  $('.main-gallery').on('staticClick.flickity', function (event, pointer, cellElement, cellIndex) {
    // dismiss if cell was not clicked
    if (!cellElement) {
      return;
    }
    
    $('.main-gallery').flickity('select', cellIndex);
    $('.main-gallery').find('.is-clicked').removeClass('is-clicked');
    $(cellElement).addClass('is-clicked');
  });
}
*/

function flickityOnSettle() {
  $('.main-gallery').on( 'settle.flickity', function( event, index ) {
    //console.log( 'Flickity settled at ' + index );
  });
}

function onLoad() {
  /*
  watchContainerClose();
  watchMovieClick();
  */
  flickityWatchClick();
  watchSubmit();
  watchNowPlaying();
  listCountries();
  flickityInit();
  flickityOnSettle();
}

$(onLoad);
