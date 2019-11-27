const colorGenerator = (function () {
    let colors = [
        '#e6194B',
        '#3cb44b',
        '#ffe119',
        '#4363d8',
        '#f58231',
        '#911eb4',
        '#42d4f4',
        '#f032e6',
        '#bfef45',
        '#fabebe',
        '#469990',
        '#e6beff',
        '#9A6324',
        '#fffac8',
        '#800000',
        '#aaffc3',
        '#808000',
        '#ffd8b1',
        '#000075',
        '#a9a9a9',
    ];

    let colorIndex = 0;

    return {
        getRandomColor() {
            let color = colors[colorIndex % colors.length];
            colorIndex = (colorIndex + 1) % colors.length;
            return color;
        }
    };

})();

export default Object.create(colorGenerator);