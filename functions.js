const {MessageEmbed} = require("discord.js");

module.exports = {
    async pagify(items, limitPerPage = 5, number = false) {
        let curPage = 0, pages = [];
        for (let i = 0; i < items.length; i++) {
            i % limitPerPage == 0 ? pages.push([]) : pages;
            if (number) {
                pages[curPage].push((i+1) + ". " +items[i]);
            } else {
                pages[curPage].push(items[i]);
            }
            i % limitPerPage ==  limitPerPage -1 ? curPage++ : curPage; 
        }
        if (pages[pages.length-1].length < 1) pages.pop();
        return pages;
    },
    //requires the other properties of each embed to be set however
    async listify(title, desc, items, number = false) {
        const em = new MessageEmbed()
            .setTitle(title)
            .setDescription(desc);
        items.forEach((v, i) => {
            let x = "";
            if (number) {
                x = (i+1) + ". ";
            }
            em.addField(x + v, "—");
        })
        return em;
    }
}