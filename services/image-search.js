const rp = require('request-promise-native');
const promisify = require('promisify-node');
const fs = promisify('fs');
const url = require('url');
const path = require('path');

const ImageQuery = require('../models/ImageQuery');

const publicBaseDir = 'public/';
const productImageBasePath = 'img/products/';
const apiBaseUrl = 'https://www.googleapis.com/customsearch/v1?';

let queryParams = new Map([
    ['key', 'AAIzaSyD5H8Y3lKehTn2enbJU1qL5S8X7Et4AX4M'],
    ['cx', '014144397479220879650:sd7rzvq2hog'],
    ['num', 1],
    ['fields', 'items(link,snippet)'],
    ['searchType', 'image'],
    ['fileType', 'jpg'],
    ['imgSize', 'medium'],
    ['alt', 'json'],
    ['imgType', 'clipart']
]);

function constructQueryParams(params) {
    // todo: rewrite with reduce?
    let encodedParams = '';

    for (let [paramName, paramValue] of params) {
        encodedParams += `${paramName}=${paramValue}&`;
    }

    return encodedParams;
}

function constructRequestUrl(query) {
    queryParams.set('q', query);
    return apiBaseUrl + constructQueryParams(queryParams);
}

function fetchImageResults(query) {
    const getUrl = constructRequestUrl(query);
    return rp({
        uri: getUrl,
        json: true
    });
}

function downloadAndSaveImage(imageUrl, originalQuery) {
    const parsedUrl = url.parse(imageUrl);
    const filename = path.basename(parsedUrl.pathname);
    const savedFilePath = path.join(publicBaseDir, productImageBasePath, filename);
    const pathForFrontend = path.join(productImageBasePath, filename);

    return rp({ uri: imageUrl, encoding: null })
        .then(body => fs.writeFile(savedFilePath, body))
        .then(fsResponse => {
            let successfulImageQuery = new ImageQuery({
                query: originalQuery,
                timestamp: new Date(),
                savedImageUrl: pathForFrontend
            });

            return successfulImageQuery
                .save()
                .exec();
        })
        .then(dbSaveResponse => pathForFrontend);
}

function checkForSavedImage(query) {
    return ImageQuery.findOne({ query: query })
        .exec()
        .then(foundImageQuery => {
            return foundImageQuery ? foundImageQuery.savedImageUrl : null;
        });
}


function saveImageForQuery(query) {
    return checkForSavedImage(query)
        .then(savedImageUrl => {
            if (savedImageUrl) return savedImageUrl;

            return fetchImageResults(query)
                .then(json => json.items[0].link)
                .then(imageUrl => {
                    return downloadAndSaveImage(imageUrl, originalQuery);
                });
        });
}

module.exports = {
    saveImageForQuery
};