module.exports = function(grunt) {

  'use strict';

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    jshint: {
      files:[
        '*.json',
        '*.js',
        'public/*.webapp',
        'public/*.manifest',
        'public/resources/*.js',
        'public/resources/views/**/*.js',
        'public/resources/components/**/*.js'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },

  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.registerTask('syntax', ['jshint']);
  grunt.registerTask('default', 'syntax');

};
