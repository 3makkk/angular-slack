/*! angular-3makkk-slack 2015-10-28 */
angular.module("slack", []).provider("Slack", function SlackProvider() {
    var clientId, redirectUri, secret;
    this.config = function(id, uri, scrt) {
        this.clientId = clientId = id;
        this.redirectUri = redirectUri = uri;
        this.secret = secret = scrt;
    };
    this.$get = [ "$q", "$http", "$window", function($q, $http, $window) {
        /**
             * Credentials
             */
        var oauth = {};
        var OAuthServer = "https://slack.com/oauth/authorize", ApiServer = "https://slack.com/api/";
        var urls = {
            api: {
                test: ApiServer + "api.test"
            },
            auth: {
                test: ""
            },
            authorize: OAuthServer,
            oauth: {
                access: ApiServer + "oauth.access"
            },
            users: {
                list: ApiServer + "users.list"
            },
            channels: {
                archive: ApiServer + "channels.archive",
                create: ApiServer + "channels.create",
                history: ApiServer + "channels.history",
                info: ApiServer + "channels.info",
                invite: ApiServer + "channels.invite",
                join: ApiServer + "channels.join",
                kick: ApiServer + "channels.kick",
                leave: ApiServer + "channels.leave",
                list: ApiServer + "channels.list",
                mark: ApiServer + "channels.mark",
                rename: ApiServer + "channels.rename",
                setPurpose: ApiServer + "channels.setPurpose",
                setTopic: ApiServer + "channels.setTopic",
                unarchive: ApiServer + "channels.unarchive"
            },
            chat: {
                "delete": ApiServer + "chat.delete",
                postMessage: ApiServer + "chat.postMessage",
                update: ApiServer + "chat.update"
            },
            emoji: {
                list: ApiServer + "emoji.list"
            },
            files: {
                "delete": ApiServer + "files.delete",
                info: ApiServer + "files.info",
                list: ApiServer + "files.list",
                upload: ApiServer + "files.upload"
            },
            groups: {
                archive: ApiServer + "groups.archive",
                close: ApiServer + "groups.close",
                create: ApiServer + "groups.create",
                createChild: ApiServer + "groups.createChild",
                history: ApiServer + "groups.history",
                info: ApiServer + "groups.info",
                invite: ApiServer + "groups.invite",
                kick: ApiServer + "groups.kick",
                leave: ApiServer + "groups.leave",
                list: ApiServer + "groups.list",
                mark: ApiServer + "groups.mark",
                open: ApiServer + "groups.open",
                rename: ApiServer + "groups.rename",
                setPurpose: ApiServer + "groups.setPurpose",
                setTopic: ApiServer + "groups.setTopic",
                unarchive: ApiServer + "groups.unarchive"
            }
        };
        /**
             * Configure the authorize popup window
             * Adapted from dropbox-js
             */
        function popupSize(popupWidth, popupHeight) {
            var x0, y0, width, height, popupLeft, popupTop;
            // Metrics for the current browser window.
            x0 = $window.screenX || $window.screenLeft;
            y0 = $window.screenY || $window.screenTop;
            width = $window.outerWidth || $document.documentElement.clientWidth;
            height = $window.outerHeight || $document.documentElement.clientHeight;
            // Computed popup window metrics.
            popupLeft = Math.round(x0) + (width - popupWidth) / 2;
            popupTop = Math.round(y0) + (height - popupHeight) / 2.5;
            if (popupLeft < x0) {
                popupLeft = x0;
            }
            if (popupTop < y0) {
                popupTop = y0;
            }
            return "width=" + popupWidth + ",height=" + popupHeight + "," + "left=" + popupLeft + ",top=" + popupTop + "," + "dialog=yes,dependent=yes,scrollbars=yes,location=yes";
        }
        function merge(required, optional) {
            required = required || {};
            optional = optional || {};
            return required.combine(optional);
        }
        /**
             * HTTP Request Helper
             */
        function request(config) {
            console.log(config);
            var deferred = $q.defer();
            function success(response) {
                deferred.resolve(response.data);
            }
            function failure(fault) {
                deferred.reject(fault);
            }
            $http(config).then(success, failure);
            return deferred.promise;
        }
        /**
             * HTTP GET Helper
             */
        function GET(url, params) {
            var deferred = $q.defer();
            params = params || {};
            if (oauth.access_token !== null || oauth.access_token !== undefined) {
                params.token = oauth.access_token;
            }
            var config = {
                method: "GET",
                url: url,
                params: params
            };
            function success(response) {
                if (true === response.ok) {
                    deferred.resolve(response);
                } else {
                    deferred.reject(response);
                }
            }
            function failure(fault) {
                deferred.reject(fault);
            }
            request(config).then(success, failure);
            return deferred.promise;
        }
        /**
             * Parse credentials from Slack authorize callback
             * Adapted from dropbox-js
             */
        function queryParamsFromUrl(url) {
            var match = /^[^?#]+(\?([^\#]*))?(\#(.*))?$/.exec(url);
            if (!match) {
                return {};
            }
            var query = match[2] || "", fragment = match[4] || "", fragmentOffset = fragment.indexOf("?"), params = {};
            if (fragmentOffset !== -1) {
                fragment = fragment.substring(fragmentOffset + 1);
            }
            var kvp = query.split("&").concat(fragment.split("&"));
            kvp.forEach(function(kv) {
                var offset = kv.indexOf("=");
                if (offset === -1) {
                    return;
                }
                params[decodeURIComponent(kv.substring(0, offset))] = decodeURIComponent(kv.substring(offset + 1));
            });
            return params;
        }
        function toQueryString(obj) {
            var parts = [];
            for (var i in obj) {
                if (obj.hasOwnProperty(i)) {
                    parts.push(encodeURIComponent(i) + "=" + encodeURIComponent(obj[i]));
                }
            }
            return parts.join("&");
        }
        return {
            urls: urls,
            authenticate: function(params) {
                var required = {
                    client_id: clientId,
                    redirect_uri: redirectUri
                };
                var qs = "?" + toQueryString(required);
                if (params) {
                    qs = qs + "&" + toQueryString(params);
                }
                var self = this, deferred = $q.defer(), authUrl = urls.authorize + qs;
                function listener(event) {
                    var response = queryParamsFromUrl(event.data);
                    if (response.access_denied) {
                        deferred.reject(response);
                    } else if (response.code) {
                        var oAuthParams = {
                            client_id: clientId,
                            code: response.code,
                            client_secret: secret,
                            redirect_uri: redirectUri
                        };
                        GET(urls.oauth.access, oAuthParams).then(function(response) {
                            oauth = self.oauth = response;
                            deferred.resolve(oauth);
                        });
                    }
                    $window.removeEventListener("message", listener, false);
                }
                $window.addEventListener("message", listener, false);
                $window.open(authUrl, "_slackOauthSigninWindow", popupSize(700, 500));
                return deferred.promise;
            },
            isAuthenticated: function() {
                return oauth.access_token ? true : false;
            },
            users: {
                list: function() {
                    return GET(urls.users.list);
                }
            },
            channels: {
                /**
                     * This method archives a channel.
                     *
                     * @see https://api.slack.com/methods/channels.archive
                     * @param channelId Channel to archive
                     * @returns {*}
                     */
                archive: function(channelId) {
                    return GET(urls.channels.archive, {
                        channel: channelId
                    });
                },
                /**
                     * This method is used to create a channel.
                     *
                     * @see https://api.slack.com/methods/channels.create
                     * @param name  Name of channel to create
                     * @returns {*}
                     */
                create: function(name) {
                    return GET(urls.channels.create, {
                        name: name
                    });
                },
                /**
                     * This method returns a portion of messages/events
                     * from the specified channel.
                     * To read the entire history for a channel,
                     * call the method with no latest or oldest arguments,
                     * and then continue paging using the instructions below.
                     *
                     * @see https://api.slack.com/methods/channels.history
                     * @param channelId Channel to fetch history for.
                     * @param opts  Optional Arguments
                     * @param opts.latest      End of time range of messages to include in results.
                     * @param opts.oldest      Start of time range of messages to include in results.
                     * @param opts.inclusive   Include messages with latest or oldest timestamp in results.
                     * @param opts.count       Number of messages to return, between 1 and 1000.
                     * @returns {*}
                     */
                history: function(channelId, opts) {
                    var args = merge({
                        channel: channelId
                    }, opts);
                    return GET(urls.channels.history, args);
                },
                /**
                     * This method is used to invite a user to a channel.
                     * The calling user must be a member of the channel.
                     *
                     * Requires scope: post
                     *
                     * @see https://api.slack.com/methods/channels.invite
                     * @param channelId Channel to invite user to
                     * @param userId    User to invite to channel.
                     * @returns {*}
                     */
                invite: function(channelId, userId) {
                    return GET(urls.channels.invite, {
                        channel: channelId,
                        user: userId
                    });
                },
                /**
                     * This method is used to join a channel. If the channel does not exist, it is created.
                     *
                     * Requires scope: post
                     *
                     * @see https://api.slack.com/methods/channels.join
                     * @param name  Name of channel to join
                     * @returns {*}
                     */
                join: function(name) {
                    return GET(urls.channels.join, {
                        name: name
                    });
                },
                /**
                     * This method allows a user to remove another member from a team channel.
                     *
                     * Requires scope: post
                     *
                     * @see https://api.slack.com/methods/channels.kick
                     * @param channel   Channel to remove user from.
                     * @param user      User to remove from channel.
                     */
                kick: function(channel, user) {
                    return GET(urls.channels.kick, {
                        channel: channel,
                        user: user
                    });
                },
                /**
                     * This method is used to leave a channel.
                     *
                     * Requires scope: post
                     *
                     * @see https://api.slack.com/methods/channels.leave
                     * @param channel   Channel to leave
                     * @returns {*}
                     */
                leave: function(channel) {
                    return GET(urls.channels.leave, {
                        channel: channel
                    });
                },
                /**
                     * This method returns a list of all channels in the team.
                     * This includes channels the caller is in,
                     * channels they are not currently in, and archived channels.
                     * The number of (non-deactivated) members in each channel is also returned.
                     *
                     * @see https://api.slack.com/methods/channels.list
                     * @param opts Optional Arguments
                     * @param opts.exclude_archived    Don't return archived channels.
                     * @returns {*}
                     */
                list: function(opts) {
                    var args = opts || {};
                    return GET(urls.channels.list, args);
                },
                /**
                     * This method moves the read cursor in a channel.
                     *
                     * Requires scope: post
                     *
                     * @see https://api.slack.com/methods/channels.mark
                     * @param channel   Channel to set reading cursor in.
                     * @param timestamp Timestamp of the most recently seen message.
                     * @returns {*}
                     */
                mark: function(channel, timestamp) {
                    return GET(urls.channels.mark, {
                        channel: channel,
                        ts: timestamp
                    });
                },
                /**
                     * This method renames a team channel.
                     *
                     * The only people who can rename a channel are team admins,
                     * or the person that originally created the channel.
                     * Others will recieve a "not_authorized" error.
                     *
                     * Requires scope: post
                     *
                     * @see https://api.slack.com/methods/channels.rename
                     * @param channel   Channel to rename
                     * @param name      New name for channel.
                     * @returns {*}
                     */
                rename: function(channel, name) {
                    return GET(urls.channels.rename, {
                        channel: channel,
                        name: name
                    });
                },
                /**
                     * This method is used to change the purpose of a channel.
                     * The calling user must be a member of the channel.
                     *
                     * Requires scope: post
                     *
                     * @see https://api.slack.com/methods/channels.setPurpose
                     * @param channelId Channel to set the purpose of
                     * @param purpose   The new purpose
                     * @returns {*}
                     */
                setPurpose: function(channelId, purpose) {
                    return GET(urls.channels.setPurpose, {
                        channel: channelId,
                        purpose: purpose
                    });
                },
                /**
                     * This method is used to change the topic of a channel.
                     * The calling user must be a member of the channel.
                     *
                     * Requires scope: post
                     *
                     * @see https://api.slack.com/methods/channels.setTopic
                     * @param channel   Channel to set the topic of
                     * @param topic     The new topic
                     * @returns {*}
                     */
                setTopic: function(channel, topic) {
                    return GET(urls.channels.setTopic, {
                        channel: channel,
                        topic: topic
                    });
                },
                /**
                     * This method unarchives a channel. The calling user is added to the channel.
                     *
                     * Requires scope: post
                     *
                     * @param channel   Channel to unarchive
                     * @returns {*}
                     */
                unarchive: function(channel) {
                    return GET(urls.channels.unarchive, {
                        channel: channel
                    });
                }
            },
            chat: {
                /**
                     * This method deletes a message from a channel.
                     *
                     * Requires scope: post
                     *
                     * @see https://api.slack.com/methods/chat.delete
                     * @param ts        Timestamp of the message to be deleted.
                     * @param channel   Channel containing the message to be deleted.
                     * @returns {*}
                     */
                "delete": function(ts, channel) {
                    return GET(urls.chat.delete, {
                        ts: ts,
                        channel: channel
                    });
                },
                /**
                     * This method posts a message to a public channel, private group, or IM channel.
                     *
                     * Requires scope: post
                     *
                     * @see https://api.slack.com/methods/chat.postMessage
                     * @param channel
                     * @param text
                     * @param opts Optional Arguments
                     * @param opts.username        Name of bot.
                     * @param opts.as_user         Pass true to post the message as the authed user, instead of as a bot
                     * @param opts.parse           Change how messages are treated. See below.
                     * @param opts.link_names      Find and link channel names and usernames.
                     * @param opts.attachments     Structured message attachments.
                     * @param opts.unfurl_links    Pass true to enable unfurling of primarily text-based content.
                     * @param opts.unfurl_media    Pass false to disable unfurling of media content.
                     * @param opts.icon_url        URL to an image to use as the icon for this message
                     * @param opts.icon_emoji      emoji to use as the icon for this message. Overrides icon_url.
                     * @returns {*}
                     */
                postMessage: function(channel, text, opts) {
                    var args = merge({
                        channel: channel,
                        text: text
                    }, opts);
                    return GET(urls.chat.postMessage, args);
                },
                /**
                     * This method updates a message in a channel.
                     *
                     * Requires scope: post
                     *
                     * @see https://api.slack.com/methods/chat.update
                     * @param ts        Timestamp of the message to be updated.
                     * @param channel   Channel containing the message to be updated
                     * @param text      New text for the message, using the default formatting rules.
                     * @param opts Optional Arguments
                     * @param opts.attachments  Structured message attachments.
                     * @param opts.parse        Change how messages are treated. See below.
                     * @param opts*link_names   Find and link channel names and usernames.
                     * @returns {*}
                     */
                update: function(ts, channel, text, opts) {
                    var args = merge({
                        ts: ts,
                        channel: channel,
                        text: text
                    }, opts);
                    return GET(urls.chat.update, args);
                }
            },
            emoji: {
                /**
                     * This method lists the custom emoji for a team
                     *
                     * @see https://api.slack.com/methods/emoji.list
                     * @returns {*}
                     */
                list: function() {
                    return GET(urls.emoji.list, {});
                }
            },
            files: {
                /**
                     * This method deletes a file from your team.
                     *
                     * Requires scope: post
                     *
                     * @see https://api.slack.com/methods/files.delete
                     * @param fileID    ID of file to delete
                     * @returns {*}
                     */
                "delete": function(fileID) {
                    return GET(urls.files.delete, {
                        file: fileID
                    });
                },
                /**
                     * This method returns information about a file in your team.
                     *
                     * @see https://api.slack.com/methods/files.info
                     * @param file  File to fetch info for
                     * @param opts  Optional Arguments
                     * @param opts.count    Number of items to return per page.
                     * @param opts.page     Page number of results to return.
                     * @returns {*}
                     */
                info: function(file, opts) {
                    return GET(urls.files.info, merge({
                        file: file
                    }, opts));
                },
                /**
                     * This method returns a list of files within the team. It can be filtered and sliced in various ways.
                     *
                     * @see https://api.slack.com/methods/files.list
                     * @param opts Optional Arguments
                     * @param opts.user     Filter files created by a single user.
                     * @param opts.ts_from  Filter files created after this timestamp (inclusive).
                     * @param opts.ts_to    Filter files created before this timestamp (inclusive).
                     * @param opts.types    Filter files by type
                     * @param opts.count    Number of items to return per page.
                     * @param opts.page     Page number of results to return.
                     * @returns {*}
                     */
                list: function(opts) {
                    return GET(urls.files.list, opts);
                },
                /**
                     * This method allows you to create or upload an existing file.
                     *
                     * Only supports file argument as enctype of multipart/form-data!
                     *
                     * @see https://api.slack.com/methods/files.upload
                     * @param file
                     * @param opts Optional Arguments
                     * @param opts.filetype         Slack-internal file type identifier.
                     * @param opts.filename         Filename of file.
                     * @param opts.title            Title of file.
                     * @param opts.initial_comment  Initial comment to add to file.
                     * @param opts.channels         Comma separated list of channels to share the file into.
                     * @returns {*}
                     */
                upload: function(file, opts) {
                    return GET(urls.files.upload, merge({
                        file: file
                    }, opts));
                }
            },
            groups: {
                archive: function() {
                    throw "Not Implemented";
                },
                close: function() {
                    throw "Not Implemented";
                },
                /**
                     * This method creates a private group
                     *
                     * Requires scope: post
                     *
                     * @see https://api.slack.com/methods/groups.create
                     * @param name Name of private group
                     * @returns {*}
                     */
                create: function(name) {
                    return GET(urls.groups.create, {
                        name: name
                    });
                },
                createChild: function() {
                    throw "Not Implemented";
                },
                history: function() {
                    throw "Not Implemented";
                },
                info: function() {
                    throw "Not Implemented";
                },
                /**
                     * This method is used to invite a user to a private group.
                     * The calling user must be a member of the group
                     *
                     * Requires scope: post
                     *
                     * @see https://api.slack.com/methods/groups.invite
                     * @param group Private group to invite user to.
                     * @param user  User to invite.
                     * @returns {*}
                     */
                invite: function(group, user) {
                    return GET(urls.groups.invite, {
                        channel: group,
                        user: user
                    });
                },
                kick: function() {
                    throw "Not Implemented";
                },
                leave: function() {
                    throw "Not Implemented";
                },
                list: function(opts) {
                    return GET(urls.groups.list, opts);
                },
                mark: function() {
                    throw "Not Implemented";
                },
                open: function() {
                    throw "Not Implemented";
                },
                rename: function() {
                    throw "Not Implemented";
                },
                /**
                     * This method is used to change the purpose of a private group. The calling user must be a member of the private group.
                     *
                     * Requires scope: post
                     *
                     * @see https://api.slack.com/methods/groups.setPurpose
                     * @param group     Private group to set the purpose of
                     * @param purpose   The new purpose
                     * @returns {*}
                     */
                setPurpose: function(group, purpose) {
                    return GET(urls.groups.setPurpose, {
                        channel: group,
                        purpose: purpose
                    });
                },
                setTopic: function() {
                    throw "Not Implemented";
                },
                unarchive: function() {
                    throw "Not Implemented";
                }
            }
        };
    } ];
});