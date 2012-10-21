module.exports = function(grunt) {

	grunt.loadNpmTasks('grunt-rm');
//	grunt.loadNpmTasks('grunt-cp');
	grunt.loadNpmTasks('grunt-replace');

	// Project configuration.
	grunt.initConfig({

		pkg: '<json:package.json>',

		meta: {
			banner: "/*\n"+
					" * <%= pkg.fullName %> <%= pkg.version %> <%= grunt.template.today('mm-dd-yyyy') %>\n"+
					" * copyright (c) <%= grunt.template.today('yyyy') %> <%= pkg.author %>\n"+
					" * you are free to distribute <%= pkg.fullName %> under the <%= pkg.license %> license\n"+
					" * <%= pkg.home %>\n"+
					" */\n"
		},

		rm: {
			dist: 'dist/**'
		},

		replace: {
			dist: {
				options: {
					prefix: '@@',
					variables: {
						version: '<%= pkg.version %>'
					}
				},
				files: {
					'dist/': ['dist/**.js']
				}
			}
		},

		concat: {
			dist: {
				src: [
					'<banner>',
					// core functionality
					"src/loot.js"

					// mvc stuff
					,"src/$model.js", "src/$view.js", "src/$collection.js", "src/$dom.js", "src/$time.js", "src/$route.js"

					// async/data io
//					,"src/$async.js", "src/$cache.js", "src/$io.js"

					// experimental
//					,"src/$components.js", "src/$reuse.js"
				],
				dest: "dist/<%= pkg.name %>-<%= pkg.version %>.js"
			}

		},

		min: {
			dist: {
				src: ['<banner>', '<config:concat.dist.dest>'],
				dest: "dist/<%= pkg.name %>-<%= pkg.version %>-min.js"
			}
		},

		qunit: {
			files: ['tests/**/*.html']
		},

		lint: {
			files: ['grunt.js', 'src/**/*.js', 'test/**/*.js']
		},

		watch: {
			files: ['grunt.js', 'src/**.js', 'src/**/*.js'],
			tasks: 'default'
		}
	});

	// Default task.
	grunt.registerTask('clean', 'rm');
	grunt.registerTask('default', 'clean concat min replace');

};