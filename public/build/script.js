angular.module("plex",
    [
        "base64",
        "LocalStorageModule"
    ])
.service("myPlex", function ($http, $base64, $q) {
    var user = {};
    var signedin = false;

    this.token = function (username, password) {
        var deferred = $q.defer();

        if (user.authentication_token) {
            deferred.resolve(user.authentication_token);
        } else if (username && password) {
            _signin(username, password).then(function () {
                deferred.resolve(user.authentication_token);
            }, function (reason) {
                deferred.reject(reason);
            });
        } else {
            deferred.reject("No token found and no username and password supplied");
        }

        return deferred.promise;
    };

    var _basicAuthorization = function (username, password) {
        var hash = $base64.encode(username + ":" + password);
        return "Basic " + hash;
    };

    var _signin = function (username, password) {
        var url = "https://my.plexapp.com/users/sign_in.json";
        var auth = _basicAuthorization(username, password);

        var deferred = $q.defer();

        $http.post(url, null, {
            headers: {
                "Authorization": auth,
                "X-Plex-Client-Identifier": "PlexWWWatch",
                "X-Plex-Product": "Web Client",
                "X-Plex-Version": "0.1"
            }
        }).success(function (data) {
            user = data.user;
            deferred.resolve();
        }).error(function (error) {
            deferred.reject(error.error);
        });

        return deferred.promise;
    };
})
;

function PlexMyPlexSignInCtrl ($scope, $rootScope, localStorageService, myPlex) {
    $scope.username = "";
    $scope.password = "";
    $scope.remember = true;
    $scope.error = false;

    $scope.signin = function () {
        $scope.error = false;
        myPlex.token($scope.username, $scope.password).then(function (token) {
            $rootScope.plex.token = token;

            if ($scope.remember) {
                localStorageService.add("plexToken", token);
            }

        }, function (error) {
            $scope.error = error;
        });

        $scope.password = "";
    };

    $scope.signout = function () {
        $scope.error = false;
        $scope.plex.token = "";

        // delete remember
        localStorageService.remove("plexToken");
    };

}

angular.module("plex-wwwatch",
    [
        "ngRoute",
        "ngResource",
        "angularMoment",
        "ngTable",
        "PlexWWWatchPartials",
        "base64",
        "plex",
        "LocalStorageModule"
    ])
.service("Settings", function ($http) {
    this.save = function (settings) {
        var promise = $http.post("backend/settings.php", settings).success(function (data) {
            return data;
        });
        return promise;
    };

    this.get = function () {
        var promise = $http.get("backend/settings.php").success(function (data) {
            if (data) {
                return data;
            }
        });
        return promise;
    };
})
.config(["$routeProvider", function ($routeProvider) {
    $routeProvider
        .when("/home", {
            controller: "HomeCtrl",
            templateUrl: "partials/home.html"
        })
        .when("/settings", {
            controller: "SettingsCtrl",
            templateUrl: "partials/settings.html",
            resolve: {
                settings: function (Settings) {
                    return Settings;
                }
            }
        })
        .otherwise({ redirectTo: "/home" })
        ;
}])
.run(function ($rootScope, Settings, localStorageService) {
    Settings.get().then(function (promise) {
        $rootScope.settings = promise.data;
    });

    $rootScope.plex = {
        token: localStorageService.get("plexToken")
    };
})
;

function HomeCtrl ($scope, $http, $filter, ngTableParams) {

}

function RecentlyWatchedCtrl ($scope, $http, $filter, ngTableParams) {
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

    $http({method: "GET", url: "backend/watched.php"}).success(function (data) {
        if (data) {
            watched = data;
            $scope.tableParams.total(watched.length);

            $scope.tableParams.reload();
        }
    });

    $scope.pages = function () {
        return Math.ceil($scope.tableParams.total() / $scope.tableParams.count());
    };
}



function WatchedRowCtrl ($scope) {
    (function () {
        var percent = ($scope.w.viewOffset / $scope.w.duration) * 100;
        if (percent > 90) {
            $scope.w.progress = 100    ;
        } else {
            $scope.w.progress = percent;
        }
    }());

    (function () {
        var start_time = $scope.w.time;
        var stop_time = 0;

        if ($scope.w.stopped > 0) {
            stop_time = $scope.w.stopped;
        } else if ($scope.w.paused > 0) {
            stop_time = $scope.w.paused;
        } else {
            stop_time = moment().valueOf();
        }

        var ms = stop_time - start_time - $scope.w.pausedCounter;

        $scope.w.timeWatched = moment.duration(ms).humanize();
    }());

    (function () {
        $scope.w.timePaused = moment.duration($scope.w.pausedCounter).humanize();
    })();

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

/*! ngTable v0.3.1 by Vitalii Savchuk(esvit666@gmail.com) - https://github.com/esvit/ng-table - New BSD License */
!function(a,b){return"function"==typeof define&&define.amd?(define(["angular"],function(a){return b(a)}),void 0):b(a)}(angular||null,function(a){var b=a.module("ngTable",[]);b.factory("ngTableParams",["$q","$log",function(b,c){var d=function(a){return!isNaN(parseFloat(a))&&isFinite(a)},e=function(e,f){var g=this;this.data=[],this.parameters=function(b,e){if(e=e||!1,a.isDefined(b)){for(var f in b){var g=b[f];if(e&&f.indexOf("[")>=0){for(var i=f.split(/\[(.*)\]/).reverse(),j="",k=0,l=i.length;l>k;k++){var m=i[k];if(""!==m){var n=g;g={},g[j=m]=d(n)?parseFloat(n):n}}"sorting"===j&&(h[j]={}),h[j]=a.extend(h[j]||{},g[j])}else h[f]=d(b[f])?parseFloat(b[f]):b[f]}return c.debug&&c.debug("ngTable: set parameters",h),this}return h},this.settings=function(b){return a.isDefined(b)?(j=a.extend(j,b),c.debug&&c.debug("ngTable: set settings",h),this):j},this.page=function(b){return a.isDefined(b)?this.parameters({page:b}):h.page},this.total=function(b){return a.isDefined(b)?this.settings({total:b}):j.total},this.count=function(b){return a.isDefined(b)?this.parameters({count:b,page:1}):h.count},this.filter=function(b){return a.isDefined(b)?this.parameters({filter:b}):h.filter},this.sorting=function(b){if(2==arguments.length){var c={};return c[b]=arguments[1],this.parameters({sorting:c}),this}return a.isDefined(b)?this.parameters({sorting:b}):h.sorting},this.isSortBy=function(b,c){return a.isDefined(h.sorting[b])&&h.sorting[b]==c},this.orderBy=function(){var a=[];for(var b in h.sorting)a.push(("asc"===h.sorting[b]?"+":"-")+b);return a},this.getData=function(a){a.resolve([])},this.getGroups=function(d,e){var f=b.defer();f.promise.then(function(b){var f={};for(var g in b){var h=b[g],i=a.isFunction(e)?e(h):h[e];f[i]=f[i]||{data:[]},f[i].value=i,f[i].data.push(h)}var j=[];for(var k in f)j.push(f[k]);c.debug&&c.debug("ngTable: refresh groups",j),d.resolve(j)}),this.getData(f,g)},this.generatePagesArray=function(a,b,c){var d,e,f,g,h,j;if(d=11,j=[],h=Math.ceil(b/c),h>1){for(j.push({type:"prev",number:Math.max(1,a-1),active:a>1}),j.push({type:"first",number:1,active:a>1}),f=Math.round((d-5)/2),g=Math.max(2,a-f),e=Math.min(h-1,a+2*f-(a-g)),g=Math.max(2,g-(2*f-(e-g))),i=g;e>=i;)i===g&&2!==i||i===e&&i!==h-1?j.push({type:"more",active:!1}):j.push({type:"page",number:i,active:a!==i}),i++;j.push({type:"last",number:h,active:a!==h}),j.push({type:"next",number:Math.min(h,a+1),active:h>a})}return j},this.url=function(b){b=b||!1;var c=b?[]:{};for(key in h)if(h.hasOwnProperty(key)){var d=h[key],e=encodeURIComponent(key);if("object"==typeof d){for(var f in d)if(!a.isUndefined(d[f])&&""!==d[f]){var g=e+"["+encodeURIComponent(f)+"]";b?c.push(g+"="+encodeURIComponent(d[f])):c[g]=encodeURIComponent(d[f])}}else a.isFunction(d)||a.isUndefined(d)||""===d||(b?c.push(e+"="+encodeURIComponent(d)):c[e]=encodeURIComponent(d))}return c},this.reload=function(){var a=b.defer(),d=this;j.$loading=!0,j.groupBy?j.getGroups(a,j.groupBy,this):j.getData(a,this),c.debug&&c.debug("ngTable: reload data"),a.promise.then(function(a){j.$loading=!1,c.debug&&c.debug("ngTable: current scope",j.$scope),d.data=j.groupBy?j.$scope.$groups=a:j.$scope.$data=a,j.$scope.pages=d.generatePagesArray(d.page(),d.total(),d.count())})},this.reloadPages=function(){var a=this;j.$scope.pages=a.generatePagesArray(a.page(),a.total(),a.count())};var h=this.$params={page:1,count:1,filter:{},sorting:{},group:{},groupBy:null},j={$scope:null,$loading:!1,total:0,counts:[10,25,50,100],getGroups:this.getGroups,getData:this.getData};return this.settings(f),this.parameters(e,!0),this};return e}]);var c=["$scope","ngTableParams","$q",function(a,b){a.$loading=!1,a.params||(a.params=new b),a.params.settings().$scope=a,a.$watch("params.$params",function(){a.params.settings().$scope=a,a.params.reload()},!0),a.sortBy=function(b){var c=a.parse(b.sortable);if(c){var d=a.params.sorting()&&a.params.sorting()[c]&&"desc"===a.params.sorting()[c],e={};e[c]=d?"asc":"desc",a.params.parameters({sorting:e})}}}];return b.directive("ngTable",["$compile","$q","$parse",function(b,d,e){"use strict";return{restrict:"A",priority:1001,scope:!0,controller:c,compile:function(c){var d=[],f=0,g=null,h=c.find("thead");return a.forEach(a.element(c.find("tr")),function(b){b=a.element(b),b.hasClass("ng-table-group")||g||(g=b)}),g?(a.forEach(g.find("td"),function(b){var c=a.element(b);if(!c.attr("ignore-cell")||"true"!==c.attr("ignore-cell")){var g=function(a,b){return function(f){return e(c.attr("x-data-"+a)||c.attr("data-"+a)||c.attr(a))(f,{$columns:d})||b}},h=g("title"," "),i=g("header",!1),j=g("filter",!1)(),k=!1;j&&j.templateURL&&(k=j.templateURL,delete j.templateURL),c.attr("data-title-text",h()),d.push({id:f++,title:h,sortable:g("sortable",!1),"class":c.attr("x-data-header-class")||c.attr("data-header-class")||c.attr("header-class"),filter:j,filterTemplateURL:k,headerTemplateURL:i,filterData:c.attr("filter-data")?c.attr("filter-data"):null,show:c.attr("ng-show")?function(a){return e(c.attr("ng-show"))(a)}:function(){return!0}})}}),function(c,f,g){if(c.$loading=!1,c.$columns=d,c.$watch(g.ngTable,function(b){a.isUndefined(b)||(c.paramsModel=e(g.ngTable),c.params=b)},!0),c.parse=function(b){return a.isDefined(b)?b(c):""},g.showFilter&&c.$parent.$watch(g.showFilter,function(a){c.show_filter=a}),a.forEach(d,function(b){var d;if(b.filterData){if(d=e(b.filterData)(c,{$column:b}),!a.isObject(d)||!a.isObject(d.promise))throw new Error("Function "+b.filterData+" must be instance of $q.defer()");return delete b.filterData,d.promise.then(function(c){a.isArray(c)||(c=[]),c.unshift({title:"-",id:""}),b.data=c})}}),!f.hasClass("ng-table")){c.templates={header:g.templateHeader?g.templateHeader:"ng-table/header.html",pagination:g.templatePagination?g.templatePagination:"ng-table/pager.html"};var i=h.length>0?h:a.element(document.createElement("thead")).attr("ng-include","templates.header"),j=a.element(document.createElement("div")).attr("ng-include","templates.pagination");return f.find("thead").remove(),f.find("tbody"),f.prepend(i),b(i)(c),b(j)(c),f.addClass("ng-table"),f.after(j)}}):void 0}}}]),a.module("ngTable").run(["$templateCache",function(a){a.put("ng-table/filters/select.html",'<select ng-options="data.id as data.title for data in column.data" ng-model="params.filter()[name]" ng-show="filter==\'select\'" class="filter filter-select form-control"> </select>'),a.put("ng-table/filters/text.html",'<input type="text" ng-model="params.filter()[name]" ng-if="filter==\'text\'" class="input-filter form-control"/>'),a.put("ng-table/header.html",'<tr> <th ng-repeat="column in $columns" ng-class="{ \'sortable\': parse(column.sortable), \'sort-asc\': params.sorting()[parse(column.sortable)]==\'asc\', \'sort-desc\': params.sorting()[parse(column.sortable)]==\'desc\' }" ng-click="sortBy(column)" ng-show="column.show(this)" ng-init="template=column.headerTemplateURL(this)" class="header {{column.class}}"> <div ng-if="!template" ng-show="!template" ng-bind="parse(column.title)"></div> <div ng-if="template" ng-show="template"><div ng-include="template"></div></div> </th> </tr> <tr ng-show="show_filter" class="ng-table-filters"> <th ng-repeat="column in $columns" ng-show="column.show(this)" class="filter"> <div ng-repeat="(name, filter) in column.filter"> <div ng-if="column.filterTemplateURL" ng-show="column.filterTemplateURL"> <div ng-include="column.filterTemplateURL"></div> </div> <div ng-if="!column.filterTemplateURL" ng-show="!column.filterTemplateURL"> <div ng-include="\'ng-table/filters/\' + filter + \'.html\'"></div> </div> </div> </th> </tr>'),a.put("ng-table/pager.html",'<div class="ng-cloak"> <div ng-if="params.settings().counts.length" class="btn-group pull-right"> <button ng-repeat="count in params.settings().counts" type="button" ng-class="{\'active\':params.count()==count}" ng-click="params.count(count)" class="btn btn-default btn-xs"> <span ng-bind="count"></span> </button> </div> <ul class="pagination"> <li ng-class="{\'disabled\': !page.active}" ng-repeat="page in pages" ng-switch="page.type"> <a ng-switch-when="prev" ng-click="params.page(page.number)" href="">&laquo;</a> <a ng-switch-when="first" ng-click="params.page(page.number)" href=""><span ng-bind="page.number"></span></a> <a ng-switch-when="page" ng-click="params.page(page.number)" href=""><span ng-bind="page.number"></span></a> <a ng-switch-when="more" ng-click="params.page(page.number)" href="">&#8230;</a> <a ng-switch-when="last" ng-click="params.page(page.number)" href=""><span ng-bind="page.number"></span></a> <a ng-switch-when="next" ng-click="params.page(page.number)" href="">&raquo;</a> </li> </ul> </div>')}]),b});
//# sourceMappingURL=ng-table.map