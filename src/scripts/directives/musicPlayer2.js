angular.module('futurism')
    .directive('musicPlayer2', function($http, $rootScope, memory, sound) {
        'use strict';
        
        var model = {};
        var curSound;
        var clientId = 'd9edd5597f8e1cc0c1d209bf16878d33';
        var volume = 1;
        
        
        var pickRandomTrack = function(tracks) {
            var index = Math.floor(Math.random() * tracks.length);
            return tracks[index];
        };
        
        
        var stop = function() {
            if(curSound) {
                curSound.onend = function(){};
                curSound.stop();
            }
            curSound = null;
        };
        
        
        var fadeStop = function() {
            if(curSound) {
                curSound.fade(curSound.volume(), 0, 2000, function() {
                    stop();
                });
            }
        };
        
        
        var playTrack = function(track) {
            curSound = sound.streamUrl({
                urls: [track.stream_url + '?client_id=' + clientId], 
                format: 'ogg',
                onend: function() {
                    $rootScope.$apply(function() {
                        playRandomTrack();
                    });
                }
            });
        };
        
        
        var playRandomTrack = function() {
            if(!model.playlist) {
                return false;
            }
            model.track = pickRandomTrack(model.playlist.tracks);
            playTrack(model.track);
            return model.track;
        };
        
        
        $http.jsonp('https://api.soundcloud.com/playlists/27086694.json?client_id=' + clientId + '&callback=JSON_CALLBACK').success(function(res) {
            model.playlist = res;
            model.track = pickRandomTrack(model.playlist.tracks);
        });
        
        
        
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'views/music-player-2.html',


            link: function (scope) {
                
                scope.model = model;
                
                if(model.playlist) {
                    model.track = pickRandomTrack(model.playlist.tracks);
                }
                
                
                scope.getPlaying = function() {
                    var playmusic = memory.long.get('playmusic');
                    return playmusic !== 'no';
                };
                
                
                scope.autoPlay = function() {
                    if(!curSound && scope.getPlaying()) {
                        playRandomTrack();
                    }
                };
                
                
                scope.play = function() {
                    memory.long.set('playmusic', 'yes');
                    if(!curSound) {
                        playTrack(model.track);
                    }
                    else {
                        curSound.play();
                        curSound.volume(volume);
                    }
                };
                    
                    
                scope.pause = function() {
                    memory.long.set('playmusic', 'no');
                    if(curSound) {
                        console.log('musicPlayer.pause', curSound);
                        curSound.pause();
                    }
                };
                
                
                scope.autoPlay();
                scope.$watch('model.playlist', function() {
                    scope.autoPlay();
                });
                
                
                scope.$on('$destroy', fadeStop);
            }
        };
        
        
    });