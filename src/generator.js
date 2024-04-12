import axios from "axios";

(async () => {
    let configResponse = await axios.get("data/config.json");
    let config = configResponse.data;

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
        `;

        let $categoryDiv = $addCategory.parentNode;

        $categoryDiv.parentNode.insertBefore($newCategory, $categoryDiv.nextSibling);
    });

    let $addArtist = document.getElementById("add-artist");

    $addArtist.addEventListener("click", () => {
        let $newArtist = document.createElement("div");
        $newArtist.innerHTML = `
            <label for="artist">Artist</label>
            <input class="artist" type="text" />
        `;

        let $artistDiv = $addArtist.parentNode;

        $artistDiv.parentNode.insertBefore($newArtist, $artistDiv.nextSibling);
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
            artists += $artist.value.hashtag() + " ";
        });

        // Site & ID
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
