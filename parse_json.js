import fs from "fs";

const fsp = fs.promises;

const readFile = async (file) => {
    let fileData = await fsp.readFile(file, "utf8");
    let jsonData = JSON.parse(fileData);
    return jsonData;
};

const writeFile = async (file, data) => {
    await fsp.writeFile(file, JSON.stringify(data, null, 4));
};

(async () => {
    let result = await readFile("raw/result.json");

    let messages = result.messages
        .filter((message) => message.text_entities.length > 0)
        .map((message) => message.text_entities);

    let hashtags = messages.reduce((acc, item) => {
        let hashtagItems = item.filter((subItem) => subItem.type === "hashtag");
        hashtagItems.forEach((hashtag) => acc.push(hashtag.text.replace("#", "")));
        return acc;
    }, []);

    await writeFile("data/hashtags.json", hashtags);

    let grouped = hashtags.reduce((acc, hashtag) => {
        let found = acc.find((item) => item.hashtag === hashtag);
        if (found) {
            found.count++;
        } else {
            acc.push({ hashtag: hashtag, count: 1 });
        }
        return acc;
    }, []);

    grouped.sort((a, b) => a.count - b.count).reverse();
    // grouped.sort((a, b) => a.hashtag.localeCompare(b.hashtag));

    await writeFile("data/hashtags.group.json", grouped);

    console.log(grouped.length);
})();
