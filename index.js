const OMDb_SEARCH_URL = 'https://www.omdbapi.com/';
const TMDb_SEARCH_URL = 'https://api.themoviedb.org/3/search/movie';
const TMDb_NOWPLAYING_URL = 'https://api.themoviedb.org/3/movie/now_playing';
const TMDb_POPULAR_URL = 'https://api.themoviedb.org/3/movie/popular';
const TMDb_TOPRATED_URL = 'https://api.themoviedb.org/3/movie/top_rated';
const TMDb_UPCOMING_URL = 'https://api.themoviedb.org/3/movie/upcoming';
const TMDb_MOVIE_URL = 'https://api.themoviedb.org/3/movie/';
const TMDb_DISCOVER_URL = 'https://aple.themoviedb.org/3/discover/movie';
const TMDb_IMAGE_BIG_URL = 'https://image.tmdb.org/t/p/original/';
const TMDb_IMAGE_SMALL_URL = 'https://image.tmdb.org/t/p/w500/';
const YOUTUBE_VIDEO_URL = 'https://www.youtube.com/watch?v=';
const YOUTUBE_THUMBNAIL_URL = 'https://img.youtube.com/vi/';
const searchObj = {};
const key = {
  TMDb: '46922a4eb88a052d565922dfe0666828',
  OMDb: 'c6c932dc'
}

function TMDbSearch(search) {
  const query = {
    api_key: key.TMDb,
    query: search
  }
  $.getJSON(TMDb_SEARCH_URL, query, displayResults);
}

function TMDbDiscover(discover, country) {
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

function TMDbMovieLookUp(data) {
  const movieID = data.id;
  const query = {
    api_key: key.TMDb,
  }

  $.getJSON(TMDb_MOVIE_URL + movieID, query, displayMovieDetails);
}

function OMDbMovieLookUp(IMDbID) {
  const query = {
    apikey: 'c6c932dc',
    i: IMDbID
  }
  return $.getJSON(OMDb_SEARCH_URL, query, displayMovieRatings);
}

function TMDbTrailerLookUp(data) {
  const query = {
    api_key: key.TMDb
  }
  return $.getJSON(`${TMDb_MOVIE_URL}${data.id}/videos`, query, displayTrailers);
}

function renderResult(result, index) {
  return $(`
  <div class="gallery-cell">
    <div class="image-container">
      <img class="result-image" src="${TMDb_IMAGE_SMALL_URL}${result.poster_path}" id="${index}" alt="${result.original_title}" title="${result.original_title}">
    </div>
    <div class="result-details"></div>
  </div>
  `);
}

/*
function displayResultsText(data) {
  $('.js-results-text').prop('hidden', false);
  $('.js-results-text').text(`
    Results: ${data.pageInfo.totalResults}
  `);
}
*/

function watchSubmit() {
  $('.js-search-form').submit(event => {
    event.preventDefault();
    const queryTarget = $(event.currentTarget).find('.js-query');
    searchObj.value = queryTarget.val();
    // clear out the input
    queryTarget.val("");
    $('.movie-container').addClass('hidden');
    TMDbSearch(searchObj.value);
  });
}

function displayResults(data) {
  //Clear previous results
  $('.main-gallery').flickity('remove', $('.main-gallery').flickity('getCellElements'));
  //Filter results to not show any films that don't have a movie poster.
  const results = data.results.filter(movie => movie.poster_path);
  searchObj.results = results;
  console.log(results);
  //Render
  results.forEach(function (result, index) {
    var $cellElems = renderResult(result, index);
    $('.main-gallery').flickity('append', $cellElems);
  })
  //Flickity select first item
  $('.main-gallery').flickity('select', 0);
}

function displayMovieDetails(data) {
  const render = renderDetails(data);
  $('.is-clicked').children('.result-details').html(render);
  //Look up review info from OMDb
  OMDbMovieLookUp(data.imdb_id);
}

function displayMovieRatings(data) {
  console.log(data);
  var rt = data.Ratings.find(function (obj) { return obj.Source === "Rotten Tomatoes"; });
  var imdb = data.Ratings.find(function (obj) { return obj.Source === "Internet Movie Database"; });
  var mc = data.Ratings.find(function (obj) { return obj.Source === "Metacritic"; });
  if (rt)
    $('.rtScore').text(rt.Value);
  else $('.rtScore').text('N/A');
  if (imdb)
    $('.imdbScore').text(imdb.Value);
  else $('.imdbScore').text('N/A');
  if (mc)
    $('.mcScore').text(mc.Value);
  else $('.mcScore').text('N/A');
}


function displayTrailers(data) {
  console.log(data.results);
}

function renderVideoResult(result, index) {
  return $(`
  <div class="gallery-cell">
    <div class="image-container">
      <img class="result-image" src="${YOUTUBE_THUMBNAIL_URL}${result.key}/mqdefault.jpg" alt="${result.name}" title="${result.name}">
    </div>
  </div>
  `);
}

function renderDetails(data) {
  return `
  <div class="movie-container">
    <h2 class="movie-title">${data.title}</h2>
    <div class="movie-details">
      Released: ${data.release_date}
    </div>
    <div class="movie-ratings">
      IMDb:
      <span class="imdbScore"></span>
      <br> RT:
      <span class="rtScore"></span>
      <br> MC:
      <span class="mcScore"></span>
    </div>
    <p class="movie-plot">${data.overview}</p>
    <div class="video-gallery"></div>
  </div>
  `
}

function watchNowPlaying() {
  $('.js-now-playing').submit(event => {
    const discover = $(event.currentTarget).find('.discover').val();
    const country = $(event.currentTarget).find('.country').val();
    event.preventDefault();
    TMDbDiscover(discover, country);
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

function flickityInitMain() {
  $('.main-gallery').flickity({
    // options
    cellAlign: 'center',
    contain: false,
    pageDots: false,
  });
}

function flickityRemoveClicked(cellElement) {
  if (!cellElement) {
    cellElement = $('.main-gallery').find('.is-clicked');
  }
  $(cellElement).removeClass('is-clicked');
  $(cellElement).children('.result-details').empty();
  $('.main-gallery').flickity('reposition');
}

function flickityWatchClick() {
  $('.main-gallery').on('staticClick.flickity', function (event, pointer, cellElement, cellIndex) {
    // dismiss if cell was not clicked
    if (!cellElement) {
      return;
    }
    if ($(cellElement).hasClass('is-clicked')) {
      flickityRemoveClicked(cellElement);
      return;
    }
    // change cell background with .is-clicked
    flickityRemoveClicked();
    $(cellElement).addClass('is-clicked');
    $('.main-gallery').flickity('reposition');
    $('.main-gallery').flickity('select', cellIndex);
    TMDbMovieLookUp(searchObj.results[cellIndex]);
    TMDbTrailerLookUp(searchObj.results[cellIndex]);
    //$(cellElement).bind("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function () {})
  });
}

function onLoad() {
  flickityWatchClick();
  watchSubmit();
  watchNowPlaying();
  listCountries();
  flickityInitMain();
}

$(onLoad);
