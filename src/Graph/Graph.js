import lodash from 'lodash';
import Bar from "./Bar";

class Graph {

    bars = {

    };

    options = {

    };

    constructor(options = {}) {
        this.options = lodash.merge(this.options, options);
    }

    addBar = (props = {}) => {
        if (this.bars[props.id] !== undefined) {
            return;
        }
    }
}

export default Graph;