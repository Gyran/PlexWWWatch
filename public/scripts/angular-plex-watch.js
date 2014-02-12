angular.module("ngPlexWatch",
    [
        "ngResource"
    ])
.factory("PlexWatch", ["$resource", function ($resource) {
    return {
        "Users": $resource("backend/users.php", {}, {
            query: { isArray: false }
        }),
        "Watched": $resource("backend/watched.php", {}, {})
    };
}]);
