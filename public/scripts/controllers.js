function HomeCtrl ($scope) {

}

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
        var setThumb = function () {
            var thumb = "img/poster.png";
            if ($scope.w.thumb !== "") {
                thumb = $scope.settings.plexMediaServerHost + $scope.w.thumb;
                if ($scope.plex.token) {
                    thumb = thumb + "?X-Plex-Token=" + $scope.plex.token;
                }
            }
            $scope.w.thumbsrc = thumb;
        };

        $scope.$watch("plex.token", function () {
            setThumb();
        });

    })();

    (function () {
        var templates = {
            "episode": "partials/watchedRowEpisode.html",
            "movie": "partials/watchedRowMovie.html"
        };
        var template = "partials/watchedRow.html";

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
            sections: ["General"],
            template: "partials/settings/PlexWWWatch.html",
            selected: 0
        },
        {
            title: "Plex Watch",
            sections: ["General"],
            template: "partials/settings/PlexWatch.html",
            selected: 0
        }
    ];
    $scope.current = 0;
    $scope.loading = false;

    $scope.select = function (index) {
        $scope.current = index;
    };

    $scope.save = function (settings) {
        $scope.loading = true;
        PWWWService.saveSettings(settings).then(function (settings) {
            $rootScope.settings = settings;
            $scope.loading = false;
        }, function () {
            $location.path("/check");
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
