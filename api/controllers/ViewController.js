'use strict'

// const util = require('util');
const httpClient = require('./../httpClient');
const db = require('./../db');
const fs = require('fs');
const cheerio = require('cheerio');
const puppeteer = require("puppeteer");

const viewCtrl = {
    get: get,
};

async function get(req, res) {
    try {
        var type = "anime";
        var id = req.params.id;

        if (req.params.id.endsWith(".jpg") || req.params.id.endsWith(".png")) {
            id = req.params.id.replace(".jpg", "").replace(".png", "");
        }

        if (Number.isNaN(+id)) {
            res.send("Invalid ID.");
        }

        var dataFromDb = await db.getAsync(id);

        if (dataFromDb) {
            var timestamp = await db.getTimestampAsync(id);
            var createdAt = new Date(+timestamp);

            if (createdAt.setDate(createdAt.getDate() + process.env.WEB_CACHEDAY) < new Date().getTime()) {
                // return cache:
                const imageBuffer = Buffer.from(dataFromDb, "base64");
                res.set("Content-Type", "image/png");
                res.send(imageBuffer);
                return;
            }
        }

        var imageBuffer = await fetchInfo(type, id, res);
        res.set("Content-Type", "image/png");
        res.send(imageBuffer);
    }
    catch (ex) {
        console.log(ex);

        if (typeof ex === "string") {
            res.send("Unexpected exception has occured. Exception: " + ex);
        } else {
            res.send("Unexpected exception has occured.");
        }
    };
}

async function fetchInfo(type, id) {
    var options = {
        host: "myanimelist.net",
        path: `/${type}/${id}`,
    };

    var response = await httpClient.getText(options);

    if (response.statusCode !== 200) {
        throw `Invalid response. Status code: ${response.statusCode}`;
    }

    var outputHtml = processHtml(response.content);
    const imageBuffer = await htmlToImage(outputHtml);

    await db.setAsync(id, imageBuffer.toString("base64"));

    return imageBuffer;
}

function processHtml(html) {
    var styles = "";

    try {
        styles = fs.readFileSync('./api/content/styles.css', 'utf8');
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
