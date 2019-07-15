import _ from 'underscore';
import { default as SteedosPlugin } from './plugin';
const plugin = new SteedosPlugin();

export function initPlugin(app){
    return plugin.init(app);
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
