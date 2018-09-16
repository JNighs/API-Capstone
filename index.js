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

function nextPage() {
  const query = {
    api_key: key.TMDb,
    region: searchObj.country,
    page: searchObj.page,
    query: searchObj.value,
  }
  $.getJSON(searchObj.URL, query, addToResults);
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

function displayResults(data) {
  console.log(data);
  //Filter results to not show any films that don't have a movie poster.
  const results = data.results.filter(movie => movie.poster_path);
  //Clear previous results
  $gallery.flickity('remove', $gallery.flickity('getCellElements'));
  //Temporary height to prevent scroll movement upon removing previous results
  $gallery.css('height', '1000px');
  $('.flex-wrap').css('height', '200px');
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
  $('.flickity-prev-next-button').css('visibility', 'visible')
  //Wait for images to load then focus on gallery
  $('.gallery-cell img').on('load', function () {
    //Return height to normal once new results are in
    $gallery.css('height', 'auto');
    //Flickity select first item
    $gallery.flickity('select', 0);
    $gallery.flickity('reloadCells');
    //Smoothly scroll to results
    scrollToResults();
  });
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

function scrollToResults() {
  const target = $gallery.offset().top;
  const offset = $('.gallery-cell img').height() / 4;
  const speed = 800;
  $("html, body").animate({ scrollTop: target - offset }, speed);

  //Fix for bug that prevents scrolling
  $(window).bind("mousewheel touchmove", function () {
    $("html, body").stop(true, false);
  });

}

function displayMovieDetails(data) {
  const render = renderDetails(data);
  $('.is-clicked').children('.result-details').html(render);
  $gallery.flickity('reloadCells');
  //Look up review info from OMDb
  OMDbMovieLookUp(data.imdb_id);
}

function displayMovieRatings(data) {
  //If failed to fetch any rating data
  if (data.Response === "False") return;

  console.log(data);
  var rt = data.Ratings.find(function (obj) { return obj.Source === "Rotten Tomatoes"; });
  var imdb = data.Ratings.find(function (obj) { return obj.Source === "Internet Movie Database"; });
  var mc = data.Ratings.find(function (obj) { return obj.Source === "Metacritic"; });
  if (rt)
    $('.rtScore').text(rt.Value);
  if (imdb)
    $('.imdbScore').text(imdb.Value);
  if (mc)
    $('.mcScore').text(mc.Value);
}

function displayTrailers(data) {
  console.log(data.results);
}

function renderDetails(data) {
  return `
  <div class="movie-container" aria-live="assertive">
    <h2 class="movie-title">${data.title}</h2>
    <div class="movie-details">
      Release Date: ${data.release_date}
    </div>
    <div class="movie-ratings">
      <img src="images/imdb.png" alt="imdb">
      <span class="imdbScore">N/A</span><br> 
      <img src="images/rottentomatoes.png" alt="Rotten Tomatoes">
      <span class="rtScore">N/A</span><br> 
      <img src="images/metacritic.png" alt="Metacritic">
      <span class="mcScore">N/A</span>
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
    loadingIcon();
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
  $gallery.flickity({
    // options
    cellAlign: 'center',
    contain: false,
    pageDots: false,
  });
}

function flickityRemoveClicked(cellElement) {
  if (!cellElement) {
    cellElement = $gallery.find('.is-clicked');
  }
  $(cellElement).removeClass('is-clicked');
  $(cellElement).children('.result-details').empty();
  $gallery.flickity('reposition');
}

function flickityWatchClick() {
  $gallery.on('staticClick.flickity', function (event, pointer, cellElement, cellIndex) {
    // dismiss if cell was not clicked
    if (!cellElement) {
      return;
    }
    if ($(cellElement).hasClass('is-clicked')) {
      flickityRemoveClicked(cellElement);
      $gallery.flickity('reloadCells');
      return;
    }
    // change cell background with .is-clicked
    flickityRemoveClicked();
    $(cellElement).addClass('is-clicked');
    $gallery.flickity('reposition');
    $gallery.flickity('select', cellIndex);
    TMDbMovieLookUp(searchObj.results[cellIndex]);
    //$(cellElement).bind("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function () {})
  });
}

function watchTopRated() {
  $('.top-rated').submit(event => {
    event.preventDefault();
    loadingIcon();
    TMDbDiscover('topRated', 'US');
  })
}

function watchPopular() {
  $('.popular').submit(event => {
    event.preventDefault();
    loadingIcon();
    TMDbDiscover('popular', 'US');
  })
}

function watchFlickitySelect() {
  $gallery.on('select.flickity', function (event, index) {
    //Check if a cell has been clicked
    if ($('.is-clicked')[0]) {
      scrollToResults();
    }

    if (index === searchObj.results.length - 1 && searchObj.page != searchObj.totalPages) {
      loadingIcon();
    } else {
      removeLoadingIcon();
    }
  })
}

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

function watchFlickitySettle() {
  $gallery.on('settle.flickity', function (event, index) {
    //Check if last result
    if (index === searchObj.results.length - 1 && searchObj.page != searchObj.totalPages) {
      searchObj.page++;
      nextPage();
    }
  })
}

//Changed input required attriute depending on form
function watchSearchFormChange() {
  $('input[type=radio][name=rg]').change(function () {
    //Remove all previous required inputs
    $('input[required]').each(function () { $(this).prop('required', false) });
    //Add in required inputs based on form
    if (this.id == 'search') {
      $(".js-query").prop('required', true);
    }
    else if (this.id == 'discoverSearch') {
      //Fill in
    }
  });
}

//Remove Country select on specific Discover options 
function watchOptions() {
  $('select[name=discover]').change(function () {
    const option = $(this).val();
    if (option === 'topRated' || option === 'popular') {
      $('.country').addClass('hiddenOption');
    } else {
      $('.country').removeClass('hiddenOption');
    }
  })
}

//Reload gallery on window resize
function onResize() {
  $(window).resize(function () {
    $gallery.flickity('reloadCells');
  })
}

function onLoad() {
  flickityWatchClick();

  watchSubmit();
  watchSearchFormChange();
  watchOptions();

  watchNowPlaying();
  watchTopRated();
  watchPopular();
  watchFlickitySelect();
  watchFlickitySettle();
  listCountries();
  flickityInitMain();
  onResize();
}

$(onLoad);
