/*
 Run with:
 node ./node_modules/requirejs/bin/r.js -o build_public.js
 */
({
    appDir: "./public",
    baseUrl: "./js",
    dir: "./public-build",
    modules:[{
        name: "impossiblefish"
    }],
    keepBuildDir: false,
    optimizeCss: "standard",
    removeCombined: true
})