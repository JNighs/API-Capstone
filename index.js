//https://comicvine.gamespot.com/api/search/?api_key=YOUR-KEY&format=json&sort=name:asc&resources=issue&query=%22Master%20of%20kung%20fu%22
//https://comicvine.gamespot.com/api/search/?api_key=YOUR-KEY&format=json&query=batman&limit=5
const OMDb_SEARCH_URL = 'http://www.omdbapi.com/';
const TMDb_SEARCH_URL = 'https://api.themoviedb.org/3/find/';
const TMDb_MOVIE_URL = 'https://api.themoviedb.org/3/movie/'
const TMDb_IMAGE_URL = 'https://image.tmdb.org/t/p/original/';
const searchObj = {};

function searchFromOMDB() {
  const query = {
    apikey: 'c6c932dc',
    type: 'movie',
    s: `${searchObj.value}`,
    page: 1,
  }
  $.getJSON(OMDb_SEARCH_URL, query, findIDs);
}

function findIDs(searchData) {
  searchObj.imdbID = searchData.Search[0].imdbID;
  findIDFromTMDb();
}

function logTMDbID(data){
  searchObj.TMDbID = data.movie_results[0].id;
  $.when(getDataFromOMDb(), getDataFromTMDb(), getVideoFromTMDb()).done(function (data, data2, data3) {
    console.log(data);
    console.log(data2);
    console.log(data3);
  })
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

function renderResult(result) {
  return `
    <div>
      <a class="js-result-thumbnail" href="https://www.imdb.com/title/${result.imdbID}/" target="_blank">
        <img src="${result.Poster}" alt="REPLACE">
      </a>
      <h3>
        <a class="js-user-name" href="https://www.imdb.com/title/${result.imdbID}/" target="_blank">${result.Title}</a>
      </h3>
    </div>
  `;
}

function showResultPage(data) {
  //displayResultsText(data);
  displayComicVineSearchData(data);
  //updatePageButtons(data);
}

function displayResultsText(data) {
  $('.js-results-text').prop('hidden', false);
  $('.js-results-text').text(`
    Results: ${data.pageInfo.totalResults}
  `);
}

function displayComicVineSearchData(data) {
  console.log(data);
  const results = data.Search.map((item, index) => renderResult(item));
  $('.js-search-results').html(results);
}

function updatePageButtons(data) {
  searchObj.nextPage = data.nextPageToken;
  searchObj.prevPage = data.prevPageToken;
  if (searchObj.nextPage)
    $('.nextButton').prop('hidden', false);
  else $('.nextButton').prop('hidden', true);
  if (searchObj.prevPage)
    $('.prevButton').prop('hidden', false);
  else $('.prevButton').prop('hidden', true);
}

function watchSubmit() {
  $('.js-search-form').submit(event => {
    event.preventDefault();
    const queryTarget = $(event.currentTarget).find('.js-query');
    searchObj.value = queryTarget.val();
    // clear out the input
    queryTarget.val("");
    searchFromOMDB();
  });
}

function onLoad() {
  watchSubmit();
}

$(onLoad);
