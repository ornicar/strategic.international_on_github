particlesJS("particles-js", {
  "particles": {
    "number": {
      "value": 80,
      "density": {
        "enable": true,
        "value_area": 800
      }
    },
    "color": {
      "value": "#161515"
    },
    "shape": {
      "type": "circle",
      "stroke": {
        "width": 0,
        "color": "#000000"
      },
      "polygon": {
        "nb_sides": 5
      },
      "image": {
        "src": "img/github.svg",
        "width": 100,
        "height": 100
      }
    },
    "opacity": {
      "value": 0.5,
      "random": false,
      "anim": {
        "enable": false,
        "speed": 1,
        "opacity_min": 0.1,
        "sync": false
      }
    },
    "size": {
      "value": 3,
      "random": true,
      "anim": {
        "enable": false,
        "speed": 78,
        "size_min": 0.1,
        "sync": false
      }
    },
    "line_linked": {
      "enable": true,
      "distance": 150,
      "color": "#969696",
      "opacity": 0.4,
      "width": 1
    },
    "move": {
      "enable": true,
      "speed": 2,
      "direction": "none",
      "random": false,
      "straight": false,
      "out_mode": "out",
      "bounce": false,
      "attract": {
        "enable": true,
        "rotateX": 600,
        "rotateY": 1200
      }
    }
  },
  "interactivity": {
    "detect_on": "window",
    "events": {
      "onhover": {
        "enable": false,
        "mode": "grab"
      },
      "onclick": {
        "enable": true,
        "mode": "repulse"
      },
      "resize": true
    },
    "modes": {
      "grab": {
        "distance": 400,
        "line_linked": {
          "opacity": 1
        }
      },
      "bubble": {
        "distance": 400,
        "size": 40,
        "duration": 2,
        "opacity": 8,
        "speed": 3
      },
      "repulse": {
        "distance": 200,
        "duration": 0.4
      },
      "push": {
        "particles_nb": 4
      },
      "remove": {
        "particles_nb": 2
      }
    }
  },
  "retina_detect": true
});

function commence_the_jigglin(){
  $('#logo').removeClass().addClass('rubberBand animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
    $(this).removeClass();
  });
};

$.fn.serializeObject = function()
{
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};

$(function() {
    $('#attempt3').submit(function() {
        // console.log(JSON.stringify($('#attempt3').serializeObject()));
        var json_form = $('#attempt3').serializeObject();
        console.log(json_form);
        console.log("About to attempt to get mailchimp");
        get_json_from_mailchimp(json_form["email"]);
        return false;
    });
});

console.log($.md5('shockizzle@gmail.com'));

var processStatus = function (response) {
  if (response.status === 200 || response.status === 0) {
    return Promise.resolve(response)
  } else {
    return Promise.reject(new Error(response.statusText))
  }
};

var MAX_WAITING_TIME = 5000;// in ms

var parseJson = function (response) {
  return response.json();
};

/* @returns {wrapped Promise} with .resolve/.reject/.catch methods */
// It goes against Promise concept to not have external access to .resolve/.reject methods, but provides more flexibility
var getWrappedPromise = function () {
  var wrappedPromise = {},
    promise = new Promise(function (resolve, reject) {
      wrappedPromise.resolve = resolve;
      wrappedPromise.reject = reject;
    });
  wrappedPromise.then = promise.then.bind(promise);
  wrappedPromise.catch = promise.catch.bind(promise);
  wrappedPromise.promise = promise;// e.g. if you want to provide somewhere only promise, without .resolve/.reject/.catch methods
  return wrappedPromise;
};

/* @returns {wrapped Promise} with .resolve/.reject/.catch methods */
var getWrappedFetch = function () {
  var wrappedPromise = getWrappedPromise();
  var args = Array.prototype.slice.call(arguments);// arguments to Array

  fetch.apply(null, args)// calling original fetch() method
    .then(function (response) {
      wrappedPromise.resolve(response);
    }, function (error) {
      wrappedPromise.reject(error);
    })
    .catch(function (error) {
      wrappedPromise.catch(error);
    });
  return wrappedPromise;
};

/**
 * Fetch JSON by url
 * @param { {
 *  url: {String},
 *  [cacheBusting]: {Boolean}
 * } } params
 * @returns {Promise}
 */
var getJSON = function (params) {
  var wrappedFetch = getWrappedFetch(
    params.cacheBusting ? params.url + '?' + new Date().getTime() : params.url,
    {
      method: 'get',// optional, "GET" is default value
      headers: {
        'Accept': 'application/json',
        'Authorization': 'apikey 4fda94dca9fe068b4b62e27858b3212d-us12'
      }
    });

  var timeoutId = setTimeout(function () {
    wrappedFetch.reject(new Error('Load timeout for resource: ' + params.url));// reject on timeout
  }, MAX_WAITING_TIME);

  return wrappedFetch.promise// getting clear promise from wrapped
    .then(function (response) {
      clearTimeout(timeoutId);
      return response;
    })
    .then(processStatus)
    .then(parseJson);
};

/*--- TEST  --*/

var onComplete = function () {
  console.log('I\'m invoked in any case after success/error');
};


var get_json_from_mailchimp = function (email) {
  var hashed_email = $.md5(email);
  var url = 'https://us12.api.mailchimp.com/3.0/lists/87b6b50b12/members/' + hashed_email + '/notes';
  getJSON({
    url: url,
    cacheBusting: true
  }).then(function (data) {// on success
    console.log('JSON parsed successfully!');
    console.log(data);
    onComplete(data);
  }, function (error) {// on reject
    console.error('An error occured!');
    console.error(error.message ? error.message : error);
    onComplete(error);
  });
};

// $( document ).ready(function() {
//     var center_height = $(window).height() / 2;
//     var center_width = $(window).width() / 2;
//     var top = center_height - center_width / 2;
//     var left = center_width - center_width / 2;
//     var x = document.createElement("IMG");
//     x.setAttribute("src", "images/SI_Logo_BW_cropped.svg");
//     x.setAttribute("width", center_width + "px");
//     x.setAttribute("width", center_width + "px");
//     x.setAttribute("alt", "Strategic International Logo");
//     x.setAttribute("id", "logo")
//     x.setAttribute("style", "position: static; margin-top: " + top + "px; margin-left: " + left + "px;");
//     x.setAttribute("class", 'animated rotateIn');
//     document.body.appendChild(x);
//     $("#logo").click(function(e){
//       e.preventDefault();
//       commence_the_jigglin();
//     });
// });