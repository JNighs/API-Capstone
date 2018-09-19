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
const searchObj = {};
const key = {
  TMDb: '46922a4eb88a052d565922dfe0666828',
  OMDb: 'c6c932dc'
}

const $gallery = $('.main-gallery');

/*          AJAX Calls           */

function TMDbSearch(search, inputPage) {
  const query = {
    api_key: key.TMDb,
    query: search,
    page: inputPage,
  }
  //Global
  searchObj.URL = TMDb_SEARCH_URL;
  searchObj.country = 'US';

  $.getJSON(TMDb_SEARCH_URL, query, displayResults);
}

function TMDbDiscover(discover, country, inputPage) {
  const query = {
    api_key: key.TMDb,
    region: country,
    page: inputPage,
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

  searchObj.URL = discoverURL;
  searchObj.country = country;
  $.getJSON(discoverURL, query, displayResults);
}

function TMDbNextPage() {
  const query = {
    api_key: key.TMDb,
    region: searchObj.country,
    page: searchObj.page,
    query: searchObj.value,
  }
  $.getJSON(searchObj.URL, query, addToResults);
}

//Lookup movie details
function TMDbMovieLookUp(data) {
  const movieID = data.id;
  const query = {
    api_key: key.TMDb,
  }

  $.getJSON(TMDb_MOVIE_URL + movieID, query, displayMovieDetails);
}

//Look up movie reviews
function OMDbMovieLookUp(IMDbID) {
  const query = {
    apikey: 'c6c932dc',
    i: IMDbID
  }
  return $.getJSON(OMDb_SEARCH_URL, query, displayOMDbData);
}

/*          Search Form           */

function searchMovie(event) {
  const queryTarget = event.find('.js-query');
  searchObj.value = queryTarget.val();
  $('.movie-container').addClass('hidden');
  loadingIcon();
  TMDbSearch(searchObj.value);
}

function searchDiscover(event) {
  const discover = event.find('.discover').val();
  const country = event.find('.country').val();
  loadingIcon();
  TMDbDiscover(discover, country);
}

/*          Display           */

function displayResults(data) {
  console.log(data);
  //If no results
  if (data.total_results === 0) {
    noResults();
    return;
  }
  //Filter results to not show any films that don't have a movie poster.
  const results = data.results.filter(movie => movie.poster_path);
  //Show results number
  $('.results-number').text(`Results: ${data.total_results}`);
  $('.results-number').removeClass('hidden');
  //Clear previous results
  $gallery.flickity('remove', $gallery.flickity('getCellElements'));
  //Temporary height to prevent scroll movement upon removing previous results
  $gallery.css('height', '1000px');
  //Global
  searchObj.results = results;
  searchObj.page = data.page;
  searchObj.totalResults = data.total_results;
  searchObj.totalPages = data.total_pages;
  //Render
  results.forEach(function (result, index) {
    var $cellElems = renderResult(result, index);
    $gallery.flickity('append', $cellElems);
  })
  //Flickity show arrows
  $('.flickity-prev-next-button').css('visibility', 'visible');
  //Wait for images to load then focus on gallery
  $('.gallery-cell img').on('load', function () {
    //Return height to normal once new results are in
    $gallery.css('height', 'auto');
    //Flickity select first item
    $gallery.flickity('select', 0);
    $gallery.flickity('reloadCells');
    //Smoothly scroll to results
    scrollToResults();
    $gallery.focus();
  });
}

function noResults() {
  removeLoadingIcon();
  $('.results-number').text('No Results');
  $('.results-number').removeClass('hidden');
  $gallery.flickity('remove', $gallery.flickity('getCellElements'));
  $('.flickity-prev-next-button').css('visibility', 'hidden');
}

function addToResults(data) {
  searchObj.results = searchObj.results.concat(data.results);
  console.log(searchObj.results);
  searchObj.page = data.page;
  //Filter results to not show any films that don't have a movie poster.
  const results = data.results.filter(movie => movie.poster_path);
  //Render
  results.forEach(function (result, index) {
    var $cellElems = renderResult(result, index);
    $gallery.flickity('append', $cellElems);
  })
}

function displayMovieDetails(data) {
  const render = renderDetails(data);
  $('.is-clicked').children('.result-details').html(render);
  $gallery.flickity('reloadCells');
  //Look up stat info from OMDb
  OMDbMovieLookUp(data.imdb_id);
}

function displayOMDbData(data) {
  //If failed to fetch any rating data
  if (data.Response === "False") return;
  $('.movie-year').text(data.Year);
  displayMovieRatings(data);
  displayMovieStats(data);
  removeLoadingIcon();
}

function displayMovieRatings(data) {
  var rt = data.Ratings.find(function (obj) { return obj.Source === "Rotten Tomatoes"; });
  var imdb = data.Ratings.find(function (obj) { return obj.Source === "Internet Movie Database"; });
  var mc = data.Ratings.find(function (obj) { return obj.Source === "Metacritic"; });
  if (rt)
    $('.movie-ratings').append(renderRating('rt', rt.Value));
  if (imdb)
    $('.movie-ratings').append(renderRating('imdb', imdb.Value));
  if (mc)
    $('.movie-ratings').append(renderRating('mc', mc.Value));
}

function displayMovieStats(data) {
  var release = data.Released;
  var runtime = data.Runtime;
  var rated = data.Rated;

  if (release)
    $('.movie-details').append(renderStat('Release', release));
  if (runtime)
    $('.movie-details').append(renderStat('Runtime', runtime));
  if (rated)
    $('.movie-details').append(renderStat('Rated', rated));

  $gallery.flickity('reloadCells');
}

/*          Render           */

function renderResult(result, index) {
  return $(`
  <div class="gallery-cell">
    <div class="image-container">
      <img class="result-image" src="${TMDb_IMAGE_SMALL_URL}${result.poster_path}" id="${index}" alt="${result.original_title}" title="${result.original_title}">
      <div class="title-block">
        <h2>${result.title}</h2>
      </div>
    </div>
    <div class="result-details"></div>
  </div>
  `);
}

function renderDetails(data) {
  return `
  <div class="movie-container" aria-live="assertive">
  <div class="movie-title-container">
    <h2 class="movie-title">${data.title}</h2>
    <h3 class="movie-year"></h3>
  </div>
    <div class="movie-ratings"></div>
    <div class="movie-details"></div>
    <h3>Summary</h3>
    <p class="movie-plot">${data.overview}</p>
    <div class="video-gallery"></div>
  </div>
  `
}

function renderRating(source, score) {
  return `
  <div class="rating-container">
    <img class="rating-image" src="images/${source}.png" alt="${source}">
    <span class="rating">${score}</span>
  </div>`
}

function renderStat(source, stat) {
  return `
  <div class="stat-container">
    <h3 class="statLabel">${source}: </h3 >
    <span class="stat">${stat}</span>
  </div>`
}

/*          Flickity Carousel           */

//Initialize
function flickityInit() {
  $gallery.flickity({
    // options
    cellAlign: 'center',
    contain: false,
    pageDots: false,
  });
}

//Look for cell click or keyboard press
////Show/Hide cell movie details
function watchFlickityClick() {
  //Look for static mouse click on cell
  $gallery.on('staticClick.flickity', function (event, pointer, cellElement, cellIndex) {
    flickityExpandCell(cellElement, cellIndex);
  });
  //a11y - Look for spacebar or enter key with gallery focused
  $(window).keypress(function (e) {
    if (e.which === 32 || e.which === 13) {
      if ($gallery.is(":focus")) {
        //Grab cell element and index manually
        const $flickity = $gallery.flickity().data('flickity');
        flickityExpandCell($flickity.selectedElement, $flickity.selectedIndex);
      }
    }
  });
}

//Load movie details
function flickityExpandCell(cellElement, cellIndex) {
  // dismiss if cell was not clicked
  if (!cellElement) {
    return;
  }
  // if clicked on previously selected cell
  if ($(cellElement).hasClass('is-clicked')) {
    flickityReduceCell(cellElement);
    $gallery.flickity('reloadCells');
    return;
  }
  // change cell background with .is-clicked
  flickityReduceCell();
  $(cellElement).addClass('is-clicked');
  $gallery.flickity('reposition');
  $gallery.flickity('select', cellIndex);
  loadingIcon();
  TMDbMovieLookUp(searchObj.results[cellIndex]);
  //$(cellElement).bind("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function () {})
}

//Remove movie details
function flickityReduceCell(cellElement) {
  if (!cellElement) {
    cellElement = $gallery.find('.is-clicked');
  }
  $(cellElement).removeClass('is-clicked');
  $(cellElement).children('.result-details').empty();
  $gallery.flickity('reposition');
}

//Run function on carousel settle (stop moving)
////Load more results if on last cell
function watchFlickitySettle() {
  $gallery.on('settle.flickity', function (event, index) {
    //Check if last result
    if (index === searchObj.results.length - 1 && searchObj.page != searchObj.totalPages) {
      searchObj.page++;
      TMDbNextPage();
    }
  })
}

//Run functions on new carousel cell select
////Scroll to results if movie details are open
////If on last result and there are more results to load - show load icon
function watchFlickitySelect() {
  //run on new cell select
  $gallery.on('select.flickity', function (event, index) {
    //If on last result and there are more results to load - show load icon
    if (index === searchObj.results.length - 1 && searchObj.page != searchObj.totalPages) {
      loadingIcon();
    } else {
      removeLoadingIcon();
    }
  })
}

/*          Misc Methods           */

function loadingIcon() {
  $('body').append(`
    <div class="loading-container">
      <img src="images/loading.gif">
    </div>
  `)
}

function removeLoadingIcon() {
  $('.loading-container').remove();
}

function scrollToResults() {
  const target = $gallery.offset().top;
  const offset = $('.gallery-cell img').height() / 4;
  const speed = 800;
  $("html, body").animate({ scrollTop: target - offset }, speed, function () {
    $("html, body").stop(true, false);
  });

}

//Fill out the list of countries in the discover form
function listCountries() {
  const dropDown = $('.country');
  countryDb.forEach(country => {
    dropDown.append($('<option></option>').attr('value', country.iso_3166_1).text(country.english_name))
  })
  //Make US the default value
  $("option[value='US']").prop('selected', true);
}

/*          Event Callbacks           */

//Changed input required attriute depending on form
function watchSearchFormChange() {
  $('input[type=radio][name=rg]').change(function () {
    //Remove ability to tab to all forms
    $('.search, .discoverSearch').each(function () { $(this).prop('tabindex', -1) });
    //Remove all previous required inputs
    $('input[required]').each(function () { $(this).prop('required', false) });
    //Add in required inputs based on form
    if (this.id == 'search') {
      $(".js-query").prop('required', true);
      $('.search').prop('tabindex', 0);
    }
    else if (this.id == 'discoverSearch') {
      $('.discoverSearch').each(function () { $(this).prop('tabindex', 0) });
    }
  });
}

//Remove Country select on specific Discover options 
function watchOptions() {
  $('select[name=discover]').change(function () {
    const option = $(this).val();
    if (option === 'topRated' || option === 'popular') {
      $('.country').addClass('hiddenOption');
      $('.country').prop('tabindex', '-1');
    } else {
      $('.country').removeClass('hiddenOption');
      $('.country').prop('tabindex', '0');
    }
  })
}

//Form submit
function watchSubmit() {
  $('.js-search-form').submit(event => {
    event.preventDefault();
    const $this = $(event.currentTarget);
    //Find active search form
    const searchType = $('input:checked').attr('id');
    if (searchType === 'search') {
      searchMovie($this);
    } else if (searchType === 'discoverSearch') {
      searchDiscover($this);
    }
  });
}

//Reload gallery on window resize
function onResize() {
  $(window).resize(function () {
    $gallery.flickity('reloadCells');
  })
}

function watchTabPress() {
  $('body').keyup(function (e) {
    var code = e.keyCode || e.which;
    if (code == '9') {
      focusBorder();
    }
  });
}

function onLoad() {
  watchSubmit();
  watchSearchFormChange();
  watchOptions();

  watchFlickityClick();
  watchFlickitySelect();
  watchFlickitySettle();
  flickityInit();

  listCountries();
  onResize();
}

$(onLoad);
