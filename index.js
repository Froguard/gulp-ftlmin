'use strict';
/**
 * gulp plugin for compress freemarker files
 */
let gutil = require('gulp-util');
let PluginError = gutil.PluginError;
let objectAssign = require('object-assign');
let tryit = require('tryit');
let BufferStreams = require('bufferstreams');
let htmlmin = require('html-minifier');
let Transform = require('readable-stream/transform');

const DEF_OPTIONS = {
    collapseWhitespace: true,
    removeComments: true,
    removeFtlComments: true,
    trimCustomFragments: true,
    minifyCSS: true,
    minifyJS: true,
    minifyFtl: true,
    ignoreCustomComments: [
        /<#--([\s\S])*.*-->/        // freemarker <#-- xxx -->
    ],
    ignoreCustomFragments: [
        /<@([\s\S])*.*(\/)?>/,      // freemarker <@abc/>
        /<(\/)?#([\s\S])*.*(\/)?>/  // freemarker <#abc>,</#abc>
    ]
};

module.exports = function gulpFtlmin(options) {
    options = objectAssign({}, DEF_OPTIONS, options);
    console.log(options);
    return new Transform({
        objectMode: true,
        transform: function htmlminTransform(file, enc, cb) {
            if (file.isNull()) {
                cb(null, file);
                return;
            }
            let self = this;
            // do minify
            if (file.isStream()) {
                file.contents.pipe(new BufferStreams((none, buf, done) => {
                    minifyFtl(buf, options, file.path, (err, contents) => {
                        if (err) {
                            self.emit('error', err);
                            done(err);
                        } else {
                            done(null, contents);
                            self.push(file);
                        }
                        cb();
                    });
                }));
            }else{
                minifyFtl(file.contents, options, file.path, (err, contents) => {
                    if (err) {
                        self.emit('error', err);
                    } else {
                        file.contents = contents;
                        self.push(file);
                    }
                    cb();
                });
            }
        }
    });
};

function minifyFtl(buf, options, filePath, done) {
    let result;
    tryit(() => {
        let afterHtmlMin = htmlmin.minify(String(buf), options);
        let res = compressFtl(afterHtmlMin || '', options);
        result = new Buffer(res);
    }, (err) => {
        if (err) {
            options = objectAssign({}, options, {fileName: filePath});
            done(new PluginError('gulp-ftlmin', err, options));
            return;
        }
        done(null, result);
    });
}
function compressFtl(str, options = {}){
    let removeFtlComments = options.removeFtlComments;
    let minifyFtl = options.minifyFtl;
    if(minifyFtl && typeof str === 'string'){
        const SINGLE_SPACE = ' ';
        const EMPTY = '';
        // remove ftl-comments <#-- xxx -->
        str = removeFtlComments ? str.replace(/<#--[\s\S]*?-->/g, EMPTY) : str;
        // convert \s* to \s
        str = str.replace(/[\s]{2,}/g, SINGLE_SPACE);
        str = str.trim();
    }
    return str;
}