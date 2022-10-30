'use strict'

// const util = require('util');
const httpClient = require('./../httpClient');
// const db = require('./../db');
// const http = require('http');
// const https = require('https');
const fs = require('fs');
const cheerio = require('cheerio');
const puppeteer = require("puppeteer");

const viewCtrl = {};

viewCtrl.get = async (req, res) => {
    var id = req.params.id;
    var type = "anime";

    var options = {
        host: "myanimelist.net",
        port: 443,
        path: `/${type}/${id}`,
        method: "GET",
        headers: {
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "UserAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:107.0) Gecko/20100101 Firefox/107.0",
        },
    };

    httpClient.getText(options)
        .then(async function (response) {
            var outputHtml = processHtml(response.content);
            const imageBuffer = await htmlToImage(outputHtml);

            res.set("Content-Type", "image/png");
            res.send(imageBuffer);
        })
        .catch(function (err) {
            console.log(err);
            res.send("Error");
        });

};

function processHtml(html) {
    var styles = "";

    try {
        styles = fs.readFileSync('./api/content/styles.css', 'utf8');
        // console.log(data.toString());
    } catch (e) {
        console.log('Error:', e.stack);
    }

    const $ = cheerio.load(html);
    var leftsideNode = $("#content table tr td:first-child .leftside");

    var startCopying = false;
    var copiedElements = [];

    for (let n = 0; n < leftsideNode.children().length; n++) {
        const element = $(leftsideNode.children()[n]);

        if (startCopying) {
            if (element.attr("itemprop") === "aggregateRating") {
                // copy this element but skip other elements afterward
                startCopying = false;
            }
        }
        else {
            if (element[0].tagName === "h2" && element.text() === "Information") {
                startCopying = true;
                var now = new Date();
                var timestamp = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
                element.append($(`<div class='timestamp'>${timestamp}</div>`));
            }
            else {
                continue;
            }
        }
        copiedElements.push(element);
    }

    var completeHtml = `<html><head><style>${styles}</style></head><body><div class=\"page-common\">`;
    copiedElements.forEach(t => completeHtml += t.toString());
    completeHtml += "</div></body></html>";

    return completeHtml;
}

async function htmlToImage(html) {
    const environment = process.env.NODE_ENV || 'development';
    const browser = environment === "production"
        ? await puppeteer.launch({ executablePath: '/usr/bin/google-chrome' })
        : await puppeteer.launch();

    const page = await browser.newPage();

    await page.setContent(html);

    const content = await page.$("body");
    const imageBuffer = await content.screenshot({ omitBackground: true });

    await page.close();
    await browser.close();

    return imageBuffer;
}

module.exports = viewCtrl;
