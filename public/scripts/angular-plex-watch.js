angular.module("ngPlexWatch",
    [
        "ngResource"
    ])
.factory("PlexWatch", ["$resource", function ($resource) {
    return {
        "Users": $resource("backend/users.php"),
        "Watched": $resource("backend/watched.php")
    };
}]);
