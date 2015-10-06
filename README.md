angular-3makkk-slack
===

> Angular.js module to handle the Slack Api

Install
---

```
$ bower install 3makkk-angular-slack
```

Usage
---

First, register your application with Slack here [https://api.slack.com/applications/new](https://api.slack.com/applications/new).

Learn more here: [https://api.slack.com/docs/oauth](https://api.slack.com/docs/oauth)

Load Module
---

``` javascript
angular.module("app", ["slack"]);
```

Use Provider
---
``` javascript
angular.module("app").config(function(SlackProvider) {
    SlackProvider.config(
        "your-client-id",
        "your-redirect-uri",
        "your-client-secret"
    );
});
```

Service and Authentication
---

All Api methods are listed here: [https://api.slack.com/methods](https://api.slack.com/methods).

Every api method has is own service method and follows the slack api notation. For Example:
* Slack.channels.archive (Archives a channel)
* Slack.channels.create (Creates a channel)

Required arguments are defined as method attributes.

``` javascript
angular.module("app").config(["$scope", "Slack", function($scope, Slack) {
    $scope.auth =  Slack.authenticate({scope: "read,post", state: "uuid"});

    $scope.auth.then(function() {
        alert("success");
    }, function(event, response) {
        alert("access failed")
    });

    Slack.channels.list().then(function(result) {
        $scope.channels = result.channels
    });

    Slack.channels.setPurpose("channel-id", "My new purpose");
});
```


