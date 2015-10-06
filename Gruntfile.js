module.exports = function(grunt) {
	'use strict';

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		uglify: {
			dist: {
				options: {
					sourceMap: true,
					banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
				},
				files: {
					'dist/angular-slack.min.js': ['src/angular-slack.js']
				}
			},
			src: {
				options: {
					beautify: true,
					mangle: false,
					compress: false,
					preserveComments: 'all',
					banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
				},
				files: {
					'dist/angular-trello.js': ['src/angular-slack.js']
				}
			}
		},
		jshint: {
			jshintrc: '.jshintrc',
			gruntfile: {
				src: 'Gruntfile.js'
			},
			source: {
				src: ['src/**/*.js']
			},
			options: {
				"globals": [
					"angular"
				],
				"laxcomma": true
			}
		},
		watch: {
	      gruntfile: {
	        files: '<%= jshint.gruntfile.src %>',
	        tasks: ['jshint:gruntfile']
	      },
	      dist: {
	        files: '<%= jshint.source.src %>',
	        tasks: ['jshint', 'uglify:dist', 'uglify:src']
	      }
	    }
	});

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');


    grunt.registerTask('default', ['jshint', 'uglify:dist', 'uglify:src']);
};
