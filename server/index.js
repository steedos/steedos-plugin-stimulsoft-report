import _ from 'underscore';
import { default as routes } from './router';
import { initMrts } from './mrt';
import { default as SteedosPlugin } from './plugin';
import appRoot from 'app-root-path';
const plugin = new SteedosPlugin();

export function initPlugin(app){
    let reportsDir = appRoot.resolve('/src');
    plugin.useReportFiles([reportsDir]);
    initMrts(plugin.getReports());

    app.use(routes);
}

export function getReports() {
    return plugin.getReports();
}

export function getReportsConfig() {
    return plugin.getReportsConfig();
}

export function getReport(id) {
    return plugin.getReport(id);
}

export { default as routes } from './router';
export * from './mrt';
export default plugin;
