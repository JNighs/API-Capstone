//https://comicvine.gamespot.com/api/search/?api_key=YOUR-KEY&format=json&sort=name:asc&resources=issue&query=%22Master%20of%20kung%20fu%22
//https://comicvine.gamespot.com/api/search/?api_key=YOUR-KEY&format=json&query=batman&limit=5
const OMDb_SEARCH_URL = 'http://www.omdbapi.com/';
const searchObj = {};

function getDataFromApi() {
  const query = {
    apikey: 'c6c932dc',
    type: 'movie',
    s: `${searchObj.value}`,
    page: 1,
  }
  $.getJSON(OMDb_SEARCH_URL, query, showResultPage);
}
/*
function getDataFromApi(searchTerm, callback) {
  const settings = {
    url: COMICVINE_SEARCH_URL,
    data: {
      api_key: '4db3b920ae1fd223ec017edcfb1b6ed3d6c680b0',
      format: 'jsonp',
      query: `${searchObj.value}`,
      limit: 5,
      json_callback: 'showResultPage'
    },
    dataType: 'JSONP',
    type: 'GET'
  };
  
  $.ajax(settings);
}
*/
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
    getDataFromApi();
  });
}

function watchNext() {
  $('.nextButton').click(event => {
    getDataFromApi(searchObj.nextPage);
  })
}

function watchPrev() {
  $('.prevButton').click(event => {
    getDataFromApi(searchObj.prevPage);
  })
}

function onLoad() {
  watchSubmit();
  watchNext();
  watchPrev();
}

$(onLoad);
