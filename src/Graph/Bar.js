import lodash from 'lodash';
import colorGenerator from './Color';

class Bar {

    constructor(options = {}) {
        this.options = lodash.merge(this.options, {
            color: colorGenerator.getRandomColor(),
            count: 0,
            currentCount: 0,
            endCount: 0,
        });
        this.options.endCount = count;
    }

    setColor(color) {
        this.options.color = color;
    }

    getColor() {
        return this.options.color;
    }
}

export default Bar;