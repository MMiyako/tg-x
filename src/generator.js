import axios from "axios";
import Fuse from "fuse.js";

(async () => {
    let configResponse = await axios.get("data/config.json");
    let config = configResponse.data;

    let tagsResponse = await axios.get("data/hashtags.group.json");
    let tags = tagsResponse.data;

    let fuseOptions = {
        includeScore: false,
        useExtendedSearch: true,
        keys: ["hashtag"],
    };

    let fuse = new Fuse(tags, fuseOptions);

    let $search = document.getElementById("search");
    let $tags = document.querySelector(".tags");

    showTopTags();

    $search.addEventListener("input", (e) => {
        showTags(e.target.value);
    });

    function copyTag() {
        let $allTags = document.querySelectorAll(".tag");

        $allTags.forEach(($tag) => {
            $tag.addEventListener("click", () => {
                let tag = $tag.firstChild.innerText;
                navigator.clipboard.writeText(tag);

                let $div = document.createElement("div");

                $div.innerHTML = "Copied";
                $div.classList.add("copy-markup");

                $tag.appendChild($div);

                setTimeout(function () {
                    $div.remove();
                }, 1000);
            });
        });
    }

    function showTopTags() {
        $tags.innerHTML = `<li class="tags-count">Total: ${tags.length}</li>`;

        for (let i = 0; i < 30; i++) {
            let $li = document.createElement("li");

            $li.innerHTML = `<div>${tags[i].hashtag}</div><div>${tags[i].count}</div>`;
            $li.classList.add("tag");

            $tags.appendChild($li);
        }

        copyTag();
    }

    function showTags(search) {
        $tags.innerHTML = "";

        if (search) {
            let result = fuse.search(search);

            $tags.innerHTML = `<li class="tags-count">Result: ${result.length} / ${tags.length}</li>`;

            result.forEach((obj) => {
                let $li = document.createElement("li");

                $li.innerHTML = `<div>${obj.item.hashtag}</div><div>${obj.item.count}</div>`;
                $li.classList.add("tag");

                $tags.appendChild($li);
            });

            copyTag();
        } else {
            showTopTags();
        }
    }

    let $help = document.querySelector("#panel-tags .help");

    $help.addEventListener("click", () => {
        let $helpInfo = document.querySelector("#panel-tags .help-info");
        $helpInfo.classList.toggle("hide");
        $help.classList.toggle("active");
    });

    let mode = "normal";
    let $normalMode = document.getElementById("normal-mode");
    let $japaneseMode = document.getElementById("japanese-mode");
    let $blockCode = document.getElementById("block-code");

    $normalMode.addEventListener("click", () => {
        mode = "normal";
        $normalMode.classList.add("active");
        $japaneseMode.classList.remove("active");
        $blockCode.classList.add("hide");
    });

    $japaneseMode.addEventListener("click", () => {
        mode = "japanese";
        $japaneseMode.classList.add("active");
        $normalMode.classList.remove("active");
        $blockCode.classList.remove("hide");
    });

    let $linkIncrement = document.getElementById("link-increment");

    $linkIncrement.addEventListener("click", () => {
        let $link = document.getElementById("link");
        let link = $link.value;

        if (link) {
            if (link.startsWith(config.prefixLink)) {
                link = link.substring(config.prefixLink.length);
            }
            $link.value = +link + 1;
        }
    });

    let $addCategory = document.getElementById("add-category");

    $addCategory.addEventListener("click", () => {
        let $newCategory = document.createElement("div");
        $newCategory.innerHTML = `
            <label for="category">Category</label>
            <input class="category" type="text" />
            <button class="remove-block">Remove</button>
        `;

        let $categoryDiv = $addCategory.parentNode;

        $categoryDiv.parentNode.insertBefore($newCategory, $categoryDiv.nextSibling);

        let $removeBlock = $newCategory.querySelector(".remove-block");

        $removeBlock.addEventListener("click", () => {
            $newCategory.remove();
        });
    });

    let $addArtist = document.getElementById("add-artist");

    $addArtist.addEventListener("click", () => {
        let $newArtist = document.createElement("div");
        $newArtist.innerHTML = `
            <label for="artist">Artist</label>
            <input class="artist" type="text" />
            <button class="remove-block">Remove</button>
        `;

        let $artistDiv = $addArtist.parentNode;

        $artistDiv.parentNode.insertBefore($newArtist, $artistDiv.nextSibling);

        let $removeBlock = $newArtist.querySelector(".remove-block");

        $removeBlock.addEventListener("click", () => {
            $newArtist.remove();
        });
    });

    let $generate = document.getElementById("generate");

    $generate.addEventListener("click", (e) => {
        e.preventDefault();
        generate();
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            generate();
        }
    });

    let $clear = document.getElementById("clear");

    $clear.addEventListener("click", () => {
        let inputs = document.querySelectorAll("#info input");
        for (let i = 1; i < inputs.length; i++) {
            if (inputs[i].type == "text") {
                inputs[i].value = "";
            }
        }
    });

    let $clearSearch = document.getElementById("clear-search");

    $clearSearch.addEventListener("click", () => {
        let input = document.querySelector("#search");
        input.value = "";
        input.focus();
        showTopTags();
    });

    function generate() {
        let link = "";
        let categories = "";
        let artists = "";
        let site = "";
        let extraInfo = "";
        let code = "";

        let $result = document.getElementById("result");
        let $link = document.getElementById("link");
        let $categories = document.querySelectorAll(".category");
        let $artists = document.querySelectorAll(".artist");
        let $site = document.querySelector(".site");
        let $siteID = document.querySelector(".site-id");
        let $extraInfo = document.querySelector(".extra-info");

        // Link
        $link.classList.remove("error");

        if ($link.value) {
            if ($link.value.startsWith(config.prefixLink)) {
                link = $link.value;
            } else {
                link = config.prefixLink + $link.value;
            }
        } else {
            $link.classList.add("error");
        }

        // Category
        $categories.forEach(($category) => {
            categories += $category.value.hashtag() + " ";
        });

        // Artist
        $artists.forEach(($artist) => {
            let artist = $artist.value;
            artist = artist.hashtag() + " ";
            artist = artist.replaceAll(",", " #");
            artist = artist.replaceAll("&", " #");
            artists += artist;
        });

        // Site & ID
        if ($site.value) {
            let site = $site.value;
            for (let key in config.siteParser) {
                if (site.includes(config.siteParser[key])) {
                    $site.value = key;

                    let urlParams = new URLSearchParams(site);
                    for (let [key, value] of urlParams.entries()) {
                        if (value) {
                            $siteID.value = value;
                        } else {
                            $siteID.value = key.split("/").pop();
                        }
                    }

                    break;
                }
            }
        }

        if ($site.value && $siteID.value) {
            site = `<br/><br/>${$site.value.hashtag()} \`${$siteID.value}\``;
        }

        // Extra Info
        if ($extraInfo.value) {
            extraInfo = $extraInfo.value + "<br/><br/>";
        }

        // Japanese Mode
        if (mode === "japanese") {
            let $code = document.querySelector(".code");
            code = `\`${$code.value.toUpperCase()}\` <br/><br/>`;
            categories = config.jCategory + " " + categories;
        }

        // Final Result
        $result.innerHTML = `
            ${link}
            <br/>
            <br/>
            ${code}
            ${extraInfo}
            ${categories} ${artists}
            ${site}
        `;

        navigator.clipboard.writeText($result.innerText);
    }
})();

String.prototype.hashtag = function () {
    return this.length > 0 ? (this.startsWith("#") ? this.replace(/\s/g, "") : "#" + this.replace(/\s/g, "")) : this;
};
