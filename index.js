const YOUTUBE_SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';
const searchObj = {};

function getDataFromApi(page) {
  const query = {
    part: 'snippet',
    key: 'AIzaSyCiygCMvjxFfC7iSmw72OtLDHxc9KetWds',
    q: `${searchObj.value}`,
    maxResults: 5,
    type: 'video',
    pageToken: page
  }
  $.getJSON(YOUTUBE_SEARCH_URL, query, showResultPage);
}

function renderResult(result) {
  return `
    <div>
      <a class="js-result-thumbnail" href="https://www.youtube.com/watch?v=${result.id.videoId}" target="_blank">
        <img src="${result.snippet.thumbnails.medium.url}" alt="${result.snippet.title}">
      </a>
      <h3>
        <a class="js-user-name" href="https://www.youtube.com/channel/${result.snippet.channelId}" target="_blank">${result.snippet.channelTitle}</a>
      </h3>
    </div>
  `;
}

function showResultPage(data) {
  displayResultsText(data);
  displayYouTubeSearchData(data);
  updatePageButtons(data);
}

function displayResultsText(data) {
  $('.js-results-text').prop('hidden', false);
  $('.js-results-text').text(`
    Results: ${data.pageInfo.totalResults}
  `);
}

function displayYouTubeSearchData(data) {
  const results = data.items.map((item, index) => renderResult(item));
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
