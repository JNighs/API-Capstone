const OMDb_SEARCH_URL = 'http://www.omdbapi.com/';
const TMDb_SEARCH_URL = 'https://api.themoviedb.org/3/find/';
const TMDb_MOVIE_URL = 'https://api.themoviedb.org/3/movie/'
const TMDb_IMAGE_URL = 'https://image.tmdb.org/t/p/original/';
const YOUTUBE_VIDEO_URL = 'https://www.youtube.com/watch?v=';
const YOUTUBE_THUMBNAIL_URL = 'https://img.youtube.com/vi/';
const searchObj = {};

function searchFromOMDB() {
  const query = {
    s: `${searchObj.value}`,
    apikey: 'c6c932dc',
    type: 'movie',
    page: 1,
  }
  $.getJSON(OMDb_SEARCH_URL, query, displaySearchResults);
}

function findIDs(resultID) {
  searchObj.imdbID = searchObj.results.Search[resultID].imdbID;
  findIDFromTMDb();
}

function getDataFromOMDb() {
  const query = {
    apikey: 'c6c932dc',
    i: searchObj.imdbID,
  }
  return $.getJSON(OMDb_SEARCH_URL, query);
}

function getDataFromTMDb() {
  const query = {
    api_key: '46922a4eb88a052d565922dfe0666828'
  }
  return $.getJSON(`${TMDb_MOVIE_URL}${searchObj.TMDbID}`, query)
}

function getVideoFromTMDb() {
  const query = {
    api_key: '46922a4eb88a052d565922dfe0666828'
  }
  return $.getJSON(`${TMDb_MOVIE_URL}${searchObj.TMDbID}/videos`, query)
}

function findIDFromTMDb() {
  const query = {
    api_key: '46922a4eb88a052d565922dfe0666828',
    language: 'en-US',
    external_source: 'imdb_id'
  }
  return $.getJSON(`${TMDb_SEARCH_URL}${searchObj.imdbID}`, query, logTMDbID);
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
    <div class="movie-result col span_2_of_10">
        <img class="result-image" src="${result.Poster}" id="${index}" alt="REPLACE">
      <h3>
        <a class="js-user-name" href="https://www.imdb.com/title/${result.imdbID}/" target="_blank">${result.Title}</a>
      </h3>
    </div>
  `;
}

function showResultPage(data) {
  displaySearchResults(data);
}

function displayMovieData() {
  const OMDb = searchObj.dataOMDb;
  const TMDb = searchObj.dataTMDb;
  const videoDb = searchObj.dataVideo;

  //Movie title
  $('.movie-title').text(OMDb.Title);
  $('.movie-year').text(OMDb.Year);
  //Movie details
  $('.rating').text(OMDb.Rated);
  $('.released').text(OMDb.Released);
  $('.runtime').text(OMDb.Runtime);
  //Review scores
  $('.imdbScore').text(OMDb.Ratings[0].Value);
  $('.rtScore').text(OMDb.Ratings[1].Value);
  $('.mcScore').text(OMDb.Ratings[2].Value);
  //Side Poster Image
  $('.poster').css('background-image', `url('${TMDb_IMAGE_URL}${TMDb.backdrop_path}')`)
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

function displaySearchResults(data) {
  searchObj.results = data;
  const results = data.Search.map((item, index) => renderResult(item, index));
  $('.js-search-results').html(results);
  $('.js-search-results').removeClass('hidden');
}

function watchSubmit() {
  $('.js-search-form').submit(event => {
    event.preventDefault();
    const queryTarget = $(event.currentTarget).find('.js-query');
    searchObj.value = queryTarget.val();
    // clear out the input
    queryTarget.val("");
    $('.movie-container').addClass('hidden');
    searchFromOMDB();
  });
}

function watchMovieClick() {
  $('.js-search-results').on("click", ".result-image", function () {
    findIDs(this.id);
  });
}

function watchContainerClose() {
  $('.close').click(function () {
    $('.movie-container').addClass('hidden');
  })
}

function onLoad() {
  watchSubmit();
  watchMovieClick();
  watchContainerClose();
}

$(onLoad);
