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
					"<banner>",
					// core functionality
					"src/loot.js",

					// JSONselect
					"src/$select.js",

					// misc utils
					"src/$time.js", "src/$async.js", "src/$cache.js", "src/$io.js",

					// DOM and templating
					"src/$dom.js",

					// architectural legos
					"src/$model.js", "src/$view.js", "src/$collection.js", "src/$route.js"

//					,"src/$components.js", "src/$reuse.js"
				],

				dest: "dist/<%= pkg.name %>-<%= pkg.version %>.js"
			},

			dev: {
				src: ["<config:concat.dist.src>", "src/dev.js"],
				dest: "dist/<%= pkg.name %>-<%= pkg.version %>-dev.js"

			}

		},

		min: {
			dist: {
				src: ["<banner>", "<config:concat.dist.dest>"],
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