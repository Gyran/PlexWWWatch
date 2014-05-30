function RecentlyWatchedCtrl ($scope, $http, $filter, ngTableParams, PlexWatch) {
    var watched = [];

    $scope.tableParams = new ngTableParams({
        page: 1,
        count: 10,
        sorting: {
            time: "desc"
        }
    }, {
        total: 0,
        getData: function($defer, params) {
            var orderedData = params.sorting() ?
                $filter("orderBy")(watched, params.orderBy()) :
                watched;
            $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
        }
     });

    PlexWatch.Watched.query({}, function (data) {
        watched = data;
        $scope.tableParams.total(watched.length);
        $scope.tableParams.reload();
    });

    $scope.pages = function () {
        return Math.ceil($scope.tableParams.total() / $scope.tableParams.count());
    };

    $scope.min = Math.min;
    $scope.max = Math.max;
}

function WatchedRowCtrl ($scope) {
    (function () {
        var src = $scope.w.thumb;
        if ($scope.w.type === "episode") {
            src = $scope.w.parentThumb;
        }

        if (src !== "") {
            $scope.w.thumbsrc = "backend/image.php?width=100&height=145&url=" + src;
        } else {
            $scope.w.thumbsrc = "img/posters/standard.png";
        }
    })();

    (function () {
        var templates = {
            "episode": "partials/watchedRow/episode.html",
            "movie": "partials/watchedRow/movie.html"
        };
        var template = "partials/watched/row.html";

        if (templates.hasOwnProperty($scope.w.type)) {
            template = templates[$scope.w.type];
        }
        $scope.w.template = template;
    })();
}

function SettingsCtrl ($scope, $rootScope, $location, PWWWService) {
    $scope.containers = [
        {
            title: "PlexWWWatch",
            template: "partials/settings/PlexWWWatch.html",
        },
        {
            title: "Plex Watch",
            template: "partials/settings/PlexWatch.html",
        },
        {
            title: "Plex",
            template: "partials/settings/Plex.html",
        },

    ];
    $scope.current = 2;
    $scope.loading = false;
    $scope.message = "";

    $scope.select = function (index) {
        $scope.current = index;
    };

    $scope.newSettings = {
        plex: {},
        plexWatch: {},
        plexWWWatch: {}
    };

    PWWWService.settings.all().then(function (settings) {
        $scope.newSettings = settings;
    });

    $scope.save = function (settings) {
        $scope.loading = true;
        PWWWService.settings.save(settings).then(function (settings) {
            $scope.loading = false;
        });
    };
}

function UsersCtrl ($scope, PlexWatch, ngTableParams, $filter) {
    var users = [];

    $scope.tableParams = new ngTableParams({
        page: 1,
        count: 25,
        sorting: {
            name: "asc"
        }
    }, {
        total: 0,
        getData: function($defer, params) {
            var orderedData = params.sorting() ?
                $filter("orderBy")(users, params.orderBy()) :
                users;
            $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
        }
     });

    PlexWatch.Users.query({}, function (data) {
        users = data;
        $scope.tableParams.total(users.length);
        $scope.tableParams.reload();
    });

    $scope.pages = function () {
        return Math.ceil($scope.tableParams.total() / $scope.tableParams.count());
    };

    $scope.min = Math.min;
    $scope.max = Math.max;

}

function UserRowCtrl ($scope) {
    (function () {
        var thumb = "img/userThumb.png";
        if ($scope.user.thumb === "") {
            $scope.user.thumb = thumb;
        }
    })();
}

function UserCtrl ($scope, $routeParams, PlexWatch, plexWWWatchConstants) {
    $scope.user = {
        watched: [],
        thumb: "img/userThumb.png"
    };
    $scope.selectedStats = "watched";

    (function () {
        var thumb = "img/userThumb.png";
        if ($scope.user.thumb === "") {
            $scope.user.thumb = thumb;
        }
    })();

    PlexWatch.Users.get({user: $routeParams.user}, function (data) {
        $scope.user = data;
    });

    $scope.deviceIcon = function (device) {
        var icon = plexWWWatchConstants.deviceIcons[device.platform];
        if (icon) {
            return icon;
        }
        return "device-icon-default";
    };

    $scope.typeIcon = function (type) {
        var icon = plexWWWatchConstants.typeIcons[type];
        if (icon) {
            return icon;
        }
        return "";
    };
}

function UserRecentlyWatchedCtrl ($scope, ngTableParams, $filter) {
    $scope.pages = function () {
        return Math.ceil($scope.tableParams.total() / $scope.tableParams.count());
    };

    $scope.tableParams = new ngTableParams({
        page: 1,
        count: 10,
        sorting: {
            time: "desc"
        }
    }, {
        total: 0,
        getData: function($defer, params) {
            var filteredData = $filter("filter")($scope.user.watched, function (watched) {
                var ret = false;
                angular.forEach($scope.user.devices, function (device, name) {
                    if (watched.device === name) {
                        ret = device.selected;
                    }
                });
                return ret;
            });

            var orderedData = params.sorting() ?
                $filter("orderBy")(filteredData, params.orderBy()) :
                filteredData;
            $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
        }
     });

    $scope.$watch("user.watched", function() {
        if ($scope.user.watched.length > 0) {
            $scope.tableParams.total($scope.user.watched.length);
            $scope.tableParams.reload();
        }
    });

    $scope.$watch("user.devices", function () {
        if ($scope.user.watched.length > 0) {
            $scope.tableParams.reload();
        }
    }, true);

    $scope.min = Math.min;
    $scope.max = Math.max;
}

function CheckCtrl ($scope, $location, PWWWService) {
    $scope.errors = [];
    PWWWService.check().then(function () {
        $location.path("/home");
    }, function (err) {
        $scope.errors = err;
    });
}

function RecentlyAddedCtrl ($scope, $window, PWWWService) {
    var itemWidth = 174;
    var listWidth = 0;
    var stepSize = $window.innerWidth * 0.9;

    $scope.positionStyle = {
        "-webkit-transform": "translate(0, 0)"
    };
    $scope.listWidthStyle = {
        width: 0
    };

    $scope.page = 1;
    $scope.pages = 1;
    $scope.items = [];

    $scope.recentlyAdded = PWWWService.recentlyAdded.query({}, function (data) {
        listWidth = data.length * itemWidth;
        $scope.pages = Math.ceil(listWidth / stepSize);
        $scope.page = 1;

        $scope.items = data;
        $scope.listWidthStyle = {
            width: listWidth + "px"
        };

    });

    $scope.$watch("page", function () {
        var xpos = "-" + ( ($scope.page - 1) * stepSize);
        $scope.positionStyle = {
            "-webkit-transform": "translate(" + xpos + "px, 0)"
        };
    });

    $scope.min = Math.min;
    $scope.max = Math.max;

}

function RecentlyAddedItemCtrl ($scope) {
    (function () {
        var templates = {
            "season": "partials/recentlyAdded/season.html",
            "movie": "partials/recentlyAdded/movie.html",
            "album": "partials/recentlyAdded/album.html"
        };
        var template = "partials/recentlyAdded/item.html";

        if (templates.hasOwnProperty($scope.item.type)) {
            template = templates[$scope.item.type];
        }
        $scope.item.template = template;
    })();

    (function () {
        if ($scope.item.thumb !== "") {
            $scope.item.thumbsrc = "backend/image.php?width=150&height=225&url=" + $scope.item.thumb;
        } else {
            $scope.item.thumbsrc = "img/posters/standard.png";
        }
    })();
}

function FetchPlexTokenCtrl ($scope, myPlex) {
    $scope.fetch = function (username, password) {
        $scope.myPlexMessage = "";
        $scope.myplex.password = "";
        myPlex.token(username, password).then(function (token) {
            $scope.$parent.newSettings.plex.token = token;
        }, function (error) {
            $scope.myPlexMessage = error;
        });
    };
}

function StatisticsCtrl ($scope, $filter, PWWWService) {
    $scope.selectedStats = "last30";

    $scope.dayOfMonthData = {
        watches: [],
        time: []
    };
    $scope.hourOfDayData = {
        watches: [],
        time: []
    };
    $scope.dayOfWeekData = {
        watches: [],
        time: []
    };
    $scope.last30Data = {
        watches: [],
        time: []
    };

    $scope.integer = function (z) {
        return Math.round(z);
    };

    $scope.duration = function (n) {
        return $filter("duration")(n);
    };

    $scope.date = function (d) {
        var m = moment.unix(d);
        return m.format("MMM-DD");
    };

    $scope.statistics = PWWWService.statistics.get({}, function (data) {
        var dayOfMonth = {
            watches: [],
            time: []
        };
        dayOfMonth.watches.push({
            key: "Movies",
            values: data.total.numWatches.dayOfMonth.movie
        });
        dayOfMonth.watches.push({
            key: "Episodes",
            values: data.total.numWatches.dayOfMonth.episode
        });
        dayOfMonth.time.push({
            key: "Movies",
            values: data.total.timeWatched.dayOfMonth.movie
        });
        dayOfMonth.time.push({
            key: "Episodes",
            values: data.total.timeWatched.dayOfMonth.episode
        });
        $scope.dayOfMonthData = dayOfMonth;

        var hourOfDay = {
            watches: [],
            time: []
        };
        hourOfDay.watches.push({
            key: "Movies",
            values: data.total.numWatches.hourOfDay.movie
        });
        hourOfDay.watches.push({
            key: "Episodes",
            values: data.total.numWatches.hourOfDay.episode
        });
        $scope.hourOfDayData = hourOfDay;

        var dayOfWeek = {
            watches: [],
            time: []
        };
        dayOfWeek.watches.push({
            key: "Movies",
            values: data.total.numWatches.dayOfWeek.movie
        });
        dayOfWeek.watches.push({
            key: "Episodes",
            values: data.total.numWatches.dayOfWeek.episode
        });
        dayOfWeek.time.push({
            key: "Movies",
            values: data.total.timeWatched.dayOfWeek.movie
        });
        dayOfWeek.time.push({
            key: "Episodes",
            values: data.total.timeWatched.dayOfWeek.episode
        });
        $scope.dayOfWeekData = dayOfWeek;

        var last30 = {
            watches: [],
            time: []
        };
        last30.watches.push({
            key: "Movies",
            values: data.last30.numWatches.movie
        });
        last30.watches.push({
            key: "Episodes",
            values: data.last30.numWatches.episode
        });
        last30.time.push({
            key: "Movies",
            values: data.last30.timeWatched.movie
        });
        last30.time.push({
            key: "Episodes",
            values: data.last30.timeWatched.episode
        });
        $scope.last30Data = last30;
    });
}

function DetailsCtrl ($scope, $routeParams, PlexWatch, Plex) {
    $scope.plexItem = {};
    $scope.watched = [];
    $scope.plexWatchItem = {};
    $scope.error = "";

    var templates = {
        "movie":   "partials/details/movie.html",
        "episode": "partials/details/episode.html",
        "season": "partials/details/season.html",
        "show": "partials/details/show.html"
    };

    $scope.template = "";

    $scope.plexItem = Plex.Item.get({item: $routeParams.item}, function (plexItem) {
        if (templates.hasOwnProperty(plexItem.type)) {
            $scope.template = templates[plexItem.type];
        }  else {
            $scope.error = "No PlexItem found";
        }
    });

    PlexWatch.Item.get({item: $routeParams.item}, function (data) {
        $scope.plexWatchItem = data.item;
        $scope.watched = data.watched;
    });
}

function DetailsEpisodeCtrl ($scope) {
    (function () {
        $scope.posterImage = "backend/image.php?width=280&height=157&url=" + $scope.plexItem.thumb;
    })();
}

function DetailsMovieCtrl ($scope) {
    (function () {
        $scope.posterImage = "backend/image.php?width=280&height=420&url=" + $scope.plexItem.thumb;
    })();
}

function DetailsSeasonCtrl ($scope, $routeParams, Plex) {
    $scope.children = Plex.Children.query({item: $routeParams.item });

    $scope.poster = function (thumb) {
        console.log("backend/image.php?width=280&height=157&url=" + thumb);
        return "backend/image.php?width=280&height=157&url=" + thumb;
    };
}

function DetailsRecentlyWatchedCtrl ($scope, $filter, ngTableParams) {
    $scope.tableParams = new ngTableParams({
        page: 1,
        count: 10,
        sorting: {
            time: "desc"
        }
    }, {
        total: 0,
        getData: function($defer, params) {
            var orderedData = params.sorting() ?
                $filter("orderBy")($scope.watched, params.orderBy()) :
                $scope.watched;
            $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
        }
     });

    $scope.pages = function () {
        return Math.ceil($scope.tableParams.total() / $scope.tableParams.count());
    };

    $scope.min = Math.min;
    $scope.max = Math.max;
}
