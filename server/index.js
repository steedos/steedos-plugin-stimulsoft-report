import { default as routes } from './router';
import { initMrts } from './mrt';
import _ from 'underscore';
const objectql = require("@steedos/objectql");

export function initPlugin(app){
    _.each(objectql.getSteedosSchema().getDataSources(), function (datasource, name) {
        initMrts(datasource.getReports());
    });

    app.use(routes);
}

export { default as routes } from './router';
export * from './mrt';
