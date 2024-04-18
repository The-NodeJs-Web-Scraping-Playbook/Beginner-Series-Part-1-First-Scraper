const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");

const listOfUrls = ["https://www.chocolate.co.uk/collections/all"];

const scrapedData = [];

async function scrape() {
  for (const url of listOfUrls) {
    const response = await axios.get(url);

    if (response.status == 200) {
      const html = response.data;
      const $ = cheerio.load(html);
      const productItems = $("product-item");

      for (const productItem of productItems) {
        const title = $(productItem).find(".product-item-meta__title").text();

        const price = $(productItem).find(".price").first().text().trim();
        const url = $(productItem)
          .find(".product-item-meta__title")
          .attr("href");

        scrapedData.push({
          title,
          price,
          url,
        });
      }

      const nextPage = $("a[rel='next']").attr("href");
      if (nextPage) {
        listOfUrls.push("https://www.chocolate.co.uk" + nextPage);
      }
    }
  }
}

function saveAsCSV(data, filename) {
  const header = Object.keys(data[0]).join(",");
  const csv = [header, ...data.map((obj) => Object.values(obj).join(","))].join(
    "\n"
  );
  fs.writeFileSync(filename, csv);
}

(async () => {
  await scrape();
  saveAsCSV(scrapedData, "chocolate.csv");
})();
