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

function renderResult(result, index) {
  return $(`
  <div class="gallery-cell">
    <div class="image-container">
      <img class="result-image" src="${TMDb_IMAGE_SMALL_URL}${result.poster_path}" id="${index}" alt="${result.original_title}" title="${result.original_title}">
    </div>
    <div class="result-details"></div>
  </div>
  `);;
}
/*
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

*/
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

function displayMovieDetails(index) {
  console.log(searchObj.results[index]);
  const render = renderDetails(searchObj.results[index]);
  $('.is-clicked').children('.result-details').html(render);
}

function renderDetails(data) {
  return `
  <div class="movie-container">
    <h2 class="movie-title">${data.title}</h2>
    <div class="movie-details">
      Year:
      Rating:
    </div>
    <div class="movie-reviews">
      IMDb:
      <span class="imdbScore"></span>
      <br> RT:
      <span class="rtScore"></span>
      <br> MC:
      <span class="mcScore"></span>
    </div>
    <p class="movie-plot">${data.overview}</p>
    <h2>Trailers</h2>
    <div class="movie-trailers"></div>
  </div>
  `
}

/*
function watchContainerClose() {
  $('.close').click(function () {
    $('.movie-container').addClass('hidden');
  })
}
*/
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
    displayMovieDetails(cellIndex);
    //$(cellElement).bind("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function () {})
  });
}

function onLoad() {
  flickityWatchClick();
  watchSubmit();
  watchNowPlaying();
  listCountries();
  flickityInit();
}

$(onLoad);
