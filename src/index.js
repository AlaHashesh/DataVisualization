import './css/main.css';

import $ from 'jquery';

import graphData from './Data/SmartPhones';
import colors from './colors';
import Bar from './Graph/Bar';

String.prototype.hashCode = function () {
    var hash = 0, i, chr;
    if (this.length === 0) return hash;
    for (i = 0; i < this.length; i++) {
        chr = this.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};

$(function () {

    function specialRound(number) {
        number = parseFloat(number + "");
        let power = Math.floor(Math.log10(number));
        number = Math.floor(number);
        while (number >= 10) {
            number = Math.floor(number / 10);
        }
        number = (number) * Math.pow(10, power);

        return number;
    }

    let barsDiv = $('#bars');
    let xAxisDiv = $('#x-axis-list');
    let maxItems = 10;
    let itemHeight = 0;
    let currentNumberOfBars = 0;
    let scale = 1;

    function shuffle(a) {
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    shuffle(colors);

    let colorIndex = 0;

    function getRandomColor() {
        let color = colors[colorIndex % colors.length];
        colorIndex = (colorIndex + 1) % colors.length;
        return color;
    }

    let keyValueItems = {};
    let items = [];
    let xAxisItems = {};

    init();

    function updateXAxis(xAxisData) {

        items.sort(function (a, b) {
            if (a.currentCount > b.currentCount)
                return -1;
            if (a.currentCount < b.currentCount)
                return 1;
            return 0;
        });

        let maxCount = items[0]['currentCount'];

        let initXAxisValues = xAxisData;
        if (initXAxisValues === undefined) {
            initXAxisValues = [];
            let maxBar = specialRound(maxCount);
            let period = Math.floor(maxBar / 4);
            for (let i = 0; i <= 7; i++) {
                initXAxisValues.push(i * period);
            }
        }

        for (let key in xAxisItems) {
            if (Object.prototype.hasOwnProperty.call(xAxisItems, key)) {
                let xAxisItem = xAxisItems[key];
                let initXAxisValueTokens = key.split("-");
                let initXAxisValue = parseFloat(initXAxisValueTokens[initXAxisValueTokens.length - 1]);
                if (!initXAxisValues.includes(initXAxisValue)) {
                    delete xAxisItems[key];
                    let element = xAxisDiv.find('#' + xAxisItem['id']);
                    if (element && element.length) {
                        element.animate({
                            opacity: 0
                        }, 500, function () {
                            element.remove();
                        });
                    }
                }
            }
        }

        for (let i = 0; i < initXAxisValues.length; i++) {

            let xAxisValue = initXAxisValues[i];
            let xAxisElementId = 'x-axis-' + xAxisValue;
            if (xAxisItems[xAxisElementId] !== undefined) {
                continue;
            }

            let xAxisElement = $(getXAxisElement());

            xAxisElement.attr('id', xAxisElementId);
            xAxisElement.find('.x-axis-title').html(xAxisValue);
            let xAxisElementLeft = (xAxisValue / maxCount) * 100;
            xAxisElement.css('left', xAxisElementLeft + '%');

            xAxisItems[xAxisElementId] = {
                id: xAxisElementId,
                value: xAxisValue,
                left: xAxisElementLeft
            };

            xAxisDiv.append(xAxisElement);
        }
    }

    function getStepLength(begin, end, numberOfSteps) {
        return (end - begin) / numberOfSteps;
    }

    function init() {
        let initData = graphData['items'][0];

        $('#graph--year').html(initData['name']);

        let numberOfBars = Math.min(initData['items'].length, maxItems);
        currentNumberOfBars = numberOfBars;

        itemHeight = barsDiv.height() / maxItems;

        // 60 times per second for 10 seconds
        let numberOfSteps = 2.5 * 60 * 10;

        for (let i = 0; i < numberOfBars; i++) {
            let item = initData['items'][i];
            item.count = parseFloat(item.count) * scale;
            items.push(item);
            let element = $(getBarElement());
            let elementId = item.name.hashCode();

            item['id'] = elementId;

            item['currentCount'] = item.count;
            item['endCount'] = item.count;
            item['countStep'] = getStepLength(0, item.count, numberOfSteps);
            item['top'] = (itemHeight * i);
            item['currentTop'] = (itemHeight * i);
            item['endTop'] = (itemHeight * i);
            item['topStep'] = getStepLength(item['currentTop'], item['endTop'], numberOfSteps);
            item['period'] = 1;

            keyValueItems[elementId] = item;

            element.attr('id', elementId);
            element.attr('data-id', elementId);
            element.attr('data-period', 1);

            element.css('height', itemHeight + 'px');
            element.css('top', item['top'] + 'px');
            element.find('.bar1--content').css('width', 0);

            element.find('.bar1--name').html(item.name);
            element.find('.bar1--count').html(0);

            let color = getRandomColor();
            item['color'] = color;
            element.find('.bar1--progress').css('background', color);

            barsDiv.append(element);
        }

        updateXAxis(initData['x-axis']);

        function moveStep() {
            let bars = $('.bar1');

            let finished = true;

            items.sort(function (a, b) {
                if (a.currentCount > b.currentCount)
                    return -1;
                if (a.currentCount < b.currentCount)
                    return 1;
                return 0;
            });

            let maxCount = items[0]['currentCount'];

            for (let i = 0; i < items.length; i++) {
                let item = items[i];
                item['endTop'] = itemHeight * i;
                if (item['order'] !== undefined && item['order'] !== i) {
                    item['topStep'] = getStepLength(item['currentTop'], item['endTop'], 60);
                }
                item['order'] = i;
            }

            for (let key in xAxisItems) {
                if (Object.prototype.hasOwnProperty.call(xAxisItems, key)) {
                    let xAxisItem = xAxisItems[key];
                    let element = xAxisDiv.find('#' + xAxisItem['id']);
                    element.css('left', (xAxisItem['value'] / maxCount) * 100 + '%');
                    if (xAxisItem['value'] > maxCount) {
                        element.css('opacity', 0);
                    } else {
                        element.css('opacity', 1);
                    }
                }
            }

            $.each(bars, function (index, element) {
                let bar = $(element);
                let elementId = bar.attr('data-id');

                let item = keyValueItems[elementId];

                if (keyValueItems[elementId] === undefined) {
                    return false;
                }

                let currentTop = parseFloat(item['currentTop']);
                let endTop = parseFloat(item['endTop']);
                let topStep = parseFloat(item['topStep']);
                let nextTop = Math.min(topStep + currentTop, endTop);

                if (topStep < 0) {
                    nextTop = Math.max(currentTop + topStep, endTop);
                }

                item['top'] = nextTop;
                item['currentTop'] = nextTop;

                bar.css('top', item['currentTop'] + 'px');
                // bar.css('top', (item['order'] * itemHeight) + 'px');
                bar.css('z-index', (keyValueItems[elementId]['endCount']));

                let countElement = bar.find('.bar1--count');
                let countStep = parseFloat(item['countStep']);
                let currentCount = parseFloat(item['currentCount']);
                let endCount = parseFloat(item['endCount']);
                let nextCount = Math.min(currentCount + countStep, endCount);

                if (countStep < 0) {
                    nextCount = Math.max(currentCount + countStep, endCount);
                }

                countElement.html(nextCount.toFixed());
                item['currentCount'] = nextCount;

                if (maxCount > 0) {
                    bar.find('.bar1--content').css('width', ((currentCount / maxCount) * 100) + '%');
                }

                if (nextCount !== endCount) {
                    finished = false;
                }

                if (nextPeriodIndex >= graphData['items'].length) {
                    if (item['currentTop'] !== item['endTop']) {
                        finished = false;
                    }
                }

            });

            updateXAxis(graphData['items'][nextPeriodIndex - 1]['x-axis']);

            return finished;
        }

        let nextPeriodIndex = 1;

        function startNextPeriod() {

            if (nextPeriodIndex >= graphData['items'].length) {
                return false;
            }

            $('#clock').addClass('clock1');

            let nextPeriod = graphData['items'][nextPeriodIndex];
            let nextItems = nextPeriod['items'];

            if (nextPeriod['name'] !== undefined) {
                $('#graph--year').html(nextPeriod['name']);
            }

            for (let i = 0; i < items.length; i++) {
                items[i]['updated'] = false;
                items[i]['isNew'] = false;
            }

            for (let i = 0; i < nextPeriod['items'].length; i++) {

                let nextItem = nextItems[i];
                nextItem['count'] = parseFloat(nextItem['count']) * scale;
                let itemId = nextItem.name.hashCode();

                if (keyValueItems[itemId] !== undefined) {
                    let item = keyValueItems[itemId];
                    item['count'] = nextItem.count;
                    item['endCount'] = nextItem.count;
                    item['countStep'] = getStepLength(item['currentCount'], item['endCount'], numberOfSteps);
                } else {

                    let element = $(getBarElement());

                    nextItem['id'] = itemId;

                    nextItem['isNew'] = true;
                    nextItem['currentCount'] = 0;
                    nextItem['endCount'] = nextItem.count;
                    nextItem['countStep'] = getStepLength(0, nextItem.count, numberOfSteps);

                    nextItem['order'] = maxItems + i;
                    nextItem['top'] = (itemHeight * maxItems);
                    nextItem['currentTop'] = (itemHeight * maxItems);
                    nextItem['endTop'] = (itemHeight * maxItems);
                    nextItem['topStep'] = getStepLength(nextItem['currentTop'], nextItem['endTop'], numberOfSteps);
                    nextItem['period'] = nextPeriodIndex + 1;

                    keyValueItems[itemId] = nextItem;
                    items.push(nextItem);

                    element.attr('id', itemId);
                    element.attr('data-id', itemId);
                    element.attr('data-period', nextPeriodIndex + 1);

                    element.css('height', itemHeight + 'px');
                    element.css('top', (itemHeight * maxItems) + 'px');
                    element.find('.bar1--content').css('width', 0);

                    element.find('.bar1--name').html(nextItem.name);
                    element.find('.bar1--count').html(0);

                    let color = getRandomColor();
                    nextItem['color'] = color;
                    element.find('.bar1--progress').css('background', color);

                    barsDiv.append(element);
                }

                keyValueItems[itemId]['updated'] = true;
            }

            let min = parseFloat(items[0]['endCount']);

            for (let i = 0; i < items.length; i++) {
                let item = items[i];
                if (item['updated'] !== undefined && item['updated']) {
                    min = parseFloat(item['endCount']);
                    break;
                }
            }

            for (let i = 0; i < items.length; i++) {
                let item = items[i];
                if (item['updated'] !== undefined && item['updated']) {
                    if (parseFloat(item['endCount']) < min) {
                        min = parseFloat(item['endCount']);
                    }
                }
            }

            for (let i = 0; i < items.length; i++) {
                let item = items[i];
                if (item['updated'] === undefined || !item['updated']) {
                    let endCount = 0;
                    item['count'] = endCount;
                    item['endCount'] = endCount;
                    item['countStep'] = getStepLength(item['currentCount'], endCount, numberOfSteps);
                }

                if (item['isNew'] !== undefined && item['isNew']) {
                    item['currentCount'] = min.toFixed();
                    if (parseFloat(item['endCount']) === min) {
                        item['currentCount'] = item['currentCount'] / 2;
                    }
                    item['countStep'] = getStepLength(item['currentCount'], item['endCount'], numberOfSteps);
                }
            }

            for (let i = 0; i < items.length; i++) {
                let item = items[i];
                if (parseFloat(item['count']) <= 0 && parseFloat(item['currentCount']) <= 0) {
                    barsDiv.find('#' + item['id']).remove();
                    delete keyValueItems[item['id']];
                }
            }

            items = items.filter(function (item) {
                return parseFloat(item['count']) > 0 || parseFloat(item['currentCount']) > 0;
            });

            itemHeight = barsDiv.height() / maxItems;
            $('.bar1').css('height', itemHeight + 'px');

            nextPeriodIndex++;

            $('[data-period="' + (nextPeriodIndex - 3) + '"]').remove();

            return true;
        }

        setTimeout(function () {

            moveStep();
            moveStep();

            setTimeout(function () {
                let interval = setInterval(function () {

                    if (moveStep()) {
                        if (!startNextPeriod()) {
                            clearInterval(interval);
                            interval = 0;
                            console.log(items);
                        }
                    }
                }, 1000 / 60);
            }, 3000);

        });

    }

    function getBarElement() {
        return '<div class="bar1">' +
            '<div class="bar1--content">' +
            '<div class="bar1--progress"></div>' +
            '<div class="bar1--details">' +
            '<div class="bar1--name"></div>' +
            '<div class="bar1--image"></div>' +
            '<div class="bar1--count"></div>' +
            '</div>' +
            '</div>' +
            '</div>'
    }

    function getXAxisElement() {
        return '<div class="x-axis-item">\n' +
            '<div class="x-axis-line"></div>\n' +
            '<div class="x-axis-title"></div>\n' +
            '</div>';
    }

});