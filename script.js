const baseUrls = ['https://readmanga.live', 'https://mintmanga.live', 'http://shakai.ru/catalog/manga/']
const searchUrls = [`${baseUrls[0]}/list?sortType=votes&filter=translated`, `${baseUrls[1]}/list/tag/noyaoi?sortType=rate&filter=translated`];

function setStatus(data) {
    const script = $('.status-script');
    const id = script.attr('id');
    const title = $(`[data-id="${id}"]`);
    if (title.children().length == 0) {
        title[0].innerHTML += `<span> -- ${data.data.status}</span>`;
    } else {
        title.children()[0].innerText = ` -- ${data.data.status}`;
    }
    script.remove();
}

function getStatus(id, siteId) {
    const statusScript = document.createElement('script');
    statusScript.id = id;
    statusScript.classList.add('status-script');
    statusScript.src = `https://grouple.co/external/status?callback=setStatus&id=${id}&site=${siteId}&user=582791`
    document.body.append(statusScript);
}

async function getTitlesFromPage(siteId, offset = 0) {
    if (document.getElementsByClassName('results')[0]) document.getElementsByClassName('results')[0].remove();
    const resultsDiv = document.createElement('div');
    resultsDiv.classList.add('results');
    document.body.append(resultsDiv);
    if (siteId == 3) {
        $.getJSON('https://api.allorigins.win/get?url=' + encodeURIComponent(baseUrls[2] + offset),
            data => {
                const posters = $(data.contents).find('.poster');
                if (posters.length == 0) {
                    const emptyResults = document.getElementById('noResults').content.cloneNode(true);
                    resultsDiv.append(emptyResults);
                } else {
                    
                    let link, linkWrap;
                    for (let i = 0; i < posters.length; i++) {
                        const description = posters[i].querySelectorAll('.poster__float-description');
                        const release = description[1].innerText;
                        const genres = description[2].innerText
                        if (!release.includes('Завершен') && genres.includes('Яой')) continue;
                        linkWrap = document.createElement('div');
                        linkWrap.style = 'display: block; font-size: 1.5em; padding: .5em';
                        link = document.createElement('a');
                        link.innerText = posters[i].querySelector('.poster__float-heading').innerText.match(/[^/]+$/gm)[0];
                        link.href = posters[i].href;
                        link.target = '_blank';
                        linkWrap.append(link);

                        resultsDiv.append(linkWrap);
                    }
                }
            }
        );
    } else {
        $.getJSON('https://api.allorigins.win/get?url=' + encodeURIComponent(`${searchUrls[siteId - 1]}&offset=${(offset - 1) * 70}`),
            data => {
                const tiles = $(data.contents).find('.tile');
                const tilesTag = tiles.find('.tags');
                const titles = tiles.find('h3 a');
                const bookmarks = tiles.find('span.bookmark-menu');

                if (titles.length == 0) {
                    const emptyResults = document.getElementById('noResults').content.cloneNode(true);
                    resultsDiv.append(emptyResults);
                } else {
                    let link, linkWrap, refreshStatus;
                    for (let i = 0; i < titles.length; i++) {
                        linkWrap = document.createElement('div');
                        linkWrap.style = 'display: block; font-size: 1.5em; padding: .5em';

                        refreshStatus = document.createElement('span');
                        refreshStatus.innerHTML = '<i class="icon icon-refresh"></i>';
                        refreshStatus.style = 'margin-left: 20px;';
                        refreshStatus.setAttribute('onclick', `getStatus(${bookmarks[i].dataset['id']}, ${siteId})`);

                        link = document.createElement('a');
                        link.innerText = titles[i].title;
                        if (tilesTag[i].children.length != 2) {
                            link.innerText += ' (Сингл)';
                        }
                        link.target = '_blank';
                        link.href = baseUrls[siteId - 1] + titles[i].pathname;
                        link.dataset['id'] = bookmarks[i].dataset['id'];

                        linkWrap.append(link, refreshStatus);

                        resultsDiv.append(linkWrap);
                    };
                }
            }
        );
    }
}

const loadBtn = document.getElementById('load');
const siteSelect = document.getElementById('siteSelect');
const pageInput = document.getElementById('pageInput');

const siteIdCookie = Cookies.get('siteId');
const pageNumCookie = Cookies.get('pageNum');

if (siteIdCookie != undefined && pageNumCookie != undefined) {
    siteSelect.value = siteIdCookie;
    pageInput.value = pageNumCookie;
    getTitlesFromPage(siteSelect.value, pageInput.value);
} else {
    getTitlesFromPage(1, 0);
}

loadBtn.addEventListener('click', () => {
    Cookies.set('siteId', siteSelect.value, { expires: 365 });
    Cookies.set('pageNum', pageInput.value, { expires: 365 });
    getTitlesFromPage(siteSelect.value, pageInput.value);
});
