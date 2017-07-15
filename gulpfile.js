'use strict';

const gulp = require('gulp');
const mocha = require('gulp-mocha');
const istanbul = require('gulp-istanbul');
const eslint = require('gulp-eslint');
const babel = require('gulp-babel');
const concat = require('gulp-concat');
const wrapInIIFE = require('./dev-tools/gulp-wrap-in-iife');

const sourceFiles = [
    'bin/buildConfig.js',
    'bin/functionHelper.js',
    'bin/injectorError.js',
    'bin/setDefaults.js',
    'bin/wrapOnInstantiable.js',
    'index.js',
];

const testFiles = [
    'test/**/*.js'
];

gulp.task('babel', () => {
    return gulp.src(sourceFiles)
        .pipe(babel({
            presets: ['env']
        }))
        .pipe(concat('dject.js'))
        .pipe(wrapInIIFE())
        .pipe(gulp.dest('dist'));
});

gulp.task('lint', () => {
    return gulp.src(sourceFiles)
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task('pre-test', function () {
    return gulp.src(sourceFiles)
        .pipe(istanbul())
        .pipe(istanbul.hookRequire());
});

gulp.task('test', ['lint', 'pre-test'], function () {
    gulp.src(testFiles, { read: false })
        .pipe(mocha())
        .pipe(istanbul.writeReports({ reporters: ['text-summary'] }))
        .pipe(istanbul.enforceThresholds({ thresholds: { global: 80 } }));
});

gulp.task('build', ['test', 'babel']);
