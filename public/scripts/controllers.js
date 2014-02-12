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

        setThumb();

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

function SettingsCtrl ($scope, $rootScope, Settings) {
    $scope.save = function (settings) {
        Settings.save(settings).then(function (promise) {
            $rootScope.settings = promise.data;
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

}

function UserCtrl ($scope) {
    (function () {
        var thumb = "img/userThumb.png";
        if ($scope.user.thumb === "") {
            $scope.user.thumb = thumb;
        }
    })();
}
